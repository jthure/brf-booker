resource "aws_cognito_user_pool" "brf_booker" {
  name = "brf-booker-user-pool"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 3
      max_length = 256
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "name"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type = "Boolean"
    name                = "isAdmin"
    required            = false
    mutable             = true
  }

  schema {
    attribute_data_type = "Boolean"
    name                = "email_verified"
    required            = false
    mutable             = true
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your verification code"
    email_message        = "Your verification code is {####}"
  }

  tags = {
    Environment = var.environment
    Project     = "brf-booker"
  }
}

resource "aws_cognito_user_pool_client" "brf_booker_client" {
  name = "brf-booker-client"

  user_pool_id = aws_cognito_user_pool.brf_booker.id

  generate_secret     = false
  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH"]

  # Remove OAuth-specific configurations as they're not needed for USER_PASSWORD_AUTH
  # allowed_oauth_flows = []
  # allowed_oauth_flows_user_pool_client = false
  # allowed_oauth_scopes = []
  # callback_urls = []
  # logout_urls = []
  # supported_identity_providers = []

  # Enable token-based authentication
  prevent_user_existence_errors = "ENABLED"
  enable_token_revocation       = true

  # Token validity
  access_token_validity  = 24
  id_token_validity      = 24
  refresh_token_validity = 1460

  # Password policy
  read_attributes = [
    "email",
    "custom:email_verified",
    "custom:isAdmin",
    "name"
  ]

  write_attributes = [
    "email",
    "custom:isAdmin",
    "name"
  ]
}

resource "aws_cognito_user_pool_domain" "brf_booker_domain" {
  domain       = "brf-booker-${var.environment}"
  user_pool_id = aws_cognito_user_pool.brf_booker.id
}

# Output the Cognito configuration
output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.brf_booker.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.brf_booker_client.id
}

output "cognito_domain" {
  value = aws_cognito_user_pool_domain.brf_booker_domain.domain
}
