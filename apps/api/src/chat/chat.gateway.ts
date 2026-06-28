import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import {
  JoinConversationDto,
  MarkReadDto,
  SendMessageDto,
} from './dto/chat.dto';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);

      if (!token) {
        throw new UnauthorizedException('Missing authentication token');
      }

      const payload = this.jwtService.verify<{ sub: string; email: string }>(
        token,
      );
      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid user');
      }

      client.data.userId = user._id.toString();

      const sockets = this.userSockets.get(client.data.userId) ?? new Set();
      sockets.add(client.id);
      this.userSockets.set(client.data.userId, sockets);

      this.logger.log(`Client connected: ${client.id} (user ${client.data.userId})`);
    } catch (error) {
      this.logger.warn(`WebSocket authentication failed: ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data?.userId;

    if (!userId) {
      return;
    }

    const sockets = this.userSockets.get(userId);

    if (!sockets) {
      return;
    }

    sockets.delete(client.id);

    if (sockets.size === 0) {
      this.userSockets.delete(userId);
    }

    this.logger.log(`Client disconnected: ${client.id} (user ${userId})`);
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinConversationDto,
  ) {
    await this.chatService.verifyParticipant(
      payload.conversationId,
      client.data.userId,
    );

    const room = this.getConversationRoom(payload.conversationId);
    await client.join(room);

    return {
      event: 'joined_conversation',
      data: { conversationId: payload.conversationId },
    };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SendMessageDto,
  ) {
    const message = await this.chatService.sendMessage(
      payload.conversationId,
      client.data.userId,
      payload.content,
    );

    const room = this.getConversationRoom(payload.conversationId);
    this.server.to(room).emit('new_message', message);

    return {
      event: 'message_sent',
      data: message,
    };
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: MarkReadDto,
  ) {
    await this.chatService.markAsRead(payload.conversationId, client.data.userId);

    const room = this.getConversationRoom(payload.conversationId);
    this.server.to(room).emit('messages_read', {
      conversationId: payload.conversationId,
      userId: client.data.userId,
    });

    return {
      event: 'marked_read',
      data: { conversationId: payload.conversationId },
    };
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;

    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const authorization = client.handshake.headers.authorization;

    if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
      return authorization.slice(7);
    }

    const queryToken = client.handshake.query.token;

    if (typeof queryToken === 'string' && queryToken.length > 0) {
      return queryToken;
    }

    return null;
  }

  private getConversationRoom(conversationId: string): string {
    return `conversation:${conversationId}`;
  }
}
