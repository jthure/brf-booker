import { config } from 'dotenv';
import { resolve } from 'path';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const client = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "local",
  endpoint: process.env.NEXT_PUBLIC_COGNITO_ENDPOINT || "http://localhost:9229",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local"
  }
});

async function createTestUser(email: string, password: string, name: string, isAdmin: boolean = false) {
  if (!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID) {
    throw new Error("NEXT_PUBLIC_COGNITO_USER_POOL_ID is not set in .env.local");
  }

  try {
    // Create the user
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
      Username: email,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "email_verified", Value: "true" },
        { Name: "name", Value: name },
        { Name: "isAdmin", Value: isAdmin.toString() },
      ],
      DesiredDeliveryMediums: ["EMAIL"],
      MessageAction: "SUPPRESS",
    });

    const createUserResponse = await client.send(createUserCommand);
    console.log("User created:", createUserResponse.User?.Username);

    // Set permanent password
    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
      Username: email,
      Password: password,
      Permanent: true,
    });

    await client.send(setPasswordCommand);
    console.log("Password set successfully");

    return createUserResponse.User;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Example usage
if (require.main === module) {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4];
  const isAdmin = process.argv[5] === "true";

  if (!email || !password || !name) {
    console.error("Usage: ts-node create-test-user.ts <email> <password> <name> [isAdmin]");
    process.exit(1);
  }

  createTestUser(email, password, name, isAdmin)
    .then(() => console.log("User created successfully"))
    .catch((error) => console.error("Failed to create user:", error));
} 
