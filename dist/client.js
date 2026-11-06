(function() {
  var __load__ = (typeof window !== "undefined" && window.__ModuleLoader__ && typeof window.__ModuleLoader__.load === "function")
    ? window.__ModuleLoader__.load.bind(window.__ModuleLoader__)
    : function(opts) { if (opts && opts.factory) { try { opts.factory(function() { return {}; }); } catch(e) { console.error(e); } } };
  __load__({ id: "dsh-deepseek-search", factory: (require) => {
  var module = { exports: {} }; var exports = module.exports;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client-ui/index.tsx
var index_exports = {};
__export(index_exports, {
  SearchButton: () => SearchButton,
  apply: () => apply,
  default: () => index_default,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var import_react = __toESM(require("react"), 1);
var name = "dsh-client-deepseek-search";
var inject = ["slots"];
var STORAGE_MODE_KEY_PREFIX = "dsh.webSearchMode.";
var STORAGE_API_KEY = "dsh_deepseek_search_api_key";
function SearchButton(props) {
  const sessionObj = props.session ?? props.zone?.session;
  const currentSessionId = sessionObj?.sessionId ?? props.sessionId ?? "default";
  const [active, setActive] = (0, import_react.useState)(() => {
    try {
      return localStorage.getItem(`${STORAGE_MODE_KEY_PREFIX}${currentSessionId}`) === "true";
    } catch {
      return false;
    }
  });
  const [isModalOpen, setIsModalOpen] = (0, import_react.useState)(false);
  const [apiKeyInput, setApiKeyInput] = (0, import_react.useState)("");
  const [showPassword, setShowPassword] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    if (!currentSessionId) return;
    try {
      const stored = localStorage.getItem(`${STORAGE_MODE_KEY_PREFIX}${currentSessionId}`) === "true";
      setActive(stored);
    } catch {
    }
  }, [currentSessionId]);
  const restoreFocus = () => {
    setTimeout(() => {
      const editor = document.querySelector('[contenteditable="true"]') || document.querySelector("textarea");
      if (editor) {
        editor.focus();
      }
    }, 20);
  };
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (active) {
      setActive(false);
      try {
        localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}${currentSessionId}`, "false");
        localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}global`, "false");
      } catch {
      }
      restoreFocus();
      return;
    }
    let savedKey = "";
    try {
      savedKey = localStorage.getItem(STORAGE_API_KEY) || "";
    } catch {
    }
    if (!savedKey.trim()) {
      setApiKeyInput("");
      setIsModalOpen(true);
      return;
    }
    setActive(true);
    try {
      localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}${currentSessionId}`, "true");
      localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}global`, "true");
    } catch {
    }
    restoreFocus();
  };
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const existing = localStorage.getItem(STORAGE_API_KEY) || "";
      setApiKeyInput(existing);
    } catch {
    }
    setIsModalOpen(true);
  };
  const handleSaveKey = () => {
    const trimmed = apiKeyInput.trim();
    try {
      localStorage.setItem(STORAGE_API_KEY, trimmed);
      localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}${currentSessionId}`, "true");
      localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}global`, "true");
    } catch {
    }
    setActive(true);
    setIsModalOpen(false);
    restoreFocus();
  };
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      type: "button",
      className: `dsh-search-toggle-btn ${active ? "active" : ""}`,
      title: active ? "\u8054\u7F51\u641C\u7D22\u5DF2\u5F00\u542F\uFF08\u5E38\u4EAE\uFF09\uFF1A\u70B9\u51FB\u53D8\u6697\u5173\u95ED\uFF0C\u53F3\u952E\u53EF\u4FEE\u6539\u914D\u7F6E" : "\u8054\u7F51\u641C\u7D22\u5DF2\u5173\u95ED\uFF08\u53D8\u6697\uFF09\uFF1A\u70B9\u51FB\u70B9\u4EAE\u5F00\u542F\uFF0C\u53F3\u952E\u53EF\u914D\u7F6E API Key",
      onClick: handleClick,
      onContextMenu: handleContextMenu,
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: "26px",
        padding: "0 12px",
        borderRadius: "13px",
        fontSize: "12px",
        lineHeight: "20px",
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        userSelect: "none",
        outline: "none",
        transition: "all 0.15s ease-in-out",
        // 使用 DSH 官方 Design Token 变量，自适应所有主题
        border: active ? "1px solid var(--dsw-alias-brand-primary, #4d6bfe)" : "1px solid var(--dsw-alias-border-l2, rgba(140, 140, 140, 0.28))",
        backgroundColor: active ? "rgba(77, 107, 254, 0.14)" : "var(--dsw-alias-interactive-bg, rgba(255, 255, 255, 0.05))",
        color: active ? "var(--dsw-alias-brand-primary, #4d6bfe)" : "var(--dsw-alias-label-secondary, #8c8c8c)",
        boxShadow: active ? "0 0 8px rgba(77, 107, 254, 0.25)" : "none"
      }
    },
    /* @__PURE__ */ import_react.default.createElement("span", null, "\u8054\u7F51\u641C\u7D22")
  ), isModalOpen && /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(6px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      },
      onClick: () => setIsModalOpen(false)
    },
    /* @__PURE__ */ import_react.default.createElement(
      "div",
      {
        style: {
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "var(--dsw-alias-surface-panel, rgba(28, 28, 32, 0.95))",
          backdropFilter: "blur(20px)",
          color: "var(--dsw-alias-label-primary, #ffffff)",
          border: "1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.12))",
          borderRadius: "14px",
          boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.5)",
          padding: "20px 24px",
          boxSizing: "border-box"
        },
        onClick: (e) => e.stopPropagation()
      },
      /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "15px", fontWeight: 600 } }, "\u914D\u7F6E DeepSeek \u8054\u7F51\u641C\u7D22"), /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          type: "button",
          style: {
            background: "transparent",
            border: "none",
            color: "var(--dsw-alias-label-secondary, #8c8c8c)",
            cursor: "pointer",
            fontSize: "16px",
            lineHeight: 1,
            padding: "4px"
          },
          onClick: () => setIsModalOpen(false)
        },
        "\u2715"
      )),
      /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "12.5px", color: "var(--dsw-alias-label-secondary, #9ca3af)", lineHeight: 1.5, marginBottom: "16px" } }, "\u63A5\u5165 DeepSeek \u5B98\u65B9\u7F51\u9875\u641C\u7D22 (Search) \u4E0E\u5185\u5BB9\u6293\u53D6 (Fetch) \u80FD\u529B\u3002", /* @__PURE__ */ import_react.default.createElement(
        "a",
        {
          href: "https://api-docs.deepseek.com/zh-cn/guides/search/",
          target: "_blank",
          rel: "noreferrer",
          style: { color: "#4d6bfe", marginLeft: "4px", textDecoration: "none" }
        },
        "\u5B98\u65B9\u63A5\u53E3\u6587\u6863 \u2197"
      )),
      /* @__PURE__ */ import_react.default.createElement("div", { style: { marginBottom: "16px" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "12px", fontWeight: 500, marginBottom: "6px" } }, "DeepSeek API Key"), /* @__PURE__ */ import_react.default.createElement("div", { style: { position: "relative", display: "flex", alignItems: "center" } }, /* @__PURE__ */ import_react.default.createElement(
        "input",
        {
          type: showPassword ? "text" : "password",
          placeholder: "sk-...",
          value: apiKeyInput,
          onChange: (e) => setApiKeyInput(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSaveKey();
            } else if (e.key === "Escape") {
              setIsModalOpen(false);
            }
          },
          autoFocus: true,
          style: {
            width: "100%",
            height: "36px",
            padding: "0 38px 0 10px",
            borderRadius: "8px",
            border: "1px solid var(--dsw-alias-border-l1, rgba(140, 140, 140, 0.35))",
            backgroundColor: "var(--dsw-alias-interactive-bg, rgba(255, 255, 255, 0.04))",
            color: "inherit",
            fontSize: "13px",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "monospace"
          }
        }
      ), /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          type: "button",
          style: {
            position: "absolute",
            right: "8px",
            background: "transparent",
            border: "none",
            color: "var(--dsw-alias-label-secondary, #8c8c8c)",
            cursor: "pointer",
            fontSize: "13px",
            padding: "4px"
          },
          onClick: () => setShowPassword(!showPassword),
          title: showPassword ? "\u9690\u85CF" : "\u663E\u793A"
        },
        showPassword ? "\u{1F648}" : "\u{1F441}"
      ))),
      /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "11.5px", color: "var(--dsw-alias-label-tertiary, #6b7280)", lineHeight: 1.4, marginBottom: "20px" } }, "\u5BC6\u94A5\u4EC5\u4FDD\u5B58\u5728\u60A8\u5F53\u524D\u7535\u8111\u672C\u5730\u8BBE\u5907\u3002\u8FD8\u6CA1\u6709 API Key\uFF1F", /* @__PURE__ */ import_react.default.createElement(
        "a",
        {
          href: "https://platform.deepseek.com/",
          target: "_blank",
          rel: "noreferrer",
          style: { color: "#4d6bfe", marginLeft: "4px", textDecoration: "none" }
        },
        "\u524D\u5F80\u5E73\u53F0\u83B7\u53D6 \u2197"
      )),
      /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: "10px" } }, /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          type: "button",
          style: {
            height: "32px",
            padding: "0 14px",
            borderRadius: "8px",
            fontSize: "12px",
            border: "1px solid var(--dsw-alias-border-l2, rgba(140, 140, 140, 0.3))",
            backgroundColor: "transparent",
            color: "var(--dsw-alias-label-secondary, #9ca3af)",
            cursor: "pointer"
          },
          onClick: () => setIsModalOpen(false)
        },
        "\u53D6\u6D88"
      ), /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          type: "button",
          style: {
            height: "32px",
            padding: "0 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 500,
            border: "none",
            backgroundColor: "#4d6bfe",
            color: "#ffffff",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(77, 107, 254, 0.35)"
          },
          onClick: handleSaveKey
        },
        "\u4FDD\u5B58\u5E76\u5F00\u542F"
      ))
    )
  ));
}
function apply(ctx) {
  ctx.inject(["slots"], (scope) => {
    scope.slots.inject(
      "conversation.input.left",
      () => scope.slots.register(
        {
          name: "conversation.input.left",
          id: "dsh-deepseek-search-toggle",
          order: 10,
          inject: (sessionId) => ({ sessionId })
        },
        SearchButton
      )
    );
  });
  if (typeof ctx?.on === "function") {
    ctx.on("conversation/before-send", (event) => {
      if (!event) return;
      event.options = event.options || {};
      const activeId = event.session?.sessionId || event.sessionId;
      let isSearchOn = false;
      let userKey = "";
      try {
        isSearchOn = activeId ? localStorage.getItem(`${STORAGE_MODE_KEY_PREFIX}${activeId}`) === "true" : localStorage.getItem(`${STORAGE_MODE_KEY_PREFIX}global`) === "true";
        userKey = localStorage.getItem(STORAGE_API_KEY) || "";
      } catch {
        isSearchOn = false;
      }
      event.options.enableDeepSeekSearch = isSearchOn;
      if (userKey) {
        event.options.deepseekApiKey = userKey;
      }
    });
  }
}
var index_default = apply;
  return module.exports;
  } });
})();
