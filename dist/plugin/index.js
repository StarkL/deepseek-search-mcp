import { fileURLToPath } from "node:url";
import path from "node:path";
import { resolveDeepSeekApiKey } from "../client.js";
export const name = "dsh-deepseek-search";
// 维护会话维度的联网搜索激活状态
const activeSearchSessions = new Set();
// 维护会话维度的自定义 API Key 缓存
const sessionApiKeyMap = new Map();
const SEARCH_MODE_PROMPT = `【DeepSeek 官方联网搜索模式已开启】
当前会话已激活 DeepSeek 官方联网检索与网页抓取（Search & Fetch）功能。
遇到用户询问任何需要最新事实、实时动态、网络资讯、开源项目动态或需要求证的内容，请主动调用 deepseek_search 或 deepseek_fetch 工具进行联网检索，并结合检索到的信息为用户提供准确详尽的回答。`;
export function apply(ctx, config = {}) {
    const serverName = config.serverName || "deepseek-search";
    let mcpFork = null;
    let isStarting = false;
    let lastUsedTime = Date.now();
    let currentActiveKey = "";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const serverIndexPath = path.resolve(__dirname, "../index.js");
    /**
     * 判断当前 MCP 服务是否存活运行中
     */
    const isMcpRunning = () => {
        return Boolean(mcpFork && !mcpFork.disposed);
    };
    /**
     * 确保 MCP 已经按需启动
     */
    const ensureStarted = async (explicitApiKey) => {
        lastUsedTime = Date.now();
        // 多级解析 API Key: 前端传入 > 环境变量 > ~/.dsh/.credentials.yaml 兜底
        const apiKey = resolveDeepSeekApiKey(explicitApiKey || config.apiKey);
        if (!apiKey || apiKey.trim() === "") {
            throw new Error("未检测到有效的 DeepSeek API Key！请点击聊天框下的“联网搜索”配置，或在系统环境变量中设置。");
        }
        // 如果已经在运行且 Key 一致，直接复用
        if (isMcpRunning() && currentActiveKey === apiKey) {
            return { success: true, message: "MCP 搜索服务已在运行中。" };
        }
        // 如果 Key 发生变化，重启服务以应用新 Key
        if (isMcpRunning() && currentActiveKey !== apiKey) {
            await stopMcp();
        }
        if (isStarting) {
            return { success: true, message: "MCP 搜索服务正在启动中，请稍候..." };
        }
        try {
            isStarting = true;
            currentActiveKey = apiKey;
            // 动态挂载 @deepseek-ai/dsh-mcp-client
            mcpFork = ctx.plugin("@deepseek-ai/dsh-mcp-client", {
                serverName,
                transport: "stdio",
                command: "node",
                args: [serverIndexPath],
                env: {
                    DEEPSEEK_API_KEY: apiKey,
                    DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
                }
            });
            if (typeof ctx.sleep === "function") {
                await ctx.sleep(250);
            }
            else {
                await new Promise((resolve) => setTimeout(resolve, 250));
            }
            return { success: true, message: "DeepSeek Search MCP 成功按需启动！" };
        }
        catch (error) {
            if (mcpFork && typeof mcpFork.dispose === "function") {
                mcpFork.dispose();
            }
            mcpFork = null;
            currentActiveKey = "";
            throw new Error(`启动 DeepSeek Search MCP 失败: ${error?.message || String(error)}`);
        }
        finally {
            isStarting = false;
        }
    };
    /**
     * 停止并释放 MCP 子进程
     */
    const stopMcp = async () => {
        if (mcpFork && typeof mcpFork.dispose === "function") {
            mcpFork.dispose();
        }
        mcpFork = null;
        currentActiveKey = "";
    };
    /**
     * 命令处理器：响应 /deepseek-search on/off 或 /search on/off
     */
    const handleToggleCommand = (invocation) => {
        const rawInput = (invocation.rawInput || "").trim();
        const sessionId = invocation.agent?.session?.sessionId || invocation.sessionId;
        if (rawInput === "on") {
            if (sessionId)
                activeSearchSessions.add(sessionId);
            return { kind: "success" };
        }
        if (rawInput === "off") {
            if (sessionId)
                activeSearchSessions.delete(sessionId);
            return { kind: "success" };
        }
        if (rawInput.startsWith("key ")) {
            const newKey = rawInput.slice(4).trim();
            if (sessionId && newKey) {
                sessionApiKeyMap.set(sessionId, newKey);
            }
            return { kind: "success" };
        }
        return { kind: "success" };
    };
    // 1. 注册动态系统提示词（当当前会话激活搜索时自动生效）
    if (ctx.systemPrompt?.section) {
        try {
            ctx.systemPrompt.section({
                name: "tool:deepseek_search_mode",
                order: 550,
                text: (context) => {
                    const sessionId = context?.agent?.session?.sessionId;
                    if (sessionId && activeSearchSessions.has(sessionId)) {
                        return SEARCH_MODE_PROMPT;
                    }
                    return "";
                }
            });
        }
        catch { }
    }
    // 2. 注册控制命令
    if (ctx.commands?.register) {
        try {
            ctx.commands.register({
                name: "deepseek-search",
                description: "控制 DeepSeek 联网搜索开关 (/deepseek-search on|off)",
                handler: handleToggleCommand
            });
            ctx.commands.register({
                name: "search",
                description: "控制联网搜索开关 (/search on|off)",
                handler: handleToggleCommand
            });
        }
        catch { }
    }
    // 3. 拦截 Agent 对话生命周期：在关闭时物理级过滤工具，在开启时确保 MCP 就绪
    ctx.on("agent/before-chat", async (session) => {
        const sessionId = session?.sessionId || session?.id || session?.agent?.session?.sessionId;
        const isSearchActive = (sessionId && activeSearchSessions.has(sessionId)) ||
            Boolean(session?.options?.enableDeepSeekSearch);
        if (!session || !Array.isArray(session.tools)) {
            return;
        }
        if (!isSearchActive) {
            // 变暗关闭状态：彻底从 session.tools 中剔除所有搜索和抓取相关工具！
            session.tools = session.tools.filter((t) => {
                const toolName = (t?.name || "").toLowerCase();
                return !toolName.includes("search") && !toolName.includes("fetch");
            });
            return;
        }
        // 亮起开启状态：确保后台 MCP 已启动
        const explicitKey = (sessionId && sessionApiKeyMap.get(sessionId)) ||
            session?.options?.deepseekApiKey;
        try {
            await ensureStarted(explicitKey);
        }
        catch (e) {
            console.error("[dsh-deepseek-search] ensureStarted error:", e);
        }
        lastUsedTime = Date.now();
        // 追加系统提示词兜底
        if (typeof session.systemPrompt === "string" && !session.systemPrompt.includes("DeepSeek 官方联网搜索模式已开启")) {
            session.systemPrompt += `\n${SEARCH_MODE_PROMPT}`;
        }
    });
    // 4. 插件卸载时的资源释放
    ctx.on("dispose", () => {
        stopMcp().catch(() => { });
    });
}
export default apply;
