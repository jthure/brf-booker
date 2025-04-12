variable "aws_region" {
  description = "The AWS region to deploy resources"
  type        = string
  default     = "eu-north-1"  # Stockholm region, adjust as needed
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for the public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for the private subnets"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "db_name" {
  description = "Name of the PostgreSQL database"
  type        = string
  default     = "brf_booker"
}

variable "db_username" {
  description = "Username for the PostgreSQL database"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "db_password" {
  description = "Password for the PostgreSQL database"
  type        = string
  default     = null  # Should be set via terraform.tfvars or environment variable
  sensitive   = true
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
  default     = null  # Should be set via terraform.tfvars or environment variable
}

# ECS Configuration
variable "ecs_cpu" {
  description = "CPU units for the ECS task (1024 = 1 vCPU)"
  type        = number
  default     = 256
}

variable "ecs_memory" {
  description = "Memory for the ECS task (in MiB)"
  type        = number
  default     = 512
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

variable "app_port" {
  description = "Port on which the application listens"
  type        = number
  default     = 3000
}

# ALB Configuration
variable "alb_health_check_path" {
  description = "Path for the ALB health check"
  type        = string
  default     = "/api/health"
}

variable "alb_health_check_interval" {
  description = "Interval for the ALB health check (in seconds)"
  type        = number
  default     = 30
}

variable "alb_health_check_timeout" {
  description = "Timeout for the ALB health check (in seconds)"
  type        = number
  default     = 5
}

variable "alb_health_check_healthy_threshold" {
  description = "Healthy threshold for the ALB health check"
  type        = number
  default     = 2
}

variable "alb_health_check_unhealthy_threshold" {
  description = "Unhealthy threshold for the ALB health check"
  type        = number
  default     = 3
}

# Certificate ARN for HTTPS (uncomment when you have a certificate)
# variable "certificate_arn" {
#   description = "ARN of the ACM certificate for HTTPS"
#   type        = string
#   default     = null
# } 
