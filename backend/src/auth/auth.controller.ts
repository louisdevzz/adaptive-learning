import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.createUser(createUserDto);

    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Return accessToken in body so the frontend can set the cookie on its own
    // domain (needed for cross-domain deployments, e.g. Vercel)
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { sessionId, ...response } =
      await this.authService.login(loginDto, this.buildRequestContext(req));

    res.cookie('access_token', response.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    if (sessionId) {
      res.cookie('session_id', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });
    }

    // Return accessToken in body so the frontend can set the cookie on its own
    // domain (needed for cross-domain deployments, e.g. Vercel)
    return response;
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async loginWithGoogle(
    @Body('idToken') idToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { sessionId, ...response } =
      await this.authService.loginWithGoogle(
        idToken,
        this.buildRequestContext(req),
      );

    res.cookie('access_token', response.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    if (sessionId) {
      res.cookie('session_id', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });
    }

    // Return accessToken in body so the frontend can set the cookie on its own
    // domain (needed for cross-domain deployments, e.g. Vercel)
    return response;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: ICurrentUser) {
    return this.authService.getProfile(user.userId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: ICurrentUser,
  ) {
    await this.authService.logout({
      sessionId: (req as Request & { cookies?: Record<string, string> })
        .cookies?.session_id,
      userId: user.userId,
      userRole: user.role,
      requestContext: this.buildRequestContext(req),
    });

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    res.clearCookie('session_id', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }

  private buildRequestContext(req: Request) {
    const forwardedFor = req.headers['x-forwarded-for'];
    const resolvedForwardedFor = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor;
    const ipAddress =
      resolvedForwardedFor?.split(',')[0]?.trim() || req.ip || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    const requestId = req.get('x-request-id') || '';

    return {
      ipAddress,
      userAgent,
      requestId,
      source: 'web_app',
    };
  }
}
