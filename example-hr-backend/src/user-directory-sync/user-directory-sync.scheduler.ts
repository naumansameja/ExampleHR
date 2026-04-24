import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserDirectorySyncService } from './user-directory-sync.service';

@Injectable()
export class UserDirectorySyncScheduler {
  private readonly logger = new Logger(UserDirectorySyncScheduler.name);

  constructor(private readonly directorySync: UserDirectorySyncService) {}

  /** 6-field cron (includes seconds). Override with `USER_SYNC_CRON`. */
  @Cron(process.env.USER_SYNC_CRON?.trim() || '*/30 * * * * *')
  async handleCron(): Promise<void> {
    if (process.env.USERS_SYNC_ENABLED === 'false') {
      return;
    }
    try {
      await this.directorySync.batchSync();
    } catch (err) {
      this.logger.error(
        'Scheduled user directory sync failed',
        err instanceof Error ? err.stack : err,
      );
    }
  }
}
