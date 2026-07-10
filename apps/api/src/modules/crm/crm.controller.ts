import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import {
  CreateClientDto,
  UpdateClientDto,
  CreateTaskDto,
  UpdateTaskDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from './dto/crm.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('CRM')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // Dashboard stats
  @Get('dashboard')
  @ApiOperation({ summary: 'Get CRM dashboard stats for provider' })
  getDashboard(@Request() req) {
    return this.crmService.getDashboardStats(req.user.providerId ?? req.user.sub);
  }

  // ==========================================
  // CLIENTS
  // ==========================================

  @Post('clients')
  createClient(@Request() req, @Body() dto: CreateClientDto) {
    return this.crmService.createClient(req.user.providerId ?? req.user.sub, dto);
  }

  @Get('clients')
  getClients(@Request() req) {
    return this.crmService.getClients(req.user.providerId ?? req.user.sub);
  }

  @Get('clients/:id')
  getClient(@Request() req, @Param('id') id: string) {
    return this.crmService.getClient(req.user.providerId ?? req.user.sub, id);
  }

  @Patch('clients/:id')
  updateClient(@Request() req, @Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.crmService.updateClient(req.user.providerId ?? req.user.sub, id, dto);
  }

  @Delete('clients/:id')
  deleteClient(@Request() req, @Param('id') id: string) {
    return this.crmService.deleteClient(req.user.providerId ?? req.user.sub, id);
  }

  // ==========================================
  // TASKS
  // ==========================================

  @Post('tasks')
  createTask(@Request() req, @Body() dto: CreateTaskDto) {
    return this.crmService.createTask(req.user.providerId ?? req.user.sub, dto);
  }

  @Get('tasks')
  getTasks(
    @Request() req,
    @Query('isDone') isDone?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.crmService.getTasks(req.user.providerId ?? req.user.sub, {
      isDone: isDone !== undefined ? isDone === 'true' : undefined,
      clientId,
    });
  }

  @Patch('tasks/:id')
  updateTask(@Request() req, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.crmService.updateTask(req.user.providerId ?? req.user.sub, id, dto);
  }

  @Patch('tasks/:id/toggle')
  toggleTask(@Request() req, @Param('id') id: string) {
    return this.crmService.toggleTask(req.user.providerId ?? req.user.sub, id);
  }

  @Delete('tasks/:id')
  deleteTask(@Request() req, @Param('id') id: string) {
    return this.crmService.deleteTask(req.user.providerId ?? req.user.sub, id);
  }

  // ==========================================
  // APPOINTMENTS
  // ==========================================

  @Post('appointments')
  createAppointment(@Request() req, @Body() dto: CreateAppointmentDto) {
    return this.crmService.createAppointment(req.user.providerId ?? req.user.sub, dto);
  }

  @Get('appointments')
  getAppointments(@Request() req) {
    return this.crmService.getAppointments(req.user.providerId ?? req.user.sub);
  }

  @Patch('appointments/:id')
  updateAppointment(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.crmService.updateAppointment(req.user.providerId ?? req.user.sub, id, dto);
  }

  @Delete('appointments/:id')
  deleteAppointment(@Request() req, @Param('id') id: string) {
    return this.crmService.deleteAppointment(req.user.providerId ?? req.user.sub, id);
  }
}
