import {
    IsString,
    IsNumber,
    IsInt,
    IsOptional,
    IsDateString,
    IsEnum,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBookingDto {
    @ApiProperty({ description: 'معرف الخدمة' })
    @IsString()
    listingId: string;

    @ApiProperty({ example: '2024-03-01T14:00:00Z' })
    @IsDateString()
    checkIn: string;

    @ApiProperty({ example: '2024-03-03T12:00:00Z' })
    @IsDateString()
    checkOut: string;

    @ApiPropertyOptional({ example: 4, default: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    guests?: number;

    @ApiPropertyOptional({ example: 'نريد سرير إضافي للطفل' })
    @IsOptional()
    @IsString()
    specialRequests?: string;

    @ApiProperty({ enum: ['CCP_TRANSFER', 'BARIDIMOB', 'CIB', 'CASH'], example: 'CCP_TRANSFER' })
    @IsEnum(['CCP_TRANSFER', 'BARIDIMOB', 'CIB', 'CASH'])
    paymentMethod: string;
}

export class CancelBookingDto {
    @ApiPropertyOptional({ example: 'تغيرت خططي' })
    @IsOptional()
    @IsString()
    reason?: string;
}

export class ListBookingsDto {
    @ApiPropertyOptional({ enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED_BY_USER'] })
    @IsOptional()
    @IsString()
    status?: string;

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
    limit?: number;
}
