import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddPortfolioItemDto } from './dto/add-portfolio-item.dto';
import { RateUserDto } from './dto/rate-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.userModel.findById(id).exec();
  }

  async updateGoogleId(
    userId: string,
    googleId: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { googleId }, { new: true })
      .exec();
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateProfileDto, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getPublicProfile(userId: string): Promise<UserDocument> {
    const user = await this.findById(userId);

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async addPortfolioItem(
    userId: string,
    portfolioItemDto: AddPortfolioItemDto,
  ): Promise<UserDocument> {
    if (portfolioItemDto.type === 'link' && !portfolioItemDto.url) {
      throw new BadRequestException('URL is required for link portfolio items');
    }

    if (portfolioItemDto.type === 'upload' && !portfolioItemDto.fileUrl) {
      throw new BadRequestException(
        'File URL is required for upload portfolio items',
      );
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $push: { portfolio: portfolioItemDto } },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async removePortfolioItem(
    userId: string,
    itemId: string,
  ): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(itemId)) {
      throw new NotFoundException('Portfolio item not found');
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { portfolio: { _id: new Types.ObjectId(itemId) } } },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async rateUser(
    targetUserId: string,
    fromUserId: string,
    rateUserDto: RateUserDto,
  ): Promise<UserDocument> {
    if (targetUserId === fromUserId) {
      throw new BadRequestException('You cannot rate yourself');
    }

    const user = await this.findById(targetUserId);

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    const fromUserObjectId = new Types.ObjectId(fromUserId);
    const existingRatingIndex = user.ratings.findIndex((entry) =>
      entry.fromUser.equals(fromUserObjectId),
    );

    const ratingEntry = {
      fromUser: fromUserObjectId,
      rating: rateUserDto.rating,
      review: rateUserDto.review,
      createdAt: new Date(),
    };

    if (existingRatingIndex >= 0) {
      user.ratings[existingRatingIndex] = ratingEntry;
    } else {
      user.ratings.push(ratingEntry);
    }

    user.averageRating = this.calculateAverageRating(user.ratings);
    await user.save();

    return user;
  }

  async searchUsers(searchUsersDto: SearchUsersDto): Promise<UserDocument[]> {
    const filter: Record<string, unknown> = { isActive: true };

    if (searchUsersDto.role) {
      filter.roles = searchUsersDto.role;
    }

    if (searchUsersDto.genre) {
      filter.genreTags = searchUsersDto.genre;
    }

    if (searchUsersDto.city) {
      filter['location.city'] = searchUsersDto.city;
    }

    if (searchUsersDto.region) {
      filter['location.region'] = searchUsersDto.region;
    }

    if (searchUsersDto.country) {
      filter['location.country'] = searchUsersDto.country;
    }

    return this.userModel.find(filter).exec();
  }

  sanitizeUser(user: UserDocument, options: { includePrivate?: boolean } = {}) {
    const userObject = user.toObject() as unknown as Record<string, unknown>;

    delete userObject.password;

    if (!options.includePrivate) {
      delete userObject.email;
      delete userObject.googleId;
      delete userObject.isActive;
    }

    return userObject;
  }

  private calculateAverageRating(
    ratings: UserDocument['ratings'],
  ): number {
    if (ratings.length === 0) {
      return 0;
    }

    const total = ratings.reduce((sum, entry) => sum + entry.rating, 0);
    return Math.round((total / ratings.length) * 10) / 10;
  }
}
