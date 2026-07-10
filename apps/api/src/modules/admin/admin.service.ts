import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KycStatus, ListingStatus, DisputeStatus, BookingStatus, PayoutStatus } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    // ---------------------------
    // Dashboard Stats
    // ---------------------------
    async getDashboardStats() {
        const [
            totalUsers,
            totalProviders,
            totalListings,
            activeListings,
            totalBookings,
            pendingKyc,
            openDisputes,
            revenue,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.provider.count(),
            this.prisma.listing.count(),
            this.prisma.listing.count({ where: { status: ListingStatus.ACTIVE } }),
            this.prisma.booking.count(),
            this.prisma.provider.count({ where: { kycStatus: KycStatus.PENDING } }),
            this.prisma.dispute.count({ where: { status: DisputeStatus.OPEN } }),
            this.prisma.transaction.aggregate({
                where: { status: 'CAPTURED' },
                _sum: { amount: true },
            }),
        ]);

        return {
            totalUsers,
            totalProviders,
            totalListings,
            activeListings,
            totalBookings,
            pendingKyc,
            openDisputes,
            totalRevenue: revenue._sum.amount || 0,
            currency: 'DZD',
        };
    }

    // ---------------------------
    // Provider Management
    // ---------------------------
    async listProviders(status?: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = status ? { kycStatus: status as KycStatus } : {};

        const [providers, total] = await Promise.all([
            this.prisma.provider.findMany({
                where,
                include: {
                    user: { select: { email: true, fullName: true, phone: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.provider.count({ where }),
        ]);

        return {
            data: providers,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async approveProvider(providerId: string, adminId: string) {
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId },
        });
        if (!provider) throw new NotFoundException('المؤسسة غير موجودة');

        return this.prisma.provider.update({
            where: { id: providerId },
            data: {
                kycStatus: KycStatus.VERIFIED,
                kycReviewedAt: new Date(),
                kycReviewedBy: adminId,
            },
        });
    }

    async rejectProvider(providerId: string, adminId: string) {
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId },
        });
        if (!provider) throw new NotFoundException('المؤسسة غير موجودة');

        return this.prisma.provider.update({
            where: { id: providerId },
            data: {
                kycStatus: KycStatus.REJECTED,
                kycReviewedAt: new Date(),
                kycReviewedBy: adminId,
            },
        });
    }

    async suspendProvider(providerId: string) {
        return this.prisma.provider.update({
            where: { id: providerId },
            data: { isActive: false },
        });
    }

    // ---------------------------
    // Listings Moderation
    // ---------------------------
    async listPendingListings(page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [listings, total] = await Promise.all([
            this.prisma.listing.findMany({
                where: { status: ListingStatus.PENDING_REVIEW },
                include: {
                    provider: {
                        include: {
                            user: { select: { fullName: true, email: true } },
                        },
                    },
                    images: true,
                },
                orderBy: { createdAt: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.listing.count({
                where: { status: ListingStatus.PENDING_REVIEW },
            }),
        ]);

        return {
            data: listings,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async approveListing(listingId: string) {
        return this.prisma.listing.update({
            where: { id: listingId },
            data: { status: ListingStatus.ACTIVE },
        });
    }

    async rejectListing(listingId: string, reason: string) {
        return this.prisma.listing.update({
            where: { id: listingId },
            data: {
                status: ListingStatus.REJECTED,
                rejectionReason: reason,
            },
        });
    }

    // ---------------------------
    // Disputes
    // ---------------------------
    async listDisputes(status?: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = status ? { status: status as DisputeStatus } : {};

        const [disputes, total] = await Promise.all([
            this.prisma.dispute.findMany({
                where,
                include: {
                    booking: {
                        include: {
                            listing: { select: { title: true, type: true } },
                            user: { select: { fullName: true, email: true } },
                        },
                    },
                    opener: { select: { fullName: true, email: true } },
                    target: { select: { fullName: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.dispute.count({ where }),
        ]);

        return {
            data: disputes,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async resolveDispute(
        disputeId: string,
        adminId: string,
        data: { resolution: 'user' | 'provider'; note: string; refundAmount?: number },
    ) {
        const dispute = await this.prisma.dispute.findUnique({
            where: { id: disputeId },
            include: { booking: true },
        });

        if (!dispute) throw new NotFoundException('النزاع غير موجود');

        const newStatus =
            data.resolution === 'user'
                ? DisputeStatus.RESOLVED_USER
                : DisputeStatus.RESOLVED_PROVIDER;

        await this.prisma.$transaction(async (tx) => {
            await tx.dispute.update({
                where: { id: disputeId },
                data: {
                    status: newStatus,
                    resolvedBy: adminId,
                    resolutionNote: data.note,
                    refundAmount: data.refundAmount,
                },
            });

            // Update booking status
            const bookingStatus =
                data.resolution === 'user'
                    ? BookingStatus.RESOLVED_USER
                    : BookingStatus.RESOLVED_PROVIDER;

            await tx.booking.update({
                where: { id: dispute.bookingId },
                data: {
                    status: bookingStatus,
                    refundAmount: data.refundAmount,
                },
            });
        });

        return { message: 'تم حل النزاع بنجاح' };
    }

    // ---------------------------
    // Financial Reports
    // ---------------------------
    async getRevenueReport(from?: string, to?: string) {
        const where: any = {};
        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from);
            if (to) where.createdAt.lte = new Date(to);
        }

        const transactions = await this.prisma.transaction.findMany({
            where: { ...where, status: 'CAPTURED' },
            include: {
                booking: {
                    select: {
                        commission: true,
                        totalAmount: true,
                        listing: { select: { type: true } },
                    },
                },
            },
        });

        const totalRevenue = transactions.reduce(
            (sum, t) => sum + t.amount,
            0,
        );
        const totalCommissions = transactions.reduce(
            (sum, t) => sum + (t.booking?.commission || 0),
            0,
        );

        // Group by listing type
        const byType: Record<string, { count: number; revenue: number; commissions: number }> = {};
        for (const t of transactions) {
            const type = t.booking?.listing?.type || 'UNKNOWN';
            if (!byType[type]) byType[type] = { count: 0, revenue: 0, commissions: 0 };
            byType[type].count++;
            byType[type].revenue += t.amount;
            byType[type].commissions += t.booking?.commission || 0;
        }

        return {
            totalRevenue,
            totalCommissions,
            totalTransactions: transactions.length,
            byType,
            currency: 'DZD',
        };
    }

    // ---------------------------
    // Payout Managament
    // ---------------------------
    async getPendingPayouts() {
        return this.prisma.transaction.findMany({
            where: {
                payoutStatus: PayoutStatus.PENDING,
                status: 'CAPTURED', // Only pay out captured funds
                booking: {
                    status: { in: [BookingStatus.COMPLETED, BookingStatus.REVIEWED] }
                }
            },
            include: {
                booking: {
                    include: {
                        provider: {
                            include: {
                                user: { select: { fullName: true, email: true } }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    }

    async markPayoutAsCompleted(transactionId: string, adminId: string, reference: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
        });

        if (!transaction) throw new NotFoundException('المعاملة غير موجودة');

        return this.prisma.transaction.update({
            where: { id: transactionId },
            data: {
                payoutStatus: PayoutStatus.COMPLETED,
                payoutAt: new Date(),
                payoutReference: reference,
            },
        });
    }
}
