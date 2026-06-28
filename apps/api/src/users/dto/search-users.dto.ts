import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreativeRole, GenreTag } from '../schemas/user.schema';

export class SearchUsersDto {
  @ApiPropertyOptional({ enum: CreativeRole, example: CreativeRole.DIRECTOR })
  @IsOptional()
  @IsEnum(CreativeRole)
  role?: CreativeRole;

  @ApiPropertyOptional({ enum: GenreTag, example: GenreTag.DRAMA })
  @IsOptional()
  @IsEnum(GenreTag)
  genre?: GenreTag;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'California' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  country?: string;
}
