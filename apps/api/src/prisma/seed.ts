import { PrismaClient, Role, ListingType, KycStatus, ListingStatus, PriceUnit } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // ---------------------------
    // 1. Create Admin
    // ---------------------------
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@rafiq.dz' },
        update: {},
        create: {
            email: 'admin@rafiq.dz',
            fullName: 'مدير المنصة',
            passwordHash: adminPassword,
            role: Role.ADMIN,
            phoneVerified: true,
            emailVerified: true,
        },
    });
    console.log('✅ Admin created:', admin.email);

    // ---------------------------
    // 2. Create Test User
    // ---------------------------
    const userPassword = await bcrypt.hash('User123!', 12);
    const testUser = await prisma.user.upsert({
        where: { email: 'ahmed@test.dz' },
        update: {},
        create: {
            email: 'ahmed@test.dz',
            fullName: 'أحمد بن محمد',
            phone: '0550123456',
            passwordHash: userPassword,
            role: Role.USER,
            phoneVerified: true,
            emailVerified: true,
        },
    });
    console.log('✅ Test user created:', testUser.email);

    // ---------------------------
    // 3. Create Test Providers
    // ---------------------------
    const providerPassword = await bcrypt.hash('Provider123!', 12);

    // Provider 1: Home rental in Oran
    const providerUser1 = await prisma.user.upsert({
        where: { email: 'karim@homes.dz' },
        update: {},
        create: {
            email: 'karim@homes.dz',
            fullName: 'كريم بوعلام',
            phone: '0661234567',
            passwordHash: providerPassword,
            role: Role.PROVIDER,
            phoneVerified: true,
            emailVerified: true,
        },
    });

    const provider1 = await prisma.provider.upsert({
        where: { userId: providerUser1.id },
        update: {},
        create: {
            userId: providerUser1.id,
            businessName: 'دار الضيافة - وهران',
            businessType: ListingType.HOME,
            city: 'وهران',
            wilaya: 'وهران',
            address: 'حي الأمير، شارع 5',
            description: 'نقدم شققاً مفروشة بالكامل في أحسن أحياء وهران',
            kycStatus: KycStatus.VERIFIED,
            ccpAccount: '00799999123456789',
            avgRating: 4.5,
            totalReviews: 12,
        },
    });

    // Provider 2: Homes in Algiers
    const providerUser2 = await prisma.user.upsert({
        where: { email: 'fatima@homes.dz' },
        update: {},
        create: {
            email: 'fatima@homes.dz',
            fullName: 'فاطمة الزهراء',
            phone: '0770987654',
            passwordHash: providerPassword,
            role: Role.PROVIDER,
            phoneVerified: true,
            emailVerified: true,
        },
    });

    const provider2 = await prisma.provider.upsert({
        where: { userId: providerUser2.id },
        update: {},
        create: {
            userId: providerUser2.id,
            businessName: 'شقق القصبة',
            businessType: ListingType.HOME,
            city: 'الجزائر العاصمة',
            wilaya: 'الجزائر',
            address: 'القصبة، الجزائر العاصمة',
            description: 'إقامة تقليدية في قلب القصبة التاريخية',
            kycStatus: KycStatus.VERIFIED,
            ccpAccount: '00799999987654321',
            avgRating: 4.8,
            totalReviews: 25,
        },
    });

    // Provider 3: Hotel in Algiers
    const providerUser3 = await prisma.user.upsert({
        where: { email: 'manager@hotel-alger.dz' },
        update: {},
        create: {
            email: 'manager@hotel-alger.dz',
            fullName: 'مدير فندق الجزائر',
            phone: '021000001',
            passwordHash: providerPassword,
            role: Role.PROVIDER,
            phoneVerified: true,
            emailVerified: true,
        },
    });

    const provider3 = await prisma.provider.upsert({
        where: { userId: providerUser3.id },
        update: {},
        create: {
            userId: providerUser3.id,
            businessName: 'فندق الجزائر جراند',
            businessType: ListingType.HOTEL,
            city: 'الجزائر العاصمة',
            wilaya: 'الجزائر',
            address: 'شارع فلسطين، الجزائر العاصمة',
            description: 'فندق 5 نجوم يقدم خدمات راقية في قلب العاصمة',
            kycStatus: KycStatus.VERIFIED,
            avgRating: 4.9,
            totalReviews: 120,
        },
    });

    // Provider 4: Hotel in Oran
    const providerUser4 = await prisma.user.upsert({
        where: { email: 'contact@royal-oran.dz' },
        update: {},
        create: {
            email: 'contact@royal-oran.dz',
            fullName: 'مسؤول مبيعات رويال وهران',
            phone: '041000001',
            passwordHash: providerPassword,
            role: Role.PROVIDER,
            phoneVerified: true,
            emailVerified: true,
        },
    });

    const provider4 = await prisma.provider.upsert({
        where: { userId: providerUser4.id },
        update: {},
        create: {
            userId: providerUser4.id,
            businessName: 'فندق رويال وهران',
            businessType: ListingType.HOTEL,
            city: 'وهران',
            wilaya: 'وهران',
            address: 'وسط مدينة وهران',
            description: 'فندق عصري مريح لرجال الأعمال والسياح',
            kycStatus: KycStatus.VERIFIED,
            avgRating: 4.5,
            totalReviews: 45,
        },
    });

    // Provider 5: Restaurant in Algiers
    const providerUser5 = await prisma.user.upsert({
        where: { email: 'contact@el-djazair-food.dz' },
        update: {},
        create: {
            email: 'contact@el-djazair-food.dz',
            fullName: 'سفيان الطيب',
            phone: '0555112233',
            passwordHash: providerPassword,
            role: Role.PROVIDER,
            phoneVerified: true,
            emailVerified: true,
        },
    });

    const provider5 = await prisma.provider.upsert({
        where: { userId: providerUser5.id },
        update: {},
        create: {
            userId: providerUser5.id,
            businessName: 'مطعم القصبة العتيق',
            businessType: ListingType.RESTAURANT,
            city: 'الجزائر العاصمة',
            wilaya: 'الجزائر',
            address: 'ساحة الشهداء، الجزائر العاصمة',
            description: 'أرقى المأكولات التقليدية العاصمية في جو أصيل',
            kycStatus: KycStatus.VERIFIED,
            avgRating: 4.8,
            totalReviews: 85,
        },
    });

    // Provider 6: Taxi Driver in Algiers
    const providerUser6 = await prisma.user.upsert({
        where: { email: 'taxi.alger@rafiq.dz' },
        update: {},
        create: {
            email: 'taxi.alger@rafiq.dz',
            fullName: 'محمد السائق',
            phone: '0777334455',
            passwordHash: providerPassword,
            role: Role.PROVIDER,
            phoneVerified: true,
            emailVerified: true,
        },
    });

    const provider6 = await prisma.provider.upsert({
        where: { userId: providerUser6.id },
        update: {},
        create: {
            userId: providerUser6.id,
            businessName: 'رفيق تاكسي - العاصمة',
            businessType: ListingType.TAXI,
            city: 'الجزائر العاصمة',
            wilaya: 'الجزائر',
            address: 'حي الموز، باب الزوار',
            description: 'خدمة توصيل سريعة وآمنة في كامل الجزائر العاصمة',
            kycStatus: KycStatus.VERIFIED,
            avgRating: 4.6,
            totalReviews: 150,
        },
    });

    console.log('✅ Providers created');

    // ---------------------------
    // 4. Create Listings
    // ---------------------------
    // Clear all related data first to avoid FK constraints
    console.log('🧹 Clearing existing data...');
    await prisma.dispute.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.listingImage.deleteMany({});
    await prisma.listing.deleteMany({});

    const listings = await Promise.all([
        // Oran listings
        prisma.listing.create({
            data: {
                providerId: provider1.id,
                type: ListingType.HOME,
                title: 'شقة مطلة على البحر في وهران',
                description: 'شقة مفروشة بالكامل، 3 غرف نوم، صالون واسع، مطبخ مجهز بالكامل. تطل مباشرة على البحر مع شرفة كبيرة. قريبة من وسط المدينة والمرافق.',
                address: 'الواجهة البحرية، وهران',
                city: 'وهران',
                wilaya: 'وهران',
                latitude: 35.6971,
                longitude: -0.6308,
                basePrice: 8000,
                priceUnit: PriceUnit.PER_NIGHT,
                metadata: {
                    rooms: 3,
                    bathrooms: 2,
                    area_m2: 120,
                    furnished: true,
                    features: ['wifi', 'parking', 'sea_view', 'air_conditioning', 'kitchen'],
                    maxGuests: 6,
                },
                status: ListingStatus.ACTIVE,
                avgRating: 4.7,
                totalReviews: 8,
            },
        }),
        // Oran listings
        prisma.listing.create({
            data: {
                providerId: provider1.id,
                type: ListingType.HOME,
                title: 'استوديو عصري وسط مدينة وهران',
                description: 'استوديو حديث ومجهز بالكامل في قلب وهران. مثالي للأزواج أو رجال الأعمال. قريب من المطاعم والمقاهي.',
                address: 'شارع العربي بن مهيدي، وهران',
                city: 'وهران',
                wilaya: 'وهران',
                latitude: 35.6911,
                longitude: -0.6417,
                basePrice: 4500,
                priceUnit: PriceUnit.PER_NIGHT,
                metadata: {
                    rooms: 1,
                    bathrooms: 1,
                    area_m2: 45,
                    furnished: true,
                    features: ['wifi', 'air_conditioning', 'kitchen', 'washing_machine'],
                    maxGuests: 2,
                },
                status: ListingStatus.ACTIVE,
                avgRating: 4.3,
                totalReviews: 5,
            },
        }),

        // Algiers listings
        prisma.listing.create({
            data: {
                providerId: provider2.id,
                type: ListingType.HOME,
                title: 'دار تقليدية في القصبة',
                description: 'بيت تقليدي جزائري أصيل في قلب القصبة التاريخية. تجربة فريدة للعيش في التراث الجزائري. الدار مجددة بالكامل مع الحفاظ على الطابع التقليدي.',
                address: 'القصبة، الجزائر العاصمة',
                city: 'الجزائر العاصمة',
                wilaya: 'الجزائر',
                latitude: 36.7866,
                longitude: 3.0600,
                basePrice: 12000,
                priceUnit: PriceUnit.PER_NIGHT,
                metadata: {
                    rooms: 4,
                    bathrooms: 2,
                    area_m2: 200,
                    furnished: true,
                    features: ['wifi', 'traditional_courtyard', 'terrace', 'kitchen', 'parking_nearby'],
                    maxGuests: 8,
                    style: 'traditional',
                },
                status: ListingStatus.ACTIVE,
                avgRating: 4.9,
                totalReviews: 15,
                isFeatured: true,
            },
        }),
        prisma.listing.create({
            data: {
                providerId: provider2.id,
                type: ListingType.HOME,
                title: 'شقة فاخرة في حيدرة',
                description: 'شقة راقية في حي حيدرة الراقي. 4 غرف نوم، صالون كبير، مطبخ أمريكي. إطلالة بانورامية على خليج الجزائر.',
                address: 'حيدرة، الجزائر العاصمة',
                city: 'الجزائر العاصمة',
                wilaya: 'الجزائر',
                latitude: 36.7650,
                longitude: 3.0200,
                basePrice: 15000,
                priceUnit: PriceUnit.PER_NIGHT,
                metadata: {
                    rooms: 4,
                    bathrooms: 3,
                    area_m2: 180,
                    furnished: true,
                    features: ['wifi', 'parking', 'bay_view', 'air_conditioning', 'pool', 'gym'],
                    maxGuests: 8,
                    style: 'luxury',
                },
                status: ListingStatus.ACTIVE,
                avgRating: 4.6,
                totalReviews: 10,
            },
        }),
        prisma.listing.create({
            data: {
                providerId: provider2.id,
                type: ListingType.HOME,
                title: 'شقة اقتصادية في باب الزوار',
                description: 'شقة نظيفة ومريحة بسعر مناسب. قريبة من المحطة المركزية والجامعة. مثالية للطلاب والمسافرين بميزانية محدودة.',
                address: 'باب الزوار، الجزائر العاصمة',
                city: 'الجزائر العاصمة',
                wilaya: 'الجزائر',
                latitude: 36.7200,
                longitude: 3.1100,
                basePrice: 3000,
                priceUnit: PriceUnit.PER_NIGHT,
                metadata: {
                    rooms: 2,
                    bathrooms: 1,
                    area_m2: 65,
                    furnished: true,
                    features: ['wifi', 'kitchen', 'washing_machine'],
                    maxGuests: 4,
                },
                status: ListingStatus.ACTIVE,
                avgRating: 4.0,
                totalReviews: 3,
            },
        }),

        // Hotel Algiers
        prisma.listing.create({
            data: {
                providerId: provider3.id,
                type: ListingType.HOTEL,
                title: 'غرفة ديلوكس مطلة على المدينة',
                description: 'غرفة فاخرة مجهزة بكل وسائل الراحة، إفطار مجاني، وصول للمسبح والنادي الصحي.',
                address: 'شارع فلسطين، الجزائر العاصمة',
                city: 'الجزائر العاصمة',
                wilaya: 'الجزائر',
                basePrice: 18000,
                priceUnit: PriceUnit.PER_NIGHT,
                metadata: {
                    type: 'Deluxe Room',
                    amenities: ['wifi', 'pool', 'gym', 'breakfast', 'parking'],
                    features: ['wifi', 'pool', 'gym'],
                    breakfast_included: true,
                },
                status: ListingStatus.ACTIVE,
                avgRating: 4.9,
                totalReviews: 50,
                isFeatured: true,
            },
        }),

        // Hotel Oran
        prisma.listing.create({
            data: {
                providerId: provider4.id,
                type: ListingType.HOTEL,
                title: 'غرفة قياسية مريحة',
                description: 'غرفة مريحة في قلب مدينة وهران، قريبة من كل المعالم السياحية.',
                address: 'وسط مدينة وهران',
                city: 'وهران',
                wilaya: 'وهران',
                basePrice: 9500,
                priceUnit: PriceUnit.PER_NIGHT,
                metadata: {
                    type: 'Standard Room',
                    amenities: ['wifi', 'air_conditioning', 'parking'],
                    features: ['wifi', 'air_conditioning'],
                },
                status: ListingStatus.ACTIVE,
                avgRating: 4.4,
                totalReviews: 20,
            },
        }),
        // Restaurant Algiers
        prisma.listing.create({
            data: {
                providerId: provider5.id,
                type: ListingType.RESTAURANT,
                title: 'مطعم القصبة العتيق',
                description: 'استمتع بأشهى الأطباق التقليدية الجزائرية في قلب القصبة. كسكسي، شربة مرمس، وطاجين الزيتون المحضر بأنامل ذهبية.',
                address: 'ساحة الشهداء، الجزائر العاصمة',
                city: 'الجزائر العاصمة',
                wilaya: 'الجزائر',
                basePrice: 1200,
                priceUnit: PriceUnit.PER_MEAL,
                metadata: {
                    category: 'TRADITIONAL',
                    menu: [
                        { name: 'كسكسي عاصمي باللحم', description: 'الطبق التقليدي الأول في الجزائر بخضار موسمية ولحم غنم طازج', price: 1500, category: 'TRADITIONAL' },
                        { name: 'شربة فريك', description: 'حساء تقليدي غني بالحبوب والأعشاب المنسية', price: 600, category: 'TRADITIONAL' },
                        { name: 'طاجين الزيتون', description: 'زيتون محضر بصلصة بيضاء ولحم دجاج محمر', price: 1200, category: 'TRADITIONAL' },
                        { name: 'مثوم عاصمي', description: 'كوريات اللحم بصلصة الثوم والحمص', price: 1400, category: 'TRADITIONAL' },
                    ]
                },
                status: ListingStatus.ACTIVE,
                avgRating: 4.8,
                totalReviews: 32,
                isFeatured: true,
            },
        }),
        // Taxi Algiers
        prisma.listing.create({
            data: {
                providerId: provider6.id,
                type: ListingType.TAXI,
                title: 'رفيق تاكسي - سيارة اقتصادية',
                description: 'سيارة نظيفة ومكيفة للتنقل في العاصمة وضواحيها. سائق محترف وخبير بالطرقات.',
                address: 'الجزائر العاصمة',
                city: 'الجزائر العاصمة',
                wilaya: 'الجزائر',
                basePrice: 100,
                priceUnit: PriceUnit.PER_HOUR,
                metadata: {
                    carType: 'STANDARD',
                    carModel: 'Dacia Logan 2023',
                    features: ['AC', 'Music', 'USB Charger']
                },
                status: ListingStatus.ACTIVE,
                avgRating: 4.7,
                totalReviews: 120,
            },
        }),
    ]);

    console.log(`✅ ${listings.length} listings created`);

    // ---------------------------
    // 5. Add images for listings
    // ---------------------------
    const listingImages = [
        // Oran Seafront
        {
            url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
            alt: 'شقة مطلة على البحر في وهران'
        },
        // Oran Modern Studio
        {
            url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
            alt: 'استوديو عصري وسط مدينة وهران'
        },
        // Algiers Casbah
        {
            url: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=800&q=80',
            alt: 'دار تقليدية في القصبة'
        },
        // Algiers Luxury
        {
            url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
            alt: 'شقة فاخرة في حيدرة'
        },
        // Algiers Budget
        {
            url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
            alt: 'شقة اقتصادية في باب الزوار'
        },
        // Hotel Algiers
        {
            url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
            alt: 'فندق الجزائر جراند'
        },
        // Hotel Oran
        {
            url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
            alt: 'فندق رويال وهران'
        },
        // Restaurant
        {
            url: 'https://images.unsplash.com/photo-1517248135467-4c7ed9d421bb?auto=format&fit=crop&w=800&q=80',
            alt: 'مطعم القصبة العتيق'
        },
        // Taxi
        {
            url: 'https://images.unsplash.com/photo-1545641203-7d072a14e3b2?auto=format&fit=crop&w=800&q=80',
            alt: 'رفيق تاكسي'
        }
    ];

    for (let i = 0; i < listings.length; i++) {
        const listing = listings[i];
        const imageData = listingImages[i] || {
            url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
            alt: listing.title
        };

        await prisma.listingImage.create({
            data: {
                listingId: listing.id,
                url: imageData.url,
                thumbnailUrl: imageData.url,
                altText: imageData.alt,
                isPrimary: true,
                sortOrder: 0,
            },
        });
    }
    console.log('✅ Listing images created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📝 Test accounts:');
    console.log('   Admin:    admin@rafiq.dz / Admin123!');
    console.log('   User:     ahmed@test.dz / User123!');
    console.log('   Provider: karim@homes.dz / Provider123!');
    console.log('   Provider: fatima@homes.dz / Provider123!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
