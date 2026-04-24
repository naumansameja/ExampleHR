import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserDirectorySyncService } from './user-directory-sync.service';

@Injectable()
export class UserDirectorySyncScheduler {
  private readonly logger = new Logger(UserDirectorySyncScheduler.name);

  constructor(private readonly directorySync: UserDirectorySyncService) {}

  @Cron(process.env.USER_SYNC_CRON ?? '*/5 * * * *')
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
