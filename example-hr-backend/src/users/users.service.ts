import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import type { RemoteUserPayload } from './types/remote-user-payload.type';
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

  /** Upsert by `email`; `payload.id` is stored as `hcmId`. */
  async upsertFromRemotePayload(payload: RemoteUserPayload): Promise<User> {
    const [user, created] = await this.userModel.findOrCreate({
      where: { email: payload.email },
      defaults: {
        name: payload.name,
        hcmId: payload.id,
        balance: payload.balance,
      },
    });
    if (!created) {
      await user.update({
        name: payload.name,
        hcmId: payload.id,
        balance: payload.balance,
      });
    }
    await user.reload();
    return user;
  }
}
