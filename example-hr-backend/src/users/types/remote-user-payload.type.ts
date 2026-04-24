/** HCM / third-party user row used to upsert into our `User` model (keyed by `email`). */
export type RemoteUserPayload = {
  id: string;
  name: string;
  email: string;
  balance: number;
};
