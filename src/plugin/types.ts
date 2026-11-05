export interface PluginConfig {
  defaultEnabled?: boolean;
  serverName?: string;
  autoShutdownIdleMinutes?: number;
}

export interface McpStatusResponse {
  running: boolean;
  hasApiKey: boolean;
  serverName: string;
}

export interface EnsureStartedResult {
  success: boolean;
  message: string;
}
