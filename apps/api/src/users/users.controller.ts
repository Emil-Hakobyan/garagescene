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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddPortfolioItemDto } from './dto/add-portfolio-item.dto';
import { UserDocument } from './schemas/user.schema';
import { RateUserDto } from './dto/rate-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiOkResponse({ description: 'Current user profile returned successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getMe(@Request() req: { user: UserDocument }) {
    return this.usersService.sanitizeUser(req.user, { includePrivate: true });
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the current user profile' })
  @ApiOkResponse({ description: 'Profile updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  updateMe(
    @Request() req: { user: UserDocument },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService
      .updateProfile(req.user._id.toString(), updateProfileDto)
      .then((user) =>
        this.usersService.sanitizeUser(user, { includePrivate: true }),
      );
  }

  @Post('me/portfolio')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a portfolio item to the current user profile' })
  @ApiCreatedResponse({ description: 'Portfolio item added successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  addPortfolioItem(
    @Request() req: { user: UserDocument },
    @Body() addPortfolioItemDto: AddPortfolioItemDto,
  ) {
    return this.usersService
      .addPortfolioItem(req.user._id.toString(), addPortfolioItemDto)
      .then((user) =>
        this.usersService.sanitizeUser(user, { includePrivate: true }),
      );
  }

  @Delete('me/portfolio/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a portfolio item from the current user profile' })
  @ApiOkResponse({ description: 'Portfolio item deleted successfully' })
  @ApiNotFoundResponse({ description: 'Portfolio item not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  removePortfolioItem(
    @Request() req: { user: UserDocument },
    @Param('itemId') itemId: string,
  ) {
    return this.usersService
      .removePortfolioItem(req.user._id.toString(), itemId)
      .then((user) =>
        this.usersService.sanitizeUser(user, { includePrivate: true }),
      );
  }

  @Get()
  @ApiOperation({ summary: 'Search and filter users' })
  @ApiOkResponse({ description: 'List of matching user profiles' })
  searchUsers(@Query() searchUsersDto: SearchUsersDto) {
    return this.usersService
      .searchUsers(searchUsersDto)
      .then((users) =>
        users.map((user) => this.usersService.sanitizeUser(user)),
      );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a public user profile by ID' })
  @ApiOkResponse({ description: 'Public user profile returned successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  getPublicProfile(@Param('id') id: string) {
    return this.usersService
      .getPublicProfile(id)
      .then((user) => this.usersService.sanitizeUser(user));
  }

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rate a user after collaboration' })
  @ApiOkResponse({ description: 'User rated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid rating request' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  rateUser(
    @Param('id') id: string,
    @Request() req: { user: UserDocument },
    @Body() rateUserDto: RateUserDto,
  ) {
    return this.usersService
      .rateUser(id, req.user._id.toString(), rateUserDto)
      .then((user) => this.usersService.sanitizeUser(user));
  }
}
