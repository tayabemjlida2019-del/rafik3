import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const logger = new Logger('Bootstrap');

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // ==========================================
    // SECURITY MIDDLEWARE
    // ==========================================

    // Helmet — Security headers (XSS, clickjacking, MIME sniffing, etc.)
    app.use(helmet());

    // Cookie parser — Required for HttpOnly cookie auth
    app.use(cookieParser());

    // Request size limits — Prevent payload DoS attacks
    app.use(json({ limit: '10kb' }));
    app.use(urlencoded({ extended: true, limit: '10kb' }));

    // ==========================================
    // CORS — Dynamic from environment
    // ==========================================
    const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3005');
    app.enableCors({
        origin: corsOrigins.split(',').map((o) => o.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        maxAge: 86400, // Preflight cache 24h
    });

    // ==========================================
    // VALIDATION — Secure pipe (NO enableImplicitConversion)
    // ==========================================
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            // enableImplicitConversion REMOVED — use explicit @Transform() decorators
        }),
    );

    // ==========================================
    // GLOBAL EXCEPTION FILTER — Hide stack traces in production
    // ==========================================
    app.useGlobalFilters(new HttpExceptionFilter());

    // ==========================================
    // SWAGGER — Protected: disabled in production
    // ==========================================
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    if (nodeEnv !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Al-Rafiq API')
            .setDescription('Al-Rafiq Super App Platform API')
            .setVersion('1.0')
            .addBearerAuth()
            .addCookieAuth('access_token')
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
        logger.log('📚 Swagger docs enabled at /api/docs');
    }

    // ==========================================
    // START
    // ==========================================
    const port = configService.get<number>('PORT', 3001);
    await app.listen(port);
    logger.log(`🚀 Al-Rafiq API running on http://localhost:${port} [${nodeEnv}]`);
}
bootstrap();
