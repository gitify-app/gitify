export interface LoginOAuthAppOptions {
  hostname: string;
  clientId: string;
  clientSecret: string;
}

export interface LoginPersonalAccessTokenOptions {
  hostname: string;
  token: string;
}

export interface AuthResponse {
  authCode: string;
  authOptions: LoginOAuthAppOptions;
}

export interface AuthTokenResponse {
  hostname: string;
  token: string;
}

export interface EnterpriseAccount {
  hostname: string;
  token: string;
}
