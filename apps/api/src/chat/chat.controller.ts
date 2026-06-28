import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateConversationDto } from './dto/chat.dto';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all conversations for the current user' })
  @ApiOkResponse({ description: 'Conversations returned successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getConversations(@Request() req: { user: UserDocument }) {
    return this.chatService.getConversations(req.user._id.toString());
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiOkResponse({ description: 'Messages returned successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getMessages(
    @Param('id') id: string,
    @Request() req: { user: UserDocument },
  ) {
    return this.chatService.getMessages(id, req.user._id.toString());
  }

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a new conversation' })
  @ApiCreatedResponse({ description: 'Conversation created or returned successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiNotFoundResponse({ description: 'Recipient not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  createConversation(
    @Request() req: { user: UserDocument },
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.chatService.getOrCreateConversation(
      req.user._id.toString(),
      createConversationDto.recipientId,
      createConversationDto.projectId,
    );
  }
}

@ApiTags('chat')
@Controller('projects')
export class ChatProjectAccessController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post(':id/access/:userId/grant')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Grant full project access from chat',
    description: 'Allows a project owner to grant full document access to a user.',
  })
  @ApiOkResponse({ description: 'Access granted successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Project or user not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  grantProjectAccess(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: { user: UserDocument },
  ) {
    return this.projectsService
      .grantAccess(req.user._id.toString(), id, userId)
      .then((project) =>
        this.projectsService.sanitizeProject(
          project,
          req.user._id.toString(),
        ),
      );
  }
}
