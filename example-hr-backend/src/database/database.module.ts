import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
// Feature modules: SequelizeModule.forFeature([YourModel]) + @InjectModel(YourModel)
import * as fs from 'fs';
import * as path from 'path';

const defaultStorage = path.join(process.cwd(), 'data', 'database.sqlite');

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: () => {
        const storage = process.env.SQLITE_STORAGE ?? defaultStorage;
        if (storage !== ':memory:') {
          fs.mkdirSync(path.dirname(storage), { recursive: true });
        }
        return {
          dialect: 'sqlite' as const,
          storage,
          autoLoadModels: true,
          synchronize: process.env.SEQUELIZE_SYNC !== 'false',
          define: { underscored: true },
          logging:
            process.env.SEQUELIZE_LOGGING === 'true' ? console.log : false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
