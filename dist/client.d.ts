import { DeepSeekSearchRequest, DeepSeekSearchResponse, DeepSeekFetchRequest, DeepSeekFetchResponse } from "./types.js";
/**
 * 智能按优先级解析有效的 DeepSeek API Key:
 * 1. 显式传入 (代码/前端会话)
 * 2. 环境变量 DEEPSEEK_API_KEY
 * 3. 终极兜底：自动探测读取 ~/.dsh/.credentials.yaml
 */
export declare function resolveDeepSeekApiKey(explicitKey?: string): string;
export declare class DeepSeekApiClient {
    private apiKey;
    private baseUrl;
    constructor(apiKey?: string, baseUrl?: string);
    /**
     * 执行网页搜索 (POST /v1/tools/search)
     */
    search(params: DeepSeekSearchRequest): Promise<DeepSeekSearchResponse>;
    /**
     * 执行单个网页抓取并转 Markdown (POST /v1/tools/fetch)
     */
    fetch(params: DeepSeekFetchRequest): Promise<DeepSeekFetchResponse>;
    private ensureApiKey;
    /**
     * 带智能退避重试的 POST 请求
     * 仅针对 408, 429, 5xx 错误自动重试
     */
    private postWithRetry;
}
