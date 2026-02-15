import { Result } from "../../logic/Result";

/**
 * WebSocket Message
 */
export interface WebSocketMessage<T = any> {
  event: string;
  data: T;
  timestamp?: Date;
  id?: string;
}

/**
 * WebSocket Room
 */
export interface WebSocketRoom {
  name: string;
  clients: Set<string>;
}

/**
 * WebSocket Client Info
 */
export interface WebSocketClient {
  id: string;
  rooms: Set<string>;
  metadata?: Record<string, any>;
  connectedAt: Date;
}

/**
 * WebSocket Server Interface
 */
export interface IWebSocketServer {
  /**
   * Start server
   */
  start(port: number): Promise<Result<void>>;
  
  /**
   * Stop server
   */
  stop(): Promise<Result<void>>;
  
  /**
   * Send message to specific client
   */
  sendToClient<T>(clientId: string, event: string, data: T): Result<void>;
  
  /**
   * Send message to all clients
   */
  broadcast<T>(event: string, data: T): Result<void>;
  
  /**
   * Send message to room
   */
  broadcastToRoom<T>(room: string, event: string, data: T): Result<void>;
  
  /**
   * Join client to room
   */
  joinRoom(clientId: string, room: string): Result<void>;
  
  /**
   * Remove client from room
   */
  leaveRoom(clientId: string, room: string): Result<void>;
  
  /**
   * Get all connected clients
   */
  getClients(): WebSocketClient[];
  
  /**
   * Get clients in room
   */
  getRoomClients(room: string): string[];
  
  /**
   * Disconnect client
   */
  disconnectClient(clientId: string): Result<void>;
  
  /**
   * Register event handler
   */
  on(event: string, handler: (clientId: string, data: any) => void | Promise<void>): void;
  
  /**
   * Get server stats
   */
  getStats(): WebSocketStats;
}

/**
 * WebSocket Client Interface
 */
export interface IWebSocketClient {
  /**
   * Connect to server
   */
  connect(url: string): Promise<Result<void>>;
  
  /**
   * Disconnect from server
   */
  disconnect(): Result<void>;
  
  /**
   * Send message
   */
  send<T>(event: string, data: T): Result<void>;
  
  /**
   * Listen to event
   */
  on(event: string, handler: (data: any) => void): void;
  
  /**
   * Remove event listener
   */
  off(event: string, handler: (data: any) => void): void;
  
  /**
   * Is connected?
   */
  isConnected(): boolean;
}

/**
 * WebSocket Stats
 */
export interface WebSocketStats {
  connectedClients: number;
  rooms: number;
  messagesSent: number;
  messagesReceived: number;
  uptime: number;
}

/**
 * WebSocket Configuration
 */
export interface WebSocketConfig {
  /**
   * Port number
   */
  port?: number;
  
  /**
   * Path
   */
  path?: string;
  
  /**
   * CORS settings
   */
  cors?: {
    origin: string | string[];
    credentials?: boolean;
  };
  
  /**
   * Ping interval (ms)
   */
  pingInterval?: number;
  
  /**
   * Ping timeout (ms)
   */
  pingTimeout?: number;
  
  /**
   * Max payload size (bytes)
   */
  maxPayload?: number;
}