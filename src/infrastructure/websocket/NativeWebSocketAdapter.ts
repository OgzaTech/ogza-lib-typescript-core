import { Result } from "../../logic/Result";
import { IWebSocketClient } from "./IWebSocket";

/**
 * Native WebSocket Client Adapter
 * Lightweight alternative to Socket.IO
 * 
 * Uses native WebSocket API (works in browser and Node.js with 'ws' package)
 */
export class NativeWebSocketAdapter implements IWebSocketClient {
  private ws?: WebSocket;
  private url: string = '';
  private connected: boolean = false;
  private eventHandlers: Map<string, Array<(data: any) => void>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  async connect(url: string): Promise<Result<void>> {
    try {
      this.url = url;

      return new Promise((resolve, reject) => {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          console.log('[WebSocket Client] Connected to server');
          resolve(Result.ok());
        };

        this.ws.onclose = () => {
          this.connected = false;
          console.log('[WebSocket Client] Disconnected from server');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket Client] Error:', error);
          reject(Result.fail('Connection failed'));
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      });
    } catch (error) {
      return Result.fail(`Failed to connect: ${error}`);
    }
  }

  disconnect(): Result<void> {
    try {
      if (this.ws) {
        this.ws.close();
        this.connected = false;
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to disconnect: ${error}`);
    }
  }

  send<T>(event: string, data: T): Result<void> {
    try {
      if (!this.connected || !this.ws) {
        return Result.fail('Not connected to server');
      }

      const message = JSON.stringify({ event, data });
      this.ws.send(message);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to send message: ${error}`);
    }
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Handle incoming message
   */
  private handleMessage(rawData: string): void {
    try {
      const message = JSON.parse(rawData);
      const { event, data } = message;

      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error(`[WebSocket Client] Handler error for event ${event}:`, error);
          }
        });
      }
    } catch (error) {
      console.error('[WebSocket Client] Failed to parse message:', error);
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket Client] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocket Client] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect(this.url);
    }, delay);
  }
}