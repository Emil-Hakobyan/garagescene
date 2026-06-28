import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  ProjectGenre,
  ProjectStage,
  RoleNeeded,
} from '../schemas/project.schema';

export class SearchProjectsDto {
  @ApiPropertyOptional({ enum: ProjectGenre, example: ProjectGenre.DRAMA })
  @IsOptional()
  @IsEnum(ProjectGenre)
  genre?: ProjectGenre;

  @ApiPropertyOptional({ enum: ProjectStage, example: ProjectStage.IDEA })
  @IsOptional()
  @IsEnum(ProjectStage)
  stage?: ProjectStage;

  @ApiPropertyOptional({ enum: RoleNeeded, example: RoleNeeded.ACTOR })
  @IsOptional()
  @IsEnum(RoleNeeded)
  roleNeeded?: RoleNeeded;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  city?: string;
}
