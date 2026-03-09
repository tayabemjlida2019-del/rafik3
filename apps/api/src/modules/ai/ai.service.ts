import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecommendationQueryDto, ChatDto } from './dto/ai.dto';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Algorithmic recommendation based on scoring system
     */
    async getRecommendations(query: RecommendationQueryDto) {
        this.logger.log(`Generating recommendations for query: ${JSON.stringify(query)}`);

        // 1. Fetch relevant places, listings, and hotels
        const [places, listings, hotels] = await Promise.all([
            this.prisma.place.findMany({
                where: query.wilaya ? { wilaya: query.wilaya } : {},
                include: { images: true, hotels: true },
            }),
            this.prisma.listing.findMany({
                where: {
                    status: 'ACTIVE',
                    wilaya: query.wilaya || undefined,
                },
                include: { images: true },
            }),
            this.prisma.hotel.findMany({
                where: query.budget ? { price: { lte: query.budget } } : {},
            }),
        ]);

        // 2. Score
        const scoredPlaces = places.map((place: any) => ({
            ...place,
            score: this.calculatePlaceScore(place, query),
            resultType: 'PLACE' as const,
        }));

        const scoredListings = listings.map((listing: any) => ({
            ...listing,
            score: this.calculateListingScore(listing, query),
            resultType: 'LISTING' as const,
        }));

        const scoredHotels = hotels.map((hotel: any) => ({
            ...hotel,
            score: this.calculateHotelScore(hotel, query),
            resultType: 'HOTEL' as const,
        }));

        // 3. Combine and Sort
        const allResults = [...scoredPlaces, ...scoredListings, ...scoredHotels]
            .sort((a, b) => b.score - a.score);

        return allResults.slice(0, 15);
    }

    private calculatePlaceScore(place: any, query: RecommendationQueryDto): number {
        let score = 50;
        if (query.categories && query.categories.length > 0) {
            const matches = place.categories.filter((c: string) => query.categories?.includes(c)).length;
            score += matches * 15;
        }
        if (place.isUnesco) score += 20;
        return score;
    }

    private calculateListingScore(listing: any, query: RecommendationQueryDto): number {
        let score = 40;
        score += (listing.avgRating || 0) * 10;
        if (listing.isFeatured) score += 15;
        if (query.budget && listing.basePrice <= query.budget) score += 20;
        return score;
    }

    private calculateHotelScore(hotel: any, query: RecommendationQueryDto): number {
        let score = 45;
        score += (hotel.rating || 0) * 10;
        if (query.budget && hotel.price <= query.budget) score += 25;
        if (hotel.placeId) score += 10; // Bonus for being linked to a tourist place
        return score;
    }

    /**
     * AI Chat — returns text + structured suggestions
     */
    async chat(body: ChatDto) {
        this.logger.log(`User chat message: ${body.message}`);

        const suggestions = await this.getRecommendations({
            wilaya: body.message.includes('بجاية') ? 'بجاية' : undefined,
        });

        const placeCount = suggestions.filter((s) => s.resultType === 'PLACE').length;
        const hotelCount = suggestions.filter((s) => s.resultType === 'HOTEL').length;

        const responseText = `أهلاً بك في رفيق! 🌍
بناءً على طلبك، وجدت لك ${placeCount} مواقع سياحية و ${hotelCount} فنادق مقترحة.
يمكنك استعراضها أدناه أو إضافتها لمسارك السياحي.`;

        return {
            text: responseText,
            suggestions,
        };
    }
}
