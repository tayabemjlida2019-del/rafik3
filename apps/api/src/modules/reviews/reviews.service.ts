import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async create(
        userId: string,
        bookingId: string,
        data: {
            rating: number;
            comment?: string;
            cleanliness?: number;
            communication?: number;
            value?: number;
            locationRating?: number;
        },
    ) {
        // Validate booking
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { review: true, listing: true },
        });

        if (!booking) throw new NotFoundException('الحجز غير موجود');
        if (booking.userId !== userId) throw new ForbiddenException('ليس لديك صلاحية');
        if (booking.status !== BookingStatus.COMPLETED) {
            throw new BadRequestException('لا يمكن تقييم حجز غير مكتمل');
        }
        if (booking.review) {
            throw new BadRequestException('تم تقييم هذا الحجز مسبقاً');
        }

        const review = await this.prisma.$transaction(async (tx) => {
            const newReview = await tx.review.create({
                data: {
                    bookingId,
                    userId,
                    listingId: booking.listingId,
                    providerId: booking.providerId,
                    rating: data.rating,
                    comment: data.comment,
                    cleanliness: data.cleanliness,
                    communication: data.communication,
                    value: data.value,
                    locationRating: data.locationRating,
                },
            });

            // Update booking status
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: BookingStatus.REVIEWED },
            });

            // Update listing stats (denormalized)
            const listingReviews = await tx.review.findMany({
                where: { listingId: booking.listingId },
                select: { rating: true },
            });

            const avgRating =
                listingReviews.reduce((sum, r) => sum + r.rating, 0) /
                listingReviews.length;

            await tx.listing.update({
                where: { id: booking.listingId },
                data: {
                    avgRating: Math.round(avgRating * 100) / 100,
                    totalReviews: listingReviews.length,
                },
            });

            // Update provider stats
            const providerReviews = await tx.review.findMany({
                where: { providerId: booking.providerId },
                select: { rating: true },
            });

            const providerAvg =
                providerReviews.reduce((sum, r) => sum + r.rating, 0) /
                providerReviews.length;

            await tx.provider.update({
                where: { id: booking.providerId },
                data: {
                    avgRating: Math.round(providerAvg * 100) / 100,
                    totalReviews: providerReviews.length,
                },
            });

            return newReview;
        });

        return review;
    }

    async getListingReviews(listingId: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where: { listingId, isVisible: true },
                include: {
                    user: { select: { id: true, fullName: true, avatarUrl: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.review.count({ where: { listingId, isVisible: true } }),
        ]);

        return {
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async providerReply(reviewId: string, providerId: string, reply: string) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
            include: { provider: true },
        });

        if (!review) throw new NotFoundException('التقييم غير موجود');
        if (review.provider.userId !== providerId) {
            throw new ForbiddenException('ليس لديك صلاحية الرد على هذا التقييم');
        }

        return this.prisma.review.update({
            where: { id: reviewId },
            data: { providerReply: reply, repliedAt: new Date() },
        });
    }
}
