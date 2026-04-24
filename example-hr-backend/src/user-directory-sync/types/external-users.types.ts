export type ExternalUserRow = {
  id: string;
  name: string;
  email: string;
  balance: number;
};

export type ExternalUsersResponse = {
  users: ExternalUserRow[];
};
