import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
    RegisterUserDto,
    RegisterProviderDto,
    LoginDto,
    RefreshTokenDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // ---------------------------
    // Register User
    // ---------------------------
    @Post('register/user')
    @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 registrations / minute
    @ApiOperation({ summary: 'تسجيل مستخدم جديد' })
    @ApiResponse({ status: 201, description: 'تم التسجيل بنجاح' })
    @ApiResponse({ status: 409, description: 'البريد الإلكتروني مسجل مسبقاً' })
    async registerUser(
        @Body() dto: RegisterUserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.registerUser(dto);
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return { user: result.user, expiresIn: result.expiresIn };
    }

    // ---------------------------
    // Register Provider
    // ---------------------------
    @Post('register/provider')
    @Throttle({ short: { limit: 5, ttl: 60000 } })
    @ApiOperation({ summary: 'تسجيل مؤسسة جديدة' })
    @ApiResponse({ status: 201, description: 'تم التسجيل بنجاح — بانتظار مراجعة الإدارة' })
    async registerProvider(
        @Body() dto: RegisterProviderDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.registerProvider(dto);
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return { user: result.user, provider: result.provider, expiresIn: result.expiresIn };
    }

    // ---------------------------
    // Login — Strict rate limiting
    // ---------------------------
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 attempts / minute max
    @ApiOperation({ summary: 'تسجيل الدخول' })
    @ApiResponse({ status: 200, description: 'تم تسجيل الدخول بنجاح' })
    @ApiResponse({ status: 401, description: 'بيانات الدخول غير صحيحة' })
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.login(dto);
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return {
            user: result.user,
            provider: result.provider,
            expiresIn: result.expiresIn,
        };
    }

    // ---------------------------
    // Refresh Token
    // ---------------------------
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @Throttle({ short: { limit: 10, ttl: 60000 } })
    @ApiOperation({ summary: 'تجديد الـ Access Token' })
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Body() dto: RefreshTokenDto,
    ) {
        // Try cookie first, then body
        const refreshToken = req.cookies?.['refresh_token'] || dto?.refreshToken;

        if (!refreshToken) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                message: 'Refresh token مطلوب',
            });
        }

        const tokens = await this.authService.refreshTokens(refreshToken);
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        return { expiresIn: tokens.expiresIn };
    }

    // ---------------------------
    // Logout
    // ---------------------------
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'تسجيل الخروج' })
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Body() dto: RefreshTokenDto,
    ) {
        const refreshToken = req.cookies?.['refresh_token'] || dto?.refreshToken;
        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }
        this.clearAuthCookies(res);
        return { message: 'تم تسجيل الخروج بنجاح' };
    }

    // ---------------------------
    // Logout from all devices
    // ---------------------------
    @Post('logout-all')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'تسجيل الخروج من جميع الأجهزة' })
    async logoutAll(
        @CurrentUser('userId') userId: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.logoutAll(userId);
        this.clearAuthCookies(res);
        return result;
    }

    // ---------------------------
    // Get Current User
    // ---------------------------
    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'بيانات المستخدم الحالي' })
    async getMe(@CurrentUser('userId') userId: string) {
        return this.authService.getMe(userId);
    }

    // ---------------------------
    // Cookie Helpers
    // ---------------------------
    private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
        res.cookie('access_token', accessToken, this.authService.getAccessTokenCookieOptions());
        res.cookie('refresh_token', refreshToken, this.authService.getRefreshTokenCookieOptions());
    }

    private clearAuthCookies(res: Response) {
        res.clearCookie('access_token', { path: '/' });
        res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
    }
}
