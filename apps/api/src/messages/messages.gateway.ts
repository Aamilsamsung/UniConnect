import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

type SocketUser = { id: string; universityId: string; role: string };

@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN || true }, namespace: '/messages' })
export class MessagesGateway {
  @WebSocketServer() server!: Server;

  constructor(private readonly jwt: JwtService, private readonly messages: MessagesService) {}

  handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!token) return socket.disconnect(true);
      const payload = this.jwt.verify<{ sub: string; universityId: string; role: string }>(token);
      (socket.data as { user?: SocketUser }).user = { id: payload.sub, universityId: payload.universityId, role: payload.role };
    } catch {
      socket.disconnect(true);
    }
  }

  @SubscribeMessage('conversation:join')
  async join(@ConnectedSocket() socket: Socket, @MessageBody() body: { conversationId?: string }) {
    const user = (socket.data as { user?: SocketUser }).user;
    if (!user || !body?.conversationId) return { ok: false, error: 'Unauthorized' };
    try {
      await this.messages.history(user, body.conversationId);
      await socket.join(`conversation:${body.conversationId}`);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Conversation access denied' };
    }
  }

  @SubscribeMessage('message:send')
  async send(@ConnectedSocket() socket: Socket, @MessageBody() body: { conversationId?: string; content?: string }) {
    const user = (socket.data as { user?: SocketUser }).user;
    if (!user || !body?.conversationId || !body.content) return { ok: false, error: 'Invalid message' };
    try {
      const message = await this.messages.send(user, body.conversationId, body.content);
      this.server.to(`conversation:${body.conversationId}`).emit('message:new', message);
      return { ok: true, message };
    } catch {
      return { ok: false, error: 'Message could not be sent' };
    }
  }
}
