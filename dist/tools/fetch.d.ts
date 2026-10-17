import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { DeepSeekApiClient } from "../client.js";
export declare const fetchToolDefinition: Tool;
export declare function handleFetchTool(args: any, client: DeepSeekApiClient): Promise<{
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
