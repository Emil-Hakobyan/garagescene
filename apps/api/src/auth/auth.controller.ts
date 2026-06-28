import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserDocument } from '../users/schemas/user.schema';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          _id: '664f1a2b3c4d5e6f7a8b9c0d',
          email: 'jane@example.com',
          name: 'Jane Doe',
          role: 'user',
          isActive: true,
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'Email already registered' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          _id: '664f1a2b3c4d5e6f7a8b9c0d',
          email: 'jane@example.com',
          name: 'Jane Doe',
          role: 'user',
          isActive: true,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Redirect to Google OAuth login' })
  @ApiFoundResponse({ description: 'Redirects to Google login page' })
  googleAuth() {
    // Handled by GoogleAuthGuard
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiOkResponse({
    description: 'Google login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          _id: '664f1a2b3c4d5e6f7a8b9c0d',
          email: 'jane@gmail.com',
          name: 'Jane Doe',
          googleId: '1234567890',
          role: 'user',
          isActive: true,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Google authentication failed' })
  googleAuthCallback(@Request() req: { user: UserDocument }) {
    return this.authService.loginWithUser(req.user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiOkResponse({
    description: 'Current user profile',
    schema: {
      example: {
        _id: '664f1a2b3c4d5e6f7a8b9c0d',
        email: 'jane@example.com',
        name: 'Jane Doe',
        role: 'user',
        isActive: true,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getProfile(@Request() req: { user: UserDocument }) {
    return this.authService.sanitizeUser(req.user);
  }
}
