// Token'ın içinde şifrelenmiş olarak duracak veriler (Claims)
export interface ITokenPayload {
  id: string;
  email: string;
  role?: string;     // RBAC için
  tenantId?: string; // Multi-tenancy için
  iat?: number;      // Issued At (Oluşturulma zamanı)
  exp?: number;      // Expiration (Bitiş zamanı)
  type?: string;     // 'ACCESS', 'REFRESH', 'RESET_PASSWORD' vb.
  [key: string]: any; // Esneklik için index signature (İsteğe bağlı)
}