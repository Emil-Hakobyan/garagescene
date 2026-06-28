import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateReportDto } from './dto/create-report.dto';
import {
  Report,
  ReportDocument,
  ReportStatus,
  ReportTargetType,
} from './schemas/report.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async createReport(
    reporterId: string,
    createReportDto: CreateReportDto,
  ): Promise<ReportDocument> {
    if (!Types.ObjectId.isValid(createReportDto.targetId)) {
      throw new BadRequestException('Invalid target ID');
    }

    await this.validateTarget(
      createReportDto.targetType,
      createReportDto.targetId,
    );

    const report = new this.reportModel({
      reporter: new Types.ObjectId(reporterId),
      targetType: createReportDto.targetType,
      targetId: new Types.ObjectId(createReportDto.targetId),
      reason: createReportDto.reason,
      status: ReportStatus.PENDING,
    });

    return report.save();
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{
    data: ReportDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.reportModel
        .find()
        .populate('reporter', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reportModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async resolveReport(reportId: string): Promise<ReportDocument> {
    if (!Types.ObjectId.isValid(reportId)) {
      throw new NotFoundException('Report not found');
    }

    const report = await this.reportModel
      .findByIdAndUpdate(
        reportId,
        { status: ReportStatus.RESOLVED },
        { new: true },
      )
      .populate('reporter', 'name email')
      .exec();

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  private async validateTarget(
    targetType: ReportTargetType,
    targetId: string,
  ): Promise<void> {
    if (targetType === ReportTargetType.USER) {
      const user = await this.userModel.findById(targetId).exec();

      if (!user) {
        throw new NotFoundException('Reported user not found');
      }

      return;
    }

    const project = await this.projectModel.findById(targetId).exec();

    if (!project) {
      throw new NotFoundException('Reported project not found');
    }
  }
}
