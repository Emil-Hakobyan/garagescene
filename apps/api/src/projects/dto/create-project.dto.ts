import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  MediaSnippetType,
  ProjectGenre,
  ProjectStage,
  RoleNeeded,
} from '../schemas/project.schema';

export class MediaSnippetDto {
  @ApiProperty({ example: 'https://vimeo.com/example' })
  @IsUrl()
  url: string;

  @ApiProperty({ enum: MediaSnippetType, example: MediaSnippetType.VIDEO })
  @IsEnum(MediaSnippetType)
  type: MediaSnippetType;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Neon Alley' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    example: 'A gritty noir set in a rain-soaked backlot city.',
    maxLength: 300,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  teaser: string;

  @ApiPropertyOptional({
    example: 'Full treatment and script outline hidden from public view.',
  })
  @IsOptional()
  @IsString()
  fullDocument?: string;

  @ApiProperty({ enum: ProjectGenre, example: ProjectGenre.THRILLER })
  @IsEnum(ProjectGenre)
  genre: ProjectGenre;

  @ApiProperty({ enum: ProjectStage, example: ProjectStage.IDEA })
  @IsEnum(ProjectStage)
  stage: ProjectStage;

  @ApiPropertyOptional({
    enum: RoleNeeded,
    isArray: true,
    example: [RoleNeeded.DIRECTOR, RoleNeeded.CINEMATOGRAPHER],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(RoleNeeded, { each: true })
  rolesNeeded?: RoleNeeded[];

  @ApiPropertyOptional({ example: 'Stunt coordinator' })
  @IsOptional()
  @IsString()
  customRoleNeeded?: string;

  @ApiPropertyOptional({ type: [MediaSnippetDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaSnippetDto)
  mediaSnippets?: MediaSnippetDto[];
}
