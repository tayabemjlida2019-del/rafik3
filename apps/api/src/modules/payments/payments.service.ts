import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, PayoutStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) { }

    // ---------------------------
    // Upload CCP Receipt
    // ---------------------------
    async uploadReceipt(bookingId: string, userId: string, receiptUrl: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { transaction: true },
        });

        if (!booking) throw new NotFoundException('الحجز غير موجود');
        if (booking.userId !== userId) throw new BadRequestException('ليس لديك صلاحية');

        if (!booking.transaction) {
            throw new BadRequestException('لا توجد معاملة مرتبطة بهذا الحجز');
        }

        return this.prisma.transaction.update({
            where: { id: booking.transaction.id },
            data: {
                receiptUrl,
                status: PaymentStatus.VERIFICATION_REQUIRED,
            },
        });
    }

    // ---------------------------
    // Verify Payment (Admin)
    // ---------------------------
    async verifyPayment(transactionId: string, adminId: string, approved: boolean) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { booking: true },
        });

        if (!transaction) throw new NotFoundException('المعاملة غير موجودة');

        if (approved) {
            await this.prisma.$transaction(async (tx) => {
                await tx.transaction.update({
                    where: { id: transactionId },
                    data: {
                        status: PaymentStatus.CAPTURED,
                        verifiedBy: adminId,
                        verifiedAt: new Date(),
                    },
                });

                await tx.booking.update({
                    where: { id: transaction.bookingId },
                    data: { status: 'ESCROW_HELD' },
                });
            });
        } else {
            await this.prisma.transaction.update({
                where: { id: transactionId },
                data: {
                    status: PaymentStatus.FAILED,
                    failureReason: 'إيصال الدفع مرفوض من الإدارة',
                },
            });
        }

        return { message: approved ? 'تم تأكيد الدفع' : 'تم رفض الدفع' };
    }

    // ---------------------------
    // Mark Payout as Completed (Admin)
    // ---------------------------
    async markPayoutAsCompleted(transactionId: string, adminId: string, reference: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { booking: true },
        });

        if (!transaction) throw new NotFoundException('المعاملة غير موجودة');
        if (transaction.payoutStatus === PayoutStatus.COMPLETED) {
            throw new BadRequestException('لقد تم دفع هذا المستحق بالفعل');
        }

        return this.prisma.transaction.update({
            where: { id: transactionId },
            data: {
                payoutStatus: PayoutStatus.COMPLETED,
                payoutAt: new Date(),
                payoutReference: reference,
            },
        });
    }

    // ---------------------------
    // Provider Balance
    // ---------------------------
    async getProviderBalance(userId: string) {
        const provider = await this.prisma.provider.findUnique({
            where: { userId },
        });

        if (!provider) throw new NotFoundException('حساب المزود غير موجود');
        const providerId = provider.id;

        // Completed bookings where payout is pending
        const pendingPayouts = await this.prisma.transaction.findMany({
            where: {
                booking: {
                    providerId,
                    status: { in: ['COMPLETED', 'REVIEWED'] },
                },
                payoutStatus: PayoutStatus.PENDING,
            },
        });

        const totalPending = pendingPayouts.reduce(
            (sum, t) => sum + (t.payoutAmount || 0),
            0,
        );

        // Already paid out
        const completedPayouts = await this.prisma.transaction.findMany({
            where: {
                booking: { providerId },
                payoutStatus: PayoutStatus.COMPLETED,
            },
        });

        const totalPaid = completedPayouts.reduce(
            (sum, t) => sum + (t.payoutAmount || 0),
            0,
        );

        return {
            pendingBalance: totalPending,
            totalPaid,
            currency: 'DZD',
            pendingPayoutsCount: pendingPayouts.length,
        };
    }

    // ---------------------------
    // Transaction History
    // ---------------------------
    async getTransactions(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where: {
                    booking: {
                        OR: [{ userId }, { provider: { userId } }],
                    },
                },
                include: {
                    booking: {
                        select: {
                            bookingRef: true,
                            listing: { select: { title: true, type: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.transaction.count({
                where: {
                    booking: {
                        OR: [{ userId }, { provider: { userId } }],
                    },
                },
            }),
        ]);

        return {
            data: transactions,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
}
