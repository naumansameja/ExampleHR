import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ExternalUsersClient } from './external-users.client';
import type { ExternalUserRow } from './types/external-users.types';
import { User } from '../users/user.model';

@Injectable()
export class UserDirectorySyncService {
  private readonly logger = new Logger(UserDirectorySyncService.name);

  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly externalUsersClient: ExternalUsersClient,
  ) {}

  async batchSync(): Promise<void> {
    const base = process.env.USERS_SYNC_BASE_URL?.trim();
    if (!base) {
      this.logger.warn('USERS_SYNC_BASE_URL is not set; skipping batch sync');
      return;
    }

    const remoteUsers = await this.externalUsersClient.fetchUsers();
    for (const row of remoteUsers) {
      await this.upsertRemoteRow(row);
    }

    this.logger.log(`Batch synced ${remoteUsers.length} user(s) from remote`);
  }

  /**
   * `hcmId` is the third-party user id (e.g. usr_001). Fetches the remote list
   * and upserts the matching row by email.
   */
  async syncUserByHcmId(hcmId: string): Promise<User> {
    const base = process.env.USERS_SYNC_BASE_URL?.trim();
    if (!base) {
      throw new BadRequestException('USERS_SYNC_BASE_URL is not set');
    }

    const remoteUsers = await this.externalUsersClient.fetchUsers();
    const row = remoteUsers.find((u) => u.id === hcmId);
    if (!row) {
      throw new NotFoundException(`No remote user with hcm id "${hcmId}"`);
    }

    return this.upsertRemoteRow(row);
  }

  private async upsertRemoteRow(row: ExternalUserRow): Promise<User> {
    const [user, created] = await this.userModel.findOrCreate({
      where: { email: row.email },
      defaults: {
        name: row.name,
        hcmId: row.id,
        balance: row.balance,
      },
    });
    if (!created) {
      await user.update({
        name: row.name,
        hcmId: row.id,
        balance: row.balance,
      });
    }
    await user.reload();
    return user;
  }
}
