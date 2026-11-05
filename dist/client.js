(function() {
  var __load__ = (typeof window !== "undefined" && window.__ModuleLoader__ && typeof window.__ModuleLoader__.load === "function")
    ? window.__ModuleLoader__.load.bind(window.__ModuleLoader__)
    : function(opts) { if (opts && opts.factory) { try { opts.factory(function() { return {}; }); } catch(e) { console.error(e); } } };
  __load__({ id: "@starkl/deepseek-search-mcp", factory: (require) => {
  var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client-ui/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  default: () => index_default,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var name = "dsh-client-deepseek-search";
var STORAGE_KEY = "dsh_deepseek_search_enabled";
function apply(ctx = {}) {
  let isWebSearchActive = false;
  try {
    isWebSearchActive = localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    isWebSearchActive = false;
  }
  const injectStyles = () => {
    if (typeof document === "undefined") return;
    if (document.getElementById("dsh-search-toggle-style")) return;
    const style = document.createElement("style");
    style.id = "dsh-search-toggle-style";
    style.textContent = `
      .dsh-search-toggle-container {
        display: inline-flex;
        align-items: center;
        margin: 0 4px;
        vertical-align: middle;
      }
      .dsh-search-toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        height: 26px;
        padding: 0 10px;
        border-radius: 9999px;
        font-size: 12px;
        line-height: 1;
        border: 1px solid rgba(140, 140, 140, 0.25);
        background: rgba(255, 255, 255, 0.05);
        color: #8c8c8c;
        cursor: pointer;
        outline: none;
        user-select: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .dsh-search-toggle-btn:hover {
        border-color: #4d6bfe;
        color: #4d6bfe;
        background: rgba(77, 107, 254, 0.08);
      }
      /* \u4EAE\u8D77\u72B6\u6001 (DeepSeek \u5B98\u7F51\u5FAE\u84DD\u9AD8\u4EAE) */
      .dsh-search-toggle-btn.active {
        background: rgba(77, 107, 254, 0.14) !important;
        border-color: #4d6bfe !important;
        color: #4d6bfe !important;
        font-weight: 500;
        box-shadow: 0 0 8px rgba(77, 107, 254, 0.25);
      }
      /* \u52A0\u8F7D\u4E2D\u72B6\u6001 */
      .dsh-search-toggle-btn.loading {
        opacity: 0.65;
        cursor: wait;
        pointer-events: none;
      }
      .dsh-search-toggle-btn .search-icon {
        width: 13px;
        height: 13px;
        flex-shrink: 0;
      }
      .dsh-search-toggle-btn.loading .search-icon {
        animation: dsh-search-spin 1s linear infinite;
      }
      @keyframes dsh-search-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  };
  injectStyles();
  const showToast = (message, type = "info") => {
    try {
      if (ctx?.toast && typeof ctx.toast[type] === "function") {
        ctx.toast[type](message);
        return;
      }
    } catch {
    }
    if (type === "error") {
      alert(message);
    }
  };
  const requestEnsureMcp = async () => {
    try {
      try {
        if (ctx?.deepseekSearchService && typeof ctx.deepseekSearchService.ensureStarted === "function") {
          await ctx.deepseekSearchService.ensureStarted();
          return true;
        }
      } catch {
      }
      if (typeof ctx?.emit === "function") {
        await ctx.emit("deepseekSearch/ensureStarted");
        return true;
      }
      return true;
    } catch (err) {
      const msg = err?.message || String(err);
      showToast(msg, "error");
      return false;
    }
  };
  const createButtonNode = () => {
    const container = document.createElement("div");
    container.className = "dsh-search-toggle-container";
    container.setAttribute("data-dsh-search-mcp", "true");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `dsh-search-toggle-btn ${isWebSearchActive ? "active" : ""}`;
    btn.title = "\u70B9\u51FB\u5207\u6362\u662F\u5426\u542F\u7528 DeepSeek \u5B9E\u65F6\u7F51\u7EDC\u641C\u7D22\u4E0E\u6293\u53D6";
    btn.innerHTML = `
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <span class="btn-text">\u8054\u7F51\u641C\u7D22</span>
    `;
    btn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isWebSearchActive) {
        isWebSearchActive = false;
        document.querySelectorAll(".dsh-search-toggle-btn").forEach((el) => el.classList.remove("active"));
        try {
          localStorage.setItem(STORAGE_KEY, "false");
        } catch {
        }
        showToast("\u5DF2\u5173\u95ED\u8054\u7F51\u641C\u7D22", "info");
        return;
      }
      btn.classList.add("loading");
      const ok = await requestEnsureMcp();
      btn.classList.remove("loading");
      if (ok) {
        isWebSearchActive = true;
        document.querySelectorAll(".dsh-search-toggle-btn").forEach((el) => el.classList.add("active"));
        try {
          localStorage.setItem(STORAGE_KEY, "true");
        } catch {
        }
        showToast("\u8054\u7F51\u641C\u7D22\u5DF2\u5C31\u7EEA", "success");
      } else {
        isWebSearchActive = false;
        btn.classList.remove("active");
      }
    };
    container.appendChild(btn);
    return container;
  };
  try {
    const slots = ctx?.slots;
    if (slots && typeof slots.register === "function") {
      const slotNames = ["conversation.input.dock", "conversation.input.left", "conversation.input.bottom"];
      slotNames.forEach((slotName) => {
        try {
          slots.register(slotName, {
            id: `deepseek-search-toggle-${slotName}`,
            order: 15,
            render: createButtonNode
          });
        } catch {
        }
      });
    }
  } catch {
  }
  const tryMountToDom = () => {
    if (typeof document === "undefined") return;
    if (document.querySelector("[data-dsh-search-mcp='true']")) {
      return;
    }
    const allButtons = Array.from(document.querySelectorAll("button, div, span"));
    const workspaceElem = allButtons.find((el) => {
      const text = el.textContent || "";
      return text.includes("\u5DE5\u4F5C\u533A\u5185\u4FEE\u6539") || text.includes("\u5DE5\u4F5C\u533A");
    });
    if (workspaceElem) {
      let targetParent = workspaceElem;
      while (targetParent && targetParent.parentElement) {
        if (targetParent.parentElement.querySelector("button") && targetParent.parentElement.children.length >= 2) {
          const container = createButtonNode();
          if (targetParent.nextSibling) {
            targetParent.parentElement.insertBefore(container, targetParent.nextSibling);
          } else {
            targetParent.parentElement.appendChild(container);
          }
          return;
        }
        targetParent = targetParent.parentElement;
      }
    }
    const textarea = document.querySelector("textarea");
    if (textarea && textarea.parentElement) {
      const parentCard = textarea.parentElement.parentElement || textarea.parentElement;
      const bottomRow = parentCard.querySelector("div:last-child");
      if (bottomRow && bottomRow !== textarea.parentElement) {
        const container = createButtonNode();
        bottomRow.appendChild(container);
      }
    }
  };
  tryMountToDom();
  if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
    const observer = new MutationObserver(() => {
      tryMountToDom();
    });
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }
  if (typeof ctx?.on === "function") {
    ctx.on("conversation/before-send", (event) => {
      if (!event) return;
      event.options = event.options || {};
      event.options.enableDeepSeekSearch = isWebSearchActive;
    });
  }
}
if (typeof window !== "undefined") {
  if (!window.__DSH_DEEPSEEK_SEARCH_CLIENT_LOADED__) {
    window.__DSH_DEEPSEEK_SEARCH_CLIENT_LOADED__ = true;
    apply();
  }
}
var index_default = apply;
  return module.exports;
  } });
})();
