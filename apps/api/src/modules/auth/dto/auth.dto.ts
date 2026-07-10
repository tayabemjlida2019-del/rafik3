import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
    @ApiProperty({ example: 'ahmed@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'أحمد بن محمد' })
    @IsString()
    @MinLength(2)
    fullName: string;

    @ApiProperty({ example: 'StrongPass123!' })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiPropertyOptional({ example: '0550123456' })
    @IsOptional()
    @IsString()
    phone?: string;
}

export class RegisterProviderDto {
    @ApiProperty({ example: 'provider@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'محمد علي' })
    @IsString()
    @MinLength(2)
    fullName: string;

    @ApiProperty({ example: 'StrongPass123!' })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiPropertyOptional({ example: '0550123456' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ example: 'دار الضيافة' })
    @IsString()
    businessName: string;

    @ApiProperty({ enum: ['HOTEL', 'HOME', 'RESTAURANT', 'TAXI'], example: 'HOME' })
    @IsEnum(['HOTEL', 'HOME', 'RESTAURANT', 'TAXI'])
    businessType: string;

    @ApiProperty({ example: 'وهران' })
    @IsString()
    city: string;

    @ApiProperty({ example: 'وهران' })
    @IsString()
    wilaya: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;
}

export class LoginDto {
    @ApiProperty({ example: 'ahmed@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'StrongPass123!' })
    @IsString()
    password: string;
}

export class RefreshTokenDto {
    @ApiProperty()
    @IsString()
    refreshToken: string;
}

export class ForgotPasswordDto {
    @ApiProperty({ example: 'ahmed@example.com' })
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @ApiProperty()
    @IsString()
    token: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    newPassword: string;
}
