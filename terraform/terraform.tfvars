# AWS Region
aws_region = "eu-north-1"  # Stockholm region, adjust as needed

# Environment
environment = "dev"  # dev, staging, prod

# Database Configuration
db_name     = "brf_booker"
db_username = "postgres"
db_password = "your-secure-password-here"  # Replace with a secure password

# VPC Configuration
vpc_cidr = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.3.0/24", "10.0.4.0/24"]

# ECS Configuration
ecs_cpu          = 256
ecs_memory       = 512
ecs_desired_count = 1
app_port         = 3000

# ALB Configuration
alb_health_check_path                = "/api/health"
alb_health_check_interval            = 30
alb_health_check_timeout             = 5
alb_health_check_healthy_threshold   = 2
alb_health_check_unhealthy_threshold = 3

# Certificate ARN for HTTPS (uncomment when you have a certificate)
# certificate_arn = "arn:aws:acm:region:account:certificate/certificate-id" 
