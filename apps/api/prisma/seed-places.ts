import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // تنظيف البيانات القديمة
    await prisma.media.deleteMany();
    await prisma.hotel.deleteMany();
    await prisma.place.deleteMany();
    console.log('🧹 Cleaned old place/hotel/media data.');

    // 1️⃣ إضافة الأماكن السياحية

    const tassili = await prisma.place.create({
        data: {
            nameAr: "جبال الطاسيلي ناجر",
            nameEn: "Tassili n'Ajjer",
            descriptionAr: "أكبر متحف مفتوح في العالم للرسوم والنقوش الصخرية، يضم أكثر من 15,000 رسم يعود تاريخها إلى 10,000 سنة.",
            descriptionEn: "The largest open-air museum with rock art and volcanic formations, containing over 15,000 drawings dating back 10,000 years.",
            latitude: 25.1667,
            longitude: 8.1667,
            city: "جانت",
            wilaya: "إليزي",
            categories: ["تاريخي", "طبيعي", "ثقافي"],
            bestSeason: ["spring", "autumn"],
            visitDuration: 8,
            crowdLevel: "low",
            isUnesco: true,
        },
    });

    const casbah = await prisma.place.create({
        data: {
            nameAr: "حي القصبة العتيق",
            nameEn: "Casbah of Algiers",
            descriptionAr: "حي تاريخي في قلب العاصمة الجزائرية، يتميز بشوارعه الضيقة ومعماره العثماني الفريد. مدرج ضمن التراث العالمي لليونسكو.",
            descriptionEn: "A historic quarter in the heart of Algiers, known for its narrow winding streets and unique Ottoman-era architecture. UNESCO World Heritage Site.",
            latitude: 36.7847,
            longitude: 3.0601,
            city: "الجزائر العاصمة",
            wilaya: "الجزائر",
            categories: ["تاريخي", "ثقافي"],
            bestSeason: ["spring", "autumn", "winter"],
            visitDuration: 4,
            crowdLevel: "high",
            isUnesco: true,
        },
    });

    const timgad = await prisma.place.create({
        data: {
            nameAr: "مدينة تيمقاد الأثرية",
            nameEn: "Timgad Roman Ruins",
            descriptionAr: "مدينة رومانية أسسها الإمبراطور تراجان عام 100م. تعتبر أفضل نموذج للعمارة الرومانية في شمال أفريقيا.",
            descriptionEn: "A Roman city founded by Emperor Trajan in 100 AD. Considered the best-preserved example of Roman urban planning in North Africa.",
            latitude: 35.4833,
            longitude: 6.4667,
            city: "تيمقاد",
            wilaya: "باتنة",
            categories: ["تاريخي"],
            bestSeason: ["spring", "autumn"],
            visitDuration: 5,
            crowdLevel: "medium",
            isUnesco: true,
        },
    });

    const bejaia = await prisma.place.create({
        data: {
            nameAr: "ساحل بجاية",
            nameEn: "Béjaïa Coast",
            descriptionAr: "تتميز بجاية بشواطئها الخلابة وجبالها الخضراء المطلة على البحر المتوسط. وجهة مثالية للسياحة الشاطئية والجبلية.",
            descriptionEn: "Béjaïa offers stunning Mediterranean beaches alongside green mountains. An ideal destination for coast and mountain tourism.",
            latitude: 36.75,
            longitude: 5.0833,
            city: "بجاية",
            wilaya: "بجاية",
            categories: ["طبيعي", "شاطئي"],
            bestSeason: ["summer"],
            visitDuration: 6,
            crowdLevel: "high",
            isUnesco: false,
        },
    });

    const djemila = await prisma.place.create({
        data: {
            nameAr: "الآثار الرومانية في جميلة",
            nameEn: "Djémila Roman Ruins",
            descriptionAr: "موقع أثري روماني استثنائي يقع على ارتفاع 900م في الجبال. يضم معابد وساحات وفسيفساء مذهلة.",
            descriptionEn: "An exceptional Roman archaeological site at 900m altitude. Features temples, forums, and breathtaking mosaics.",
            latitude: 36.3167,
            longitude: 5.7333,
            city: "جميلة",
            wilaya: "سطيف",
            categories: ["تاريخي", "ثقافي"],
            bestSeason: ["spring", "autumn"],
            visitDuration: 4,
            crowdLevel: "medium",
            isUnesco: true,
        },
    });

    const ghardaia = await prisma.place.create({
        data: {
            nameAr: "وادي مزاب - غرداية",
            nameEn: "M'zab Valley - Ghardaia",
            descriptionAr: "تجمع حضري فريد من خمس قصور محصنة (قُرى) بُنيت في القرن العاشر الميلادي. نموذج عالمي للعمارة المستدامة.",
            descriptionEn: "A unique urban cluster of five fortified ksour (villages) built in the 10th century. A global model of sustainable architecture.",
            latitude: 32.4903,
            longitude: 3.6733,
            city: "غرداية",
            wilaya: "غرداية",
            categories: ["تاريخي", "ثقافي", "ديني"],
            bestSeason: ["spring", "winter"],
            visitDuration: 6,
            crowdLevel: "medium",
            isUnesco: true,
        },
    });

    const tipaza = await prisma.place.create({
        data: {
            nameAr: "الآثار الرومانية في تيبازة",
            nameEn: "Tipaza Roman Ruins",
            descriptionAr: "آثار رومانية ساحلية خلابة تطل على البحر المتوسط. وصفها ألبير كامو بأنها أجمل مكان في العالم.",
            descriptionEn: "Stunning coastal Roman ruins overlooking the Mediterranean. Described by Albert Camus as the most beautiful place in the world.",
            latitude: 36.5903,
            longitude: 2.4489,
            city: "تيبازة",
            wilaya: "تيبازة",
            categories: ["تاريخي", "طبيعي"],
            bestSeason: ["spring", "summer", "autumn"],
            visitDuration: 4,
            crowdLevel: "medium",
            isUnesco: true,
        },
    });

    const hoggar = await prisma.place.create({
        data: {
            nameAr: "جبال الهقار",
            nameEn: "Hoggar Mountains",
            descriptionAr: "سلسلة جبلية بركانية مهيبة في قلب الصحراء، تشتهر بمناظر شروق الشمس من قمة أسكرام الأسطورية.",
            descriptionEn: "A majestic volcanic mountain range in the Sahara, famous for legendary sunrise views from the Assekrem summit.",
            latitude: 23.3,
            longitude: 5.6333,
            city: "تمنراست",
            wilaya: "تمنراست",
            categories: ["طبيعي", "مغامرة"],
            bestSeason: ["autumn", "winter"],
            visitDuration: 10,
            crowdLevel: "low",
            isUnesco: false,
        },
    });

    console.log('✅ تم إضافة 8 مواقع سياحية.');

    // 2️⃣ إضافة الفنادق

    await prisma.hotel.createMany({
        data: [
            // فنادق الجزائر العاصمة
            { name: "فندق الأوراسي", latitude: 36.7538, longitude: 3.0588, price: 15000, rating: 4.2, placeId: casbah.id },
            { name: "سوفيتل الجزائر", latitude: 36.7655, longitude: 3.0428, price: 25000, rating: 4.5, placeId: casbah.id },
            { name: "فندق القصبة البوتيكي", latitude: 36.7850, longitude: 3.0610, price: 8000, rating: 3.8, placeId: casbah.id },

            // فنادق بجاية
            { name: "فندق الشابي", latitude: 36.7480, longitude: 5.0800, price: 6000, rating: 3.5, placeId: bejaia.id },
            { name: "فندق Les Hammadites", latitude: 36.7560, longitude: 5.0760, price: 12000, rating: 4.0, placeId: bejaia.id },

            // فنادق باتنة / تيمقاد
            { name: "فندق الشريعة", latitude: 35.5550, longitude: 6.1740, price: 5000, rating: 3.3, placeId: timgad.id },
            { name: "فندق سلطان باتنة", latitude: 35.5600, longitude: 6.1800, price: 7000, rating: 3.7, placeId: timgad.id },

            // فنادق تمنراست / الهقار
            { name: "فندق تاهات", latitude: 22.7870, longitude: 5.5100, price: 9000, rating: 4.0, placeId: hoggar.id },
            { name: "مخيم أسكرام السياحي", latitude: 23.2700, longitude: 5.6300, price: 4000, rating: 4.3, placeId: hoggar.id },

            // فنادق جانت / الطاسيلي
            { name: "فندق زريبة جانت", latitude: 24.5530, longitude: 9.4840, price: 6000, rating: 3.9, placeId: tassili.id },

            // فنادق غرداية
            { name: "فندق روستميد غرداية", latitude: 32.4900, longitude: 3.6700, price: 7500, rating: 3.6, placeId: ghardaia.id },

            // فنادق تيبازة
            { name: "فندق ماتاريس تيبازة", latitude: 36.5910, longitude: 2.4500, price: 10000, rating: 4.1, placeId: tipaza.id },

            // فنادق سطيف / جميلة
            { name: "فندق نوفوتيل سطيف", latitude: 36.1900, longitude: 5.4100, price: 11000, rating: 4.0, placeId: djemila.id },
        ],
    });

    console.log('✅ تم إضافة 13 فندق.');

    // 3️⃣ إضافة صور (Media)
    await prisma.media.createMany({
        data: [
            { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Tassili_n%27Ajjer.jpg/1280px-Tassili_n%27Ajjer.jpg", source: "Wikimedia", license: "CC BY-SA 4.0", placeId: tassili.id },
            { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Casbah_d%27Alger.jpg/1280px-Casbah_d%27Alger.jpg", source: "Wikimedia", license: "CC BY-SA 4.0", placeId: casbah.id },
            { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Timgad2.jpg/1280px-Timgad2.jpg", source: "Wikimedia", license: "CC BY-SA 4.0", placeId: timgad.id },
            { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Djemila_Roman_ruins.jpg/1280px-Djemila_Roman_ruins.jpg", source: "Wikimedia", license: "CC BY-SA 4.0", placeId: djemila.id },
            { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Ghardaia.jpg/1280px-Ghardaia.jpg", source: "Wikimedia", license: "CC BY-SA 4.0", placeId: ghardaia.id },
            { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Tipaza_ruins.jpg/1280px-Tipaza_ruins.jpg", source: "Wikimedia", license: "CC BY-SA 4.0", placeId: tipaza.id },
            { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Hoggar_Mountains.jpg/1280px-Hoggar_Mountains.jpg", source: "Wikimedia", license: "CC BY-SA 4.0", placeId: hoggar.id },
            { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Bejaia_coast.jpg/1280px-Bejaia_coast.jpg", source: "Wikimedia", license: "CC BY-SA 4.0", placeId: bejaia.id },
        ],
    });

    console.log('✅ تم إضافة 8 صور.');
    console.log('🎉 اكتملت عملية تغذية قاعدة البيانات بنجاح!');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
