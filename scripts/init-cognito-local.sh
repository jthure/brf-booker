#!/bin/bash

# Wait for cognito-local to be ready
echo "Waiting for cognito-local to be ready..."
until curl -s http://localhost:9229/health | grep "ok"; do
  sleep 2
done

echo "cognito-local is ready. Creating Cognito resources..."

# Create User Pool
USER_POOL_ID=$(aws --endpoint-url=http://localhost:9229 cognito-idp create-user-pool \
  --pool-name brf-booker-local \
  --username-attributes email \
  --auto-verified-attributes email \
  --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireLowercase":true,"RequireNumbers":true,"RequireSymbols":true,"RequireUppercase":true}}' \
  --schema '[{"AttributeDataType":"String","Name":"email","Required":true,"Mutable":true},{"AttributeDataType":"String","Name":"name","Required":true,"Mutable":true},{"AttributeDataType":"Boolean","Name":"isAdmin","Required":false,"Mutable":true},{"AttributeDataType":"Boolean","Name":"email_verified","Required":false,"Mutable":true}]' \
  --query 'UserPool.Id' \
  --output text)

echo "Created User Pool with ID: $USER_POOL_ID"

# Create App Client with simplified configuration
CLIENT_ID=$(aws --endpoint-url=http://localhost:9229 cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name brf-booker-local-client \
  --generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH \
  --query 'UserPoolClient.ClientId' \
  --output text)

echo "Created App Client with ID: $CLIENT_ID"

# Create a test user with required attributes and delivery medium
aws --endpoint-url=http://localhost:9229 cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username test@example.com \
  --temporary-password "Test123!" \
  --user-attributes Name=email,Value=test@example.com Name=email_verified,Value=true Name=name,Value="Test User" Name=isAdmin,Value=true \
  --desired-delivery-mediums EMAIL \
  --message-action SUPPRESS

echo "Created test user: test@example.com with temporary password: Test123!"

# Create .env.local file with Cognito configuration
cat > .env.local << EOL
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID=$CLIENT_ID
NEXT_PUBLIC_AWS_REGION=local
NEXT_PUBLIC_COGNITO_ENDPOINT=http://localhost:9229
EOL

echo "Created .env.local file with Cognito configuration" 
