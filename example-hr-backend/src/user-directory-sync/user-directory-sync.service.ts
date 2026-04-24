import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { UsersService } from '../users/users.service';
import { ExternalUsersClient } from './external-users.client';
import type { ExternalUserRow } from './types/external-users.types';
import { User } from '../users/user.model';

@Injectable()
export class UserDirectorySyncService {
  private readonly logger = new Logger(UserDirectorySyncService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly externalUsersClient: ExternalUsersClient,
  ) {}

  async batchSync(): Promise<void> {
    const base = process.env.USERS_SYNC_BASE_URL?.trim();
    if (!base) {
      this.logger.warn('USERS_SYNC_BASE_URL is not set; skipping batch sync');
      return;
    }

    const remoteUsers = await this.externalUsersClient.fetchUsers();
    // Should be one bulk upsert; we walk rows sequentially instead due to ORM (Sequelize) limitations for a safe, portable path here.
    for (const row of remoteUsers) {
      await this.usersService.upsertFromRemotePayload(row);
    }

    this.logger.log(`Batch synced ${remoteUsers.length} user(s) from remote`);
  }

  /**
   * `hcmId` is the third-party user id (e.g. usr_001). Uses the remote
   * single-user GET (same collection URL as the list + `/{hcmId}`).
   */
  async syncUserByHcmId(hcmId: string): Promise<User> {
    const base = process.env.USERS_SYNC_BASE_URL?.trim();
    if (!base) {
      throw new BadRequestException('USERS_SYNC_BASE_URL is not set');
    }

    try {
      const row: ExternalUserRow =
        await this.externalUsersClient.fetchUserByHcmId(hcmId);
      return await this.usersService.upsertFromRemotePayload(row);
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err.response?.status === HttpStatus.NOT_FOUND
      ) {
        throw new NotFoundException(`No remote user with hcm id "${hcmId}"`);
      }
      throw err;
    }
  }
}
