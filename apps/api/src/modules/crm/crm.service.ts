import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateClientDto,
  UpdateClientDto,
  CreateTaskDto,
  UpdateTaskDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from './dto/crm.dto';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CLIENTS
  // ==========================================

  async createClient(providerId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: { ...dto, providerId },
    });
  }

  async getClients(providerId: string) {
    return this.prisma.client.findMany({
      where: { providerId },
      include: {
        _count: { select: { tasks: true, appointments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getClient(providerId: string, clientId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, providerId },
      include: {
        tasks: { orderBy: { createdAt: 'desc' } },
        appointments: { orderBy: { startTime: 'asc' } },
      },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async updateClient(providerId: string, clientId: string, dto: UpdateClientDto) {
    await this.getClient(providerId, clientId); // Throws if not found
    return this.prisma.client.update({
      where: { id: clientId },
      data: dto,
    });
  }

  async deleteClient(providerId: string, clientId: string) {
    await this.getClient(providerId, clientId); // Throws if not found
    return this.prisma.client.delete({ where: { id: clientId } });
  }

  // ==========================================
  // TASKS
  // ==========================================

  async createTask(providerId: string, dto: CreateTaskDto) {
    const { dueDate, ...rest } = dto;
    return this.prisma.task.create({
      data: {
        ...rest,
        providerId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
      include: { client: true },
    });
  }

  async getTasks(providerId: string, filters?: { isDone?: boolean; clientId?: string }) {
    return this.prisma.task.findMany({
      where: {
        providerId,
        ...(filters?.isDone !== undefined && { isDone: filters.isDone }),
        ...(filters?.clientId && { clientId: filters.clientId }),
      },
      include: { client: { select: { id: true, name: true } } },
      orderBy: [{ isDone: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async updateTask(providerId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, providerId } });
    if (!task) throw new NotFoundException('Task not found');
    const { dueDate, ...rest } = dto;
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...rest,
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });
  }

  async toggleTask(providerId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, providerId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.task.update({
      where: { id: taskId },
      data: { isDone: !task.isDone },
    });
  }

  async deleteTask(providerId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, providerId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.task.delete({ where: { id: taskId } });
  }

  // ==========================================
  // APPOINTMENTS
  // ==========================================

  async createAppointment(providerId: string, dto: CreateAppointmentDto) {
    return this.prisma.appointment.create({
      data: {
        ...dto,
        providerId,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
      },
      include: { client: { select: { id: true, name: true } } },
    });
  }

  async getAppointments(providerId: string) {
    return this.prisma.appointment.findMany({
      where: { providerId },
      include: { client: { select: { id: true, name: true, phone: true } } },
      orderBy: { startTime: 'asc' },
    });
  }

  async updateAppointment(providerId: string, appointmentId: string, dto: UpdateAppointmentDto) {
    const appt = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, providerId },
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    const { startTime, endTime, ...rest } = dto;
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...rest,
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
      },
    });
  }

  async deleteAppointment(providerId: string, appointmentId: string) {
    const appt = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, providerId },
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    return this.prisma.appointment.delete({ where: { id: appointmentId } });
  }

  // ==========================================
  // DASHBOARD SUMMARY
  // ==========================================

  async getDashboardStats(providerId: string) {
    const [totalClients, openTasks, upcomingAppointments] = await Promise.all([
      this.prisma.client.count({ where: { providerId } }),
      this.prisma.task.count({ where: { providerId, isDone: false } }),
      this.prisma.appointment.count({
        where: { providerId, startTime: { gte: new Date() }, status: 'SCHEDULED' },
      }),
    ]);
    return { totalClients, openTasks, upcomingAppointments };
  }
}
