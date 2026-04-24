import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ExternalUsersClient } from './external-users.client';
import { UserDirectorySyncScheduler } from './user-directory-sync.scheduler';
import { UserDirectorySyncService } from './user-directory-sync.service';

@Module({
  imports: [
    UsersModule,
    HttpModule.register({ timeout: 15_000, maxRedirects: 3 }),
  ],
  providers: [
    ExternalUsersClient,
    UserDirectorySyncService,
    UserDirectorySyncScheduler,
  ],
})
export class UserDirectorySyncModule {}
