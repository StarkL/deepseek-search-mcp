export declare const name = "dsh-client-deepseek-search";
export declare const inject: readonly ["slots"];
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
export declare function SearchButton(props: SearchButtonProps): any;
/**
 * DSH 客户端插件入口：
 * 精准注册到 conversation.input.left 插槽（与聊天输入框底部的 +、工作区修改 处于同一操作栏）
 */
export declare function apply(ctx: any): void;
export default apply;
