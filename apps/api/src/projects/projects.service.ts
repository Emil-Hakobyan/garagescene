import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { SearchProjectsDto } from './dto/search-projects.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    ownerId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectDocument> {
    const project = new this.projectModel({
      ...createProjectDto,
      owner: new Types.ObjectId(ownerId),
      accessList: [new Types.ObjectId(ownerId)],
    });

    return project.save();
  }

  async findAll(searchProjectsDto: SearchProjectsDto): Promise<ProjectDocument[]> {
    const filter: Record<string, unknown> = { isActive: true };

    if (searchProjectsDto.genre) {
      filter.genre = searchProjectsDto.genre;
    }

    if (searchProjectsDto.stage) {
      filter.stage = searchProjectsDto.stage;
    }

    if (searchProjectsDto.roleNeeded) {
      filter.rolesNeeded = searchProjectsDto.roleNeeded;
    }

    if (searchProjectsDto.city) {
      const owners = await this.usersService.findOwnerIdsByCity(
        searchProjectsDto.city,
      );

      if (owners.length === 0) {
        return [];
      }

      filter.owner = { $in: owners };
    }

    return this.projectModel
      .find(filter)
      .populate('owner', 'name avatar location')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(
    projectId: string,
    requesterId?: string,
  ): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.projectModel
      .findById(projectId)
      .populate('owner', 'name avatar location')
      .exec();

    if (!project || !project.isActive) {
      throw new NotFoundException('Project not found');
    }

    return this.sanitizeProject(project, requesterId);
  }

  async update(
    ownerId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectDocument> {
    const project = await this.findOwnedProject(ownerId, projectId);

    Object.assign(project, updateProjectDto);
    await project.save();

    return project;
  }

  async delete(ownerId: string, projectId: string): Promise<void> {
    const project = await this.findOwnedProject(ownerId, projectId);
    await project.deleteOne();
  }

  async grantAccess(
    ownerId: string,
    projectId: string,
    userId: string,
  ): Promise<ProjectDocument> {
    await this.findOwnedProject(ownerId, projectId);

    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('User not found');
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedProject = await this.projectModel
      .findByIdAndUpdate(
        projectId,
        { $addToSet: { accessList: new Types.ObjectId(userId) } },
        { new: true },
      )
      .exec();

    if (!updatedProject) {
      throw new NotFoundException('Project not found');
    }

    return updatedProject;
  }

  async revokeAccess(
    ownerId: string,
    projectId: string,
    userId: string,
  ): Promise<ProjectDocument> {
    const project = await this.findOwnedProject(ownerId, projectId);

    if (project.owner.toString() === userId) {
      throw new ForbiddenException('Cannot revoke access from the project owner');
    }

    const updatedProject = await this.projectModel
      .findByIdAndUpdate(
        projectId,
        { $pull: { accessList: new Types.ObjectId(userId) } },
        { new: true },
      )
      .exec();

    if (!updatedProject) {
      throw new NotFoundException('Project not found');
    }

    return updatedProject;
  }

  async getRecommendedProjects(userId: string): Promise<Record<string, unknown>[]> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const filter: Record<string, unknown> = {
      isActive: true,
      owner: { $ne: new Types.ObjectId(userId) },
    };

    const matchConditions: Record<string, unknown>[] = [];

    if (user.genreTags?.length) {
      matchConditions.push({ genre: { $in: user.genreTags } });
    }

    if (user.roles?.length) {
      matchConditions.push({ rolesNeeded: { $in: user.roles } });
    }

    if (matchConditions.length > 0) {
      filter.$or = matchConditions;
    }

    const projects = await this.projectModel
      .find(filter)
      .populate('owner', 'name avatar location')
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();

    return projects.map((project) => this.sanitizeProject(project, userId));
  }

  sanitizeProject(
    project: ProjectDocument,
    requesterId?: string,
  ): Record<string, unknown> {
    const projectObject = project.toObject() as unknown as Record<string, unknown>;

    if (!this.hasFullDocumentAccess(project, requesterId)) {
      delete projectObject.fullDocument;
    }

    return projectObject;
  }

  private hasFullDocumentAccess(
    project: ProjectDocument,
    requesterId?: string,
  ): boolean {
    if (!requesterId) {
      return false;
    }

    const ownerId =
      project.owner instanceof Types.ObjectId
        ? project.owner.toString()
        : (project.owner as { _id: Types.ObjectId })._id.toString();

    if (ownerId === requesterId) {
      return true;
    }

    return project.accessList.some(
      (userId) => userId.toString() === requesterId,
    );
  }

  private async findOwnedProject(
    ownerId: string,
    projectId: string,
  ): Promise<ProjectDocument> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.projectModel.findById(projectId).exec();

    if (!project || !project.isActive) {
      throw new NotFoundException('Project not found');
    }

    if (project.owner.toString() !== ownerId) {
      throw new ForbiddenException('You do not own this project');
    }

    return project;
  }
}
