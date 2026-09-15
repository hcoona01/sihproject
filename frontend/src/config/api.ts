import { DashboardConfig } from '../types/telemetry';

export const DEFAULT_BACKEND_URL = 'https://sihproject-qt1s.onrender.com';

const CONFIG_STORAGE_KEY = 'rover_station_config_v1';

export const DEFAULT_CONFIG: DashboardConfig = {
  backendBaseUrl: DEFAULT_BACKEND_URL,
  historyLimit: 40,
  reconnectDelayMs: 2500,
  maxReconnectAttempts: 15,
  highTempThreshold: 55, // °C
  lowDistThreshold: 30,  // cm warning
  highHumdThreshold: 85, // % RH
};

export function loadConfig(): DashboardConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      backendBaseUrl: (parsed.backendBaseUrl || DEFAULT_BACKEND_URL).trim().replace(/\/+$/, ''),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(cfg: Partial<DashboardConfig>): DashboardConfig {
  const current = loadConfig();
  const updated: DashboardConfig = {
    ...current,
    ...cfg,
    backendBaseUrl: (cfg.backendBaseUrl || current.backendBaseUrl).trim().replace(/\/+$/, ''),
  };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function getStreamUrl(baseUrl: string, endpoint: 'temp' | 'dist' | 'humd'): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${cleanBase}/${cleanEndpoint}`;
}

export function getVideoUrl(baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `${cleanBase}/video`;
}

export function getLedUrl(baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `${cleanBase}/led`;
}
