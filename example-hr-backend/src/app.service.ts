import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}

  async getHealth(): Promise<{
    status: string;
    service: string;
    database: boolean;
  }> {
    await this.sequelize.authenticate();
    return { status: 'ok', service: 'example-hr-backend', database: true };
  }
}
