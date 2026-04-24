export type ExternalUserRow = {
  id: string;
  name: string;
  email: string;
  balance: number;
};

export type ExternalUsersResponse = {
  users: ExternalUserRow[];
};

/**
 * Single-user GET response (e.g. `GET /api/users/usr_001`).
 * Body shape: `{ "user": { "id", "name", "email", "balance" } }`.
 */
export type ExternalSingleUserResponse = {
  user: ExternalUserRow;
};
