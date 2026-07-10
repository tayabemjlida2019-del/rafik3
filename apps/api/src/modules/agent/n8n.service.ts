import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class N8nService {
  private readonly logger = new Logger(N8nService.name);

  constructor(private configService: ConfigService) {}

  async invokeAction(action: string, payload: any, context: any) {
    const webhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL');
    if (!webhookUrl) {
      this.logger.warn('N8N_WEBHOOK_URL is not configured. Action skipped.');
      return { ok: false, error: 'Webhook URL not configured' };
    }

    this.logger.log(`Invoking n8n action: ${action}`);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          payload,
          context,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`n8n responded with ${response.status}`);
      }

      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      this.logger.error(`Failed to invoke n8n: ${error.message}`);
      return { ok: false, error: error.message };
    }
  }
}
