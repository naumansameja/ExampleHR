import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User } from './user.model';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let sequelize: Sequelize;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          dialect: 'sqlite',
          storage: ':memory:',
          autoLoadModels: true,
          synchronize: true,
          logging: false,
          define: { underscored: true },
        }),
        SequelizeModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    sequelize = module.get<Sequelize>(getConnectionToken());
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it('creates and lists users', async () => {
    const created = await service.create({
      name: 'Ada',
      email: 'ada@example.com',
      hcmId: 'hcm_1',
    });
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Ada');
    expect(created.email).toBe('ada@example.com');
    expect(created.hcmId).toBe('hcm_1');
    expect(created.balance).toBe(0);

    const all = await service.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].hcmId).toBe('hcm_1');
  });
});
