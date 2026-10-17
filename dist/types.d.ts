/**
 * DeepSeek Search & Fetch API 类型定义
 */
export interface DeepSeekApiError {
    error: {
        message: string;
        type: string;
        param: string | null;
        code: string;
    };
}
export interface DeepSeekSearchRequest {
    query: string;
    count?: number;
    need_content?: boolean;
    ori_question?: string | null;
    localization?: string;
}
export interface DeepSeekSearchResultItem {
    rerank_score: number;
    title: string;
    url: string;
    snippet: string;
    summary: string;
    content: string;
    site_name: string | null;
    site_icon: string | null;
    date: string | null;
    authority: number;
}
export interface DeepSeekSearchResponse {
    results: DeepSeekSearchResultItem[];
}
export interface DeepSeekFetchRequest {
    url: string;
}
export interface DeepSeekFetchResponse {
    title: string;
    content: string;
}
export type DetailLevel = "summary" | "snippet" | "full";
export interface SearchToolArgs {
    query: string;
    count?: number;
    detail_level?: DetailLevel;
    min_score?: number;
    ori_question?: string;
    localization?: string;
}
export interface FetchToolArgs {
    url: string;
    max_length?: number;
}
