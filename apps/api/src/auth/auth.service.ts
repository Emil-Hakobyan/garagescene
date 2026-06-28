import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string) {
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
    });

    return this.buildAuthResponse(user);
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async validateGoogleUser(
    googleId: string,
    email: string,
    name: string,
  ): Promise<UserDocument> {
    let user = await this.usersService.findByGoogleId(googleId);

    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException('Account is inactive');
      }

      return user;
    }

    user = await this.usersService.findByEmail(email);

    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException('Account is inactive');
      }

      const linkedUser = await this.usersService.updateGoogleId(
        user._id.toString(),
        googleId,
      );

      if (!linkedUser) {
        throw new UnauthorizedException('Unable to link Google account');
      }

      return linkedUser;
    }

    return this.usersService.create({
      email,
      name,
      googleId,
    });
  }

  loginWithUser(user: UserDocument) {
    return this.buildAuthResponse(user);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.password || !user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  private buildAuthResponse(user: UserDocument) {
    const payload = { sub: user._id.toString(), email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
      user: this.sanitizeUser(user),
    };
  }

  sanitizeUser(user: UserDocument) {
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }
}
