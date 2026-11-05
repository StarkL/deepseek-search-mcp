/**
 * DeepSeek Search DSH Client UI Extension
 * 为 DSH 聊天框下方注入类似 DeepSeek 官网的“联网搜索”交互按钮
 */

export const name = "dsh-client-deepseek-search";

// 声明前端可选服务依赖
export const inject = {
  optional: ["slots", "toast", "api"]
};

export function apply(ctx: any) {
  const STORAGE_KEY = "dsh_deepseek_search_enabled";

  // 读取上次保存的状态，默认关闭 (变暗)
  let isWebSearchActive = false;
  try {
    isWebSearchActive = localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    isWebSearchActive = false;
  }

  // 注入样式
  const injectStyles = () => {
    if (document.getElementById("dsh-search-toggle-style")) return;
    const style = document.createElement("style");
    style.id = "dsh-search-toggle-style";
    style.textContent = `
      .dsh-search-toggle-container {
        display: inline-flex;
        align-items: center;
        margin: 2px 4px;
      }
      .dsh-search-toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 11px;
        border-radius: 9999px;
        font-size: 12.5px;
        line-height: 1.4;
        border: 1px solid rgba(140, 140, 140, 0.28);
        background: rgba(255, 255, 255, 0.04);
        color: #8c8c8c;
        cursor: pointer;
        outline: none;
        user-select: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .dsh-search-toggle-btn:hover {
        border-color: #4d6bfe;
        color: #4d6bfe;
        background: rgba(77, 107, 254, 0.06);
      }
      /* 亮起状态 (DeepSeek 官网微蓝高亮) */
      .dsh-search-toggle-btn.active {
        background: rgba(77, 107, 254, 0.14) !important;
        border-color: #4d6bfe !important;
        color: #4d6bfe !important;
        font-weight: 500;
        box-shadow: 0 0 10px rgba(77, 107, 254, 0.25);
      }
      /* 加载中状态 */
      .dsh-search-toggle-btn.loading {
        opacity: 0.7;
        cursor: wait;
        pointer-events: none;
      }
      .dsh-search-toggle-btn .search-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        transition: transform 0.2s ease;
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
      if (ctx.toast && typeof ctx.toast[type] === "function") {
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
      // 1. 优先尝试 RPC api
      try {
        if (ctx.api && typeof ctx.api.call === "function") {
          await ctx.api.call("deepseekSearch/ensureStarted");
          return true;
        }
      } catch {}

      // 2. 尝试 Cordis 服务直调
      try {
        if (ctx.deepseekSearchService && typeof ctx.deepseekSearchService.ensureStarted === "function") {
          await ctx.deepseekSearchService.ensureStarted();
          return true;
        }
      } catch {}

      // 3. 尝试通用事件总线
      if (typeof ctx.emit === "function") {
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
   * 注册到聊天输入框插槽
   */
  try {
    const slots = ctx.slots;
    if (slots && typeof slots.register === "function") {
      slots.register("conversation.input.dock", {
        id: "deepseek-web-search-toggle",
        order: 15,
        render: () => {
          const container = document.createElement("div");
          container.className = "dsh-search-toggle-container";

          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `dsh-search-toggle-btn ${isWebSearchActive ? "active" : ""}`;
          btn.title = "点击切换是否启用 DeepSeek 实时网络搜索";

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

            // 如果已经亮起，点击变暗
            if (isWebSearchActive) {
              isWebSearchActive = false;
              btn.classList.remove("active");
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
              btn.classList.add("active");
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
        }
      });
    }
  } catch {}

  /**
   * 拦截会话发送钩子：传递搜索开关状态
   */
  ctx.on("conversation/before-send", (event: any) => {
    if (!event) return;
    event.options = event.options || {};
    event.options.enableDeepSeekSearch = isWebSearchActive;
  });
}

export default apply;
