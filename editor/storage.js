export default class WorkspaceStorage {
  static STORAGE_KEY = 'discord_bot_builder_workspace_v5';
  static DOWNLOAD_NAME = 'bot-project.json';

  #workspace;

  constructor(workspace) {
    this.#workspace = workspace;
  }

  // XMLかどうかの大まかな判定
  static #looksLikeXml(text) {
    return typeof text === 'string' && text.trim().startsWith('<');
  }

  // Fileオブジェクトをテキストとして読む
  static #readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file, 'utf-8');
    });
  }

  // --- 公開API ---

  // JSON文字列として取得（ダウンロードせずに利用）
  exportText({ pretty = false } = {}) {
    if (!this.#workspace) return '';
    try {
      const data = Blockly.serialization.workspaces.save(this.#workspace);
      return JSON.stringify(data, null, pretty ? 2 : 0);
    } catch (error) {
      console.error('ワークスペースのシリアライズに失敗しました。', error);
      return '';
    }
  }

  // JSONまたはXML文字列を判別して読み込む
  importText(text) {
    if (WorkspaceStorage.#looksLikeXml(text)) {
      // 旧フォーマット(XML)の場合はDOM化して読込
      const dom = Blockly.Xml.textToDom(text);
      Blockly.Xml.clearWorkspaceAndLoadFromXml(dom, this.#workspace);
      return true;
    }
    try {
      // JSONはシリアライズAPIを使って復元
      const data = JSON.parse(text);
      Blockly.serialization.workspaces.load(data, this.#workspace);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 現在のワークスペース状態をlocalStorageへ保存
  save() {
    const json = this.exportText({ pretty: false });
    if (!json) return;
    try {
      localStorage.setItem(WorkspaceStorage.STORAGE_KEY, json);
    } catch (error) {
      console.error('ワークスペースの保存に失敗しました。', error);
    }
  }

  // localStorageから保存済みデータを復元
  load() {
    const stored = localStorage.getItem(WorkspaceStorage.STORAGE_KEY);
    if (!stored) return false;
    try {
      if (this.importText(stored)) {
        // XMLから読み込んだ場合でも即JSONに変換し直す
        this.save();
        return true;
      }
    } catch (error) {
      console.error('ワークスペースの読み込みに失敗しました。', error);
    }
    return false;
  }

  // JSONファイルとしてダウンロード
  exportFile() {
    const json = this.exportText({ pretty: true });
    if (!json) return;
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = WorkspaceStorage.DOWNLOAD_NAME;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('ワークスペースのエクスポートに失敗しました。', error);
    }
  }

  // ユーザーが選択したファイルを読み込み
  async importFile(file) {
    if (!file) return false;
    try {
      const text = await WorkspaceStorage.#readFile(file);
      if (typeof text !== 'string') throw new Error('ファイルを読み込めませんでした。');
      if (!this.importText(text)) {
        throw new Error('対応していないファイル形式です。');
      }
      this.save();
      return true;
    } catch (error) {
      console.error('ワークスペースのインポートに失敗しました。', error);
      return false;
    }
  }
}
