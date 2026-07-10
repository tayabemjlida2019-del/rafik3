import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import {
    CreateListingDto,
    UpdateListingDto,
    SearchListingsDto,
    BulkAvailabilityDto,
} from './dto/listings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
    constructor(private readonly listingsService: ListingsService) { }

    // ---------------------------
    // Public endpoints
    // ---------------------------

    @Get()
    @ApiOperation({ summary: 'البحث عن الخدمات مع فلاتر' })
    async search(@Query() dto: SearchListingsDto) {
        return this.listingsService.search(dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'تفاصيل خدمة' })
    async findOne(@Param('id') id: string) {
        return this.listingsService.findOne(id);
    }

    @Get(':id/availability')
    @ApiOperation({ summary: 'التحقق من توفر الخدمة' })
    @ApiQuery({ name: 'from', required: true, example: '2024-03-01' })
    @ApiQuery({ name: 'to', required: true, example: '2024-03-10' })
    async getAvailability(
        @Param('id') id: string,
        @Query('from') from: string,
        @Query('to') to: string,
    ) {
        return this.listingsService.getAvailability(id, from, to);
    }

    // ---------------------------
    // Provider endpoints
    // ---------------------------

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'إنشاء خدمة جديدة (مزود فقط)' })
    async create(
        @CurrentUser('userId') userId: string,
        @Body() dto: CreateListingDto,
    ) {
        // We need to get provider ID from user ID
        const { PrismaService } = require('../../prisma/prisma.service');
        // Actually, we should inject PrismaService & look up provider
        // For now, the service handles it via providerId which we derive
        return this.listingsService.create(userId, dto);
    }

    @Get('provider/my-listings')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'قائمة خدماتي (مزود)' })
    async myListings(@CurrentUser('userId') userId: string) {
        return this.listingsService.findByProvider(userId);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'تحديث خدمة (المالك فقط)' })
    async update(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: UpdateListingDto,
    ) {
        return this.listingsService.update(id, userId, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PROVIDER, Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'حذف خدمة (المالك أو المدير)' })
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        return this.listingsService.remove(id, user.userId, user.role === Role.ADMIN);
    }

    @Post(':id/availability')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'تحديث توفر الخدمة (مزود)' })
    async setAvailability(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: BulkAvailabilityDto,
    ) {
        return this.listingsService.setAvailability(id, userId, dto);
    }
}
