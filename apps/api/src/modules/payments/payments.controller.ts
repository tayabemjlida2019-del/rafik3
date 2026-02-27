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
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post(':bookingId/receipt')
    @ApiOperation({ summary: 'رفع إيصال تحويل CCP' })
    async uploadReceipt(
        @Param('bookingId') bookingId: string,
        @CurrentUser('userId') userId: string,
        @Body('receiptUrl') receiptUrl: string,
    ) {
        return this.paymentsService.uploadReceipt(bookingId, userId, receiptUrl);
    }

    @Patch(':transactionId/verify')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'تأكيد أو رفض الدفع (مدير)' })
    async verifyPayment(
        @Param('transactionId') transactionId: string,
        @CurrentUser('userId') adminId: string,
        @Body('approved') approved: boolean,
    ) {
        return this.paymentsService.verifyPayment(transactionId, adminId, approved);
    }

    @Patch(':transactionId/payout')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'تأكيد إرسال مستحقات المزود (مدير)' })
    async markPayoutAsCompleted(
        @Param('transactionId') transactionId: string,
        @CurrentUser('userId') adminId: string,
        @Body('reference') reference: string,
    ) {
        return this.paymentsService.markPayoutAsCompleted(transactionId, adminId, reference);
    }

    @Get('provider/balance')
    @UseGuards(RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiOperation({ summary: 'رصيد المزود' })
    async getBalance(@CurrentUser('userId') userId: string) {
        return this.paymentsService.getProviderBalance(userId);
    }

    @Get('transactions')
    @ApiOperation({ summary: 'سجل المعاملات' })
    async getTransactions(
        @CurrentUser('userId') userId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.paymentsService.getTransactions(userId, page, limit);
    }
}
