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
    }, 20);
  };

  // 即时切换状态（零弹窗、零时延、瞬间切换）
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const next = !active;
    setActive(next);

    try {
      localStorage.setItem(`dsh.webSearchMode.${currentSessionId}`, next ? "true" : "false");
      localStorage.setItem("dsh.webSearchMode.global", next ? "true" : "false");
    } catch {}

    restoreFocus();
  };

  return (
    <button
      type="button"
      className={`dsh-search-toggle-btn ${active ? "active" : ""}`}
      title={active ? "联网搜索已开启（常亮）：点击变暗关闭" : "联网搜索已关闭（变暗）：点击点亮开启"}
      onClick={handleClick}
      style={{
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
        border: active
          ? "1px solid var(--dsw-alias-brand-primary, #4d6bfe)"
          : "1px solid var(--dsw-alias-border-l2, rgba(140, 140, 140, 0.28))",
        backgroundColor: active
          ? "rgba(77, 107, 254, 0.14)"
          : "var(--dsw-alias-interactive-bg, rgba(255, 255, 255, 0.05))",
        color: active
          ? "var(--dsw-alias-brand-primary, #4d6bfe)"
          : "var(--dsw-alias-label-secondary, #8c8c8c)",
        boxShadow: active
          ? "0 0 8px rgba(77, 107, 254, 0.25)"
          : "none",
      }}
    >
      <span>联网搜索</span>
    </button>
  );
}

/**
 * DSH 客户端插件入口：
 * 挂载到 conversation.input.left 插槽
 */
export function apply(ctx: any) {
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
      let isSearchOn = false;
      try {
        isSearchOn = activeId
          ? localStorage.getItem(`dsh.webSearchMode.${activeId}`) === "true"
          : localStorage.getItem("dsh.webSearchMode.global") === "true";
      } catch {
        isSearchOn = false;
      }
      event.options.enableDeepSeekSearch = isSearchOn;
    });
  }
}

export default apply;
