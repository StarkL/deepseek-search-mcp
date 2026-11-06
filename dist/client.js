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
function SearchButton(props) {
  const sessionObj = props.session ?? props.zone?.session;
  const currentSessionId = sessionObj?.sessionId ?? props.sessionId ?? "default";
  const [active, setActive] = (0, import_react.useState)(() => {
    try {
      return localStorage.getItem(`dsh.webSearchMode.${currentSessionId}`) === "true";
    } catch {
      return false;
    }
  });
  (0, import_react.useEffect)(() => {
    if (!currentSessionId) return;
    try {
      const stored = localStorage.getItem(`dsh.webSearchMode.${currentSessionId}`) === "true";
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
    const next = !active;
    setActive(next);
    try {
      localStorage.setItem(`dsh.webSearchMode.${currentSessionId}`, next ? "true" : "false");
      localStorage.setItem("dsh.webSearchMode.global", next ? "true" : "false");
    } catch {
    }
    restoreFocus();
  };
  return /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      type: "button",
      className: `dsh-search-toggle-btn ${active ? "active" : ""}`,
      title: active ? "\u8054\u7F51\u641C\u7D22\u5DF2\u5F00\u542F\uFF08\u5E38\u4EAE\uFF09\uFF1A\u70B9\u51FB\u53D8\u6697\u5173\u95ED" : "\u8054\u7F51\u641C\u7D22\u5DF2\u5173\u95ED\uFF08\u53D8\u6697\uFF09\uFF1A\u70B9\u51FB\u70B9\u4EAE\u5F00\u542F",
      onClick: handleClick,
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
        // 使用 DSH 官方 Design Token 变量，深色/浅色/自定义主题自适应
        border: active ? "1px solid var(--dsw-alias-brand-primary, #4d6bfe)" : "1px solid var(--dsw-alias-border-l2, rgba(140, 140, 140, 0.28))",
        backgroundColor: active ? "rgba(77, 107, 254, 0.14)" : "var(--dsw-alias-interactive-bg, rgba(255, 255, 255, 0.05))",
        color: active ? "var(--dsw-alias-brand-primary, #4d6bfe)" : "var(--dsw-alias-label-secondary, #8c8c8c)",
        boxShadow: active ? "0 0 8px rgba(77, 107, 254, 0.25)" : "none"
      }
    },
    /* @__PURE__ */ import_react.default.createElement("span", null, "\u8054\u7F51\u641C\u7D22")
  );
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
      try {
        isSearchOn = activeId ? localStorage.getItem(`dsh.webSearchMode.${activeId}`) === "true" : localStorage.getItem("dsh.webSearchMode.global") === "true";
      } catch {
        isSearchOn = false;
      }
      event.options.enableDeepSeekSearch = isSearchOn;
    });
  }
}
var index_default = apply;
  return module.exports;
  } });
})();
