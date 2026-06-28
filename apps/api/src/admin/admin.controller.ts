import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../reports/dto/create-report.dto';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiOkResponse({ description: 'Users returned successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  getAllUsers(@Query() paginationDto: PaginationDto) {
    return this.adminService.getAllUsers(
      paginationDto.page,
      paginationDto.limit,
    );
  }

  @Put('users/:id/ban')
  @ApiOperation({ summary: 'Ban a user' })
  @ApiOkResponse({ description: 'User banned successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @Put('users/:id/unban')
  @ApiOperation({ summary: 'Unban a user' })
  @ApiOkResponse({ description: 'User unbanned successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @Get('projects')
  @ApiOperation({ summary: 'Get all projects with pagination' })
  @ApiOkResponse({ description: 'Projects returned successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  getAllProjects(@Query() paginationDto: PaginationDto) {
    return this.adminService.getAllProjects(
      paginationDto.page,
      paginationDto.limit,
    );
  }

  @Delete('projects/:id')
  @ApiOperation({ summary: 'Delete any project' })
  @ApiOkResponse({ description: 'Project deleted successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  async deleteProject(@Param('id') id: string) {
    await this.adminService.deleteProject(id);
    return { message: 'Project deleted successfully' };
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all reports' })
  @ApiOkResponse({ description: 'Reports returned successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  getAllReports(@Query() paginationDto: PaginationDto) {
    return this.adminService.getAllReports(
      paginationDto.page,
      paginationDto.limit,
    );
  }

  @Put('reports/:id/resolve')
  @ApiOperation({ summary: 'Mark a report as resolved' })
  @ApiOkResponse({ description: 'Report resolved successfully' })
  @ApiNotFoundResponse({ description: 'Report not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  resolveReport(@Param('id') id: string) {
    return this.adminService.resolveReport(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics' })
  @ApiOkResponse({
    description: 'Platform stats returned successfully',
    schema: {
      example: {
        totalUsers: 120,
        totalProjects: 45,
        totalConversations: 78,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  getStats() {
    return this.adminService.getStats();
  }
}
