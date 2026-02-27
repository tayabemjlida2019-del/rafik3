import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'قائمة التنبيهات' })
    async findAll(@CurrentUser('userId') userId: string) {
        return this.notificationsService.findAll(userId);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'عدد التنبيهات غير المقروءة' })
    async getUnreadCount(@CurrentUser('userId') userId: string) {
        const count = await this.notificationsService.getUnreadCount(userId);
        return { count };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'تحديد التنبيه كمقروء' })
    async markAsRead(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
    ) {
        return this.notificationsService.markAsRead(id, userId);
    }
}
