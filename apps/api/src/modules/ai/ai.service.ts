import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecommendationQueryDto, ChatDto } from './dto/ai.dto';
import { ListingType } from '@prisma/client';

// ============================================
// Algerian Wilayas for NLP matching
// ============================================
const WILAYAS = [
    'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار',
    'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر',
    'الجلفة', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة',
    'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض',
    'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي',
    'خنشلة', 'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت',
    'غرداية', 'غليزان',
];

// ============================================
// Intent patterns for Arabic NLP
// ============================================
interface IntentPattern {
    intent: string;
    patterns: RegExp[];
    handler: string;
}

const INTENT_PATTERNS: IntentPattern[] = [
    {
        intent: 'greeting',
        patterns: [
            /^(مرحبا|سلام|أهلا|هلا|صباح|مساء|السلام عليكم|اهلا|مرحبًا|هاي|بونجور)/i,
        ],
        handler: 'handleGreeting',
    },
    {
        intent: 'hotel_search',
        patterns: [
            /(فندق|فنادق|حجز فندق|ابحث.*فندق|أريد فندق|وين.*فندق|نبي فندق|أبحث.*فندق|محتاج فندق)/i,
        ],
        handler: 'handleHotelSearch',
    },
    {
        intent: 'home_search',
        patterns: [
            /(منزل|شقة|كراء|إيجار|منازل|شقق|سكن|إقامة|بيت|دار|أبحث.*سكن|محتاج.*شقة)/i,
        ],
        handler: 'handleHomeSearch',
    },
    {
        intent: 'food_search',
        patterns: [
            /(أكل|طعام|مأكولات|مطعم|طبق|وجبة|أكلة|كسكس|شخشوخة|طاجين|محاجب|بوراك|رشتة|زلابية|مقروط|مسمن|شكشوكة)/i,
        ],
        handler: 'handleFoodSearch',
    },
    {
        intent: 'taxi_search',
        patterns: [
            /(تاكسي|سيارة|أجرة|سائق|نقل|توصيل|سيارات|تنقل)/i,
        ],
        handler: 'handleTaxiSearch',
    },
    {
        intent: 'booking_status',
        patterns: [
            /(حجز|حجوزات|حالة.*حجز|متى.*حجز|حجزي|موعدي|مواعيدي)/i,
        ],
        handler: 'handleBookingInfo',
    },
    {
        intent: 'price_query',
        patterns: [
            /(سعر|أسعار|ثمن|كم.*سعر|بكم|بشحال|تكلفة|ميزانية|رخيص|غالي)/i,
        ],
        handler: 'handlePriceQuery',
    },
    {
        intent: 'place_info',
        patterns: [
            /(مكان|أماكن|سياحة|سياحي|معالم|زيارة|وجهة|وجهات|أين.*أزور|وين.*نروح|أجمل.*مكان|أحسن.*مكان)/i,
        ],
        handler: 'handlePlaceInfo',
    },
    {
        intent: 'help',
        patterns: [
            /(مساعدة|ساعدني|كيف|شنو.*تقدر|واش.*تعرف|ماذا.*تفعل|خدمات|ما هي)/i,
        ],
        handler: 'handleHelp',
    },
    {
        intent: 'thanks',
        patterns: [
            /(شكر|بارك|ممنون|يعطيك|الله يسلمك|merci|thank)/i,
        ],
        handler: 'handleThanks',
    },
];

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);

    constructor(private prisma: PrismaService) { }

    // ============================================
    // RECOMMENDATION ENGINE
    // ============================================
    async getRecommendations(query: RecommendationQueryDto) {
        this.logger.log(`Generating recommendations for: ${JSON.stringify(query)}`);

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

        return [...scoredPlaces, ...scoredListings, ...scoredHotels]
            .sort((a, b) => b.score - a.score)
            .slice(0, 15);
    }

    private calculatePlaceScore(place: any, query: RecommendationQueryDto): number {
        let score = 50;
        if (query.categories && query.categories.length > 0) {
            const matches = place.categories?.filter((c: string) => query.categories?.includes(c)).length || 0;
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
        if (hotel.placeId) score += 10;
        return score;
    }

    // ============================================
    // AI CHATBOT ENGINE
    // ============================================
    async chat(body: ChatDto) {
        this.logger.log(`Chat message: ${body.message}`);

        const message = body.message.trim();
        const detectedWilaya = this.detectWilaya(message);
        const detectedIntent = this.detectIntent(message);

        this.logger.log(`Intent: ${detectedIntent?.intent || 'unknown'}, Wilaya: ${detectedWilaya || 'none'}`);

        // Dispatch to the right handler
        switch (detectedIntent?.handler) {
            case 'handleGreeting':
                return this.handleGreeting();
            case 'handleHotelSearch':
                return this.handleHotelSearch(message, detectedWilaya);
            case 'handleHomeSearch':
                return this.handleHomeSearch(message, detectedWilaya);
            case 'handleFoodSearch':
                return this.handleFoodSearch(message);
            case 'handleTaxiSearch':
                return this.handleTaxiSearch();
            case 'handleBookingInfo':
                return this.handleBookingInfo();
            case 'handlePriceQuery':
                return this.handlePriceQuery(message, detectedWilaya);
            case 'handlePlaceInfo':
                return this.handlePlaceInfo(detectedWilaya);
            case 'handleHelp':
                return this.handleHelp();
            case 'handleThanks':
                return this.handleThanks();
            default:
                return this.handleUnknown(message, detectedWilaya);
        }
    }

    // --- NLP Helpers ---
    private detectWilaya(message: string): string | null {
        for (const w of WILAYAS) {
            if (message.includes(w)) return w;
        }
        // Common aliases
        const aliases: Record<string, string> = {
            'القصبة': 'الجزائر',
            'العاصمة': 'الجزائر',
            'الجزاير': 'الجزائر',
            'دزاير': 'الجزائر',
        };
        for (const [alias, wilaya] of Object.entries(aliases)) {
            if (message.includes(alias)) return wilaya;
        }
        return null;
    }

    private detectIntent(message: string): IntentPattern | null {
        for (const intent of INTENT_PATTERNS) {
            for (const pattern of intent.patterns) {
                if (pattern.test(message)) return intent;
            }
        }
        return null;
    }

    private extractBudget(message: string): number | null {
        const match = message.match(/(\d{3,6})/);
        return match ? parseInt(match[1]) : null;
    }

    // --- Intent Handlers ---
    private handleGreeting() {
        const greetings = [
            'أهلاً وسهلاً بك في منصة الرفيق! 🌟 كيف يمكنني مساعدتك اليوم؟',
            'مرحباً بك! 👋 أنا المساعد الذكي لمنصة الرفيق. هل تبحث عن فندق، منزل للكراء، مأكولات، أو تاكسي؟',
            'السلام عليكم! 🌙 أنا هنا لمساعدتك في اكتشاف أجمل ما في الجزائر. بماذا أبدأ؟',
        ];
        return {
            text: greetings[Math.floor(Math.random() * greetings.length)],
            suggestions: [],
            quickReplies: ['🏨 أبحث عن فندق', '🏠 أريد شقة للكراء', '🍲 أريد طعام', '🚕 أحتاج تاكسي'],
        };
    }

    private async handleHotelSearch(message: string, wilaya: string | null) {
        const budget = this.extractBudget(message);

        const listings = await this.prisma.listing.findMany({
            where: {
                status: 'ACTIVE',
                type: 'HOTEL',
                ...(wilaya && { wilaya }),
                ...(budget && { basePrice: { lte: budget } }),
            },
            include: { images: true },
            orderBy: { avgRating: 'desc' },
            take: 5,
        });

        if (listings.length === 0) {
            return {
                text: wilaya
                    ? `للأسف لم أجد فنادق متاحة في ${wilaya} حالياً. 😔 هل تريد البحث في ولاية أخرى؟`
                    : 'أخبرني في أي ولاية تريد الفندق وسأبحث لك! 📍 مثال: "أريد فندق في وهران"',
                suggestions: [],
                quickReplies: ['فندق في وهران', 'فندق في قسنطينة', 'فندق في بجاية', 'فندق في الجزائر'],
            };
        }

        const listText = listings.map((l: any, i: number) =>
            `${i + 1}. **${l.title}** — ${l.city} — ${(l.basePrice ?? 0).toLocaleString()} دج/ليلة ⭐ ${l.avgRating || 'جديد'}`
        ).join('\n');

        return {
            text: `وجدت لك ${listings.length} فنادق ${wilaya ? `في ${wilaya}` : ''} 🏨:\n\n${listText}\n\nهل تريد تفاصيل أكثر عن أحدها؟`,
            suggestions: listings.map((l: any) => ({
                id: l.id,
                title: l.title,
                price: l.basePrice,
                rating: l.avgRating,
                image: l.images?.[0]?.thumbnailUrl || l.images?.[0]?.url,
                type: 'HOTEL',
                link: `/hotels/${l.id}`,
            })),
            quickReplies: ['أرخص فندق', 'أفضل تقييم', 'ابحث في ولاية أخرى'],
        };
    }

    private async handleHomeSearch(message: string, wilaya: string | null) {
        const budget = this.extractBudget(message);

        const listings = await this.prisma.listing.findMany({
            where: {
                status: 'ACTIVE',
                type: 'HOME',
                ...(wilaya && { wilaya }),
                ...(budget && { basePrice: { lte: budget } }),
            },
            include: { images: true },
            orderBy: { avgRating: 'desc' },
            take: 5,
        });

        if (listings.length === 0) {
            return {
                text: wilaya
                    ? `لم أجد شقق أو منازل متاحة في ${wilaya} حالياً. هل تريد البحث في مكان آخر؟`
                    : 'أخبرني في أي مدينة تريد شقة وسأبحث لك! 🏠 مثال: "شقة في تيزي وزو"',
                suggestions: [],
                quickReplies: ['شقة في الجزائر', 'منزل في بجاية', 'فيلا في تيبازة'],
            };
        }

        const listText = listings.map((l: any, i: number) =>
            `${i + 1}. **${l.title}** — ${l.city} — ${(l.basePrice ?? 0).toLocaleString()} دج/ليلة`
        ).join('\n');

        return {
            text: `إليك ${listings.length} إقامات متاحة 🏠:\n\n${listText}`,
            suggestions: listings.map((l: any) => ({
                id: l.id,
                title: l.title,
                price: l.basePrice,
                rating: l.avgRating,
                image: l.images?.[0]?.thumbnailUrl || l.images?.[0]?.url,
                type: 'HOME',
                link: `/homes/${l.id}`,
            })),
            quickReplies: ['أرخص شقة', 'شقة مع مسبح', 'ابحث في مكان آخر'],
        };
    }

    private async handleFoodSearch(message: string) {
        const categories = await this.prisma.category.findMany({
            include: { items: true },
            take: 5,
        });

        const dishes = [
            { name: 'كسكسي', desc: 'الطبق الوطني الجزائري التقليدي', emoji: '🥘' },
            { name: 'شخشوخة', desc: 'طبق تقليدي من الشرق الجزائري', emoji: '🍲' },
            { name: 'طاجين الحلو', desc: 'حلوى تقليدية في المناسبات', emoji: '🍯' },
            { name: 'محاجب', desc: 'فطائر جزائرية محشية', emoji: '🫓' },
            { name: 'بوراك', desc: 'لفائف مقلية بالعجين الرقيق', emoji: '🌯' },
            { name: 'رشتة', desc: 'مكرونة تقليدية بمرق الدجاج', emoji: '🍝' },
        ];

        const listText = dishes.map(d => `${d.emoji} **${d.name}** — ${d.desc}`).join('\n');

        return {
            text: `🍲 أشهر الأطباق الجزائرية التقليدية:\n\n${listText}\n\nيمكنك طلب أي طبق من صفحة المأكولات!`,
            suggestions: categories.map((c: any) => ({
                id: c.id,
                title: c.name,
                type: 'FOOD_CATEGORY',
                link: '/food',
            })),
            quickReplies: ['🍲 اطلب طعام الآن', '📋 قائمة المطاعم', '🏠 رجوع للقائمة'],
        };
    }

    private handleTaxiSearch() {
        return {
            text: `🚕 خدمة سيارات الأجرة متاحة!\n\nيمكنك حجز تاكسي بسهولة:\n• اختر نقطة الانطلاق و الوصول\n• حدد الموعد\n• احجز بضغطة واحدة\n\nانتقل لصفحة التاكسي للبدء!`,
            suggestions: [],
            quickReplies: ['🚕 احجز تاكسي الآن', '💰 أسعار التاكسي', '🏠 القائمة الرئيسية'],
            actions: [{ type: 'navigate', label: 'صفحة التاكسي', url: '/taxi' }],
        };
    }

    private handleBookingInfo() {
        return {
            text: `📋 لمتابعة حجوزاتك:\n\n1. قم بتسجيل الدخول لحسابك\n2. انتقل إلى "حجوزاتي" في لوحة التحكم\n3. ستجد كل حجوزاتك مع حالتها\n\nهل تريد تسجيل الدخول الآن؟`,
            suggestions: [],
            quickReplies: ['🔐 تسجيل الدخول', '📝 إنشاء حساب', '🏠 القائمة الرئيسية'],
            actions: [
                { type: 'navigate', label: 'تسجيل الدخول', url: '/login' },
                { type: 'navigate', label: 'حجوزاتي', url: '/bookings' },
            ],
        };
    }

    private async handlePriceQuery(message: string, wilaya: string | null) {
        const listings = await this.prisma.listing.findMany({
            where: {
                status: 'ACTIVE',
                ...(wilaya && { wilaya }),
            },
            orderBy: { basePrice: 'asc' },
            take: 5,
        });

        if (listings.length === 0) {
            return {
                text: 'لم أجد إقامات حالياً. جرب تحديد ولاية معينة. 📍',
                suggestions: [],
                quickReplies: ['أسعار وهران', 'أسعار الجزائر', 'أسعار بجاية'],
            };
        }

        const cheapest = listings[0] as any;
        const avgPrice = Math.round(listings.reduce((sum: number, l: any) => sum + (l.basePrice || 0), 0) / listings.length);

        return {
            text: `💰 معلومات الأسعار${wilaya ? ` في ${wilaya}` : ''}:\n\n• أرخص إقامة: **${(cheapest.basePrice ?? 0).toLocaleString()} دج/ليلة** (${cheapest.title})\n• متوسط الأسعار: **${avgPrice.toLocaleString()} دج/ليلة**\n• عدد الخيارات المتاحة: **${listings.length}** إقامة`,
            suggestions: listings.map((l: any) => ({
                id: l.id,
                title: l.title,
                price: l.basePrice,
                type: l.type,
                link: `/${l.type === 'HOTEL' ? 'hotels' : 'homes'}/${l.id}`,
            })),
            quickReplies: ['🏨 أرخص فندق', '🏠 أرخص شقة', '⭐ الأفضل تقييماً'],
        };
    }

    private async handlePlaceInfo(wilaya: string | null) {
        const places = await this.prisma.place.findMany({
            where: wilaya ? { wilaya } : {},
            include: { images: true },
            take: 5,
        });

        if (places.length === 0) {
            return {
                text: wilaya
                    ? `لم أجد أماكن سياحية مسجلة في ${wilaya} حالياً. لكن الجزائر مليئة بالكنوز! 🇩🇿`
                    : '🗺️ الجزائر غنية بالمعالم السياحية! أخبرني أي ولاية تهمك وسأرشدك.',
                suggestions: [],
                quickReplies: ['معالم تيمقاد', 'معالم جيجل', 'معالم غرداية', 'معالم قسنطينة'],
            };
        }

        const listText = places.map((p: any, i: number) =>
            `${i + 1}. 📍 **${p.nameAr}** — ${p.wilaya}${p.isUnesco ? ' 🏛️ تراث عالمي' : ''}`
        ).join('\n');

        return {
            text: `🗺️ أماكن سياحية ${wilaya ? `في ${wilaya}` : 'مقترحة'}:\n\n${listText}\n\nهل تريد حجز إقامة بالقرب من أحد هذه الأماكن؟`,
            suggestions: places.map((p: any) => ({
                id: p.id,
                title: p.nameAr,
                wilaya: p.wilaya,
                isUnesco: p.isUnesco,
                image: p.images?.[0]?.url,
                type: 'PLACE',
            })),
            quickReplies: ['🏨 فندق قريب', '🏠 شقة قريبة', '🗺️ أماكن أخرى'],
        };
    }

    private handleHelp() {
        return {
            text: `🌟 **مرحباً بك في مساعد الرفيق الذكي!**\n\nأستطيع مساعدتك في:\n\n🏨 **حجز الفنادق** — ابحث عن أفضل الفنادق\n🏠 **كراء المنازل** — شقق وفيلات مفروشة\n🍲 **المأكولات** — أطباق جزائرية تقليدية\n🚕 **سيارات الأجرة** — تنقل سهل وآمن\n📍 **الأماكن السياحية** — اكتشف الجزائر\n💰 **الأسعار** — مقارنة الأسعار\n\nجرب أن تسألني مثلاً:\n• "أريد فندق في وهران"\n• "شقة رخيصة في الجزائر"\n• "أماكن سياحية في بجاية"`,
            suggestions: [],
            quickReplies: ['🏨 فنادق', '🏠 منازل', '🍲 مأكولات', '🚕 تاكسي', '📍 أماكن سياحية'],
        };
    }

    private handleThanks() {
        const responses = [
            'عفواً! 😊 هل تحتاج شيئاً آخر؟',
            'على الرحب والسعة! 🌟 أنا هنا دائماً لمساعدتك.',
            'بارك الله فيك! لا تتردد في السؤال مجدداً. 🤝',
        ];
        return {
            text: responses[Math.floor(Math.random() * responses.length)],
            suggestions: [],
            quickReplies: ['🏨 أبحث عن فندق', '📍 أماكن سياحية', '🏠 القائمة الرئيسية'],
        };
    }

    private async handleUnknown(message: string, wilaya: string | null) {
        // If we detected a wilaya even without a clear intent, give general info
        if (wilaya) {
            return this.handlePlaceInfo(wilaya);
        }

        // Fallback: try recommendation engine
        const suggestions = await this.getRecommendations({});

        return {
            text: `🤔 لم أفهم طلبك تماماً. لكن يمكنني مساعدتك في:\n\n🏨 حجز فنادق — "أريد فندق في وهران"\n🏠 كراء شقق — "شقة في الجزائر"\n🍲 طلب طعام — "أريد أكل تقليدي"\n🚕 حجز تاكسي — "أحتاج تاكسي"\n📍 أماكن سياحية — "معالم بجاية"\n\nجرب إعادة صياغة سؤالك! 😊`,
            suggestions: suggestions.slice(0, 3),
            quickReplies: ['🏨 فنادق', '🏠 منازل', '🍲 مأكولات', '❓ مساعدة'],
        };
    }
}
