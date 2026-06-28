import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a report' })
  @ApiCreatedResponse({ description: 'Report submitted successfully' })
  @ApiNotFoundResponse({ description: 'Report target not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  createReport(
    @Request() req: { user: UserDocument },
    @Body() createReportDto: CreateReportDto,
  ) {
    return this.reportsService.createReport(
      req.user._id.toString(),
      createReportDto,
    );
  }
}
