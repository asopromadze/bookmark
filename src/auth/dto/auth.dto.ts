import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthState {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
