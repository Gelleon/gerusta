import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const adminLogin = this.configService.get<string>('ADMIN_LOGIN')?.trim();
    const adminPasswordRaw = this.configService
      .get<string>('ADMIN_PASSWORD')
      ?.trim();

    if (!adminLogin || !adminPasswordRaw) {
      return;
    }

    const adminPassword = await bcrypt.hash(adminPasswordRaw, 10);
    await this.prisma.user.upsert({
      where: { email: adminLogin },
      update: {
        password: adminPassword,
        name: 'Gerusta Admin',
        role: 'ADMIN',
      },
      create: {
        email: adminLogin,
        password: adminPassword,
        name: 'Gerusta Admin',
        role: 'ADMIN',
      },
    });
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
      },
    });
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    if (updateDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateDto.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    const data: any = {};
    if (updateDto.email) data.email = updateDto.email;
    if (updateDto.name) data.name = updateDto.name;
    if (updateDto.password) {
      data.password = await bcrypt.hash(updateDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    const { password, ...result } = user;
    return result;
  }
}
