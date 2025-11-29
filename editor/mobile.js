(function () {
  const isMobile =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  // Chrome（特にモバイル）で SVG の <text> を直接編集すると
  // キャレット位置や IME が壊れる不具合があるため、
  // 回避策として <input> を同じ位置に重ねて編集させている。
  if (!isMobile) return;
  Blockly.FieldTextInput.prototype.showEditor_ = function () {
    const field = this;
    const svgText = field.textElement_;
    if (!svgText) return;

    const computed = window.getComputedStyle(svgText);
    const font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;

    const input = document.createElement("input");
    input.type = "text";
    input.value = field.getValue();
    input.className = "blocklyMobileInput";

    input.style.position = "absolute";
    input.style.font = font;
    input.style.lineHeight = computed.lineHeight;
    input.style.padding = "0";
    input.style.margin = "0";
    input.style.zIndex = 99999;
    document.body.appendChild(input);

    const syncPosition = () => {
      const r = svgText.getBoundingClientRect();
      input.style.left = `${r.left + window.scrollX}px`;
      input.style.top = `${r.top + window.scrollY}px`;
      input.style.width = `${r.width}px`;
      input.style.height = `${r.height}px`;
    };

    syncPosition();
    input.focus();
    input.select();

    let liveValue = input.value;
    let composing = false;
    let pendingEnter = false;
    let finished = false;

    const update = () => {
      const value = liveValue || " ";

      const ctx = document.createElement("canvas").getContext("2d");
      ctx.font = font;
      const w = ctx.measureText(value).width;

      field.size_.width = w + 8;
      svgText.textContent = value;

      field.sourceBlock_.render();

      requestAnimationFrame(syncPosition);
    };

    const syncFromInput = () => {
      liveValue = input.value;
      update();
    };

    const cleanup = () => {
      window.removeEventListener("resize", syncPosition);
      window.removeEventListener("scroll", syncPosition, true);
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      syncFromInput();
      field.setValue(liveValue);
      cleanup();
      input.remove();
    };

    input.addEventListener("input", syncFromInput);

    input.addEventListener("compositionstart", () => {
      composing = true;
      pendingEnter = false;
    });

    input.addEventListener("compositionupdate", syncFromInput);

    input.addEventListener("compositionend", () => {
      composing = false;
      syncFromInput();
      if (pendingEnter) finish();
    });

    input.addEventListener("blur", finish);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        if (e.isComposing || composing) {
          pendingEnter = true;
          return;
        }
        e.preventDefault();
        finish();
      }
    });

    window.addEventListener("resize", syncPosition);
    window.addEventListener("scroll", syncPosition, true);
  };

})();
