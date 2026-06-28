import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly usersService: UsersService,
  ) {}

  async getOrCreateConversation(
    userId1: string,
    userId2: string,
    projectId?: string,
  ): Promise<ConversationDocument> {
    if (userId1 === userId2) {
      throw new BadRequestException('Cannot create a conversation with yourself');
    }

    if (
      !Types.ObjectId.isValid(userId1) ||
      !Types.ObjectId.isValid(userId2)
    ) {
      throw new BadRequestException('Invalid user ID');
    }

    const recipient = await this.usersService.findById(userId2);

    if (!recipient || !recipient.isActive) {
      throw new NotFoundException('Recipient not found');
    }

    const participantIds = [userId1, userId2]
      .sort()
      .map((id) => new Types.ObjectId(id));

    const filter: Record<string, unknown> = {
      participants: { $all: participantIds, $size: 2 },
    };

    if (projectId) {
      if (!Types.ObjectId.isValid(projectId)) {
        throw new BadRequestException('Invalid project ID');
      }

      filter.project = new Types.ObjectId(projectId);
    } else {
      filter.project = { $exists: false };
    }

    const existingConversation = await this.conversationModel
      .findOne(filter)
      .exec();

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = new this.conversationModel({
      participants: participantIds,
      project: projectId ? new Types.ObjectId(projectId) : undefined,
    });

    return conversation.save();
  }

  async getConversations(userId: string): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find({ participants: new Types.ObjectId(userId) })
      .populate('participants', 'name avatar email')
      .populate('project', 'title')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .exec();
  }

  async getMessages(
    conversationId: string,
    userId: string,
  ): Promise<MessageDocument[]> {
    await this.ensureParticipant(conversationId, userId);

    return this.messageModel
      .find({ conversation: new Types.ObjectId(conversationId) })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .exec();
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<MessageDocument> {
    await this.ensureParticipant(conversationId, senderId);

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const message = await this.messageModel.create({
      conversation: new Types.ObjectId(conversationId),
      sender: new Types.ObjectId(senderId),
      content: trimmedContent,
    });

    await this.conversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: trimmedContent,
      lastMessageAt: new Date(),
    });

    return message.populate('sender', 'name avatar');
  }

  async verifyParticipant(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    await this.ensureParticipant(conversationId, userId);
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.ensureParticipant(conversationId, userId);

    await this.messageModel.updateMany(
      {
        conversation: new Types.ObjectId(conversationId),
        sender: { $ne: new Types.ObjectId(userId) },
        readAt: { $exists: false },
      },
      { readAt: new Date() },
    );
  }

  async findConversationById(
    conversationId: string,
  ): Promise<ConversationDocument | null> {
    if (!Types.ObjectId.isValid(conversationId)) {
      return null;
    }

    return this.conversationModel.findById(conversationId).exec();
  }

  private async ensureParticipant(
    conversationId: string,
    userId: string,
  ): Promise<ConversationDocument> {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new NotFoundException('Conversation not found');
    }

    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (participantId) => participantId.toString() === userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    return conversation;
  }
}
