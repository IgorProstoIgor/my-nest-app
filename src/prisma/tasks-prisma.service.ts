import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class TasksPrismaService {
  constructor(private readonly prisma: PrismaService) {}

  createUser(username: string, email: string) {
    return this.prisma.user.create({ data: { username, email } });
  }

  createTask(title: string, description?: string, userId?: number) {
    return this.prisma.task.create({ data: { title, description, userId } });
  }

  getAllTasks() {
    return this.prisma.task.findMany({ include: { user: true } });
  }

  async getTaskById(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    return task;
  }

  updateTask(id: number, title?: string, completed?: boolean) {
    return this.prisma.task.update({
      where: { id },
      data: { title, completed },
    });
  }

  deleteTask(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }
}
