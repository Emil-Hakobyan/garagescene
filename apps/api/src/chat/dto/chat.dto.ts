import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ example: '664f1a2b3c4d5e6f7a8b9c0d' })
  @IsMongoId()
  recipientId: string;

  @ApiPropertyOptional({ example: '664f1a2b3c4d5e6f7a8b9c0e' })
  @IsOptional()
  @IsMongoId()
  projectId?: string;
}

export class JoinConversationDto {
  @ApiProperty({ example: '664f1a2b3c4d5e6f7a8b9c0f' })
  @IsMongoId()
  conversationId: string;
}

export class SendMessageDto {
  @ApiProperty({ example: '664f1a2b3c4d5e6f7a8b9c0f' })
  @IsMongoId()
  conversationId: string;

  @ApiProperty({ example: 'Hey, I loved your project teaser!' })
  @IsString()
  content: string;
}

export class MarkReadDto {
  @ApiProperty({ example: '664f1a2b3c4d5e6f7a8b9c0f' })
  @IsMongoId()
  conversationId: string;
}
