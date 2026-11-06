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
  const [loading, setLoading] = (0, import_react.useState)(false);
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
    }, 30);
  };
  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (active) {
      setActive(false);
      try {
        localStorage.setItem(`dsh.webSearchMode.${currentSessionId}`, "false");
        localStorage.setItem("dsh.webSearchMode.global", "false");
      } catch {
      }
      restoreFocus();
      return;
    }
    setLoading(true);
    let ok = false;
    try {
      if (window.__DSH_DEEPSEEK_SEARCH_ENSURE__) {
        await window.__DSH_DEEPSEEK_SEARCH_ENSURE__();
        ok = true;
      } else {
        ok = true;
      }
    } catch (err) {
      alert(err?.message || "\u542F\u52A8\u8054\u7F51\u641C\u7D22\u670D\u52A1\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5 DEEPSEEK_API_KEY \u914D\u7F6E");
      ok = false;
    } finally {
      setLoading(false);
    }
    if (ok) {
      setActive(true);
      try {
        localStorage.setItem(`dsh.webSearchMode.${currentSessionId}`, "true");
        localStorage.setItem("dsh.webSearchMode.global", "true");
      } catch {
      }
    } else {
      setActive(false);
    }
    restoreFocus();
  };
  return /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      type: "button",
      className: `dsh-search-toggle-btn ${active ? "active" : ""} ${loading ? "loading" : ""}`,
      title: active ? "\u8054\u7F51\u641C\u7D22\u5DF2\u5F00\u542F\uFF08\u5E38\u4EAE\uFF09\uFF1A\u70B9\u51FB\u53D8\u6697\u5173\u95ED" : "\u8054\u7F51\u641C\u7D22\u5DF2\u5173\u95ED\uFF08\u53D8\u6697\uFF09\uFF1A\u70B9\u51FB\u70B9\u4EAE\u5F00\u542F",
      onClick: handleClick,
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        height: "26px",
        padding: "0 10px",
        borderRadius: "13px",
        fontSize: "12px",
        lineHeight: "20px",
        fontWeight: active ? 600 : 500,
        cursor: loading ? "wait" : "pointer",
        userSelect: "none",
        outline: "none",
        transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
        // 样式严格对齐聊天框底部工具栏：未激活时为半透明浅灰，激活时为官网亮蓝微光
        border: active ? "1px solid #4d6bfe" : "1px solid rgba(140, 140, 140, 0.28)",
        backgroundColor: active ? "rgba(77, 107, 254, 0.14)" : "rgba(255, 255, 255, 0.05)",
        color: active ? "#4d6bfe" : "var(--dsw-alias-label-secondary, #8c8c8c)",
        boxShadow: active ? "0 0 8px rgba(77, 107, 254, 0.28)" : "none",
        opacity: loading ? 0.7 : 1
      }
    },
    /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "13px", lineHeight: "1" } }, "\u{1F310}"),
    /* @__PURE__ */ import_react.default.createElement("span", null, loading ? "\u5C31\u7EEA\u4E2D..." : "\u8054\u7F51\u641C\u7D22")
  );
}
function apply(ctx) {
  if (typeof window !== "undefined") {
    window.__DSH_DEEPSEEK_SEARCH_ENSURE__ = async () => {
      if (ctx?.deepseekSearchService?.ensureStarted) {
        return ctx.deepseekSearchService.ensureStarted();
      }
      if (typeof ctx?.emit === "function") {
        return ctx.emit("deepseekSearch/ensureStarted");
      }
      return true;
    };
  }
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
      const isSearchOn = activeId ? localStorage.getItem(`dsh.webSearchMode.${activeId}`) === "true" : localStorage.getItem("dsh.webSearchMode.global") === "true";
      event.options.enableDeepSeekSearch = isSearchOn;
    });
  }
}
var index_default = apply;
  return module.exports;
  } });
})();
