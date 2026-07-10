import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto, CancelBookingDto, ListBookingsDto } from './dto/bookings.dto';
import {
    BookingStatus,
    PaymentMethod,
    PaymentStatus,
    Prisma,
} from '@prisma/client';

// Commission rates per listing type
const COMMISSION_RATES: Record<string, number> = {
    HOME: 0.10,
    HOTEL: 0.12,
    RESTAURANT: 0.15,
    TAXI: 0.20,
};

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService {
    constructor(
        private prisma: PrismaService,
        private notifications: NotificationsService,
    ) { }

    // ---------------------------
    // Generate booking reference: RF-XXXX-XXXX
    // ---------------------------
    private generateBookingRef(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let ref = 'RF-';
        for (let i = 0; i < 4; i++) ref += chars[Math.floor(Math.random() * chars.length)];
        ref += '-';
        for (let i = 0; i < 4; i++) ref += chars[Math.floor(Math.random() * chars.length)];
        return ref;
    }

    // ---------------------------
    // Create Booking
    // ---------------------------
    async create(userId: string, dto: CreateBookingDto) {
        // 1. Get listing with provider
        const listing = await this.prisma.listing.findUnique({
            where: { id: dto.listingId },
            include: { provider: { include: { user: true } } },
        });

        if (!listing || listing.status !== 'ACTIVE') {
            throw new NotFoundException('الخدمة غير متاحة');
        }

        // 2. Prevent self-booking
        if (listing.provider.userId === userId) {
            throw new BadRequestException('لا يمكنك حجز خدمتك الخاصة');
        }

        // 3. Check availability for date range (Skip for RESTAURANT and TAXI)
        const checkIn = new Date(dto.checkIn);
        const checkOut = new Date(dto.checkOut);

        if (listing.type !== 'RESTAURANT' && listing.type !== 'TAXI') {
            if (checkIn >= checkOut) {
                throw new BadRequestException('تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول');
            }

            // Check for overlapping bookings
            const existingBooking = await this.prisma.booking.findFirst({
                where: {
                    listingId: dto.listingId,
                    status: {
                        in: ['PENDING', 'CONFIRMED', 'ESCROW_HELD'],
                    },
                    OR: [
                        {
                            checkIn: { lte: checkOut },
                            checkOut: { gte: checkIn },
                        },
                    ],
                },
            });

            if (existingBooking) {
                throw new BadRequestException('التواريخ المطلوبة غير متاحة');
            }
        }

        // 4. Check user doesn't have too many pending bookings
        const pendingCount = await this.prisma.booking.count({
            where: {
                userId,
                status: 'PENDING',
            },
        });

        if (pendingCount >= 3) {
            throw new BadRequestException('لديك 3 حجوزات معلقة بالفعل. يرجى إتمام أو إلغاء حجز قبل إنشاء حجز جديد');
        }

        // 5. Calculate pricing
        const nights = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
        );
        const subtotal = listing.basePrice * nights;
        const commissionRate = COMMISSION_RATES[listing.type] || 0.10;
        const commission = Math.round(subtotal * commissionRate * 100) / 100;
        const totalAmount = subtotal;
        const providerPayout = subtotal - commission;

        // 6. Create booking + transaction in one transaction
        const result = await this.prisma.$transaction(async (tx) => {
            const booking = await tx.booking.create({
                data: {
                    bookingRef: this.generateBookingRef(),
                    userId,
                    listingId: dto.listingId,
                    providerId: listing.providerId,
                    checkIn,
                    checkOut,
                    guests: dto.guests || 1,
                    specialRequests: dto.specialRequests,
                    subtotal,
                    commissionRate,
                    commission,
                    totalAmount,
                    providerPayout,
                    status: BookingStatus.PENDING,
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
                },
            });

            // Create associated transaction
            await tx.transaction.create({
                data: {
                    bookingId: booking.id,
                    amount: totalAmount,
                    paymentMethod: dto.paymentMethod as PaymentMethod,
                    status: PaymentStatus.PENDING,
                    payoutAmount: providerPayout,
                },
            });

            return booking;
        });

        // 7. Send notification to provider
        await this.notifications.create(
            listing.provider.userId,
            'حجز جديد',
            `لديك حجز جديد لـ ${listing.title} من ${listing.provider.user?.fullName || 'مستخدم'}`,
            'BOOKING_CREATED',
            { bookingId: result.id }
        );

        return {
            booking: result,
            pricing: {
                nights,
                pricePerNight: listing.basePrice,
                subtotal,
                commission,
                commissionRate: `${commissionRate * 100}%`,
                totalAmount,
                providerPayout,
                currency: 'DZD',
            },
        };
    }

    // ---------------------------
    // Confirm Booking (Provider)
    // ---------------------------
    async confirm(bookingId: string, providerId: string) {
        const booking = await this.getBookingForProvider(bookingId, providerId);

        if (booking.status !== BookingStatus.PENDING) {
            throw new BadRequestException('لا يمكن تأكيد هذا الحجز في حالته الحالية');
        }

        const updated = await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CONFIRMED,
                confirmedAt: new Date(),
            },
            include: {
                listing: true,
                user: { select: { id: true, fullName: true, email: true, phone: true } },
            },
        });

        // Send notification to user
        await this.notifications.create(
            updated.userId,
            'تم تأكيد حجزك',
            `لقد تم قبول حجزك لـ ${updated.listing.title}. رحلة سعيدة!`,
            'BOOKING_CONFIRMED',
            { bookingId }
        );

        return updated;
    }

    // ---------------------------
    // Reject Booking (Provider)
    // ---------------------------
    async reject(bookingId: string, providerId: string) {
        const booking = await this.getBookingForProvider(bookingId, providerId);

        if (booking.status !== BookingStatus.PENDING) {
            throw new BadRequestException('لا يمكن رفض هذا الحجز');
        }

        const updated = await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.REJECTED },
            include: { listing: true }
        });

        // Send notification to user
        await this.notifications.create(
            updated.userId,
            'تم رفض الحجز',
            `نعتذر، لم يتم قبول حجزك لـ ${updated.listing.title}.`,
            'BOOKING_REJECTED',
            { bookingId }
        );

        return updated;
    }

    // ---------------------------
    // Cancel Booking (User)
    // ---------------------------
    async cancel(bookingId: string, userId: string, dto: CancelBookingDto) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) throw new NotFoundException('الحجز غير موجود');
        if (booking.userId !== userId) throw new ForbiddenException('ليس لديك صلاحية');

        const cancellableStatuses: BookingStatus[] = [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.ESCROW_HELD,
        ];

        if (!cancellableStatuses.includes(booking.status)) {
            throw new BadRequestException('لا يمكن إلغاء هذا الحجز');
        }

        // Calculate refund based on cancellation policy
        let refundAmount = 0;
        if (booking.checkIn) {
            const hoursUntilCheckIn =
                (booking.checkIn.getTime() - Date.now()) / (1000 * 60 * 60);

            if (hoursUntilCheckIn > 48) {
                refundAmount = booking.totalAmount; // Full refund
            } else if (hoursUntilCheckIn > 24) {
                refundAmount = booking.totalAmount * 0.5; // 50% refund
            }
            // < 24h: no refund
        } else {
            refundAmount = booking.totalAmount;
        }

        return this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED_BY_USER,
                cancelledAt: new Date(),
                cancellationReason: dto.reason,
                refundAmount,
            },
        });
    }

    // ---------------------------
    // Complete Booking (Provider)
    // ---------------------------
    async complete(bookingId: string, providerId: string) {
        const booking = await this.getBookingForProvider(bookingId, providerId);

        if (
            booking.status !== BookingStatus.CONFIRMED &&
            booking.status !== BookingStatus.ESCROW_HELD
        ) {
            throw new BadRequestException('لا يمكن إتمام هذا الحجز');
        }

        return this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.COMPLETED,
                completedAt: new Date(),
            },
        });
    }

    // ---------------------------
    // List Bookings (User)
    // ---------------------------
    async listUserBookings(userId: string, dto: ListBookingsDto) {
        const page = dto.page || 1;
        const limit = dto.limit || 20;
        const skip = (page - 1) * limit;

        const where: Prisma.BookingWhereInput = { userId };
        if (dto.status) {
            where.status = dto.status as BookingStatus;
        }

        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                include: {
                    listing: {
                        include: {
                            images: { where: { isPrimary: true }, take: 1 },
                        },
                    },
                    transaction: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.booking.count({ where }),
        ]);

        return {
            data: bookings,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    // ---------------------------
    // List Bookings (Provider)
    // ---------------------------
    async listProviderBookings(userId: string, dto: ListBookingsDto) {
        const page = dto.page || 1;
        const limit = dto.limit || 20;
        const skip = (page - 1) * limit;

        const where: Prisma.BookingWhereInput = { provider: { userId } };
        if (dto.status) {
            where.status = dto.status as BookingStatus;
        }

        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                include: {
                    listing: true,
                    user: {
                        select: { id: true, fullName: true, phone: true, avatarUrl: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.booking.count({ where }),
        ]);

        return {
            data: bookings,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    // ---------------------------
    // Get Booking Details
    // ---------------------------
    async findOne(bookingId: string, userId: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                listing: {
                    include: { images: true, provider: { select: { businessName: true, city: true } } },
                },
                user: { select: { id: true, fullName: true, phone: true } },
                provider: true,
                transaction: true,
                review: true,
                dispute: true,
            },
        });

        if (!booking) throw new NotFoundException('الحجز غير موجود');

        // User can see their own bookings, provider can see bookings for their listings
        if (booking.userId !== userId && booking.provider?.userId !== userId) {
            throw new ForbiddenException('ليس لديك صلاحية');
        }

        return booking;
    }

    // ---------------------------
    // Helper
    // ---------------------------
    private async getBookingForProvider(bookingId: string, providerId: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { provider: true },
        });

        if (!booking) throw new NotFoundException('الحجز غير موجود');
        if (booking.provider.userId !== providerId) {
            throw new ForbiddenException('ليس لديك صلاحية لهذا الحجز');
        }

        return booking;
    }
}
