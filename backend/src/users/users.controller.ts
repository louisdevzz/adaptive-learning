import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get(':id/status')
  async findStatus(@Param('id') id: string) {
    return this.usersService.findStatus(id);
  }

  @Get(':id/role')
  async findRole(@Param('id') id: string) {
    return this.usersService.findRole(id);
  }

  @Get(':id/permissions')
  async findPermissions(@Param('id') id: string) {
    return this.usersService.findPermissions(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() updateUserStatusDto: { status: boolean }) {
    return this.usersService.updateUserStatus(id, updateUserStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.usersService.deleteUserRole(id);
    await this.usersService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }

  @Post(':id/reset-password')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('id') id: string,
    @Body() resetPasswordDto: { password: string },
  ) {
    await this.usersService.resetPassword(id, resetPasswordDto.password);
    return { message: 'Password reset successfully' };
  }
}
