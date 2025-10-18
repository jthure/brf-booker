import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";

// AWS Cognito configuration
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
};

// Initialize Cognito User Pool
export const userPool = new CognitoUserPool(poolData);

// Initialize Cognito Client
export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
});

// Helper function to get current user
export const getCurrentUser = () => {
  return userPool.getCurrentUser();
};

// Helper function to sign in
export const signIn = async (email: string, password: string) => {
  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const userData = {
    Username: email,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

// Helper function to sign out
export const signOut = () => {
  const user = getCurrentUser();
  if (user) {
    user.signOut();
  }
};

// Helper function to get user attributes
export const getUserAttributes = async () => {
  const user = getCurrentUser();
  if (!user) return null;

  return new Promise((resolve, reject) => {
    user.getSession((err: any, session: any) => {
      if (err) {
        reject(err);
        return;
      }

      user.getUserAttributes((err: any, attributes: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(attributes);
      });
    });
  });
}; 
