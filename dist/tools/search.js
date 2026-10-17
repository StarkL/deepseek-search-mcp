export const searchToolDefinition = {
    name: "deepseek_search",
    description: "Search the web using DeepSeek's official search engine. Returns real-time, high-quality search results with relevance scores (rerank_score) and dense summaries tailored for LLMs. Supports advanced syntax such as 'site:', '-site:', and quotes.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "Search query keywords (1-128 characters). Keep it concise. Supports advanced syntax like 'site:github.com'."
            },
            count: {
                type: "number",
                description: "Number of search results to return (1-50). Default is 5.",
                default: 5
            },
            detail_level: {
                type: "string",
                enum: ["summary", "snippet", "full"],
                description: "Level of detail: 'summary' (recommended, dense 600-800 char summary), 'snippet' (short 100-200 char snippet, token-efficient), or 'full' (crawls full webpage content). Default is 'summary'.",
                default: "summary"
            },
            min_score: {
                type: "number",
                description: "Minimum rerank score (0.0 to 3.0) to filter out low-relevance results. DeepSeek considers >= 1.5 high quality. Default is 1.0.",
                default: 1.0
            },
            ori_question: {
                type: "string",
                description: "The user's original unedited question. Helps the search engine better understand user intent."
            },
            localization: {
                type: "string",
                description: "Optional IP address to prioritize localized search results."
            }
        },
        required: ["query"]
    }
};
export async function handleSearchTool(args, client) {
    const toolArgs = args;
    const detailLevel = toolArgs.detail_level || "summary";
    const needContent = detailLevel === "full";
    const count = toolArgs.count || 5;
    const minScore = toolArgs.min_score !== undefined ? toolArgs.min_score : 1.0;
    try {
        const response = await client.search({
            query: toolArgs.query,
            count,
            need_content: needContent,
            ori_question: toolArgs.ori_question,
            localization: toolArgs.localization
        });
        const rawResults = response.results || [];
        if (rawResults.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No search results found for query: "${toolArgs.query}". Try refining your keywords or removing restrictive search filters.`
                    }
                ]
            };
        }
        // 按 min_score 过滤
        let filteredResults = rawResults.filter((item) => (item.rerank_score ?? 0) >= minScore);
        let notice = "";
        // 如果过滤后全为空，但原始有结果，做降级展示并给提示
        if (filteredResults.length === 0 && rawResults.length > 0) {
            filteredResults = rawResults.slice(0, 3);
            notice = `> Note: All results had rerank scores below ${minScore}. Showing top ${filteredResults.length} closest matches.\n\n`;
        }
        // 格式化为 Markdown
        const markdownItems = filteredResults.map((item, index) => {
            const scoreStr = item.rerank_score !== undefined ? ` (Score: ${item.rerank_score.toFixed(2)}/3.0)` : "";
            const siteStr = item.site_name ? ` · *${item.site_name}*` : "";
            const dateStr = item.date ? ` · 📅 ${item.date.split("T")[0]}` : "";
            let bodyText = "";
            if (detailLevel === "full" && item.content) {
                bodyText = `\n**Full Content:**\n${item.content}\n`;
            }
            else if (detailLevel === "snippet") {
                bodyText = item.snippet || item.summary || "No snippet available.";
            }
            else {
                // default summary
                bodyText = item.summary || item.snippet || "No summary available.";
            }
            return `### ${index + 1}. [${item.title}](${item.url})${scoreStr}\n${siteStr}${dateStr}\n\n${bodyText}\n`;
        });
        const outputText = `## 🔍 Search Results for: "${toolArgs.query}" (${filteredResults.length} items)\n\n` +
            notice +
            markdownItems.join("\n---\n\n");
        return {
            content: [
                {
                    type: "text",
                    text: outputText
                }
            ]
        };
    }
    catch (err) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Search Failed: ${err.message}`
                }
            ],
            isError: true
        };
    }
}
