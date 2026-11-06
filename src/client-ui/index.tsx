import React, { useState, useEffect } from "react";

export const name = "dsh-client-deepseek-search";
export const inject = ["slots"] as const;

const STORAGE_MODE_KEY_PREFIX = "dsh.webSearchMode.";
const STORAGE_API_KEY = "dsh_deepseek_search_api_key";

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
      return localStorage.getItem(`${STORAGE_MODE_KEY_PREFIX}${currentSessionId}`) === "true";
    } catch {
      return false;
    }
  });

  // 控制配置弹窗的显示与隐藏
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // 会话切换时自动同步当前会话的状态
  useEffect(() => {
    if (!currentSessionId) return;
    try {
      const stored = localStorage.getItem(`${STORAGE_MODE_KEY_PREFIX}${currentSessionId}`) === "true";
      setActive(stored);
    } catch {}
  }, [currentSessionId]);

  // 平滑恢复输入框的光标焦点
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

  // 左键点击：快速切换开关
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 如果当前已经是开启状态，点击则变暗关闭
    if (active) {
      setActive(false);
      try {
        localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}${currentSessionId}`, "false");
        localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}global`, "false");
      } catch {}
      restoreFocus();
      return;
    }

    // 如果当前是关闭状态，检查本地是否已经配置了 API Key
    let savedKey = "";
    try {
      savedKey = localStorage.getItem(STORAGE_API_KEY) || "";
    } catch {}

    // 如果还没有在界面配置过 Key，首次引导弹出配置弹窗
    if (!savedKey.trim()) {
      setApiKeyInput("");
      setIsModalOpen(true);
      return;
    }

    // 已经有 Key，直接点亮开启
    setActive(true);
    try {
      localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}${currentSessionId}`, "true");
      localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}global`, "true");
    } catch {}

    restoreFocus();
  };

  // 右键点击：随时调出配置弹窗修改 Key
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const existing = localStorage.getItem(STORAGE_API_KEY) || "";
      setApiKeyInput(existing);
    } catch {}
    setIsModalOpen(true);
  };

  // 保存 API Key
  const handleSaveKey = () => {
    const trimmed = apiKeyInput.trim();
    try {
      localStorage.setItem(STORAGE_API_KEY, trimmed);
      // 保存后自动激活当前会话的联网搜索
      localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}${currentSessionId}`, "true");
      localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}global`, "true");
    } catch {}

    setActive(true);
    setIsModalOpen(false);
    restoreFocus();
  };

  return (
    <>
      <button
        type="button"
        className={`dsh-search-toggle-btn ${active ? "active" : ""}`}
        title={active ? "联网搜索已开启（常亮）：点击变暗关闭，右键可修改配置" : "联网搜索已关闭（变暗）：点击点亮开启，右键可配置 API Key"}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
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
          // 使用 DSH 官方 Design Token 变量，自适应所有主题
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

      {/* 可视化配置弹窗 */}
      {isModalOpen && (
        <div
          style={{
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
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
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
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div style={{ fontSize: "15px", fontWeight: 600 }}>配置 DeepSeek 联网搜索</div>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--dsw-alias-label-secondary, #8c8c8c)",
                  cursor: "pointer",
                  fontSize: "16px",
                  lineHeight: 1,
                  padding: "4px"
                }}
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* 弹窗说明（不写死价格与模型，官方功能+文档链接） */}
            <div style={{ fontSize: "12.5px", color: "var(--dsw-alias-label-secondary, #9ca3af)", lineHeight: 1.5, marginBottom: "16px" }}>
              接入 DeepSeek 官方网页搜索 (Search) 与内容抓取 (Fetch) 能力。
              <a
                href="https://api-docs.deepseek.com/zh-cn/guides/search/"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#4d6bfe", marginLeft: "4px", textDecoration: "none" }}
              >
                官方接口文档 ↗
              </a>
            </div>

            {/* 输入框区域 */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>DeepSeek API Key</div>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="sk-..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveKey();
                    } else if (e.key === "Escape") {
                      setIsModalOpen(false);
                    }
                  }}
                  autoFocus
                  style={{
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
                  }}
                />
                <button
                  type="button"
                  style={{
                    position: "absolute",
                    right: "8px",
                    background: "transparent",
                    border: "none",
                    color: "var(--dsw-alias-label-secondary, #8c8c8c)",
                    cursor: "pointer",
                    fontSize: "13px",
                    padding: "4px"
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "隐藏" : "显示"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* 辅助隐私说明与获取链接 */}
            <div style={{ fontSize: "11.5px", color: "var(--dsw-alias-label-tertiary, #6b7280)", lineHeight: 1.4, marginBottom: "20px" }}>
              密钥仅保存在您当前电脑本地设备。还没有 API Key？
              <a
                href="https://platform.deepseek.com/"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#4d6bfe", marginLeft: "4px", textDecoration: "none" }}
              >
                前往平台获取 ↗
              </a>
            </div>

            {/* 底部按钮栏 */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                style={{
                  height: "32px",
                  padding: "0 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  border: "1px solid var(--dsw-alias-border-l2, rgba(140, 140, 140, 0.3))",
                  backgroundColor: "transparent",
                  color: "var(--dsw-alias-label-secondary, #9ca3af)",
                  cursor: "pointer"
                }}
                onClick={() => setIsModalOpen(false)}
              >
                取消
              </button>
              <button
                type="button"
                style={{
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
                }}
                onClick={handleSaveKey}
              >
                保存并开启
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * DSH 客户端插件入口
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

  // 拦截会话发送事件，同步开关状态与本地 API Key 给后端
  if (typeof ctx?.on === "function") {
    ctx.on("conversation/before-send", (event: any) => {
      if (!event) return;
      event.options = event.options || {};
      const activeId = event.session?.sessionId || event.sessionId;
      let isSearchOn = false;
      let userKey = "";
      try {
        isSearchOn = activeId
          ? localStorage.getItem(`${STORAGE_MODE_KEY_PREFIX}${activeId}`) === "true"
          : localStorage.getItem(`${STORAGE_MODE_KEY_PREFIX}global`) === "true";
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

export default apply;
