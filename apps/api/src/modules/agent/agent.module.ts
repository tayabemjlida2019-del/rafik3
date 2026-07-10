import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { LlmService } from './llm.service';
import { N8nService } from './n8n.service';

@Module({
  controllers: [AgentController],
  providers: [AgentService, LlmService, N8nService],
  exports: [AgentService],
})
export class AgentModule {}
