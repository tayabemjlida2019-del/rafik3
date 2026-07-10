import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, Tool } from '@google/generative-ai';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: `أنت "الرفيق"، وكيل أعمال ذكي متخصص في حجز الفنادق والخدمات السياحية في الجزائر.
مهمتك هي مساعدة المستخدمين في العثور على فنادق، حجزها، وإرسال الإشعارات.
استخدم الأدوات المتاحة لك (search_hotels, book_hotel, send_notification) لتنفيذ طلبات المستخدم.
كن موجزاً، عملياً، وباللغة العربية (الجزائرية إذا أمكن).`,
      });
    }
  }

  isLlmEnabled(): boolean {
    return !!this.genAI;
  }

  getTools(): Tool[] {
    return [
      {
        functionDeclarations: [
          {
            name: 'search_hotels',
            description: 'البحث عن فنادق في مدينة معينة مع خيارات الميزانية والتواريخ.',
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string', description: 'اسم المدينة (مثلاً: وهران، الجزائر العاصمة)' },
                budget_max: { type: 'number', description: 'الحد الأقصى للميزانية لليلة بالدج' },
                checkin: { type: 'string', description: 'تاريخ الدخول (YYYY-MM-DD)' },
                nights: { type: 'number', description: 'عدد الليالي' },
              },
              required: ['location'],
            },
          },
          {
            name: 'book_hotel',
            description: 'حجز فندق محدد للمستخدم.',
            parameters: {
              type: 'object',
              properties: {
                hotel_id: { type: 'string', description: 'معرف الفندق' },
                checkin: { type: 'string', description: 'تاريخ الدخول (YYYY-MM-DD)' },
                nights: { type: 'number', description: 'عدد الليالي' },
              },
              required: ['hotel_id', 'checkin', 'nights'],
            },
          },
          {
            name: 'send_notification',
            description: 'إرسال إشعار للمستخدم حول حالة الحجز أو معلومات هامة.',
            parameters: {
              type: 'object',
              properties: {
                type: { type: 'string', description: 'نوع الإشعار' },
                message: { type: 'string', description: 'نص الرسالة' },
              },
              required: ['type', 'message'],
            },
          },
          {
            name: 'create_client',
            description: 'إضافة عميل جديد لدفتر أعمال المزود.',
            parameters: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'اسم العميل' },
                phone: { type: 'string', description: 'رقم الهاتف' },
                company: { type: 'string', description: 'الشركة' },
              },
              required: ['name'],
            },
          },
          {
            name: 'create_task',
            description: 'إضافة مهمة جديدة لمتابعتها.',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'عنوان المهمة' },
                due_date: { type: 'string', description: 'تاريخ الاستحقاق (YYYY-MM-DD)' },
                priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
              },
              required: ['title'],
            },
          },
          {
            name: 'schedule_appointment',
            description: 'تحديد موعد جديد مع عميل.',
            parameters: {
              type: 'object',
              properties: {
                client_id: { type: 'string', description: 'معرف العميل' },
                title: { type: 'string', description: 'موضوع الموعد' },
                start_time: { type: 'string', description: 'وقت البدء (YYYY-MM-DD HH:mm)' },
              },
              required: ['client_id', 'title', 'start_time'],
            },
          },
        ],
      } as any,
    ];
  }

  async generateResponse(history: any[], userMessage: string) {
    if (!this.model) throw new Error('Gemini API key is not configured');

    const chat = this.model.startChat({
      history: history,
      tools: this.getTools(),
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response;
  }
}
