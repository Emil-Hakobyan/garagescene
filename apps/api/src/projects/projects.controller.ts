import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
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
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { SearchProjectsDto } from './dto/search-projects.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiCreatedResponse({ description: 'Project created successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(
    @Request() req: { user: UserDocument },
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectsService
      .create(req.user._id.toString(), createProjectDto)
      .then((project) =>
        this.projectsService.sanitizeProject(
          project,
          req.user._id.toString(),
        ),
      );
  }

  @Get()
  @ApiOperation({ summary: 'List and search projects' })
  @ApiOkResponse({ description: 'Projects returned successfully' })
  findAll(@Query() searchProjectsDto: SearchProjectsDto) {
    return this.projectsService
      .findAll(searchProjectsDto)
      .then((projects) =>
        projects.map((project) => this.projectsService.sanitizeProject(project)),
      );
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recommended projects for the current user' })
  @ApiOkResponse({ description: 'Recommended projects returned successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getRecommended(@Request() req: { user: UserDocument }) {
    return this.projectsService.getRecommendedProjects(req.user._id.toString());
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get a single project',
    description:
      'Returns project details. fullDocument is hidden unless the requester is the owner or in accessList.',
  })
  @ApiOkResponse({ description: 'Project returned successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user?: UserDocument | null },
  ) {
    return this.projectsService.findById(id, req.user?._id.toString());
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project' })
  @ApiOkResponse({ description: 'Project updated successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Request() req: { user: UserDocument },
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService
      .update(req.user._id.toString(), id, updateProjectDto)
      .then((project) =>
        this.projectsService.sanitizeProject(
          project,
          req.user._id.toString(),
        ),
      );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project' })
  @ApiOkResponse({ description: 'Project deleted successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async delete(
    @Param('id') id: string,
    @Request() req: { user: UserDocument },
  ) {
    await this.projectsService.delete(req.user._id.toString(), id);
    return { message: 'Project deleted successfully' };
  }

  @Post(':id/access/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Grant full document access to a user' })
  @ApiOkResponse({ description: 'Access granted successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Project or user not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  grantAccess(
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

  @Delete(':id/access/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke full document access from a user' })
  @ApiOkResponse({ description: 'Access revoked successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  revokeAccess(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: { user: UserDocument },
  ) {
    return this.projectsService
      .revokeAccess(req.user._id.toString(), id, userId)
      .then((project) =>
        this.projectsService.sanitizeProject(
          project,
          req.user._id.toString(),
        ),
      );
  }
}
