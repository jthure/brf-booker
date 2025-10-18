import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { CognitoUser as CognitoUserType, AuthTokens } from '@/types/auth';

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
};

const userPool = new CognitoUserPool(poolData);

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  endpoint: process.env.NEXT_PUBLIC_COGNITO_ENDPOINT,
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local"
  }
});

export async function signIn(email: string, password: string): Promise<AuthTokens> {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const accessToken = result.getAccessToken().getJwtToken();
        const idToken = result.getIdToken().getJwtToken();
        const refreshToken = result.getRefreshToken().getToken();

        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('idToken', idToken);
        localStorage.setItem('refreshToken', refreshToken);

        resolve({
          accessToken,
          idToken,
          refreshToken,
        });
      },
      onFailure: (err) => {
        console.error('Authentication failed:', err);
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // Handle new password requirement if needed
        reject(new Error('New password required'));
      },
    });
  });
}

export async function signOut() {
  // Clear tokens from localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('idToken');
  localStorage.removeItem('refreshToken');

  const user = userPool.getCurrentUser();
  if (user) {
    user.signOut();
  }
}

export async function getCurrentUser(): Promise<CognitoUserType | null> {
  return new Promise((resolve, reject) => {
    const user = userPool.getCurrentUser();
    if (!user) {
      resolve(null);
      return;
    }

    user.getSession((err: any, session: any) => {
      if (err) {
        reject(err);
        return;
      }

      if (!session.isValid()) {
        resolve(null);
        return;
      }

      user.getUserAttributes((err: any, attributes: any) => {
        if (err) {
          reject(err);
          return;
        }

        const userData = attributes.reduce((acc: any, attr: any) => {
          acc[attr.Name] = attr.Value;
          return acc;
        }, {});

        resolve({
          ...userData,
          username: user.getUsername(),
        } as CognitoUserType);
      });
    });
  });
}

export async function refreshSession(): Promise<AuthTokens> {
  return new Promise((resolve, reject) => {
    const user = userPool.getCurrentUser();
    if (!user) {
      reject(new Error("No user found"));
      return;
    }

    user.getSession((err: any, session: any) => {
      if (err) {
        reject(err);
        return;
      }

      if (!session.isValid()) {
        reject(new Error("Invalid session"));
        return;
      }

      user.refreshSession(session.getRefreshToken(), (err: any, session: any) => {
        if (err) {
          reject(err);
          return;
        }

        const accessToken = session.getAccessToken().getJwtToken();
        const idToken = session.getIdToken().getJwtToken();

        // Update tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('idToken', idToken);

        resolve({
          accessToken,
          idToken,
          refreshToken: session.getRefreshToken().getToken(),
        });
      });
    });
  });
}

// Helper function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    return false;
  }
} 
