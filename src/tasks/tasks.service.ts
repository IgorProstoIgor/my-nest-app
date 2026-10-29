import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Создание пользователя (Задание 2)
  async createUser(username: string, email: string): Promise<User> {
    const user = this.usersRepository.create({ username, email });
    return this.usersRepository.save(user);
  }

  // Создание задачи с привязкой к пользователю (Задания 1 и 2)
  async createTask(
    title: string,
    description?: string,
    userId?: number,
  ): Promise<Task> {
    const task = this.tasksRepository.create({ title, description });

    if (userId) {
      const user = await this.usersRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      task.user = user;
    }

    return this.tasksRepository.save(task);
  }

  // Получение всех задач (Задание 1)
  async getAllTasks(): Promise<Task[]> {
    return this.tasksRepository.find({ relations: { user: true } });
  }

  // Получение всех задач конкретного пользователя (Задание 2)
  async getTasksByUser(userId: number): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { user: { id: userId } },
      relations: { user: true },
    });
  }

  // Получение задачи по ID вместе с пользователем (Задания 1 и 2)
  async getTaskById(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  // Обновление задачи (Задание 1)
  async updateTask(
    id: number,
    title?: string,
    completed?: boolean,
  ): Promise<Task> {
    const task = await this.getTaskById(id);
    if (title !== undefined) task.title = title;
    if (completed !== undefined) task.completed = completed;
    return this.tasksRepository.save(task);
  }

  // Удаление задачи (Задание 1)
  async deleteTask(id: number): Promise<void> {
    const task = await this.getTaskById(id);
    await this.tasksRepository.remove(task);
  }
}