import React, { useState, useEffect } from "react";

export const name = "dsh-deepseek-search";
export const inject = ["slots", "remote.commands", "sessions"] as const;

const STORAGE_MODE_KEY_PREFIX = "dsh.webSearchMode.";
const STORAGE_API_KEY = "dsh_deepseek_search_api_key";

export interface ZoneProps {
  session?: {
    sessionId: string;
    [key: string]: any;
  };
  input?: {
    draft: string;
    [key: string]: any;
  };
}

export interface SearchButtonProps {
  zone?: ZoneProps;
  input?: {
    draft: string;
    [key: string]: any;
  };
  session?: {
    sessionId: string;
    [key: string]: any;
  };
  sessionId?: string;
  onExecuteCommand?: (cmd: string, sid?: string) => Promise<any>;
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

  // 左键点击：直接切换开关（亮起/变暗），无需弹窗打扰
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !active;
    setActive(nextState);

    try {
      localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}${currentSessionId}`, nextState ? "true" : "false");
      localStorage.setItem(`${STORAGE_MODE_KEY_PREFIX}global`, nextState ? "true" : "false");
    } catch {}

    if (props.onExecuteCommand) {
      if (nextState) {
        // 如果本地存了自定义 Key，一并发送通知后端
        let customKey = "";
        try {
          customKey = localStorage.getItem(STORAGE_API_KEY) || "";
        } catch {}
        if (customKey.trim()) {
          props.onExecuteCommand(`/deepseek-search key ${customKey.trim()}`, currentSessionId).catch(() => {});
        }
        props.onExecuteCommand("/deepseek-search on", currentSessionId).catch(() => {});
      } else {
        props.onExecuteCommand("/deepseek-search off", currentSessionId).catch(() => {});
      }
    }

    restoreFocus();
  };

  // 右键点击：随时调出配置弹窗，允许用户查看、修改或清空自定义 Key
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const existing = localStorage.getItem(STORAGE_API_KEY) || "";
      setApiKeyInput(existing);
    } catch {}
    setIsModalOpen(true);
  };

  // 保存 API Key 配置
  const handleSaveKey = () => {
    const trimmed = apiKeyInput.trim();
    try {
      if (trimmed) {
        localStorage.setItem(STORAGE_API_KEY, trimmed);
      } else {
        // 若清空保存，则移除自定义配置，自动使用官方登录凭据或环境变量兜底
        localStorage.removeItem(STORAGE_API_KEY);
      }
    } catch {}

    if (props.onExecuteCommand) {
      if (trimmed) {
        props.onExecuteCommand(`/deepseek-search key ${trimmed}`, currentSessionId).catch(() => {});
      }
    }

    setIsModalOpen(false);
    restoreFocus();
  };

  return (
    <>
      <button
        type="button"
        className={`dsh-search-toggle-btn ${active ? "active" : ""}`}
        title={active ? "联网搜索已开启（常亮）：点击关闭，右键可修改配置" : "联网搜索已关闭（变暗）：点击开启，右键可配置 API Key"}
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
          transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: active
            ? "var(--dsw-alias-brand-primary, #4d6bfe)"
            : "var(--dsw-alias-interactive-bg, rgba(0, 0, 0, 0.04))",
          border: active
            ? "1px solid var(--dsw-alias-brand-primary, #4d6bfe)"
            : "1px solid var(--dsw-alias-border-l2, rgba(140, 140, 140, 0.25))",
          color: active
            ? "#ffffff"
            : "var(--dsw-alias-label-secondary, #6b7280)",
          boxShadow: active
            ? "0 0 6px rgba(77, 107, 254, 0.35)"
            : "none"
        }}
      >
        <span>联网搜索</span>
      </button>

      {/* API Key 可视化配置弹窗 */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
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
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
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
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ fontSize: "16px", fontWeight: 600 }}>DeepSeek 联网搜索配置</div>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "var(--dsw-alias-label-secondary, #8c8c8c)",
                  padding: "4px 8px"
                }}
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            {/* 功能说明与官方文档超链接 */}
            <div style={{ fontSize: "13px", color: "var(--dsw-alias-label-secondary, #4b5563)", lineHeight: 1.5, marginBottom: "14px" }}>
              使用 DeepSeek 官方联网搜索服务（Search & Fetch），为模型提供实时网页检索与抓取能力。
              <div style={{ marginTop: "4px" }}>
                <a
                  href="https://api-docs.deepseek.com/"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "var(--dsw-alias-brand-primary, #4d6bfe)",
                    textDecoration: "underline",
                    cursor: "pointer"
                  }}
                >
                  查看 DeepSeek 官方 API 文档 ↗
                </a>
              </div>
            </div>

            {/* 智能探测提示 */}
            <div
              style={{
                backgroundColor: "var(--dsw-alias-interactive-bg, rgba(0, 0, 0, 0.03))",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "12px",
                color: "var(--dsw-alias-label-secondary, #6b7280)",
                marginBottom: "14px",
                border: "1px dashed var(--dsw-alias-border-l2, rgba(140, 140, 140, 0.25))"
              }}
            >
              💡 <strong>自动兜底提示：</strong>系统已默认自动探测您在 DSH 中登录的 DeepSeek 官方账户凭据或系统环境变量，留空即可自动使用；如需使用特定的其他 API Key，可在此填写覆盖。
            </div>

            {/* 输入表单 */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>
                自定义 DeepSeek API Key（可选）
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="留空自动使用官方登录凭据，或输入 sk-..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveKey();
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
                    fontSize: "12px",
                    padding: "4px"
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "隐藏" : "显示"}
                >
                  {showPassword ? "隐藏" : "显示"}
                </button>
              </div>
            </div>

            {/* 隐私提示与平台入口 */}
            <div style={{ fontSize: "11.5px", color: "var(--dsw-alias-label-tertiary, #6b7280)", lineHeight: 1.4, marginBottom: "20px" }}>
              API Key 仅保存在您当前设备本地。尚未获取独立 Key？
              <a
                href="https://platform.deepseek.com/"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--dsw-alias-brand-primary, #4d6bfe)", marginLeft: "4px", textDecoration: "none" }}
              >
                前往平台获取 →
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
                  backgroundColor: "var(--dsw-alias-brand-primary, #4d6bfe)",
                  color: "#ffffff",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(77, 107, 254, 0.35)"
                }}
                onClick={handleSaveKey}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * DSH 客户端插件入口：注册至会话输入框左侧插槽
 */
export function apply(ctx: any) {
  ctx.inject(["slots", "remote.commands", "sessions"], (scope: any) => {
    scope.slots.inject("conversation.input.left", () =>
      scope.slots.register(
        {
          name: "conversation.input.left",
          id: "dsh-deepseek-search-toggle",
          order: 10,
          inject: (sessionId: string) => ({
            sessionId,
            onExecuteCommand: async (cmd: string, sid?: string) => {
              const targetId = sid ?? sessionId;
              if (!targetId) return;

              // 优先走 remote commands 执行通道
              const remote = (scope && scope.remote) || (ctx && ctx.remote);
              if (remote?.commands?.execute) {
                return remote.commands.execute(targetId, cmd, []);
              }

              // 回退走 session prompt 通道
              const sessions = (scope && scope.sessions) || (ctx && ctx.sessions);
              const binding = sessions && typeof sessions.binding === "function"
                ? sessions.binding(targetId)
                : null;
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

  // 拦截会话发送事件，同步状态到请求上下文（双重兜底）
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
