#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { DeepSeekApiClient } from "./client.js";
import { searchToolDefinition, handleSearchTool } from "./tools/search.js";
import { fetchToolDefinition, handleFetchTool } from "./tools/fetch.js";

async function main() {
  const client = new DeepSeekApiClient();

  const server = new Server(
    {
      name: "deepseek-search-mcp",
      version: "1.0.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // 1. 注册可用工具列表
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [searchToolDefinition, fetchToolDefinition]
    };
  });

  // 2. 路由并处理工具调用
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "deepseek_search") {
      return handleSearchTool(args || {}, client);
    }

    if (name === "deepseek_fetch") {
      return handleFetchTool(args || {}, client);
    }

    throw new Error(`Tool not found: ${name}`);
  });

  // 3. 建立 stdio 传输通道
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("[deepseek-search-mcp] Server running and listening on stdio.");
}

// 确保未捕获异常不破坏 stdio 报文通道
process.on("uncaughtException", (error) => {
  console.error("[deepseek-search-mcp] Uncaught exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("[deepseek-search-mcp] Unhandled rejection:", reason);
});

main().catch((error) => {
  console.error("[deepseek-search-mcp] Fatal error in main():", error);
  process.exit(1);
});
