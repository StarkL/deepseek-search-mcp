export class DeepSeekApiClient {
    apiKey;
    baseUrl;
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || "";
        this.baseUrl = (baseUrl || process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");
        if (!this.apiKey) {
            console.error("[DeepSeekApiClient] WARNING: DEEPSEEK_API_KEY is not set. Requests will fail until configured.");
        }
    }
    /**
     * 执行网页搜索 (POST /v1/tools/search)
     */
    async search(params) {
        this.ensureApiKey();
        // 官方约束：query 必须 1~128 字符且非空
        let cleanQuery = (params.query || "").trim();
        if (!cleanQuery) {
            throw new Error("Query cannot be empty.");
        }
        if (cleanQuery.length > 128) {
            console.error(`[DeepSeekApiClient] Query exceeds 128 characters (${cleanQuery.length}), auto-truncating.`);
            cleanQuery = cleanQuery.slice(0, 128);
        }
        // ori_question 限制 1~128 字符
        let cleanOriQuestion = params.ori_question ? params.ori_question.trim() : null;
        if (cleanOriQuestion && cleanOriQuestion.length > 128) {
            cleanOriQuestion = cleanOriQuestion.slice(0, 128);
        }
        // count 范围 1~50
        const count = Math.min(Math.max(params.count ?? 10, 1), 50);
        const payload = {
            query: cleanQuery,
            count,
            need_content: params.need_content ?? false,
            ori_question: cleanOriQuestion || null,
            localization: params.localization || ""
        };
        const endpoint = `${this.baseUrl}/v1/tools/search`;
        return this.postWithRetry(endpoint, payload);
    }
    /**
     * 执行单个网页抓取并转 Markdown (POST /v1/tools/fetch)
     */
    async fetch(params) {
        this.ensureApiKey();
        const cleanUrl = (params.url || "").trim();
        if (!cleanUrl) {
            throw new Error("URL cannot be empty.");
        }
        if (cleanUrl.length > 8192) {
            throw new Error(`URL length (${cleanUrl.length}) exceeds maximum limit of 8192 characters.`);
        }
        // 校验 URL 合法性
        let parsed;
        try {
            parsed = new URL(cleanUrl);
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                throw new Error("URL protocol must be HTTP or HTTPS.");
            }
            if (parsed.username || parsed.password) {
                throw new Error("URL must not contain username or password credentials.");
            }
        }
        catch (e) {
            throw new Error(`Invalid URL format: ${e.message}`);
        }
        const payload = { url: cleanUrl };
        const endpoint = `${this.baseUrl}/v1/tools/fetch`;
        return this.postWithRetry(endpoint, payload);
    }
    ensureApiKey() {
        if (!this.apiKey) {
            throw new Error("Missing DeepSeek API Key. Please configure the DEEPSEEK_API_KEY environment variable in your MCP client settings.");
        }
    }
    /**
     * 带智能退避重试的 POST 请求
     * 仅针对 408, 429, 5xx 错误自动重试
     */
    async postWithRetry(url, body, maxRetries = 3) {
        let attempt = 0;
        let delay = 600; // 初始退避毫秒数
        while (attempt <= maxRetries) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.apiKey}`,
                        "User-Agent": "deepseek-search-mcp/1.0.0"
                    },
                    body: JSON.stringify(body)
                });
                if (response.ok) {
                    return (await response.json());
                }
                const statusCode = response.status;
                let errorData = null;
                try {
                    errorData = (await response.json());
                }
                catch {
                    // 非 JSON 格式错误响应
                }
                const errorMessage = errorData?.error?.message || response.statusText || `HTTP ${statusCode}`;
                // 401 密钥失效
                if (statusCode === 401) {
                    throw new Error(`DeepSeek API Key is invalid or expired (HTTP 401): ${errorMessage}. Please check your DEEPSEEK_API_KEY.`);
                }
                // 402 余额不足
                if (statusCode === 402) {
                    throw new Error(`DeepSeek API account balance is insufficient (HTTP 402): ${errorMessage}. Please top up your balance at https://platform.deepseek.com.`);
                }
                // 403 安全策略拒绝
                if (statusCode === 403) {
                    throw new Error(`Request rejected by DeepSeek security policy (HTTP 403): ${errorMessage}.`);
                }
                // 404 Fetch 网页未获取到内容
                if (statusCode === 404) {
                    const err = new Error(`Page content could not be retrieved (HTTP 404): ${errorMessage}`);
                    err.isFetchNotFound = true;
                    throw err;
                }
                // 400 / 413 等不可重试错误
                const isRetryable = [408, 429, 500, 502, 503, 504].includes(statusCode);
                if (!isRetryable || attempt >= maxRetries) {
                    throw new Error(`DeepSeek API request failed with status ${statusCode}: ${errorMessage}`);
                }
                // 触发退避重试（带少量随机抖动 jitter）
                attempt++;
                const jitter = Math.floor(Math.random() * 200);
                const waitMs = delay + jitter;
                console.error(`[DeepSeekApiClient] Request returned ${statusCode} (${errorMessage}). Retrying attempt ${attempt}/${maxRetries} after ${waitMs}ms...`);
                await new Promise((res) => setTimeout(res, waitMs));
                delay *= 2; // 指数退避
            }
            catch (err) {
                // 如果是已被抛出的不可重试业务异常，直接向上传递
                if (err.message?.includes("HTTP 401") ||
                    err.message?.includes("HTTP 402") ||
                    err.message?.includes("HTTP 403") ||
                    err.isFetchNotFound ||
                    err.message?.includes("HTTP 400") ||
                    err.message?.includes("HTTP 413")) {
                    throw err;
                }
                // 网络断开等底层错误重试
                if (attempt >= maxRetries) {
                    throw err;
                }
                attempt++;
                const waitMs = delay;
                console.error(`[DeepSeekApiClient] Network error: ${err.message}. Retrying attempt ${attempt}/${maxRetries}...`);
                await new Promise((res) => setTimeout(res, waitMs));
                delay *= 2;
            }
        }
        throw new Error(`Request failed after ${maxRetries} retry attempts.`);
    }
}
