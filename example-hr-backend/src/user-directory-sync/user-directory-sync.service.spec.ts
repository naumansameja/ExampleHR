import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { ExternalUsersClient } from './external-users.client';
import { UserDirectorySyncService } from './user-directory-sync.service';

describe('UserDirectorySyncService', () => {
  let service: UserDirectorySyncService;
  let sequelize: Sequelize;
  const fetchUsers = jest.fn();
  const fetchUserByHcmId = jest.fn();

  beforeEach(async () => {
    fetchUsers.mockReset();
    fetchUserByHcmId.mockReset();
    process.env.USERS_SYNC_BASE_URL = 'http://example.test';
    fetchUsers.mockResolvedValue([
      { id: 'usr_001', name: 'Alice', email: 'a@ex.com', balance: 10 },
      { id: 'usr_001b', name: 'Alice Updated', email: 'a@ex.com', balance: 11 },
    ]);

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
      providers: [
        UserDirectorySyncService,
        {
          provide: ExternalUsersClient,
          useValue: { fetchUsers, fetchUserByHcmId },
        },
      ],
    }).compile();

    service = module.get(UserDirectorySyncService);
    sequelize = module.get(getConnectionToken());
  });

  afterEach(async () => {
    delete process.env.USERS_SYNC_BASE_URL;
    await sequelize.close();
  });

  it('batchSync upserts by email when the remote payload contains duplicates', async () => {
    await service.batchSync();

    const users = await User.findAll({ order: [['id', 'ASC']] });
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('a@ex.com');
    expect(users[0].name).toBe('Alice Updated');
    expect(users[0].hcmId).toBe('usr_001b');
    expect(users[0].balance).toBe(11);
    expect(fetchUsers).toHaveBeenCalledTimes(1);
  });

  it('syncUserByHcmId upserts a single remote row', async () => {
    fetchUserByHcmId.mockResolvedValueOnce({
      id: 'usr_x',
      name: 'Zed',
      email: 'zed@ex.com',
      balance: 3,
    });

    const user = await service.syncUserByHcmId('usr_x');
    expect(user.email).toBe('zed@ex.com');
    expect(user.hcmId).toBe('usr_x');
    expect(user.balance).toBe(3);
    expect(fetchUserByHcmId).toHaveBeenCalledWith('usr_x');
    expect(fetchUsers).not.toHaveBeenCalled();
  });
});
