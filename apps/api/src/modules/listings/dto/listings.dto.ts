import {
    IsString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsObject,
    IsInt,
    Min,
    Max,
    IsDateString,
    IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

// ---------------------------
// Create Listing
// ---------------------------
export class CreateListingDto {
    @ApiProperty({ example: 'شقة مطلة على البحر في وهران' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ example: 'شقة مفروشة بالكامل، 3 غرف، مطبخ مجهز، قريبة من الشاطئ' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ enum: ['HOTEL', 'HOME', 'RESTAURANT', 'TAXI'], example: 'HOME' })
    @IsEnum(['HOTEL', 'HOME', 'RESTAURANT', 'TAXI'])
    type: string;

    @ApiPropertyOptional({ example: 'حي الأمير، شارع 5' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ example: 'وهران' })
    @IsString()
    city: string;

    @ApiProperty({ example: 'وهران' })
    @IsString()
    wilaya: string;

    @ApiPropertyOptional({ example: 35.6971 })
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional({ example: -0.6308 })
    @IsOptional()
    @IsNumber()
    longitude?: number;

    @ApiProperty({ example: 6000 })
    @IsNumber()
    @Min(0)
    basePrice: number;

    @ApiPropertyOptional({ enum: ['PER_NIGHT', 'PER_MEAL', 'PER_RIDE', 'PER_HOUR'], default: 'PER_NIGHT' })
    @IsOptional()
    @IsEnum(['PER_NIGHT', 'PER_MEAL', 'PER_RIDE', 'PER_HOUR'])
    priceUnit?: string;

    @ApiPropertyOptional({
        example: { rooms: 3, area_m2: 120, furnished: true, features: ['parking', 'wifi'] },
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

// ---------------------------
// Update Listing
// ---------------------------
export class UpdateListingDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    wilaya?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    longitude?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    basePrice?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

// ---------------------------
// Search / Filter Listings
// ---------------------------
export class SearchListingsDto {
    @ApiPropertyOptional({ enum: ['HOTEL', 'HOME', 'RESTAURANT', 'TAXI'] })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    wilaya?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minPrice?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    maxPrice?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @Max(5)
    minRating?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    checkIn?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    checkOut?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    guests?: number;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    @Max(50)
    limit?: number;

    @ApiPropertyOptional({ enum: ['price_asc', 'price_desc', 'rating_desc', 'newest'] })
    @IsOptional()
    @IsString()
    sortBy?: string;
}

// ---------------------------
// Set Availability
// ---------------------------
export class SetAvailabilityDto {
    @ApiProperty({ example: '2024-03-01' })
    @IsDateString()
    date: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    isAvailable: boolean;

    @ApiPropertyOptional({ example: 8000, description: 'سعر خاص لهذا اليوم (موسم، عطلة)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    priceOverride?: number;
}

export class BulkAvailabilityDto {
    @ApiProperty({ type: [SetAvailabilityDto] })
    @Type(() => SetAvailabilityDto)
    dates: SetAvailabilityDto[];
}
