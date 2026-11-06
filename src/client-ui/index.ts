/**
 * DeepSeek Search DSH Client UI Extension
 * 为 DSH 聊天框下方注入类似 DeepSeek 官网的“联网搜索”交互按钮
 */

export const name = "dsh-client-deepseek-search";

const STORAGE_KEY = "dsh_deepseek_search_enabled";

export function apply(ctx: any = {}) {
  let isWebSearchActive = false;
  try {
    isWebSearchActive = localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    isWebSearchActive = false;
  }

  // 注入 CSS 样式
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
        border: 1px solid rgba(140, 140, 140, 0.28);
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
      /* 亮起状态 (DeepSeek 官网微蓝高亮) */
      .dsh-search-toggle-btn.active {
        background: rgba(77, 107, 254, 0.14) !important;
        border-color: #4d6bfe !important;
        color: #4d6bfe !important;
        font-weight: 500;
        box-shadow: 0 0 8px rgba(77, 107, 254, 0.25);
      }
      /* 加载中状态 */
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

  /**
   * 安全显示 Toast 提示
   */
  const showToast = (message: string, type: "error" | "info" | "success" = "info") => {
    try {
      if (ctx?.toast && typeof ctx.toast[type] === "function") {
        ctx.toast[type](message);
        return;
      }
    } catch {}
    if (type === "error") {
      alert(message);
    }
  };

  /**
   * 触发后端检查并拉起 MCP
   */
  const requestEnsureMcp = async (): Promise<boolean> => {
    try {
      if (ctx?.deepseekSearchService && typeof ctx.deepseekSearchService.ensureStarted === "function") {
        await ctx.deepseekSearchService.ensureStarted();
        return true;
      }
      if (typeof ctx?.emit === "function") {
        await ctx.emit("deepseekSearch/ensureStarted");
        return true;
      }
      return true;
    } catch (err: any) {
      const msg = err?.message || String(err);
      showToast(msg, "error");
      return false;
    }
  };

  // 尝试获取宿主环境的 React
  let React: any = null;
  try {
    // @ts-ignore
    if (typeof require === "function") {
      // @ts-ignore
      React = require("react");
    }
  } catch {}
  if (!React && typeof window !== "undefined") {
    // @ts-ignore
    React = window.React;
  }

  /**
   * React 组件定义
   */
  let ReactComponent: any = null;
  if (React && typeof React.createElement === "function") {
    ReactComponent = function SearchToggleButton() {
      const [active, setActive] = React.useState(isWebSearchActive);
      const [loading, setLoading] = React.useState(false);

      const handleClick = async (e: any) => {
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();

        if (active) {
          setActive(false);
          isWebSearchActive = false;
          try { localStorage.setItem(STORAGE_KEY, "false"); } catch {}
          showToast("已关闭联网搜索", "info");
          return;
        }

        setLoading(true);
        const ok = await requestEnsureMcp();
        setLoading(false);

        if (ok) {
          setActive(true);
          isWebSearchActive = true;
          try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
          showToast("联网搜索已就绪", "success");
        } else {
          setActive(false);
          isWebSearchActive = false;
        }
      };

      return React.createElement(
        "div",
        { className: "dsh-search-toggle-container", key: "dsh-search-toggle-box" },
        React.createElement(
          "button",
          {
            type: "button",
            className: `dsh-search-toggle-btn ${active ? "active" : ""} ${loading ? "loading" : ""}`,
            title: "点击切换是否启用 DeepSeek 实时网络搜索与抓取",
            onClick: handleClick
          },
          React.createElement(
            "svg",
            {
              className: "search-icon",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            },
            React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
            React.createElement("line", { x1: "2", y1: "12", x2: "22", y2: "12" }),
            React.createElement("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" })
          ),
          React.createElement("span", { className: "btn-text" }, "联网搜索")
        )
      );
    };
  }

  /**
   * 注册到 DSH 官方 Slot 插槽
   */
  const registerToSlots = () => {
    try {
      const slots = ctx?.slots;
      if (!slots) return;

      const targetSlots = ["conversation.input.left", "conversation.input.dock", "conversation.input.right"];

      targetSlots.forEach((slotName) => {
        // 模式 A: slots.inject(slotName, () => slots.register(...))
        if (typeof slots.inject === "function") {
          try {
            slots.inject(slotName, () => {
              if (typeof slots.register === "function") {
                return slots.register(
                  { id: `dsh-search-${slotName}`, order: 12 },
                  () => ReactComponent ? React.createElement(ReactComponent) : createButtonNode()
                );
              }
            });
          } catch {}
        }

        // 模式 B: slots.register(slotName, { component: ... })
        if (typeof slots.register === "function") {
          try {
            slots.register(slotName, {
              id: `dsh-search-reg-${slotName}`,
              order: 12,
              component: ReactComponent,
              render: () => ReactComponent ? React.createElement(ReactComponent) : createButtonNode()
            });
          } catch {}
        }
      });
    } catch {}
  };

  registerToSlots();

  /**
   * 原生 DOM 按钮创建器（用于非 React 环境或 DOM 探测兜底）
   */
  function createButtonNode() {
    const container = document.createElement("div");
    container.className = "dsh-search-toggle-container";
    container.setAttribute("data-dsh-search-mcp", "true");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `dsh-search-toggle-btn ${isWebSearchActive ? "active" : ""}`;
    btn.title = "点击切换是否启用 DeepSeek 实时网络搜索与抓取";

    btn.innerHTML = `
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <span class="btn-text">联网搜索</span>
    `;

    btn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isWebSearchActive) {
        isWebSearchActive = false;
        document.querySelectorAll(".dsh-search-toggle-btn").forEach((el) => el.classList.remove("active"));
        try { localStorage.setItem(STORAGE_KEY, "false"); } catch {}
        showToast("已关闭联网搜索", "info");
        return;
      }

      btn.classList.add("loading");
      const ok = await requestEnsureMcp();
      btn.classList.remove("loading");

      if (ok) {
        isWebSearchActive = true;
        document.querySelectorAll(".dsh-search-toggle-btn").forEach((el) => el.classList.add("active"));
        try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
        showToast("联网搜索已就绪", "success");
      } else {
        isWebSearchActive = false;
        btn.classList.remove("active");
      }
    };

    container.appendChild(btn);
    return container;
  }

  /**
   * 智能 DOM 自动挂载器（双保险）
   */
  const tryMountToDom = () => {
    if (typeof document === "undefined") return;
    if (document.querySelector("[data-dsh-search-mcp='true']")) return;

    // 寻找包含“工作区”的按钮
    const allButtons = Array.from(document.querySelectorAll("button, div, span"));
    const workspaceElem = allButtons.find((el) => {
      const text = el.textContent || "";
      return text.includes("工作区内修改") || text.includes("工作区");
    });

    if (workspaceElem) {
      let targetParent: HTMLElement | null = workspaceElem as HTMLElement;
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

  /**
   * 拦截会话发送钩子：传递搜索开关状态
   */
  if (typeof ctx?.on === "function") {
    ctx.on("conversation/before-send", (event: any) => {
      if (!event) return;
      event.options = event.options || {};
      event.options.enableDeepSeekSearch = isWebSearchActive;
    });
  }
}

// 兼容自执行环境
if (typeof window !== "undefined") {
  // @ts-ignore
  if (!window.__DSH_DEEPSEEK_SEARCH_CLIENT_LOADED__) {
    // @ts-ignore
    window.__DSH_DEEPSEEK_SEARCH_CLIENT_LOADED__ = true;
    apply();
  }
}

export default apply;
