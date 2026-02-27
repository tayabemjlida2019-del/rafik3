import {
    Controller,
    Get,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // Dashboard
    @Get('dashboard/stats')
    @ApiOperation({ summary: 'إحصائيات لوحة التحكم' })
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }

    // Providers
    @Get('providers')
    @ApiOperation({ summary: 'قائمة مقدمي الخدمات' })
    async listProviders(
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.adminService.listProviders(status, page, limit);
    }

    @Patch('providers/:id/approve')
    @ApiOperation({ summary: 'قبول مؤسسة' })
    async approveProvider(
        @Param('id') id: string,
        @CurrentUser('userId') adminId: string,
    ) {
        return this.adminService.approveProvider(id, adminId);
    }

    @Patch('providers/:id/reject')
    @ApiOperation({ summary: 'رفض مؤسسة' })
    async rejectProvider(
        @Param('id') id: string,
        @CurrentUser('userId') adminId: string,
    ) {
        return this.adminService.rejectProvider(id, adminId);
    }

    @Patch('providers/:id/suspend')
    @ApiOperation({ summary: 'تعليق مؤسسة' })
    async suspendProvider(@Param('id') id: string) {
        return this.adminService.suspendProvider(id);
    }

    // Listings moderation
    @Get('listings/pending')
    @ApiOperation({ summary: 'خدمات بانتظار المراجعة' })
    async listPendingListings(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.adminService.listPendingListings(page, limit);
    }

    @Patch('listings/:id/approve')
    @ApiOperation({ summary: 'قبول خدمة' })
    async approveListing(@Param('id') id: string) {
        return this.adminService.approveListing(id);
    }

    @Patch('listings/:id/reject')
    @ApiOperation({ summary: 'رفض خدمة' })
    async rejectListing(
        @Param('id') id: string,
        @Body('reason') reason: string,
    ) {
        return this.adminService.rejectListing(id, reason);
    }

    // Disputes
    @Get('disputes')
    @ApiOperation({ summary: 'قائمة النزاعات' })
    async listDisputes(
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.adminService.listDisputes(status, page, limit);
    }

    @Patch('disputes/:id/resolve')
    @ApiOperation({ summary: 'حل نزاع' })
    async resolveDispute(
        @Param('id') id: string,
        @CurrentUser('userId') adminId: string,
        @Body() data: { resolution: 'user' | 'provider'; note: string; refundAmount?: number },
    ) {
        return this.adminService.resolveDispute(id, adminId, data);
    }

    // Finance
    @Get('finance/revenue')
    @ApiOperation({ summary: 'تقرير الإيرادات' })
    async getRevenueReport(
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.adminService.getRevenueReport(from, to);
    }

    @Get('finance/payouts/pending')
    @ApiOperation({ summary: 'المستحقات بانتظار الدفع' })
    async getPendingPayouts() {
        return this.adminService.getPendingPayouts();
    }

    @Patch('finance/payouts/:transactionId/complete')
    @ApiOperation({ summary: 'تأكيد دفع المستحقات للمزود' })
    async completePayout(
        @Param('transactionId') transactionId: string,
        @CurrentUser('userId') adminId: string,
        @Body('reference') reference: string,
    ) {
        return this.adminService.markPayoutAsCompleted(transactionId, adminId, reference);
    }
}
