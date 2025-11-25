import { loadTemplates as loadBlockTemplates, generateBlocks } from "./blocks.js";
import PythonGenerator, { loadTemplates as loadCodeTemplates } from "./generator.js";




let workspace;
const STORAGE_KEY = "discord_bot_builder_workspace_v5";

Blockly.Blocks["custom_python_code"] = {
  init: function () {
    this.appendDummyInput().appendField("🐍 Pythonコード実行");
    this.appendDummyInput().appendField(
      new Blockly.FieldMultilineInput("print('Hello World')"),
      "CODE"
    );
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
  },
};

const setupBlocklyEnvironment = (Blocks) => {
  if (Blockly.common?.defineBlocks) {
    Blockly.common.defineBlocks(Blocks);
  }
  Object.assign(Blockly.Blocks, Blocks);
  Object.assign(Blockly.Python, PythonGenerator);
  Blockly.Python.INDENT = "    ";

  const modernLightTheme = Blockly.Theme.defineTheme("modernLight", {
    base: Blockly.Themes.Classic,
    componentStyles: {
      workspaceBackgroundColour: "#f8fafc",
      toolboxBackgroundColour: "#ffffff",
      toolboxForegroundColour: "#475569",
    },
  });

  const modernDarkTheme = Blockly.Theme.defineTheme("modernDark", {
    base: Blockly.Themes.Classic,
    componentStyles: {
      workspaceBackgroundColour: "#020617",
      toolboxBackgroundColour: "#0f172a",
      toolboxForegroundColour: "#cbd5e1",
    },
  });

  return { modernLightTheme, modernDarkTheme };
};

const html = document.documentElement;

const generatePythonCode = () => {
  if (!workspace) return "";
  const rawCode = Blockly.Python.workspaceToCode(workspace);

  const buttons = [];
  const modals = [];

  rawCode.split("\n").forEach((line) => {
    if (line.includes("# BUTTON_EVENT:")) {
      const name = line.split(":")[1].trim();
      buttons.push(
        `if interaction.data.get('custom_id') == '${name}':\n            await on_button_${name}(interaction)`
      );
    }
    if (line.includes("# MODAL_EVENT:")) {
      const name = line.split(":")[1].trim();
      modals.push(
        `if interaction.data.get('custom_id') == '${name}':\n            await on_modal_${name}(interaction)`
      );
    }
  });

  const componentEvents = buttons.length ? buttons.join("\n            ") : "pass";
  const modalEvents = modals.length ? modals.join("\n            ") : "pass";

  const code = `
import discord, random, asyncio, datetime, json, os
from discord.ext import commands
import os
intents = discord.Intents.default()
intents.message_content = intents.members = intents.voice_states = True

bot = commands.Bot(command_prefix='!', intents=intents)

def _load_json_data(f): return json.load(open(f, encoding='utf-8')) if os.path.exists(f) else {}
def _save_json_data(f, d): json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

class EasyModal(discord.ui.Modal):
    def __init__(self, title, custom_id, inputs):
        super().__init__(title=title, timeout=None, custom_id=custom_id)
        for i in inputs:
            self.add_item(discord.ui.TextInput(label=i['label'], custom_id=i['id']))

@bot.event
async def on_interaction(interaction):
    if interaction.type == discord.InteractionType.component:
        ${componentEvents}
    elif interaction.type == discord.InteractionType.modal_submit:
        ${modalEvents}

${rawCode}
# ユーザー操作
if __name__ == "__main__":
    bot.run(os.getenv('TOKEN'))
`;

  return code.replace(/\n{3,}/g, "\n").trim();
};

const updateLivePreview = () => {
  const code = generatePythonCode();
  const preview = document.getElementById("codePreviewContent");
  preview.textContent = code;
  hljs.highlightElement(preview);
};

const toggleTheme = (modernLightTheme, modernDarkTheme) => {
  const currentTheme = html.classList.contains("dark") ? "dark" : "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  html.classList.remove(currentTheme);
  html.classList.add(newTheme);
  localStorage.setItem("theme", newTheme);
  if (workspace) {
    workspace.setTheme(newTheme === "dark" ? modernDarkTheme : modernLightTheme);
  }
};

const initializeApp = (Blocks) => {
  lucide.createIcons();
  const { modernLightTheme, modernDarkTheme } = setupBlocklyEnvironment(Blocks);

  const blocklyDiv = document.getElementById("blocklyDiv");
  const toolbox = document.getElementById("toolbox");
  const themeToggle = document.getElementById("themeToggle");
  const showCodeBtn = document.getElementById("showCodeBtn");
  const codeModal = document.getElementById("codeModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const codeOutput = document.getElementById("codeOutput");
  const copyCodeBtn = document.getElementById("copyCodeBtn");
  const downloadCodeBtn = document.getElementById("downloadCodeBtn");
  const importBtn = document.getElementById("importBtn");
  const exportBtn = document.getElementById("exportBtn");
  const importInput = document.getElementById("importInput");
  const workspaceContainer = document.getElementById("workspace-container");
  const layoutBlockBtn = document.getElementById("layoutBlockBtn");
  const layoutSplitBtn = document.getElementById("layoutSplitBtn");

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") html.classList.add("dark");
  const initialTheme = savedTheme === "dark" ? modernDarkTheme : modernLightTheme;

  Blockly.VerticalFlyout.prototype.getFlyoutScale = function () {
    return 1;
  };

  workspace = Blockly.inject(blocklyDiv, {
    toolbox: toolbox,
    horizontalLayout: false,
    trashcan: true,
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2,
    },
    renderer: "zelos",
    theme: initialTheme,
  });

  if (workspace.getToolbox()) {
    const flyout = workspace.getToolbox().getFlyout();
    if (flyout) {
      flyout.autoClose = false;
    }
  }

  const setLayout = (mode) => {
    if (mode === "split") {
      workspaceContainer.classList.add("split-view");
      layoutSplitBtn.classList.remove("text-slate-500", "dark:text-slate-400");
      layoutSplitBtn.classList.add(
        "bg-white",
        "dark:bg-slate-800",
        "shadow-sm",
        "text-indigo-600",
        "dark:text-indigo-400"
      );

      layoutBlockBtn.classList.remove(
        "bg-white",
        "dark:bg-slate-800",
        "shadow-sm",
        "text-indigo-600",
        "dark:text-indigo-400"
      );
      layoutBlockBtn.classList.add("text-slate-500", "dark:text-slate-400");
      updateLivePreview();
    } else {
      workspaceContainer.classList.remove("split-view");
      layoutBlockBtn.classList.remove("text-slate-500", "dark:text-slate-400");
      layoutBlockBtn.classList.add(
        "bg-white",
        "dark:bg-slate-800",
        "shadow-sm",
        "text-indigo-600",
        "dark:text-indigo-400"
      );

      layoutSplitBtn.classList.remove(
        "bg-white",
        "dark:bg-slate-800",
        "shadow-sm",
        "text-indigo-600",
        "dark:text-indigo-400"
      );
      layoutSplitBtn.classList.add("text-slate-500", "dark:text-slate-400");
    }
    setTimeout(() => Blockly.svgResize(workspace), 350);
  };

  layoutBlockBtn.addEventListener("click", () => setLayout("block"));
  layoutSplitBtn.addEventListener("click", () => setLayout("split"));

  workspace.addChangeListener((e) => {
    if (e.type !== Blockly.Events.UI && workspaceContainer.classList.contains("split-view")) {
      updateLivePreview();
    }

    if (!e.isUiEvent && e.type !== Blockly.Events.FINISHED_LOADING) {
      const xml = Blockly.Xml.workspaceToDom(workspace);
      localStorage.setItem(STORAGE_KEY, Blockly.Xml.domToText(xml));
      const saveStatus = document.getElementById("saveStatus");
      saveStatus.setAttribute("data-show", "true");
      setTimeout(() => saveStatus.setAttribute("data-show", "false"), 2000);
    }
  });

  const pinBtn = document.createElement("button");
  pinBtn.id = "toolboxPinBtn";
  pinBtn.className =
    "absolute z-20 p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-all duration-200 shadow-sm border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50";
  pinBtn.style.top = "12px";

  const updatePinState = () => {
    if (!workspace) return;
    const toolbox = workspace.getToolbox();
    if (!toolbox) return;

    let isVisible = true;
    if (typeof toolbox.isVisible === "function") {
      isVisible = toolbox.isVisible();
    } else if (typeof toolbox.getWidth === "function") {
      isVisible = toolbox.getWidth() > 0;
    }

    const width = typeof toolbox.getWidth === "function" ? toolbox.getWidth() : 0;

    if (isVisible) {
      pinBtn.style.left = `${width - 38}px`;
      pinBtn.innerHTML =
        '<i data-lucide="pin" class="w-3.5 h-3.5 fill-indigo-500 text-indigo-600"></i>';
      pinBtn.classList.add("bg-white", "dark:bg-slate-800");
    } else {
      pinBtn.style.left = "12px";
      pinBtn.innerHTML = '<i data-lucide="pin-off" class="w-3.5 h-3.5"></i>';
      pinBtn.classList.remove("bg-white", "dark:bg-slate-800");
      pinBtn.classList.add("bg-white/80", "dark:bg-slate-800/80", "backdrop-blur-sm");
    }
    lucide.createIcons();
  };

  pinBtn.onclick = () => {
    const toolbox = workspace.getToolbox();
    if (!toolbox) return;
    const isVisible =
      typeof toolbox.isVisible === "function" ? toolbox.isVisible() : toolbox.getWidth() > 0;
    if (typeof toolbox.setVisible === "function") toolbox.setVisible(!isVisible);
    Blockly.svgResize(workspace);
    setTimeout(updatePinState, 50);
  };

  document.getElementById("blocklyDiv").appendChild(pinBtn);
  setTimeout(updatePinState, 100);

  window.addEventListener("resize", () => {
    Blockly.svgResize(workspace);
    updatePinState();
  });

  workspace.addChangeListener((e) => {
    if (e.type === Blockly.Events.TOOLBOX_ITEM_SELECT) setTimeout(updatePinState, 50);
  });

  const xmlText = localStorage.getItem(STORAGE_KEY);
  if (xmlText) {
    try {
      Blockly.Xml.clearWorkspaceAndLoadFromXml(Blockly.Xml.textToDom(xmlText), workspace);
    } catch (e) {}
  }

  themeToggle.addEventListener("click", () => toggleTheme(modernLightTheme, modernDarkTheme));

  importBtn.addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        Blockly.Xml.clearWorkspaceAndLoadFromXml(
          Blockly.Xml.textToDom(e.target.result),
          workspace
        );
      } catch (err) {}
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  exportBtn.addEventListener("click", () => {
    const xml = Blockly.Xml.workspaceToDom(workspace);
    const blob = new Blob([Blockly.Xml.domToText(xml)], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bot-project.xml`;
    a.click();
    URL.revokeObjectURL(url);
  });

  showCodeBtn.addEventListener("click", () => {
    showCodeBtn.blur();
    if (workspace) Blockly.hideChaff();
    codeOutput.textContent = generatePythonCode();
    codeModal.classList.remove("hidden");
    codeModal.classList.add("flex");
    void codeModal.offsetWidth;
    codeModal.classList.add("show-modal");
  });

  closeModalBtn.addEventListener("click", () => {
    codeModal.classList.remove("show-modal");
    setTimeout(() => {
      codeModal.classList.remove("flex");
      codeModal.classList.add("hidden");
    }, 300);
  });

  copyCodeBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(codeOutput.textContent);
    const originalHtml = copyCodeBtn.innerHTML;
    copyCodeBtn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5"></i> コピー完了';
    copyCodeBtn.classList.remove("bg-indigo-600", "hover:bg-indigo-500");
    copyCodeBtn.classList.add("bg-emerald-600", "hover:bg-emerald-500", "border-emerald-400");
    lucide.createIcons();

    setTimeout(() => {
      copyCodeBtn.innerHTML = originalHtml;
      copyCodeBtn.classList.add("bg-indigo-600", "hover:bg-indigo-500");
      copyCodeBtn.classList.remove("bg-emerald-600", "hover:bg-emerald-500", "border-emerald-400");
      lucide.createIcons();
    }, 2000);
  });
  downloadCodeBtn.addEventListener("click", () => {
    const zip = new JSZip();
    zip.file("bot-project.py", codeOutput.textContent);
    zip.file(".env", "TOKEN=YOUR_TOKEN\n");
    zip.generateAsync({ type: "blob" }).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bot-project.zip`;
      a.click();
      URL.revokeObjectURL(url);
    });
  });

};

window.onload = async () => {
  await Promise.all([loadBlockTemplates(), loadCodeTemplates()]);
  const Blocks = generateBlocks();
  initializeApp(Blocks);
};
