import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserDirectorySyncModule } from './user-directory-sync/user-directory-sync.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    UserDirectorySyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
