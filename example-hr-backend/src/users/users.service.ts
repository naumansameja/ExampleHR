import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  create(dto: CreateUserDto): Promise<User> {
    return this.userModel.create({
      name: dto.name,
      email: dto.email,
      hcmId: dto.hcmId,
      balance: dto.balance ?? 0,
    });
  }

  findAll(): Promise<User[]> {
    return this.userModel.findAll({ order: [['id', 'ASC']] });
  }
}
