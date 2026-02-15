import { Result } from "../../logic/Result";
import { 
  IWebSocketServer, 
  WebSocketClient, 
  WebSocketStats,
  WebSocketConfig 
} from "./IWebSocket";

/**
 * Socket.IO Server Adapter
 * 
 * IMPORTANT: Requires 'socket.io' package
 * Install: npm install socket.io @types/socket.io
 * 
 * This is an interface adapter - actual Socket.IO server must be injected
 */
export class SocketIOServerAdapter implements IWebSocketServer {
  private io: any; // Socket.IO Server
  private clients: Map<string, WebSocketClient> = new Map();
  private rooms: Map<string, Set<string>> = new Map();
  private handlers: Map<string, Array<(clientId: string, data: any) => void | Promise<void>>> = new Map();
  private messagesSent: number = 0;
  private messagesReceived: number = 0;
  private startTime: Date;

  constructor(io: any, config?: WebSocketConfig) {
    this.io = io;
    this.startTime = new Date();
    this.setupHandlers();
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupHandlers(): void {
    this.io.on('connection', (socket: any) => {
      this.handleConnection(socket);
    });
  }

  /**
   * Handle new client connection
   */
  private handleConnection(socket: any): void {
    const clientId = socket.id;

    // Add client
    const client: WebSocketClient = {
      id: clientId,
      rooms: new Set(),
      connectedAt: new Date()
    };
    this.clients.set(clientId, client);

    console.log(`[WebSocket] Client connected: ${clientId}`);

    // Setup client event handlers
    this.setupClientHandlers(socket);

    // Handle disconnect
    socket.on('disconnect', () => {
      this.handleDisconnection(clientId);
    });
  }

  /**
   * Setup handlers for client events
   */
  private setupClientHandlers(socket: any): void {
    // Listen to all registered custom events
    for (const [event, handlers] of this.handlers.entries()) {
      socket.on(event, async (data: any) => {
        this.messagesReceived++;
        
        for (const handler of handlers) {
          try {
            await handler(socket.id, data);
          } catch (error) {
            console.error(`[WebSocket] Handler error for event ${event}:`, error);
          }
        }
      });
    }
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    
    if (client) {
      // Remove from all rooms
      for (const room of client.rooms) {
        this.leaveRoom(clientId, room);
      }
      
      this.clients.delete(clientId);
      console.log(`[WebSocket] Client disconnected: ${clientId}`);
    }
  }

  async start(port: number): Promise<Result<void>> {
    try {
      // Socket.IO is already started by HTTP server
      // This method is here for interface compatibility
      this.startTime = new Date();
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to start WebSocket server: ${error}`);
    }
  }

  async stop(): Promise<Result<void>> {
    try {
      this.io.close();
      this.clients.clear();
      this.rooms.clear();
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to stop WebSocket server: ${error}`);
    }
  }

  sendToClient<T>(clientId: string, event: string, data: T): Result<void> {
    try {
      const socket = this.io.sockets.sockets.get(clientId);
      
      if (!socket) {
        return Result.fail(`Client ${clientId} not found`);
      }

      socket.emit(event, data);
      this.messagesSent++;
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to send to client: ${error}`);
    }
  }

  broadcast<T>(event: string, data: T): Result<void> {
    try {
      this.io.emit(event, data);
      this.messagesSent += this.clients.size;
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to broadcast: ${error}`);
    }
  }

  broadcastToRoom<T>(room: string, event: string, data: T): Result<void> {
    try {
      this.io.to(room).emit(event, data);
      
      const roomClients = this.rooms.get(room);
      if (roomClients) {
        this.messagesSent += roomClients.size;
      }
      
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to broadcast to room: ${error}`);
    }
  }

  joinRoom(clientId: string, room: string): Result<void> {
    try {
      const socket = this.io.sockets.sockets.get(clientId);
      
      if (!socket) {
        return Result.fail(`Client ${clientId} not found`);
      }

      const client = this.clients.get(clientId);
      if (client) {
        client.rooms.add(room);
      }

      if (!this.rooms.has(room)) {
        this.rooms.set(room, new Set());
      }
      this.rooms.get(room)!.add(clientId);

      socket.join(room);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to join room: ${error}`);
    }
  }

  leaveRoom(clientId: string, room: string): Result<void> {
    try {
      const socket = this.io.sockets.sockets.get(clientId);
      
      if (socket) {
        socket.leave(room);
      }

      const client = this.clients.get(clientId);
      if (client) {
        client.rooms.delete(room);
      }

      const roomClients = this.rooms.get(room);
      if (roomClients) {
        roomClients.delete(clientId);
        if (roomClients.size === 0) {
          this.rooms.delete(room);
        }
      }

      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to leave room: ${error}`);
    }
  }

  getClients(): WebSocketClient[] {
    return Array.from(this.clients.values());
  }

  getRoomClients(room: string): string[] {
    const roomClients = this.rooms.get(room);
    return roomClients ? Array.from(roomClients) : [];
  }

  disconnectClient(clientId: string): Result<void> {
    try {
      const socket = this.io.sockets.sockets.get(clientId);
      
      if (!socket) {
        return Result.fail(`Client ${clientId} not found`);
      }

      socket.disconnect(true);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to disconnect client: ${error}`);
    }
  }

  on(event: string, handler: (clientId: string, data: any) => void | Promise<void>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    
    this.handlers.get(event)!.push(handler);

    // Register handler on existing sockets
    for (const [socketId, socket] of this.io.sockets.sockets) {
      socket.on(event, async (data: any) => {
        this.messagesReceived++;
        try {
          await handler(socketId, data);
        } catch (error) {
          console.error(`[WebSocket] Handler error for event ${event}:`, error);
        }
      });
    }
  }

  getStats(): WebSocketStats {
    const uptime = Date.now() - this.startTime.getTime();

    return {
      connectedClients: this.clients.size,
      rooms: this.rooms.size,
      messagesSent: this.messagesSent,
      messagesReceived: this.messagesReceived,
      uptime: Math.floor(uptime / 1000) // seconds
    };
  }

  /**
   * Set client metadata
   */
  setClientMetadata(clientId: string, metadata: Record<string, any>): Result<void> {
    const client = this.clients.get(clientId);
    
    if (!client) {
      return Result.fail(`Client ${clientId} not found`);
    }

    client.metadata = { ...client.metadata, ...metadata };
    return Result.ok();
  }

  /**
   * Get client metadata
   */
  getClientMetadata(clientId: string): Result<Record<string, any> | undefined> {
    const client = this.clients.get(clientId);
    
    if (!client) {
      return Result.fail(`Client ${clientId} not found`);
    }

    return Result.ok(client.metadata);
  }
}