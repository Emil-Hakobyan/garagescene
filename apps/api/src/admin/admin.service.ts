import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from '../chat/schemas/conversation.schema';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { ReportsService } from '../reports/reports.service';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    private readonly reportsService: ReportsService,
  ) {}

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel
        .find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async banUser(userId: string): Promise<UserDocument> {
    return this.setUserActiveStatus(userId, false);
  }

  async unbanUser(userId: string): Promise<UserDocument> {
    return this.setUserActiveStatus(userId, true);
  }

  async getAllProjects(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.projectModel
        .find()
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async deleteProject(projectId: string): Promise<void> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.projectModel.findByIdAndDelete(projectId).exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  getAllReports(page = 1, limit = 20) {
    return this.reportsService.findAll(page, limit);
  }

  resolveReport(reportId: string) {
    return this.reportsService.resolveReport(reportId);
  }

  async getStats() {
    const [totalUsers, totalProjects, totalConversations] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.projectModel.countDocuments().exec(),
      this.conversationModel.countDocuments().exec(),
    ]);

    return {
      totalUsers,
      totalProjects,
      totalConversations,
    };
  }

  private async setUserActiveStatus(
    userId: string,
    isActive: boolean,
  ): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('User not found');
    }

    const user = await this.userModel
      .findByIdAndUpdate(userId, { isActive }, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
