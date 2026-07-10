import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AgentService } from './agent.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a message to the Al-Rafiq Agent' })
  async chat(@Body() body: { message: string; history?: any[]; context?: any }) {
    const { message, history = [], context = {} } = body;
    return this.agentService.processMessage(message, history, context);
  }
}
