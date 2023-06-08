import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-paylod';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from './interfaces/login-response';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {

  constructor(@InjectModel(User.name)
  private userModel: Model<User>,
    private jwtServive: JwtService) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log({ createUserDto });

    try {

      const { password, ...userData } = createUserDto;



      const newUser = new this.userModel({
        ...createUserDto,
        password: bcryptjs.hashSync(password, 10)
      });



      await newUser.save();
      const { password: _, ...user } = newUser.toJSON();
      return user;

    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exists!`);
      }

      throw new InternalServerErrorException('Something terrible happend!!!');
    }

  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const user = await this.create(registerDto);

    return {
      user,
      token: this.getJwtToken({ id: user._id })
    }

  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });


    if (!user) {
      throw new UnauthorizedException('Not valid credentials - email');
    }


    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials - password');
    }

    const { password: _, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({ id: user._id })
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserByid(id: string) {
    const user = await this.userModel.findOne({ _id: id });
    const { password, ...rest } = user;
    return rest;
  }


  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtServive.sign(payload);
    return token;
  }
}
