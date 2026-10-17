import { DeepSeekSearchRequest, DeepSeekSearchResponse, DeepSeekFetchRequest, DeepSeekFetchResponse } from "./types.js";
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
