export const fetchToolDefinition = {
    name: "deepseek_fetch",
    description: "Fetch and extract the readable Markdown text of a specific webpage using DeepSeek's official crawler. Ideal for deep-dive reading on search results or analyzing documentation from a specific URL.",
    inputSchema: {
        type: "object",
        properties: {
            url: {
                type: "string",
                description: "The full HTTP/HTTPS URL of the webpage to fetch."
            },
            max_length: {
                type: "number",
                description: "Maximum character length of the returned markdown content (default is 8000).",
                default: 8000
            }
        },
        required: ["url"]
    }
};
export async function handleFetchTool(args, client) {
    const toolArgs = args;
    const maxLength = toolArgs.max_length || 8000;
    try {
        const response = await client.fetch({ url: toolArgs.url });
        const title = response.title || "Untitled Page";
        let content = response.content || "";
        if (!content.trim()) {
            return {
                content: [
                    {
                        type: "text",
                        text: `⚠️ Page fetched successfully, but no readable body text could be extracted from: ${toolArgs.url}`
                    }
                ]
            };
        }
        let truncatedNotice = "";
        if (content.length > maxLength) {
            content = content.slice(0, maxLength);
            truncatedNotice = `\n\n*(Content truncated at ${maxLength} characters to prevent context overflow.)*`;
        }
        const outputText = `# 📄 ${title}\n**Source:** ${toolArgs.url}\n\n---\n\n${content}${truncatedNotice}`;
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
        // 捕获 404 反爬拦截或无可用内容，优雅告知模型
        if (err.isFetchNotFound || err.message?.includes("404")) {
            return {
                content: [
                    {
                        type: "text",
                        text: `⚠️ Unable to extract readable markdown content from: ${toolArgs.url}. The target website might have strict anti-scraping protections or does not contain standard article text. Please consider relying on the search summaries or trying an alternate source.`
                    }
                ]
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Fetch Failed: ${err.message}`
                }
            ],
            isError: true
        };
    }
}
