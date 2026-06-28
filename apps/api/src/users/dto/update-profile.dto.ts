import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreativeRole, GenreTag } from '../schemas/user.schema';
import { LocationDto } from './location.dto';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Indie filmmaker focused on raw storytelling.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ type: LocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiPropertyOptional({
    enum: CreativeRole,
    isArray: true,
    example: [CreativeRole.DIRECTOR, CreativeRole.SCREENWRITER],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(CreativeRole, { each: true })
  roles?: CreativeRole[];

  @ApiPropertyOptional({ example: 'Stunt coordinator' })
  @IsOptional()
  @IsString()
  customRole?: string;

  @ApiPropertyOptional({
    enum: GenreTag,
    isArray: true,
    example: [GenreTag.DRAMA, GenreTag.THRILLER],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(GenreTag, { each: true })
  genreTags?: GenreTag[];
}
