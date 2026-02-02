import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreatePayload, UserInterface } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateEmailDto } from './dto/update-email.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { randomBytes } from 'crypto';
import { EmailChangeRequestsService } from 'src/email-change-requests/email-change-requests.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
    private emailChangeRequestsService: EmailChangeRequestsService,
    private imageService: ImageService,
  ) {}

  async createUser(payload: CreatePayload): Promise<UserInterface> {
    return this.prisma.user.create({
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findOneById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        profileUrl: true,
        phoneNo: true,
      },
    });
    const imageUrl = user?.profileUrl
      ? this.imageService.getPublicUrl(user?.profileUrl)
      : null;
    return {
      ...user,
      profileUrl: imageUrl,
    };
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        profileUrl: true,
        phoneNo: true,
      },
    });
  }

  async updateProfile(
    id: string,
    updateUserDto: UpdateProfileDto,
    file: Express.Multer.File | undefined,
  ) {
    const { name, phoneNo } = updateUserDto;
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    let imageKey = existingUser?.profileUrl;

    if (file) {
      imageKey = await this.imageService.uploadPublicImage(file);
    }
    try {
      return this.prisma.user.update({
        where: { id },
        data: {
          name,
          phoneNo,
          profileUrl: imageKey,
        },
        select: {
          name: true,
          email: true,
          profileUrl: true,
          phoneNo: true,
        },
      });
    } catch (err) {
      if (imageKey) this.imageService.deleteImage(imageKey);
    }
  }

  async requestEmailChange(id: string, updateEmailDto: UpdateEmailDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = bcrypt.compare(
      updateEmailDto.password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Credentials', {
        cause: new Error(),
        description: 'Invalid email or password',
      });
    }

    const token = randomBytes(32).toString('hex');

    await this.emailChangeRequestsService.create({
      userId: existingUser.id,
      newEmail: updateEmailDto.newEmail,
      token,
      expiresAt: new Date(Date.now() + 3600000),
    });

    await this.sendVerificationEmail(updateEmailDto.newEmail, token);
    // await this.sendSecurityAlert(user.email);

    // return this.prisma.user.update({
    //   where: { id },
    //   data: {
    //     email: updateEmailDto.newEmail,
    //   },
    // });
  }

  async confirmEmailChange(token: string) {
    const request = await this.emailChangeRequestsService.findOne(token);

    if (!request || request.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Update user and clean up
    await this.prisma.user.update({
      where: { id: request.userId },
      data: {
        email: request.newEmail,
      },
    });
    await this.emailChangeRequestsService.delete(request.id);

    return { message: 'Email updated successfully' };
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `http://localhost:3000/users/change-email-confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Action Required: Verify your email change',
      template: './verify-email', // Path relative to the 'dir' set in AppModule
      context: {
        url: verificationUrl,
      },
    });
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = bcrypt.compare(
      dto.oldPassword,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Credentials', {
        cause: new Error(),
        description: 'Invalid email or password',
      });
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}
