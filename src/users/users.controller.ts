import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post('/register')
  // register(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.register(createUserDto);
  // }

  // @Post('/login')
  // login(@Body() loginUserDto: LoginUserDto) {
  //   return this.usersService.login(loginUserDto);
  // }

  // @Post('/refresh')
  // refresh(@Body() refreshTokenDto: RefreshTokenDto) {
  //   return this.usersService.refreshTokens(refreshTokenDto);
  // }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
