import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import {
    RegisterUserDto,
    RegisterProviderDto,
    LoginDto,
} from './dto/auth.dto';
import { Role, ListingType } from '@prisma/client';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    // ---------------------------
    // Register User
    // ---------------------------
    async registerUser(dto: RegisterUserDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('البريد الإلكتروني مسجل مسبقاً');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                fullName: dto.fullName,
                phone: dto.phone,
                passwordHash,
                role: Role.USER,
            },
        });

        this.logger.log(`New user registered: ${user.id}`);
        const tokens = await this.generateTokens(user.id, user.role);

        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }

    // ---------------------------
    // Register Provider
    // ---------------------------
    async registerProvider(dto: RegisterProviderDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('البريد الإلكتروني مسجل مسبقاً');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    fullName: dto.fullName,
                    phone: dto.phone,
                    passwordHash,
                    role: Role.PROVIDER,
                },
            });

            const provider = await tx.provider.create({
                data: {
                    userId: user.id,
                    businessName: dto.businessName,
                    businessType: dto.businessType as ListingType,
                    city: dto.city,
                    wilaya: dto.wilaya,
                    address: dto.address,
                    description: dto.description,
                },
            });

            return { user, provider };
        });

        this.logger.log(`New provider registered: ${result.user.id}`);
        const tokens = await this.generateTokens(
            result.user.id,
            result.user.role,
        );

        return {
            user: this.sanitizeUser(result.user),
            provider: result.provider,
            ...tokens,
        };
    }

    // ---------------------------
    // Login
    // ---------------------------
    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { provider: true },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('بيانات الدخول غير صحيحة');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('بيانات الدخول غير صحيحة');
        }

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        this.logger.log(`User logged in: ${user.id}`);
        const tokens = await this.generateTokens(user.id, user.role);

        return {
            user: this.sanitizeUser(user),
            provider: user.provider,
            ...tokens,
        };
    }

    // ---------------------------
    // Refresh Token — WITH ROTATION (Security-critical)
    // ---------------------------
    async refreshTokens(oldRefreshToken: string) {
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token: oldRefreshToken },
            include: { user: true },
        });

        if (!stored) {
            // Token doesn't exist — possible token reuse attack
            this.logger.warn(`Refresh token not found — possible reuse attack`);
            throw new UnauthorizedException('Refresh token غير صالح');
        }

        if (stored.expiresAt < new Date()) {
            // Expired — clean up and reject
            await this.prisma.refreshToken.delete({ where: { id: stored.id } });
            throw new UnauthorizedException('Refresh token منتهي الصلاحية');
        }

        // ROTATION: Delete the used token IMMEDIATELY (one-time use)
        await this.prisma.refreshToken.delete({ where: { id: stored.id } });

        // Generate new pair
        const tokens = await this.generateTokens(stored.user.id, stored.user.role);

        this.logger.log(`Tokens rotated for user: ${stored.user.id}`);
        return tokens;
    }

    // ---------------------------
    // Logout — Invalidate refresh token
    // ---------------------------
    async logout(refreshToken: string) {
        await this.prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
        return { message: 'تم تسجيل الخروج بنجاح' };
    }

    // ---------------------------
    // Logout from all devices
    // ---------------------------
    async logoutAll(userId: string) {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
        this.logger.log(`All sessions revoked for user: ${userId}`);
        return { message: 'تم تسجيل الخروج من جميع الأجهزة' };
    }

    // ---------------------------
    // Get Current User
    // ---------------------------
    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { provider: true },
        });

        if (!user) {
            throw new NotFoundException('المستخدم غير موجود');
        }

        return {
            user: this.sanitizeUser(user),
            provider: user.provider,
        };
    }

    // ---------------------------
    // Helper: Generate Tokens
    // ---------------------------
    private async generateTokens(userId: string, role: Role) {
        const payload = { sub: userId, role };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
            algorithm: 'HS256',
        });

        const refreshTokenValue = uuidv4();
        const refreshExpiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days

        // Clean up expired tokens for this user (housekeeping)
        await this.prisma.refreshToken.deleteMany({
            where: {
                userId,
                expiresAt: { lt: new Date() },
            },
        });

        await this.prisma.refreshToken.create({
            data: {
                userId,
                token: refreshTokenValue,
                expiresAt: new Date(Date.now() + refreshExpiresIn),
            },
        });

        return {
            accessToken,
            refreshToken: refreshTokenValue,
            expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
        };
    }

    // ---------------------------
    // Helper: Cookie options
    // ---------------------------
    getAccessTokenCookieOptions() {
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        return {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? ('strict' as const) : ('lax' as const),
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/',
        };
    }

    getRefreshTokenCookieOptions() {
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        return {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? ('strict' as const) : ('lax' as const),
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/api/v1/auth/refresh', // Only sent to refresh endpoint
        };
    }

    // ---------------------------
    // Helper: Remove sensitive fields
    // ---------------------------
    private sanitizeUser(user: any) {
        const { passwordHash, ...sanitized } = user;
        return sanitized;
    }
}
