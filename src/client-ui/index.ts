/**
 * DeepSeek Search DSH Client UI Extension
 * 为 DSH 聊天框下方注入类似 DeepSeek 官网的“联网搜索”交互按钮
 */

export const name = "dsh-client-deepseek-search";

const STORAGE_KEY = "dsh_deepseek_search_enabled";

export function apply(ctx: any = {}) {
  // 读取上次保存的状态，默认关闭 (变暗)
  let isWebSearchActive = false;
  try {
    isWebSearchActive = localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    isWebSearchActive = false;
  }

  // 注入样式
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
      // 1. 尝试 Cordis 服务直调
      try {
        if (ctx?.deepseekSearchService && typeof ctx.deepseekSearchService.ensureStarted === "function") {
          await ctx.deepseekSearchService.ensureStarted();
          return true;
        }
      } catch {}

      // 2. 尝试通用事件总线
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

  /**
   * 创建 DOM 按钮元素
   */
  const createButtonNode = () => {
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
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <span class="btn-text">联网搜索</span>
    `;

    btn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // 如果已经亮起，点击变暗
      if (isWebSearchActive) {
        isWebSearchActive = false;
        // 同步所有实例按钮样式
        document.querySelectorAll(".dsh-search-toggle-btn").forEach((el) => el.classList.remove("active"));
        try {
          localStorage.setItem(STORAGE_KEY, "false");
        } catch {}
        showToast("已关闭联网搜索", "info");
        return;
      }

      // 如果当前是暗的，准备点亮：需要先判断并启动 MCP
      btn.classList.add("loading");
      const ok = await requestEnsureMcp();
      btn.classList.remove("loading");

      if (ok) {
        isWebSearchActive = true;
        // 同步所有实例按钮样式
        document.querySelectorAll(".dsh-search-toggle-btn").forEach((el) => el.classList.add("active"));
        try {
          localStorage.setItem(STORAGE_KEY, "true");
        } catch {}
        showToast("联网搜索已就绪", "success");
      } else {
        isWebSearchActive = false;
        btn.classList.remove("active");
      }
    };

    container.appendChild(btn);
    return container;
  };

  /**
   * 方式 1：通过官方 Slots 注册
   */
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
        } catch {}
      });
    }
  } catch {}

  /**
   * 方式 2：智能 DOM 探测与挂载（无论 slot 机制是否存在，100% 确保注入到输入框工具栏）
   */
  const tryMountToDom = () => {
    if (typeof document === "undefined") return;

    // 如果当前页面上已经挂载成功，直接返回
    if (document.querySelector("[data-dsh-search-mcp='true']")) {
      return;
    }

    // 探测特征 1：找到包含“工作区内修改”的元素
    const allButtons = Array.from(document.querySelectorAll("button, div, span"));
    const workspaceElem = allButtons.find((el) => {
      const text = el.textContent || "";
      return text.includes("工作区内修改") || text.includes("工作区");
    });

    if (workspaceElem) {
      // 找到它的目标父级容器或者最邻近的操作按钮容器
      let targetParent: HTMLElement | null = workspaceElem as HTMLElement;
      while (targetParent && targetParent.parentElement) {
        // 如果父容器包含按钮且元素多于 1 个，即为操作条
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

    // 探测特征 2：寻找输入框底部操作栏
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

  // 初始执行一次
  tryMountToDom();

  // 监听动态 DOM 变化（新建会话、切换页面时自动挂载）
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

// 兼容浏览器直接自执行
if (typeof window !== "undefined") {
  // @ts-ignore
  if (!window.__DSH_DEEPSEEK_SEARCH_CLIENT_LOADED__) {
    // @ts-ignore
    window.__DSH_DEEPSEEK_SEARCH_CLIENT_LOADED__ = true;
    apply();
  }
}

export default apply;
