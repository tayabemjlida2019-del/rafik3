import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Get('listing/:listingId')
    @ApiOperation({ summary: 'تقييمات خدمة' })
    async getListingReviews(
        @Param('listingId') listingId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.reviewsService.getListingReviews(listingId, page, limit);
    }

    @Post('booking/:bookingId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'إضافة تقييم لحجز مكتمل' })
    async create(
        @Param('bookingId') bookingId: string,
        @CurrentUser('userId') userId: string,
        @Body() data: {
            rating: number;
            comment?: string;
            cleanliness?: number;
            communication?: number;
            value?: number;
            locationRating?: number;
        },
    ) {
        return this.reviewsService.create(userId, bookingId, data);
    }

    @Post(':reviewId/reply')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PROVIDER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'رد المزود على تقييم' })
    async reply(
        @Param('reviewId') reviewId: string,
        @CurrentUser('userId') userId: string,
        @Body('reply') reply: string,
    ) {
        return this.reviewsService.providerReply(reviewId, userId, reply);
    }
}
