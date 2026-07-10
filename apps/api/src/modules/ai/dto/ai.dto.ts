import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';

export class ChatDto {
    @IsString()
    @IsNotEmpty()
    message: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    context?: string[];
}

export class RecommendationQueryDto {
    @IsOptional()
    @IsString()
    wilaya?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categories?: string[];

    @IsOptional()
    @IsNumber()
    budget?: number;
}
