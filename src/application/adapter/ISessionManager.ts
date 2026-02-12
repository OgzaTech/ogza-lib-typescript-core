import { Result } from '../../logic/Result';

export interface ISessionManager<UserType> {
  setSession(token: string, user: UserType): Promise<void>;
  getSession(): { token: string | null; user: UserType | null };
  clearSession(): Promise<void>;
  getToken(): string | null;
  isAuthenticated(): boolean;
}