import { StreamConnectionState, TelemetryPayload } from '../types/telemetry';

export type MessageHandler = (payload: TelemetryPayload) => void;
export type StateChangeHandler = (state: StreamConnectionState) => void;
export type LogHandler = (level: 'info' | 'warn' | 'error' | 'success', message: string) => void;

export class SseStreamManager {
  private url: string;
  private name: string;
  private eventSource: EventSource | null = null;
  private state: StreamConnectionState = 'disconnected';
  private reconnectTimeout: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 30;
  private baseReconnectDelay = 2000;
  private isManuallyClosed = false;

  private messageListeners: Set<MessageHandler> = new Set();
  private stateListeners: Set<StateChangeHandler> = new Set();
  private logListeners: Set<LogHandler> = new Set();

  constructor(url: string, name: string) {
    this.url = url;
    this.name = name;
  }

  public setUrl(newUrl: string): void {
    if (this.url !== newUrl) {
      this.url = newUrl;
      if (this.state !== 'disconnected') {
        this.reconnect();
      }
    }
  }

  public connect(): void {
    this.isManuallyClosed = false;
    this.clearReconnectTimeout();

    if (this.eventSource) {
      this.cleanupEventSource();
    }

    this.updateState('connecting');
    this.log('info', `Connecting to SSE endpoint: ${this.url}`);

    try {
      this.eventSource = new EventSource(this.url);

      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0;
        this.updateState('connected');
        this.log('success', `SSE stream established for ${this.name}`);
      };

      this.eventSource.onmessage = (event: MessageEvent) => {
        this.handleRawMessage(event.data);
      };

      // In case server sends named events like 'telemetry', 'update', or 'data'
      this.eventSource.addEventListener('data', (event: MessageEvent) => {
        this.handleRawMessage(event.data);
      });
      this.eventSource.addEventListener('telemetry', (event: MessageEvent) => {
        this.handleRawMessage(event.data);
      });

      this.eventSource.onerror = (_errorEvent: Event) => {
        // EventSource will automatically attempt browser-level reconnect,
        // but if connection failed completely or closed, we manage state & backoff.
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          this.updateState('disconnected');
          this.log('warn', `Stream closed for ${this.name}. Scheduling reconnect...`);
          this.scheduleReconnect();
        } else if (this.eventSource?.readyState === EventSource.CONNECTING) {
          this.updateState('connecting');
        } else {
          this.updateState('error');
          this.log('error', `Stream error detected on ${this.name}`);
          this.scheduleReconnect();
        }
      };
    } catch (err: unknown) {
      this.updateState('error');
      const msg = err instanceof Error ? err.message : String(err);
      this.log('error', `Failed to construct EventSource for ${this.name}: ${msg}`);
      this.scheduleReconnect();
    }
  }

  private handleRawMessage(raw: string): void {
    if (!raw) return;

    try {
      let parsedPayload: TelemetryPayload | null = null;
      const trimmed = raw.trim();

      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const json = JSON.parse(trimmed);
        if (typeof json.data === 'number' || !isNaN(Number(json.data))) {
          parsedPayload = {
            data: Number(json.data),
            rover_id: Number(json.rover_id ?? 0),
          };
        }
      } else if (!isNaN(Number(trimmed))) {
        // Fallback if backend sends plain number
        parsedPayload = {
          data: Number(trimmed),
          rover_id: 100,
        };
      }

      if (parsedPayload !== null) {
        // Notify all subscribers
        this.messageListeners.forEach((listener) => {
          try {
            listener(parsedPayload!);
          } catch (e) {
            console.error(`Error in message listener for ${this.name}:`, e);
          }
        });
      } else {
        this.log('warn', `Unrecognized payload format from ${this.name}: ${trimmed}`);
      }
    } catch (e) {
      this.log('error', `JSON parse error on ${this.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  private scheduleReconnect(): void {
    if (this.isManuallyClosed) return;

    this.clearReconnectTimeout();

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.log('error', `Max reconnect attempts (${this.maxReconnectAttempts}) reached for ${this.name}`);
      this.updateState('error');
      return;
    }

    this.reconnectAttempts++;
    // Exponential backoff with jitter, capped at 15 seconds
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1) + Math.random() * 500,
      15000
    );

    this.log('info', `Attempting reconnect #${this.reconnectAttempts} for ${this.name} in ${(delay / 1000).toFixed(1)}s`);

    this.reconnectTimeout = window.setTimeout(() => {
      if (!this.isManuallyClosed) {
        this.connect();
      }
    }, delay);
  }

  public reconnect(): void {
    this.reconnectAttempts = 0;
    this.connect();
  }

  public disconnect(): void {
    this.isManuallyClosed = true;
    this.clearReconnectTimeout();
    this.cleanupEventSource();
    this.updateState('disconnected');
    this.log('info', `Stream disconnected for ${this.name}`);
  }

  private cleanupEventSource(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private updateState(newState: StreamConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.stateListeners.forEach((fn) => fn(newState));
    }
  }

  private log(level: 'info' | 'warn' | 'error' | 'success', message: string): void {
    this.logListeners.forEach((fn) => fn(level, message));
  }

  public onMessage(handler: MessageHandler): () => void {
    this.messageListeners.add(handler);
    return () => this.messageListeners.delete(handler);
  }

  public onStateChange(handler: StateChangeHandler): () => void {
    this.stateListeners.add(handler);
    handler(this.state);
    return () => this.stateListeners.delete(handler);
  }

  public onLog(handler: LogHandler): () => void {
    this.logListeners.add(handler);
    return () => this.logListeners.delete(handler);
  }

  public getState(): StreamConnectionState {
    return this.state;
  }

  public getAttempts(): number {
    return this.reconnectAttempts;
  }
}
