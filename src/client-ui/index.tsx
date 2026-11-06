import React, { useState, useEffect } from "react";

export const name = "dsh-client-deepseek-search";
export const inject = ["slots"] as const;

export interface SearchButtonProps {
  zone?: {
    session?: {
      sessionId: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  session?: {
    sessionId: string;
    [key: string]: any;
  };
  sessionId?: string;
}

export function SearchButton(props: SearchButtonProps) {
  const sessionObj = props.session ?? props.zone?.session;
  const currentSessionId = sessionObj?.sessionId ?? props.sessionId ?? "default";

  // 读取与当前会话绑定的联网状态
  const [active, setActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`dsh.webSearchMode.${currentSessionId}`) === "true";
    } catch {
      return false;
    }
  });

  const [loading, setLoading] = useState<boolean>(false);

  // 会话切换时自动同步当前会话的状态
  useEffect(() => {
    if (!currentSessionId) return;
    try {
      const stored = localStorage.getItem(`dsh.webSearchMode.${currentSessionId}`) === "true";
      setActive(stored);
    } catch {}
  }, [currentSessionId]);

  // 点击后平滑恢复输入框的光标焦点
  const restoreFocus = () => {
    setTimeout(() => {
      const editor =
        document.querySelector<HTMLElement>('[contenteditable="true"]') ||
        document.querySelector<HTMLElement>("textarea");
      if (editor) {
        editor.focus();
      }
    }, 30);
  };

  // 点击切换状态
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (active) {
      // 变暗关闭
      setActive(false);
      try {
        localStorage.setItem(`dsh.webSearchMode.${currentSessionId}`, "false");
        localStorage.setItem("dsh.webSearchMode.global", "false");
      } catch {}
      restoreFocus();
      return;
    }

    // 亮起开启：先异步确保 MCP 搜索服务存活就绪
    setLoading(true);
    let ok = false;
    try {
      if ((window as any).__DSH_DEEPSEEK_SEARCH_ENSURE__) {
        await (window as any).__DSH_DEEPSEEK_SEARCH_ENSURE__();
        ok = true;
      } else {
        ok = true;
      }
    } catch (err: any) {
      alert(err?.message || "启动联网搜索服务失败，请检查 DEEPSEEK_API_KEY 配置");
      ok = false;
    } finally {
      setLoading(false);
    }

    if (ok) {
      setActive(true);
      try {
        localStorage.setItem(`dsh.webSearchMode.${currentSessionId}`, "true");
        localStorage.setItem("dsh.webSearchMode.global", "true");
      } catch {}
    } else {
      setActive(false);
    }

    restoreFocus();
  };

  return (
    <button
      type="button"
      className={`dsh-search-toggle-btn ${active ? "active" : ""} ${loading ? "loading" : ""}`}
      title={active ? "联网搜索已开启（常亮）：点击变暗关闭" : "联网搜索已关闭（变暗）：点击点亮开启"}
      onClick={handleClick}
      style={{
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
        border: active
          ? "1px solid #4d6bfe"
          : "1px solid rgba(140, 140, 140, 0.28)",
        backgroundColor: active
          ? "rgba(77, 107, 254, 0.14)"
          : "rgba(255, 255, 255, 0.05)",
        color: active
          ? "#4d6bfe"
          : "var(--dsw-alias-label-secondary, #8c8c8c)",
        boxShadow: active
          ? "0 0 8px rgba(77, 107, 254, 0.28)"
          : "none",
        opacity: loading ? 0.7 : 1,
      }}
    >
      <span style={{ fontSize: "13px", lineHeight: "1" }}>🌐</span>
      <span>{loading ? "就绪中..." : "联网搜索"}</span>
    </button>
  );
}

/**
 * DSH 客户端插件入口：
 * 精准注册到 conversation.input.left 插槽（与聊天输入框底部的 +、工作区修改 处于同一操作栏）
 */
export function apply(ctx: any) {
  // 暴露给组件调用的跨层确保就绪钩子
  if (typeof window !== "undefined") {
    (window as any).__DSH_DEEPSEEK_SEARCH_ENSURE__ = async () => {
      if (ctx?.deepseekSearchService?.ensureStarted) {
        return ctx.deepseekSearchService.ensureStarted();
      }
      if (typeof ctx?.emit === "function") {
        return ctx.emit("deepseekSearch/ensureStarted");
      }
      return true;
    };
  }

  // 利用 DSH 规范的 slots.inject 挂载到输入框左侧操作区
  ctx.inject(["slots"], (scope: any) => {
    scope.slots.inject("conversation.input.left", () =>
      scope.slots.register(
        {
          name: "conversation.input.left",
          id: "dsh-deepseek-search-toggle",
          order: 10,
          inject: (sessionId: string) => ({ sessionId })
        },
        SearchButton
      )
    );
  });

  // 拦截会话发送事件，同步开关状态给后端
  if (typeof ctx?.on === "function") {
    ctx.on("conversation/before-send", (event: any) => {
      if (!event) return;
      event.options = event.options || {};
      const activeId = event.session?.sessionId || event.sessionId;
      const isSearchOn = activeId
        ? localStorage.getItem(`dsh.webSearchMode.${activeId}`) === "true"
        : localStorage.getItem("dsh.webSearchMode.global") === "true";
      event.options.enableDeepSeekSearch = isSearchOn;
    });
  }
}

export default apply;
