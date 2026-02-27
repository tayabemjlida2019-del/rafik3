import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateListingDto,
    UpdateListingDto,
    SearchListingsDto,
    SetAvailabilityDto,
    BulkAvailabilityDto,
} from './dto/listings.dto';
import { ListingType, ListingStatus, PriceUnit, Prisma } from '@prisma/client';

@Injectable()
export class ListingsService {
    constructor(private prisma: PrismaService) { }

    // ---------------------------
    // Create Listing
    // ---------------------------
    async create(userId: string, dto: CreateListingDto) {
        // Verify provider exists and is verified
        const provider = await this.prisma.provider.findUnique({
            where: { userId },
        });

        if (!provider) {
            throw new NotFoundException('الحساب المهني غير موجود');
        }

        const providerId = provider.id;

        const listing = await this.prisma.listing.create({
            data: {
                providerId,
                type: dto.type as ListingType,
                title: dto.title,
                description: dto.description,
                address: dto.address,
                city: dto.city,
                wilaya: dto.wilaya,
                latitude: dto.latitude,
                longitude: dto.longitude,
                basePrice: dto.basePrice,
                priceUnit: (dto.priceUnit as PriceUnit) || PriceUnit.PER_NIGHT,
                metadata: dto.metadata || {},
                status: ListingStatus.PENDING_REVIEW,
            },
            include: {
                images: true,
                provider: {
                    select: {
                        id: true,
                        businessName: true,
                        avgRating: true,
                        kycStatus: true,
                    },
                },
            },
        });

        return listing;
    }

    // ---------------------------
    // Search Listings (Public)
    // ---------------------------
    async search(dto: SearchListingsDto) {
        const page = dto.page || 1;
        const limit = dto.limit || 20;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.ListingWhereInput = {
            status: ListingStatus.ACTIVE,
        };

        if (dto.type) {
            where.type = dto.type as ListingType;
        }
        if (dto.city) {
            where.city = { contains: dto.city, mode: 'insensitive' };
        }
        if (dto.wilaya) {
            where.wilaya = { contains: dto.wilaya, mode: 'insensitive' };
        }
        if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
            where.basePrice = {};
            if (dto.minPrice !== undefined) where.basePrice.gte = dto.minPrice;
            if (dto.maxPrice !== undefined) where.basePrice.lte = dto.maxPrice;
        }
        if (dto.minRating !== undefined) {
            where.avgRating = { gte: dto.minRating };
        }

        // Build orderBy
        let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
        switch (dto.sortBy) {
            case 'price_asc':
                orderBy = { basePrice: 'asc' };
                break;
            case 'price_desc':
                orderBy = { basePrice: 'desc' };
                break;
            case 'rating_desc':
                orderBy = { avgRating: 'desc' };
                break;
            case 'newest':
                orderBy = { createdAt: 'desc' };
                break;
        }

        const [listings, total] = await Promise.all([
            this.prisma.listing.findMany({
                where,
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                    provider: {
                        select: {
                            id: true,
                            businessName: true,
                            avgRating: true,
                            kycStatus: true,
                            isFeatured: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.listing.count({ where }),
        ]);

        return {
            data: listings,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ---------------------------
    // Get Single Listing (Public)
    // ---------------------------
    async findOne(id: string) {
        const listing = await this.prisma.listing.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
                provider: {
                    select: {
                        id: true,
                        businessName: true,
                        description: true,
                        avgRating: true,
                        totalReviews: true,
                        kycStatus: true,
                        isFeatured: true,
                        city: true,
                        wilaya: true,
                    },
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!listing) {
            throw new NotFoundException('الخدمة غير موجودة');
        }

        return listing;
    }

    // ---------------------------
    // Update Listing (Owner only)
    // ---------------------------
    async update(id: string, userId: string, dto: UpdateListingDto) {
        const listing = await this.prisma.listing.findUnique({
            where: { id },
            include: { provider: true },
        });

        if (!listing) {
            throw new NotFoundException('الخدمة غير موجودة');
        }

        if (listing.provider.userId !== userId) {
            throw new ForbiddenException('لا يمكنك تعديل هذه الخدمة');
        }

        return this.prisma.listing.update({
            where: { id },
            data: {
                ...dto,
            },
            include: {
                images: true,
            },
        });
    }

    // ---------------------------
    // Delete Listing
    // ---------------------------
    async remove(id: string, userId: string, isAdmin: boolean) {
        const listing = await this.prisma.listing.findUnique({
            where: { id },
            include: { provider: true },
        });

        if (!listing) {
            throw new NotFoundException('الخدمة غير موجودة');
        }

        if (!isAdmin && listing.provider.userId !== userId) {
            throw new ForbiddenException('لا يمكنك حذف هذه الخدمة');
        }

        await this.prisma.listing.delete({ where: { id } });
        return { message: 'تم حذف الخدمة بنجاح' };
    }

    // ---------------------------
    // Get Provider's Listings
    // ---------------------------
    async findByProvider(userId: string) {
        const provider = await this.prisma.provider.findUnique({
            where: { userId },
        });

        if (!provider) {
            throw new NotFoundException('الحساب المهني غير موجود');
        }

        return this.prisma.listing.findMany({
            where: { providerId: provider.id },
            include: {
                images: {
                    where: { isPrimary: true },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ---------------------------
    // Availability
    // ---------------------------
    async getAvailability(listingId: string, from: string, to: string) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!listing) {
            throw new NotFoundException('الخدمة غير موجودة');
        }

        const availability = await this.prisma.availability.findMany({
            where: {
                listingId,
                date: {
                    gte: new Date(from),
                    lte: new Date(to),
                },
            },
            orderBy: { date: 'asc' },
        });

        return {
            listingId,
            basePrice: listing.basePrice,
            availability,
        };
    }

    async setAvailability(
        listingId: string,
        userId: string,
        dto: BulkAvailabilityDto,
    ) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            include: { provider: true },
        });

        if (!listing) {
            throw new NotFoundException('الخدمة غير موجودة');
        }

        if (listing.provider.userId !== userId) {
            throw new ForbiddenException('لا يمكنك تعديل توفر هذه الخدمة');
        }

        const results = await Promise.all(
            dto.dates.map((d) =>
                this.prisma.availability.upsert({
                    where: {
                        listingId_date: {
                            listingId,
                            date: new Date(d.date),
                        },
                    },
                    update: {
                        isAvailable: d.isAvailable,
                        priceOverride: d.priceOverride,
                    },
                    create: {
                        listingId,
                        date: new Date(d.date),
                        isAvailable: d.isAvailable,
                        priceOverride: d.priceOverride,
                    },
                }),
            ),
        );

        return results;
    }
}
