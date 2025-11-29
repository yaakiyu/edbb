// 共有用のクエリキーとステータス表示時間
const SHARE_QUERY_KEY = 'share';
const SHARE_STATUS_SHOW_MS = 2500;
const SHARE_SHORTENER_ENDPOINT = 'https://share.himais0giiiin.com/share/create';
const SHARE_IMPORT_SKIP_KEY = 'share_import_dialog_skip';

// 共有インポート確認ダイアログの表示設定を取得・保存
const getShareImportSkipPreference = () => {
  try {
    return window.localStorage?.getItem(SHARE_IMPORT_SKIP_KEY) === '1';
  } catch (error) {
    return false;
  }
};

const setShareImportSkipPreference = (shouldSkip) => {
  try {
    if (shouldSkip) {
      window.localStorage?.setItem(SHARE_IMPORT_SKIP_KEY, '1');
    } else {
      window.localStorage?.removeItem(SHARE_IMPORT_SKIP_KEY);
    }
  } catch (error) {
    // localStorage may be unavailable (private mode等)
  }
};
const BLOCKLY_CAPTURE_EXTRA_CSS = [
  // 通常CSSでは対応しきれないBlocklyキャプチャ用の追加スタイル (SVGはfillで指定する必要があるため、ここで上書き)
  ".blocklyText { fill:#fff !important; }",
  ".blocklyEditableText { fill: #fff !important; }",
  ".blocklyEditableText .blocklyText:not(.blocklyDropdownText) { fill:#000 !important; }",
].join('');
let blocklyOverrideCssCache = '';

// クエリやハッシュを除いた共有用URLを生成
// origin/pathname を組み立て直して「今開いているページの土台」を必ず使う
const getBaseShareUrl = () => {
  if (window.location.origin && window.location.origin !== 'null') {
    return `${window.location.origin}${window.location.pathname}`;
  }
  return window.location.href.split('?')[0].split('#')[0];
};

// クリップボード書き込みを試し、結果だけを返す
// ブラウザや権限によって失敗する可能性があるので例外は握りつぶしてハンドラ側で処理
const tryCopyToClipboard = async (text) => {
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn('Clipboard copy failed', error);
    return false;
  }
};

export const initShareFeature = ({
  workspace,
  storage,
}) => {
  // 何度も触るDOM要素はここでキャッシュ
  // Modal関連はCode Modalと同じ挙動にしたいので同じクラス構成に揃えている
  const shareBtn = document.getElementById('shareBtn');
  const shareStatus = document.getElementById('shareStatus');
  const shareStatusText = document.getElementById('shareStatusText');
  const shareModal = document.getElementById('shareModal');
  const shareModalInput = document.getElementById('shareModalInput');
  const shareModalCopyBtn = document.getElementById('shareModalCopyBtn');
  const shareModalXBtn = document.getElementById('shareModalXBtn');
  const shareModalClose = document.getElementById('shareModalClose');
  const shareImportModal = document.getElementById('shareImportModal');
  const shareImportModalClose = document.getElementById('shareImportModalClose');
  const shareImportDownloadBtn = document.getElementById('shareImportDownloadBtn');
  const shareImportConfirmBtn = document.getElementById('shareImportConfirmBtn');
  const shareImportCancelBtn = document.getElementById('shareImportCancelBtn');
  const shareImportSkipCheckbox = document.getElementById('shareImportSkipCheckbox');
  const shareViewOverlay = document.getElementById('shareViewOverlay');
  const shareViewStartEditingBtn = document.getElementById('shareViewStartEditingBtn');
  const shareThumbnailWrapper = document.getElementById('shareThumbnailWrapper');
  const shareThumbnailImage = document.getElementById('shareThumbnailImage');
  const shareThumbnailMessage = document.getElementById('shareThumbnailMessage');
  const shareThumbnailCopyBtn = document.getElementById('shareThumbnailCopyBtn');
  let shareThumbnailDataUrl = '';

  let shareStatusTimer;
  let pendingShareEncoded = '';
  let shareViewMode = false;
  const shareViewModeListeners = new Set();
  // モーダル内のテキストボックスでURLの先頭(https...)が常に見えるようにする小技
  // setSelectionRangeを使えるブラウザでは0~lengthを選択して即座にコピーできる状態にする
  const ensureUrlVisible = () => {
    if (!shareModalInput) return;
    shareModalInput.select();
    if (typeof shareModalInput.setSelectionRange === 'function') {
      shareModalInput.setSelectionRange(0, shareModalInput.value.length);
    }
    shareModalInput.scrollLeft = 0;
  };

  // 共有状態を伝えるピル状トースト
  // 「Saved」と同じ挙動になるように、data-show属性のON/OFFとCSSトランジションを使う
  const showShareStatus = (message, state = 'info') => {
    if (!shareStatus || !shareStatusText) return;
    shareStatusText.textContent = message;
    shareStatus.dataset.state = state;
    shareStatus.setAttribute('data-show', 'true');
    if (shareStatusTimer) clearTimeout(shareStatusTimer);
    shareStatusTimer = setTimeout(() => {
      shareStatus.setAttribute('data-show', 'false');
    }, SHARE_STATUS_SHOW_MS);
  };

  const applyShareViewUiState = () => {
    if (shareViewOverlay) {
      shareViewOverlay.classList.toggle('hidden', !shareViewMode);
    }
    if (!workspace) return;
    const toolbox = workspace.getToolbox?.();
    if (toolbox && typeof toolbox.setVisible === 'function') {
      toolbox.setVisible(!shareViewMode);
    }
    const blocks = workspace.getAllBlocks?.(false) ?? [];
    blocks.forEach((block) => {
      if (typeof block.setMovable === 'function') block.setMovable(!shareViewMode);
      if (typeof block.setEditable === 'function') block.setEditable(!shareViewMode);
      if (typeof block.setDeletable === 'function') block.setDeletable(!shareViewMode);
    });
  };

  const setShareViewMode = (enabled) => {
    shareViewMode = enabled;
    applyShareViewUiState();
    shareViewModeListeners.forEach((listener) => {
      try {
        listener(shareViewMode);
      } catch (error) {
        console.error('share view mode listener failed', error);
      }
    });
  };

  const toBase64Svg = (svgString) =>
    `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgString)))}`;

  const setShareThumbnailState = (state, dataUrl = '') => {
    if (!shareThumbnailImage || !shareThumbnailMessage || !shareThumbnailWrapper) return;
    if (state === 'ready' && dataUrl) {
      shareThumbnailImage.src = dataUrl;
      shareThumbnailImage.classList.remove('hidden');
      shareThumbnailMessage.classList.add('hidden');
      shareThumbnailWrapper.classList.remove('opacity-70');
      shareThumbnailDataUrl = dataUrl;
      if (shareThumbnailCopyBtn) shareThumbnailCopyBtn.disabled = false;
      return;
    }
    shareThumbnailImage.classList.add('hidden');
    shareThumbnailWrapper.classList.toggle('opacity-70', state !== 'hidden');
    shareThumbnailMessage.classList.toggle('hidden', state === 'hidden');
    shareThumbnailDataUrl = '';
    if (shareThumbnailCopyBtn) shareThumbnailCopyBtn.disabled = true;
    if (state === 'loading') {
      shareThumbnailMessage.textContent = 'ワークスペースを撮影しています...';
    } else if (state === 'error') {
      shareThumbnailMessage.textContent = 'サムネイルの生成に失敗しました。再試行してください。';
    } else {
      shareThumbnailMessage.textContent = '';
    }
  };

  const captureWorkspaceThumbnail = async () => {
    if (!workspace) throw new Error('WORKSPACE_NOT_READY');

    const canvasSvg = workspace.getCanvas?.() ?? workspace.svgBlockCanvas_;
    if (!canvasSvg) throw new Error('CANVAS_NOT_FOUND');

    const blocks = workspace.getAllBlocks(false);
    if (!blocks.length) throw new Error('NO_BLOCKS_FOUND');

    const clonedCanvas = canvasSvg.cloneNode(true);
    ['width', 'height', 'transform'].forEach((attr) =>
      clonedCanvas.removeAttribute(attr)
    );

    const cssPayload = (window.Blockly?.Css?.CONTENT || []).join('') + BLOCKLY_CAPTURE_EXTRA_CSS;
    clonedCanvas.insertAdjacentHTML('afterbegin', `<style>${cssPayload}</style>`);

    const bbox = canvasSvg.getBBox();
    const padding = 32;
    const minDimension = 64;
    const viewWidth = Math.max(minDimension, Math.ceil(bbox.width + padding * 2));
    const viewHeight = Math.max(minDimension, Math.ceil(bbox.height + padding * 2));
    const viewX = bbox.x - padding;
    const viewY = bbox.y - padding;

    const xml = new XMLSerializer().serializeToString(clonedCanvas);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewWidth}" height="${viewHeight}" viewBox="${viewX} ${viewY} ${viewWidth} ${viewHeight}">${xml}</svg>`;

    // // DEBUG: コメントアウト解除して直接SVGを表示 (デバッグ用)
    // shareThumbnailWrapper.innerHTML = svg;

    const svgDataUrl = toBase64Svg(svg);
    const scaleFactor = Math.min(3, Math.max(1, window.devicePixelRatio || 1));

    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewWidth * scaleFactor);
        canvas.height = Math.ceil(viewHeight * scaleFactor);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('CANVAS_CONTEXT_NOT_AVAILABLE'));
        ctx.scale(scaleFactor, scaleFactor);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = svgDataUrl;
    });
  };

  const refreshShareThumbnail = async () => {
    if (!shareModal || shareModal.classList.contains('hidden')) return null;
    setShareThumbnailState('loading');
    try {
      const dataUrl = await captureWorkspaceThumbnail();
      if (dataUrl) {
        setShareThumbnailState('ready', dataUrl);
      } else {
        setShareThumbnailState('error');
      }
      return dataUrl;
    } catch (error) {
      console.error('Failed to capture workspace thumbnail', error);
      setShareThumbnailState('error');
      return null;
    } finally {
      // no manual refresh button to toggle
    }
  };

  // 共有モーダルの開閉制御
  // Code Modalのアニメーションを参考に、hidden/flex + show-modalクラスで開閉を統一
  const toggleShareModal = (isOpen, url = '') => {
    if (!shareModal || !shareModalInput) return;
    shareModal.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    if (isOpen) {
      shareModalInput.value = url;
      shareModal.classList.remove('hidden');
      shareModal.classList.add('flex');
      void shareModal.offsetWidth;
      shareModal.classList.add('show-modal');
      setTimeout(() => {
        shareModalInput.focus();
        ensureUrlVisible();
        setShareThumbnailState('loading');
        refreshShareThumbnail();
      }, 0);
    } else {
      shareModal.classList.remove('show-modal');
      setTimeout(() => {
        shareModal.classList.remove('flex');
        shareModal.classList.add('hidden');
      }, 300);
      shareModalInput.value = '';
      setShareThumbnailState('hidden');
    }
  };

  const cleanupShareQuery = () => {
    if (typeof window.history.replaceState === 'function') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const showShareImportModal = () => {
    if (!shareImportModal) return;
    if (shareImportSkipCheckbox) {
      shareImportSkipCheckbox.checked = getShareImportSkipPreference();
    }
    shareImportModal.setAttribute('aria-hidden', 'false');
    shareImportModal.classList.remove('hidden');
    shareImportModal.classList.add('flex');
    void shareImportModal.offsetWidth;
    shareImportModal.classList.add('show-modal');
    setTimeout(() => {
      shareImportConfirmBtn?.focus();
    }, 0);
  };

  const hideShareImportModal = () => {
    if (!shareImportModal) {
      return Promise.resolve();
    }
    shareImportModal.setAttribute('aria-hidden', 'true');
    shareImportModal.classList.remove('show-modal');
    return new Promise((resolve) => {
      setTimeout(() => {
        shareImportModal.classList.remove('flex');
        shareImportModal.classList.add('hidden');
        resolve();
      }, 300);
    });
  };

  const finalizeShareImport = (applied) => {
    hideShareImportModal().then(() => {
      if (applied) {
        pendingShareEncoded = '';
        setShareViewMode(false);
        cleanupShareQuery();
      }
    });
  };

  const isShareImportModalOpen = () =>
    !!shareImportModal && !shareImportModal.classList.contains('hidden');

  const importSharedLayoutPayload = (encoded) => {
    if (!storage || !storage.importMinified(encoded)) {
      throw new Error('LOAD_FAILED');
    }
  };

  // 短縮URL生成APIへポストして短縮URLを取得
  const createShortShareUrl = async (encoded) => {
    const response = await fetch(SHARE_SHORTENER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ share: encoded }),
    });
    if (!response.ok) {
      throw new Error(`SHORTENER_HTTP_${response.status}`);
    }
    const data = await response.json();
    if (!data?.url) {
      throw new Error('SHORTENER_RESPONSE_INVALID');
    }
    return data.url;
  };

  const buildShareUrl = (encoded) => `${getBaseShareUrl()}?${SHARE_QUERY_KEY}=${encoded}`;

  const exportSharePayload = () => {
    if (!workspace || !storage) throw new Error('WORKSPACE_NOT_READY');
    const encoded = storage.exportMinified();
    if (!encoded) throw new Error('ENCODE_FAILED');
    return {
      encoded,
      url: buildShareUrl(encoded),
    };
  };

  // URLクエリに埋め込まれた共有データを適用
  // 成功したらlocalStorageにも反映し、その後クエリをクリーンアップして再読込で重複適用されないようにする
  const applySharedLayoutFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(SHARE_QUERY_KEY);
    if (!encoded) return false;

    pendingShareEncoded = encoded;
    try {
      importSharedLayoutPayload(encoded);
      setShareViewMode(true);
      showShareStatus('共有レイアウトを閲覧専用で開いています', 'info');
      return true;
    } catch (error) {
      console.warn('Failed to read shared layout', error);
      showShareStatus('共有データを適用できませんでした', 'error');
      pendingShareEncoded = '';
      setShareViewMode(false);
      if (typeof window.history.replaceState === 'function') {
        window.history.replaceState({}, '', window.location.pathname);
      }
      return false;
    }
  };

  const handleShareImportConfirm = () => {
    if (!pendingShareEncoded) {
      finalizeShareImport(false);
      return;
    }
    if (shareImportConfirmBtn) {
      shareImportConfirmBtn.disabled = true;
      shareImportConfirmBtn.setAttribute('aria-busy', 'true');
    }
    try {
      importSharedLayoutPayload(pendingShareEncoded);
      showShareStatus('共有レイアウトの編集を開始します', 'success');
      finalizeShareImport(true);
    } catch (error) {
      console.warn('Failed to read shared layout', error);
      showShareStatus('共有データを適用できませんでした', 'error');
      finalizeShareImport(false);
    } finally {
      if (shareImportConfirmBtn) {
        shareImportConfirmBtn.disabled = false;
        shareImportConfirmBtn.removeAttribute('aria-busy');
      }
    }
  };

  const handleShareImportCancel = () => {
    if (!isShareImportModalOpen()) return;
    showShareStatus('共有レイアウトの読み込みをキャンセルしました', 'info');
    finalizeShareImport(false);
  };

  // Shareボタンが押されたときのメイン処理
  // URL生成→モーダル表示→自動コピーの順で動き、エラー時はトーストで告知
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      if (shareBtn.disabled) return;
      shareBtn.disabled = true;
      shareBtn.setAttribute('aria-busy', 'true');
      try {
        const { encoded, url } = exportSharePayload();
        toggleShareModal(true, url);
        try {
          const shortUrl = await createShortShareUrl(encoded);
          if (
            shortUrl &&
            shareModalInput &&
            shareModal &&
            !shareModal.classList.contains('hidden')
          ) {
            shareModalInput.value = shortUrl;
            ensureUrlVisible();
          }
        } catch (error) {
          console.error('Failed to create short share url', error);
          showShareStatus('短縮URLの生成に失敗したため通常リンクを表示します', 'error');
        }
      } catch (error) {
        console.error('Failed to generate share url', error);
        showShareStatus('共有リンクの生成に失敗しました', 'error');
      } finally {
        shareBtn.disabled = false;
        shareBtn.removeAttribute('aria-busy');
      }
    });
  }

  // モーダル内の閉じるボタンや背景クリック、Escキーでも閉じられるようにしてUXを揃える
  if (shareModalClose) {
    shareModalClose.addEventListener('click', () => toggleShareModal(false));
  }
  if (shareModal) {
    shareModal.addEventListener('click', (event) => {
      if (event.target === shareModal) toggleShareModal(false);
    });
  }
  // 入力欄をクリック/フォーカスした際に常に全選択させてコピーしやすくする
  if (shareModalInput) {
    shareModalInput.addEventListener('focus', ensureUrlVisible);
    shareModalInput.addEventListener('click', ensureUrlVisible);
  }

  if (shareThumbnailCopyBtn) {
    shareThumbnailCopyBtn.addEventListener('click', async () => {
      if (!shareThumbnailDataUrl) return;
      if (
        !navigator.clipboard ||
        typeof navigator.clipboard.write !== 'function' ||
        typeof window.ClipboardItem !== 'function'
      ) {
        showShareStatus('クリップボードに画像をコピーできません', 'error');
        return;
      }
      try {
        const blob = await (await fetch(shareThumbnailDataUrl)).blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showShareStatus('プレビュー画像をコピーしました！', 'success');
      } catch (error) {
        console.error('Failed to copy thumbnail', error);
        showShareStatus('画像のコピーに失敗しました', 'error');
      }
    });
  }
  // 手動で「リンクをコピー」ボタンを押した場合の処理
  // 自動コピーに失敗した環境でもここで再チャレンジできる
  if (shareModalCopyBtn) {
    shareModalCopyBtn.addEventListener('click', async () => {
      if (!shareModalInput) return;
      ensureUrlVisible();
      const copied = await tryCopyToClipboard(shareModalInput.value);
      if (copied) {
        showShareStatus('共有リンクをコピーしました！', 'success');
      } else {
        showShareStatus('クリップボードにアクセスできません', 'error');
      }
    });
  }
  // Xへ直接ポストするためのボタン。別タブで intent を開く。
  if (shareModalXBtn) {
    shareModalXBtn.addEventListener('click', () => {
      if (!shareModalInput || !shareModalInput.value) return;
      const baseText = encodeURIComponent('Easy Discord Bot BuilderでDiscord BOTを作成しました！ #EDBB');
      const encodedUrl = encodeURIComponent(shareModalInput.value);
      const intentUrl = `https://x.com/intent/tweet?text=${baseText}%0A${encodedUrl}`;
      window.open(intentUrl, '_blank', 'noopener,noreferrer');
      showShareStatus('Xのポスト画面を開きました', 'info');
    });
  }
  // モーダルを開いたままEscを押した場合でも閉じられるようにグローバルで監視
  if (shareModal) {
    document.addEventListener('keydown', (event) => {
      if (
        event.key === 'Escape' &&
        !shareModal.classList.contains('hidden')
      ) {
        toggleShareModal(false);
      }
    });
  }

  if (shareViewStartEditingBtn) {
    shareViewStartEditingBtn.addEventListener('click', () => {
      if (!shareViewMode) return;
      if (getShareImportSkipPreference()) {
        handleShareImportConfirm();
        return;
      }
      showShareImportModal();
    });
  }

  if (shareImportDownloadBtn) {
    shareImportDownloadBtn.addEventListener('click', () => {
      storage?.exportFile();
    });
  }
  if (shareImportConfirmBtn) {
    shareImportConfirmBtn.addEventListener('click', handleShareImportConfirm);
  }
  if (shareImportCancelBtn) {
    shareImportCancelBtn.addEventListener('click', handleShareImportCancel);
  }
  if (shareImportModalClose) {
    shareImportModalClose.addEventListener('click', handleShareImportCancel);
  }
  if (shareImportSkipCheckbox) {
    shareImportSkipCheckbox.addEventListener('change', (event) => {
      setShareImportSkipPreference(Boolean(event.target.checked));
    });
  }
  if (shareImportModal) {
    shareImportModal.addEventListener('click', (event) => {
      if (event.target === shareImportModal) {
        handleShareImportCancel();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isShareImportModalOpen()) {
        handleShareImportCancel();
      }
    });
  }

  return {
    applySharedLayoutFromQuery,
    isShareViewMode: () => shareViewMode,
    onShareViewModeChange: (listener) => {
      if (typeof listener !== 'function') return () => {};
      shareViewModeListeners.add(listener);
      try {
        listener(shareViewMode);
      } catch (error) {
        console.error('share view mode listener failed', error);
      }
      return () => shareViewModeListeners.delete(listener);
    },
  };
};
