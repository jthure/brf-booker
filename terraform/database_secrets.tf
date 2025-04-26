# Generate a random password for the PostgreSQL database
resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
  lower            = true
  upper            = true
  numeric          = true
}

# Store the database password in SSM Parameter Store
resource "aws_ssm_parameter" "db_password" {
  name        = "/${var.environment}/brf-booker/DB_PASSWORD"
  description = "PostgreSQL database password for brf-booker"
  type        = "SecureString"
  value       = random_password.db_password.result

  tags = {
    Name        = "brf-booker-db-password"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Store the complete database URL in SSM Parameter Store
resource "aws_ssm_parameter" "database_url" {
  name        = "/${var.environment}/brf-booker/DATABASE_URL"
  description = "PostgreSQL connection string for brf-booker"
  type        = "SecureString"
  value       = "postgresql://${var.db_username}:${urlencode(random_password.db_password.result)}@${aws_db_instance.postgres.endpoint}/${var.db_name}"

  tags = {
    Name        = "brf-booker-database-url"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
} 
