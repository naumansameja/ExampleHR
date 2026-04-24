import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type {
  ExternalSingleUserResponse,
  ExternalUserRow,
  ExternalUsersResponse,
} from './types/external-users.types';

@Injectable()
export class ExternalUsersClient {
  constructor(private readonly http: HttpService) {}

  async fetchUsers(): Promise<ExternalUsersResponse['users']> {
    const { data } = await firstValueFrom(
      this.http.get<ExternalUsersResponse>(this.usersCollectionUrl()),
    );
    if (!data?.users || !Array.isArray(data.users)) {
      throw new Error('External API returned an invalid users payload');
    }
    return data.users;
  }

  /** GET `{collectionUrl}/{hcmId}` — same base path as the list endpoint + id. */
  async fetchUserByHcmId(hcmId: string): Promise<ExternalUserRow> {
    const url = `${this.usersCollectionUrl()}/${encodeURIComponent(hcmId)}`;
    const { data } = await firstValueFrom(
      this.http.get<ExternalSingleUserResponse>(url),
    );
    if (!data?.user || typeof data.user !== 'object') {
      throw new Error('External API returned an invalid single-user payload');
    }
    return data.user;
  }

  private usersCollectionUrl(): string {
    const base = process.env.USERS_SYNC_BASE_URL?.trim();
    if (!base) {
      throw new Error('USERS_SYNC_BASE_URL is not set');
    }
    const usersPath = (
      process.env.USERS_SYNC_USERS_PATH ?? 'api/users'
    ).replace(/^\/+/, '');
    return `${base.replace(/\/$/, '')}/${usersPath}`;
  }
}
