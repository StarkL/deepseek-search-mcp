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
var name = "dsh-deepseek-search";
var inject = ["slots", "remote.commands", "sessions"];
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
    const nextState = !active;
    setActive(nextState);
    try {
      localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}${currentSessionId}`, nextState ? "true" : "false");
      localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}global`, nextState ? "true" : "false");
    } catch {
    }
    if (props.onExecuteCommand) {
      if (nextState) {
        let customKey = "";
        try {
          customKey = localStorage.getItem(STORAGE_API_KEY) || "";
        } catch {
        }
        if (customKey.trim()) {
          props.onExecuteCommand(`/deepseek-search key ${customKey.trim()}`, currentSessionId).catch(() => {
          });
        }
        props.onExecuteCommand("/deepseek-search on", currentSessionId).catch(() => {
        });
      } else {
        props.onExecuteCommand("/deepseek-search off", currentSessionId).catch(() => {
        });
      }
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
      if (trimmed) {
        localStorage.setItem(STORAGE_API_KEY, trimmed);
      } else {
        localStorage.removeItem(STORAGE_API_KEY);
      }
    } catch {
    }
    if (props.onExecuteCommand) {
      if (trimmed) {
        props.onExecuteCommand(`/deepseek-search key ${trimmed}`, currentSessionId).catch(() => {
        });
      }
    }
    setIsModalOpen(false);
    restoreFocus();
  };
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      type: "button",
      className: `dsh-search-toggle-btn ${active ? "active" : ""}`,
      title: active ? "\u8054\u7F51\u641C\u7D22\u5DF2\u5F00\u542F\uFF08\u5E38\u4EAE\uFF09\uFF1A\u70B9\u51FB\u5173\u95ED\uFF0C\u53F3\u952E\u53EF\u4FEE\u6539\u914D\u7F6E" : "\u8054\u7F51\u641C\u7D22\u5DF2\u5173\u95ED\uFF08\u53D8\u6697\uFF09\uFF1A\u70B9\u51FB\u5F00\u542F\uFF0C\u53F3\u952E\u53EF\u914D\u7F6E API Key",
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
        transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: active ? "var(--dsw-alias-brand-primary, #4d6bfe)" : "var(--dsw-alias-interactive-bg, rgba(0, 0, 0, 0.04))",
        border: active ? "1px solid var(--dsw-alias-brand-primary, #4d6bfe)" : "1px solid var(--dsw-alias-border-l2, rgba(140, 140, 140, 0.25))",
        color: active ? "#ffffff" : "var(--dsw-alias-label-secondary, #6b7280)",
        boxShadow: active ? "0 0 6px rgba(77, 107, 254, 0.35)" : "none"
      }
    },
    /* @__PURE__ */ import_react.default.createElement("span", null, "\u8054\u7F51\u641C\u7D22")
  ), isModalOpen && /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      role: "dialog",
      "aria-modal": "true",
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999
      },
      onClick: () => setIsModalOpen(false)
    },
    /* @__PURE__ */ import_react.default.createElement(
      "div",
      {
        style: {
          width: "440px",
          maxWidth: "92vw",
          backgroundColor: "var(--dsw-alias-bg-elevated, #ffffff)",
          color: "var(--dsw-alias-label-primary, #111827)",
          borderRadius: "14px",
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.24)",
          padding: "24px",
          boxSizing: "border-box",
          border: "1px solid var(--dsw-alias-border-l1, rgba(140, 140, 140, 0.2))",
          animation: "fadeIn 0.15s ease-out"
        },
        onClick: (e) => e.stopPropagation()
      },
      /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "16px", fontWeight: 600 } }, "DeepSeek \u8054\u7F51\u641C\u7D22\u914D\u7F6E"), /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          type: "button",
          style: {
            background: "transparent",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "var(--dsw-alias-label-secondary, #8c8c8c)",
            padding: "4px 8px"
          },
          onClick: () => setIsModalOpen(false)
        },
        "\xD7"
      )),
      /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "13px", color: "var(--dsw-alias-label-secondary, #4b5563)", lineHeight: 1.5, marginBottom: "14px" } }, "\u4F7F\u7528 DeepSeek \u5B98\u65B9\u8054\u7F51\u641C\u7D22\u670D\u52A1\uFF08Search & Fetch\uFF09\uFF0C\u4E3A\u6A21\u578B\u63D0\u4F9B\u5B9E\u65F6\u7F51\u9875\u68C0\u7D22\u4E0E\u6293\u53D6\u80FD\u529B\u3002", /* @__PURE__ */ import_react.default.createElement("div", { style: { marginTop: "4px" } }, /* @__PURE__ */ import_react.default.createElement(
        "a",
        {
          href: "https://api-docs.deepseek.com/",
          target: "_blank",
          rel: "noreferrer",
          style: {
            color: "var(--dsw-alias-brand-primary, #4d6bfe)",
            textDecoration: "underline",
            cursor: "pointer"
          }
        },
        "\u67E5\u770B DeepSeek \u5B98\u65B9 API \u6587\u6863 \u2197"
      ))),
      /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          style: {
            backgroundColor: "var(--dsw-alias-interactive-bg, rgba(0, 0, 0, 0.03))",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "12px",
            color: "var(--dsw-alias-label-secondary, #6b7280)",
            marginBottom: "14px",
            border: "1px dashed var(--dsw-alias-border-l2, rgba(140, 140, 140, 0.25))"
          }
        },
        "\u{1F4A1} ",
        /* @__PURE__ */ import_react.default.createElement("strong", null, "\u81EA\u52A8\u515C\u5E95\u63D0\u793A\uFF1A"),
        "\u7CFB\u7EDF\u5DF2\u9ED8\u8BA4\u81EA\u52A8\u63A2\u6D4B\u60A8\u5728 DSH \u4E2D\u767B\u5F55\u7684 DeepSeek \u5B98\u65B9\u8D26\u6237\u51ED\u636E\u6216\u7CFB\u7EDF\u73AF\u5883\u53D8\u91CF\uFF0C\u7559\u7A7A\u5373\u53EF\u81EA\u52A8\u4F7F\u7528\uFF1B\u5982\u9700\u4F7F\u7528\u7279\u5B9A\u7684\u5176\u4ED6 API Key\uFF0C\u53EF\u5728\u6B64\u586B\u5199\u8986\u76D6\u3002"
      ),
      /* @__PURE__ */ import_react.default.createElement("div", { style: { marginBottom: "14px" } }, /* @__PURE__ */ import_react.default.createElement("label", { style: { display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "6px" } }, "\u81EA\u5B9A\u4E49 DeepSeek API Key\uFF08\u53EF\u9009\uFF09"), /* @__PURE__ */ import_react.default.createElement("div", { style: { position: "relative", display: "flex", alignItems: "center" } }, /* @__PURE__ */ import_react.default.createElement(
        "input",
        {
          type: showPassword ? "text" : "password",
          placeholder: "\u7559\u7A7A\u81EA\u52A8\u4F7F\u7528\u5B98\u65B9\u767B\u5F55\u51ED\u636E\uFF0C\u6216\u8F93\u5165 sk-...",
          value: apiKeyInput,
          onChange: (e) => setApiKeyInput(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSaveKey();
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
            fontSize: "12px",
            padding: "4px"
          },
          onClick: () => setShowPassword(!showPassword),
          title: showPassword ? "\u9690\u85CF" : "\u663E\u793A"
        },
        showPassword ? "\u9690\u85CF" : "\u663E\u793A"
      ))),
      /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "11.5px", color: "var(--dsw-alias-label-tertiary, #6b7280)", lineHeight: 1.4, marginBottom: "20px" } }, "API Key \u4EC5\u4FDD\u5B58\u5728\u60A8\u5F53\u524D\u8BBE\u5907\u672C\u5730\u3002\u5C1A\u672A\u83B7\u53D6\u72EC\u7ACB Key\uFF1F", /* @__PURE__ */ import_react.default.createElement(
        "a",
        {
          href: "https://platform.deepseek.com/",
          target: "_blank",
          rel: "noreferrer",
          style: { color: "var(--dsw-alias-brand-primary, #4d6bfe)", marginLeft: "4px", textDecoration: "none" }
        },
        "\u524D\u5F80\u5E73\u53F0\u83B7\u53D6 \u2192"
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
            backgroundColor: "var(--dsw-alias-brand-primary, #4d6bfe)",
            color: "#ffffff",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(77, 107, 254, 0.35)"
          },
          onClick: handleSaveKey
        },
        "\u4FDD\u5B58"
      ))
    )
  ));
}
function apply(ctx) {
  ctx.inject(["slots", "remote.commands", "sessions"], (scope) => {
    scope.slots.inject(
      "conversation.input.left",
      () => scope.slots.register(
        {
          name: "conversation.input.left",
          id: "dsh-deepseek-search-toggle",
          order: 10,
          inject: (sessionId) => ({
            sessionId,
            onExecuteCommand: async (cmd, sid) => {
              const targetId = sid ?? sessionId;
              if (!targetId) return;
              const remote = scope && scope.remote || ctx && ctx.remote;
              if (remote?.commands?.execute) {
                return remote.commands.execute(targetId, cmd, []);
              }
              const sessions = scope && scope.sessions || ctx && ctx.sessions;
              const binding = sessions && typeof sessions.binding === "function" ? sessions.binding(targetId) : null;
              const session = binding && binding.session;
              if (session) {
                return session.prompt([{ type: "text", text: cmd }], "queue");
              }
              return Promise.resolve();
            }
          })
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
