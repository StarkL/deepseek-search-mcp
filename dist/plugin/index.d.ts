import type { PluginConfig } from "./types.js";
export declare const name = "dsh-plugin-deepseek-search";
export declare const inject: {
    optional: string[];
};
export declare function apply(ctx: any, config?: PluginConfig): void;
