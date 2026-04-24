import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { ExternalUsersResponse } from './types/external-users.types';

@Injectable()
export class ExternalUsersClient {
  constructor(private readonly http: HttpService) {}

  async fetchUsers(): Promise<ExternalUsersResponse['users']> {
    const base = process.env.USERS_SYNC_BASE_URL?.trim();
    if (!base) {
      throw new Error('USERS_SYNC_BASE_URL is not set');
    }
    // mock-hcm uses GET /api/users; override with USERS_SYNC_USERS_PATH (e.g. "users")
    const usersPath = (
      process.env.USERS_SYNC_USERS_PATH ?? '/users'
    ).replace(/^\/+/, '');

    const url = `${base.replace(/\/$/, '')}/${usersPath}`;
    console.log('url', url);
    const { data } = await firstValueFrom(
      this.http.get<ExternalUsersResponse>(url),
    );
    if (!data?.users || !Array.isArray(data.users)) {
      throw new Error('External API returned an invalid users payload');
    }
    return data.users;
  }
}
