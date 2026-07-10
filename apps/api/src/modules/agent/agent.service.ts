import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';
import { N8nService } from './n8n.service';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private llmService: LlmService,
    private n8nService: N8nService,
  ) {}

  async processMessage(userMessage: string, history: any[], context: any) {
    this.logger.log(`Processing message: ${userMessage}`);

    // 1. Call Gemini
    const response = await this.llmService.generateResponse(history, userMessage);
    
    // 2. Handle Function Calls (if any)
    const parts = response.candidates?.[0]?.content?.parts || [];
    const segments: any[] = [];
    const finalModelMessage: { role: string; parts: any[] } = { role: 'model', parts: [] };
    let combinedText = '';

    for (const part of parts) {
      if (part.text) {
        combinedText += part.text;
        segments.push({ type: 'text', content: part.text });
        finalModelMessage.parts.push({ text: part.text } as any);
      }

      if (part.functionCall) {
        const { name, args } = part.functionCall;
        this.logger.log(`Executing tool: ${name}`);

        const n8nResult = await this.n8nService.invokeAction(name, args, context);
        
        segments.push({ 
          type: 'tool_result', 
          tool: name, 
          result: n8nResult.ok ? n8nResult.data : { error: n8nResult.error } 
        });
      }
    }

    // Default response if no text was generated
    if (!combinedText && segments.length > 0) {
      combinedText = "تم تنفيذ طلبك بنجاح. ✅";
    }

    return {
      text: combinedText,
      segments,
      updatedHistory: [...history, { role: 'user', parts: [{ text: userMessage }] }, finalModelMessage],
    };
  }
}
