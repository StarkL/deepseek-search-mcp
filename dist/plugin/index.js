import { fileURLToPath } from "node:url";
import path from "node:path";
import { resolveDeepSeekApiKey } from "../client.js";
export const name = "dsh-deepseek-search";
export function apply(ctx, config = {}) {
    const serverName = config.serverName || "deepseek-search";
    const defaultEnabled = config.defaultEnabled ?? false;
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
     * 确保 MCP 已经启动：支持多级 API Key 自动寻址与热切换
     */
    const ensureStarted = async (explicitApiKey) => {
        lastUsedTime = Date.now();
        // 多级解析 API Key: 前端传入 > 环境变量 > ~/.dsh/.credentials.yaml 兜底
        const apiKey = resolveDeepSeekApiKey(explicitApiKey || config.apiKey);
        if (!apiKey || apiKey.trim() === "") {
            throw new Error("未检测到有效的 DeepSeek API Key！请点击按钮配置，或在系统环境变量中设置。");
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
            // 动态加载 @deepseek-ai/dsh-mcp-client 并建立 stdio 链接
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
     * 状态与操作服务对象
     */
    const searchService = {
        getStatus: async () => ({
            running: isMcpRunning(),
            hasApiKey: Boolean(resolveDeepSeekApiKey(config.apiKey)),
            serverName
        }),
        ensureStarted: (explicitKey) => ensureStarted(explicitKey),
        stop: stopMcp
    };
    // 1. 注册为 Cordis 服务
    try {
        if (typeof ctx.provide === "function") {
            ctx.provide("deepseekSearchService", searchService);
        }
    }
    catch { }
    // 2. 原生 Cordis 事件总线监听
    ctx.on("deepseekSearch/getStatus", searchService.getStatus);
    ctx.on("deepseekSearch/ensureStarted", (key) => ensureStarted(key));
    ctx.on("deepseekSearch/stop", searchService.stop);
    /**
     * 拦截 Agent 对话生命周期：按需过滤/注入工具并自动按需启动
     */
    ctx.on("agent/before-chat", async (session) => {
        const isSearchActive = session?.options?.enableDeepSeekSearch ?? defaultEnabled;
        if (!session || !Array.isArray(session.tools)) {
            return;
        }
        if (!isSearchActive) {
            // 变暗状态：严格剔除搜索与抓取工具，避免模型误调或浪费 token
            session.tools = session.tools.filter((t) => {
                const toolName = t?.name || "";
                return !toolName.includes("deepseek_search") && !toolName.includes("deepseek_fetch");
            });
        }
        else {
            // 亮起状态：确保后台 MCP 已启动
            const userKey = session?.options?.deepseekApiKey;
            try {
                await ensureStarted(userKey);
            }
            catch (e) {
                console.error("[dsh-deepseek-search] ensureStarted error:", e);
            }
            lastUsedTime = Date.now();
            // 在 System Prompt 中注入联网搜索提示词
            const searchPrompt = "\n[联网检索已就绪]: 当前会话已开启 DeepSeek 实时网页搜索与抓取能力。如需最新资讯、外部链接分析或查证事实，请按需调用 search 或 fetch 工具。";
            if (typeof session.systemPrompt === "string") {
                if (!session.systemPrompt.includes("联网检索已就绪")) {
                    session.systemPrompt += searchPrompt;
                }
            }
        }
    });
    // 插件卸载时的清理
    ctx.on("dispose", () => {
        stopMcp().catch(() => { });
    });
}
