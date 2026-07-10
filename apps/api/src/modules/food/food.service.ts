import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, CreateMenuItemDto, UpdateMenuItemDto } from './dto/food.dto';

@Injectable()
export class FoodService {
    constructor(private prisma: PrismaService) { }

    // ---------------------------
    // Categories
    // ---------------------------
    async createCategory(listingId: string, providerId: string, dto: CreateCategoryDto) {
        await this.verifyOwnership(listingId, providerId);

        return this.prisma.category.create({
            data: {
                listingId,
                name: dto.name,
                sortOrder: dto.sortOrder || 0,
            },
        });
    }

    async getMenu(listingId: string) {
        return this.prisma.category.findMany({
            where: { listingId },
            include: {
                items: {
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async deleteCategory(categoryId: string, providerId: string) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            include: { listing: { include: { provider: true } } },
        });

        if (!category) throw new NotFoundException('الفئة غير موجودة');
        if (category.listing.provider.userId !== providerId) {
            throw new ForbiddenException('ليس لديك صلاحية');
        }

        await this.prisma.category.delete({ where: { id: categoryId } });
        return { message: 'تم حذف الفئة بنجاح' };
    }

    // ---------------------------
    // Menu Items
    // ---------------------------
    async createMenuItem(categoryId: string, providerId: string, dto: CreateMenuItemDto) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            include: { listing: { include: { provider: true } } },
        });

        if (!category) throw new NotFoundException('الفئة غير موجودة');
        if (category.listing.provider.userId !== providerId) {
            throw new ForbiddenException('ليس لديك صلاحية');
        }

        return this.prisma.menuItem.create({
            data: {
                categoryId,
                ...dto,
            },
        });
    }

    async updateMenuItem(itemId: string, providerId: string, dto: UpdateMenuItemDto) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id: itemId },
            include: { category: { include: { listing: { include: { provider: true } } } } },
        });

        if (!item) throw new NotFoundException('العنصر غير موجود');
        if (item.category.listing.provider.userId !== providerId) {
            throw new ForbiddenException('ليس لديك صلاحية');
        }

        return this.prisma.menuItem.update({
            where: { id: itemId },
            data: dto,
        });
    }

    async deleteMenuItem(itemId: string, providerId: string) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id: itemId },
            include: { category: { include: { listing: { include: { provider: true } } } } },
        });

        if (!item) throw new NotFoundException('العنصر غير موجود');
        if (item.category.listing.provider.userId !== providerId) {
            throw new ForbiddenException('ليس لديك صلاحية');
        }

        await this.prisma.menuItem.delete({ where: { id: itemId } });
        return { message: 'تم حذف العنصر بنجاح' };
    }

    // ---------------------------
    // Helpers
    // ---------------------------
    private async verifyOwnership(listingId: string, providerId: string) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            include: { provider: true },
        });

        if (!listing) throw new NotFoundException('المطعم غير موجود');
        if (listing.provider.userId !== providerId) {
            throw new ForbiddenException('ليس لديك صلاحية لتعديل هذا المنيو');
        }
    }
}
