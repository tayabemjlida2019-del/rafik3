import { PrismaClient, ListingType, ListingStatus, PriceUnit, KycStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Ensuring demo data for Al-Rafiq...');

    // 1. Ensure Provider exists
    const providerEmail = 'contact@el-djazair-food.dz';
    const hashedPassword = await bcrypt.hash('password123', 10);

    let providerUser = await prisma.user.findUnique({ where: { email: providerEmail } });

    if (!providerUser) {
        providerUser = await prisma.user.create({
            data: {
                email: providerEmail,
                fullName: 'منتجات الجزائر التقليدية',
                passwordHash: hashedPassword,
                role: Role.PROVIDER,
                emailVerified: true,
                isActive: true,
            }
        });
    }

    let provider = await prisma.provider.findUnique({ where: { userId: providerUser.id } });

    if (!provider) {
        provider = await prisma.provider.create({
            data: {
                userId: providerUser.id,
                businessName: 'مطعم القصبة العريق',
                businessType: ListingType.RESTAURANT,
                city: 'الجزائر العاصمة',
                wilaya: 'الجزائر',
                kycStatus: KycStatus.VERIFIED,
                description: 'أفضل الأطباق التقليدية الجزائرية في قلب العاصمة',
            }
        });
    }

    // 2. Ensure Restaurant Listing exists
    const restaurantListing = await prisma.listing.upsert({
        where: { id: 'demo-restaurant-1' },
        update: { status: ListingStatus.ACTIVE },
        create: {
            id: 'demo-restaurant-1',
            providerId: provider.id,
            type: ListingType.RESTAURANT,
            title: 'مطعم القصبة الفاخر',
            description: 'نقدم لكم أشهى المأكولات التقليدية الجزائرية: كسكس، شخشوخة، وطاجين الزيتون بلمسة عصرية.',
            city: 'الجزائر العاصمة',
            wilaya: 'الجزائر',
            basePrice: 1500,
            priceUnit: PriceUnit.PER_MEAL,
            status: ListingStatus.ACTIVE,
            isFeatured: true,
            metadata: {
                features: ['traditional', 'family_friendly', 'delivery'],
                category: 'TRADITIONAL'
            }
        }
    });

    // 3. Ensure Categories and Menu Items for the restaurant
    const category = await prisma.category.upsert({
        where: { id: 'demo-cat-1' },
        update: {},
        create: {
            id: 'demo-cat-1',
            listingId: restaurantListing.id,
            name: 'الأطباق الرئيسية',
            sortOrder: 1
        }
    });

    await prisma.menuItem.upsert({
        where: { id: 'demo-item-1' },
        update: {},
        create: {
            id: 'demo-item-1',
            categoryId: category.id,
            name: 'كسكس ملكي بالخضر ولحم الغنم',
            description: 'طبق الكسكس التقليدي مع أجود أنواع اللحم والخضر الطازجة',
            price: 1800,
            isAvailable: true
        }
    });

    await prisma.menuItem.upsert({
        where: { id: 'demo-item-2' },
        update: {},
        create: {
            id: 'demo-item-2',
            categoryId: category.id,
            name: 'طاجين الزيتون العاصمي',
            description: 'طاجين الزيتون بالدجاج على الطريقة العاصمية التقليدية',
            price: 1200,
            isAvailable: true
        }
    });

    // 4. Ensure Taxi Provider & Listing
    const taxiEmail = 'taxi@rafiq.dz';
    let taxiUser = await prisma.user.findUnique({ where: { email: taxiEmail } });

    if (!taxiUser) {
        taxiUser = await prisma.user.create({
            data: {
                email: taxiEmail,
                fullName: 'سائق الرفيق المعتمد',
                passwordHash: hashedPassword,
                role: Role.PROVIDER,
                emailVerified: true,
                isActive: true,
            }
        });
    }

    let taxiProvider = await prisma.provider.findUnique({ where: { userId: taxiUser.id } });

    if (!taxiProvider) {
        taxiProvider = await prisma.provider.create({
            data: {
                userId: taxiUser.id,
                businessName: 'رفيق للنقل الخاص',
                businessType: ListingType.TAXI,
                city: 'الجزائر العاصمة',
                wilaya: 'الجزائر',
                kycStatus: KycStatus.VERIFIED,
            }
        });
    }

    await prisma.listing.upsert({
        where: { id: 'demo-taxi-1' },
        update: { status: ListingStatus.ACTIVE },
        create: {
            id: 'demo-taxi-1',
            providerId: taxiProvider.id,
            type: ListingType.TAXI,
            title: 'سيارة أجرة رفاهية - مرسيدس 2024',
            description: 'سائق محترف، سيارة مريحة، تكييف، وخدمة VIP',
            city: 'الجزائر العاصمة',
            wilaya: 'الجزائر',
            basePrice: 50, // per km logic
            priceUnit: PriceUnit.PER_RIDE,
            status: ListingStatus.ACTIVE,
            metadata: {
                carModel: 'Mercedes S-Class 2024',
                features: ['ac', 'wifi', 'charger'],
                carType: 'LUXURY'
            }
        }
    });

    console.log('✅ Demo data ensured successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
