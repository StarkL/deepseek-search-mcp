import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { DeepSeekApiClient } from "../client.js";
export declare const searchToolDefinition: Tool;
export declare function handleSearchTool(args: any, client: DeepSeekApiClient): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
