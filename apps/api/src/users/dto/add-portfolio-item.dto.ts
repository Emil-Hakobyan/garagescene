import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { PortfolioItemType } from '../schemas/user.schema';

export class AddPortfolioItemDto {
  @ApiProperty({ example: 'Short Film Reel' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({ example: 'A collection of my best indie work.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://vimeo.com/example' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({ enum: PortfolioItemType, example: PortfolioItemType.LINK })
  @IsEnum(PortfolioItemType)
  type: PortfolioItemType;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/reel.mp4' })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}
