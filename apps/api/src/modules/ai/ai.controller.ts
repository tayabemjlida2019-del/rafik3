import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { RecommendationQueryDto, ChatDto } from './dto/ai.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('AI - Smart Assistant')
@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('chat')
    @ApiOperation({ summary: 'Chat with Rafiq AI Assistant' })
    @ApiBody({ type: ChatDto })
    async chat(@Body() body: ChatDto) {
        return this.aiService.chat(body);
    }

    @Get('recommend')
    @ApiOperation({ summary: 'Get algorithmic recommendations for places and stays' })
    async getRecommendations(@Query() query: RecommendationQueryDto) {
        return this.aiService.getRecommendations(query);
    }
}
