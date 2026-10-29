import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly jwtService: JwtService,
  ) {}

  // Регистрация с хешированием пароля через bcrypt (Задание 1)
  async register(
    username: string,
    email: string,
    pass: string,
    roleName: string = 'user',
  ) {
    const existing = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existing) {
      throw new ConflictException('Username or email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pass, salt);

    let role = await this.rolesRepository.findOneBy({ name: roleName });
    if (!role) {
      role = this.rolesRepository.create({ name: roleName });
      await this.rolesRepository.save(role);
    }

    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      roles: [role],
    });

    const savedUser = await this.usersRepository.save(user);
    const { password, ...result } = savedUser;
    return result;
  }

  // Проверка пароля для LocalStrategy (Задание 1)
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Выдача JWT токена после логина (Задание 2)
  async login(user: any) {
    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles?.map((r: Role) => r.name) || [],
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}