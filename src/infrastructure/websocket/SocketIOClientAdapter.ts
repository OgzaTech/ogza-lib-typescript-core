import { Result } from "../../logic/Result";
import { IWebSocketClient } from "./IWebSocket";

/**
 * Socket.IO Client Adapter
 * 
 * IMPORTANT: Requires 'socket.io-client' package
 * Install: npm install socket.io-client
 * 
 * This is an interface adapter - actual Socket.IO client must be injected
 */
export class SocketIOClientAdapter implements IWebSocketClient {
  private socket: any; // Socket.IO Client
  private url: string = '';
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(socket?: any) {
    this.socket = socket;
  }

  async connect(url: string): Promise<Result<void>> {
    try {
      this.url = url;

      return new Promise((resolve) => {
        this.socket.on('connect', () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          console.log('[WebSocket Client] Connected to server');
          resolve(Result.ok());
        });

        this.socket.on('disconnect', () => {
          this.connected = false;
          console.log('[WebSocket Client] Disconnected from server');
        });

        this.socket.on('connect_error', (error: Error) => {
          console.error('[WebSocket Client] Connection error:', error);
          
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            resolve(Result.fail(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
          }
        });

        this.socket.connect();
      });
    } catch (error) {
      return Result.fail(`Failed to connect: ${error}`);
    }
  }

  disconnect(): Result<void> {
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.connected = false;
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to disconnect: ${error}`);
    }
  }

  send<T>(event: string, data: T): Result<void> {
    try {
      if (!this.connected) {
        return Result.fail('Not connected to server');
      }

      this.socket.emit(event, data);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to send message: ${error}`);
    }
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }

    this.socket.on(event, handler);
  }

  off(event: string, handler: (data: any) => void): void {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }

    this.socket.off(event, handler);
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Send with acknowledgment
   */
  async sendWithAck<T, R>(event: string, data: T, timeout: number = 5000): Promise<Result<R>> {
    try {
      if (!this.connected) {
        return Result.fail('Not connected to server');
      }

      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve(Result.fail('Acknowledgment timeout'));
        }, timeout);

        this.socket.emit(event, data, (response: R) => {
          clearTimeout(timer);
          resolve(Result.ok(response));
        });
      });
    } catch (error) {
      return Result.fail(`Failed to send with ack: ${error}`);
    }
  }

  /**
   * Join room
   */
  joinRoom(room: string): Result<void> {
    return this.send('join-room', { room });
  }

  /**
   * Leave room
   */
  leaveRoom(room: string): Result<void> {
    return this.send('leave-room', { room });
  }
}