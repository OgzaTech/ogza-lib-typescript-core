// Token yanıtı (Login olunca dönen obje)
export interface IAuthResponse {
  accessToken: string;
  refreshToken?: string; // Opsiyonel
  expiresIn: number;     // Saniye cinsinden
  tokenType: string;     // Genelde 'Bearer'
}