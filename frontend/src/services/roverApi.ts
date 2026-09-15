import { getLedUrl } from '../config/api';

export interface LedCommandResult {
  success: boolean;
  status: number;
  message: string;
  timestamp: Date;
  rawResponse?: string;
}

export async function toggleRoverLed(
  baseUrl: string,
  targetState: boolean,
  roverId: number = 100
): Promise<LedCommandResult> {
  const ledUrl = getLedUrl(baseUrl);
  const timestamp = new Date();

  // Try GET request with query params state & rover_id as per user specification:
  // "its a simple http get endpoint for ex GET /temp -> {data: 23, rover_id: 100 }"
  const urlWithParams = `${ledUrl}?state=${targetState ? '1' : '0'}&status=${targetState ? 'on' : 'off'}&rover_id=${roverId}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(urlWithParams, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await res.text();

    if (res.ok) {
      let parsed = text;
      try {
        parsed = JSON.parse(text);
      } catch {
        // text is fine
      }
      return {
        success: true,
        status: res.status,
        message: `LED command [${targetState ? 'ON' : 'OFF'}] acknowledged by rover`,
        timestamp,
        rawResponse: typeof parsed === 'string' ? parsed : JSON.stringify(parsed),
      };
    } else {
      return {
        success: false,
        status: res.status,
        message: `Server returned HTTP ${res.status}: ${res.statusText || (res.status === 404 ? 'LED endpoint route not yet exposed on server' : 'Command error')}`,
        timestamp,
        rawResponse: text,
      };
    }
  } catch (err: unknown) {
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    const errorMsg = isAbort ? 'Command timed out (4s)' : (err instanceof Error ? err.message : String(err));

    return {
      success: false,
      status: 0,
      message: `Failed to contact rover: ${errorMsg}`,
      timestamp,
      rawResponse: errorMsg,
    };
  }
}
