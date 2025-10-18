export interface CognitoUser {
  username: string;
  email: string;
  name: string;
  isAdmin: boolean;
  email_verified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
} 
