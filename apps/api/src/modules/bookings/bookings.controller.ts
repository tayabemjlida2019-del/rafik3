import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, CancelBookingDto, ListBookingsDto } from './dto/bookings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Post()
    @ApiOperation({ summary: 'إنشاء حجز جديد' })
    async create(
        @CurrentUser('userId') userId: string,
        @Body() dto: CreateBookingDto,
    ) {
        return this.bookingsService.create(userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'قائمة حجوزاتي (مستخدم)' })
    async listMyBookings(
        @CurrentUser('userId') userId: string,
        @Query() dto: ListBookingsDto,
    ) {
        return this.bookingsService.listUserBookings(userId, dto);
    }

    @Get('provider')
    @UseGuards(RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiOperation({ summary: 'الحجوزات الواردة (مزود)' })
    async listProviderBookings(
        @CurrentUser('userId') userId: string,
        @Query() dto: ListBookingsDto,
    ) {
        return this.bookingsService.listProviderBookings(userId, dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'تفاصيل حجز' })
    async findOne(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
    ) {
        return this.bookingsService.findOne(id, userId);
    }

    @Patch(':id/confirm')
    @UseGuards(RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiOperation({ summary: 'تأكيد حجز (مزود)' })
    async confirm(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
    ) {
        return this.bookingsService.confirm(id, userId);
    }

    @Patch(':id/reject')
    @UseGuards(RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiOperation({ summary: 'رفض حجز (مزود)' })
    async reject(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
    ) {
        return this.bookingsService.reject(id, userId);
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'إلغاء حجز (مستخدم)' })
    async cancel(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: CancelBookingDto,
    ) {
        return this.bookingsService.cancel(id, userId, dto);
    }

    @Patch(':id/complete')
    @UseGuards(RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiOperation({ summary: 'إتمام الخدمة (مزود)' })
    async complete(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
    ) {
        return this.bookingsService.complete(id, userId);
    }
}
