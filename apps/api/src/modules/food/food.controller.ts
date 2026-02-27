import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FoodService } from './food.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { CreateCategoryDto, CreateMenuItemDto, UpdateMenuItemDto } from './dto/food.dto';

@ApiTags('Food')
@Controller('food')
export class FoodController {
    constructor(private readonly foodService: FoodService) { }

    @Get('menu/:listingId')
    @ApiOperation({ summary: 'الحصول على المنيو لمطعم معين' })
    async getMenu(@Param('listingId') listingId: string) {
        return this.foodService.getMenu(listingId);
    }

    @Post('category/:listingId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'إضافة فئة جديدة للمنيو' })
    async createCategory(
        @Param('listingId') listingId: string,
        @CurrentUser('userId') providerId: string,
        @Body() dto: CreateCategoryDto,
    ) {
        return this.foodService.createCategory(listingId, providerId, dto);
    }

    @Delete('category/:categoryId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'حذف فئة بالكامل' })
    async deleteCategory(
        @Param('categoryId') categoryId: string,
        @CurrentUser('userId') providerId: string,
    ) {
        return this.foodService.deleteCategory(categoryId, providerId);
    }

    @Post('item/:categoryId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'إضافة طبق/منتج جديد للفئة' })
    async createMenuItem(
        @Param('categoryId') categoryId: string,
        @CurrentUser('userId') providerId: string,
        @Body() dto: CreateMenuItemDto,
    ) {
        return this.foodService.createMenuItem(categoryId, providerId, dto);
    }

    @Patch('item/:itemId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'تعديل طبق موجود' })
    async updateMenuItem(
        @Param('itemId') itemId: string,
        @CurrentUser('userId') providerId: string,
        @Body() dto: UpdateMenuItemDto,
    ) {
        return this.foodService.updateMenuItem(itemId, providerId, dto);
    }

    @Delete('item/:itemId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'حذف طبق' })
    async deleteMenuItem(
        @Param('itemId') itemId: string,
        @CurrentUser('userId') providerId: string,
    ) {
        return this.foodService.deleteMenuItem(itemId, providerId);
    }
}
