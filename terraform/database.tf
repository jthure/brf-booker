# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "brf-booker-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "brf-booker-db-subnet-group"
  }
}

# PostgreSQL DB Parameter Group
resource "aws_db_parameter_group" "postgres" {
  name   = "brf-booker-postgres-params"
  family = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  tags = {
    Name = "brf-booker-postgres-params"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "postgres" {
  identifier             = "brf-booker-db"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp2"
  storage_encrypted      = true
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  port                   = 5432
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.postgres.name
  publicly_accessible    = false
  skip_final_snapshot    = true
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"
  copy_tags_to_snapshot   = true
  
  # Enable deletion protection in production
  deletion_protection = var.environment == "prod" ? true : false

  tags = {
    Name = "brf-booker-postgres"
  }
}

# SSM Parameter Store for database connection string
resource "aws_ssm_parameter" "database_url" {
  name        = "/${var.environment}/brf-booker/DATABASE_URL"
  description = "PostgreSQL connection string for the brf-booker application"
  type        = "SecureString"
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${var.db_name}"

  tags = {
    Name = "brf-booker-database-url"
  }
} 
