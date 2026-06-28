import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import {
  ChatController,
  ChatProjectAccessController,
} from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';
import { Message, MessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    UsersModule,
    ProjectsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [ChatController, ChatProjectAccessController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
