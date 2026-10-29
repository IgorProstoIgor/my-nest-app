import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('users')
  createUser(@Body() body: { username: string; email: string }) {
    return this.tasksService.createUser(body.username, body.email);
  }

  // Защищено JWT-токеном (ЛР №17, Задание 2)
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getAllTasks() {
    return this.tasksService.getAllTasks();
  }

  @Get('user/:userId')
  getTasksByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.tasksService.getTasksByUser(userId);
  }

  @Get(':id')
  getTaskById(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto & { userId?: number }) {
    return this.tasksService.createTask(
      createTaskDto.title,
      createTaskDto.description,
      createTaskDto.userId,
    );
  }

  @Put(':id')
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(
      id,
      updateTaskDto.title,
      updateTaskDto.completed,
    );
  }

  // Защищено JWT-токеном + ролью 'administrator' (ЛР №17, Задание 3)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('administrator')
  @Delete(':id')
  async deleteTask(@Param('id', ParseIntPipe) id: number) {
    await this.tasksService.deleteTask(id);
    return { message: `Task ${id} successfully deleted` };
  }
}