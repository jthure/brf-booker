# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "brf-booker-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "brf-booker-ecs-cluster"
  }
}

# CloudWatch Log Group for ECS Tasks
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/brf-booker"
  retention_in_days = 30

  tags = {
    Name = "brf-booker-ecs-logs"
  }
}

# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution" {
  name = "brf-booker-ecs-task-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "brf-booker-ecs-task-execution"
  }
}

# Attach the AWS managed policy for ECS task execution
resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Attach the SSM access policy to the task execution role
resource "aws_iam_role_policy_attachment" "ssm_access_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = aws_iam_policy.ssm_access.arn
}

# ECS Task Role (for application permissions)
resource "aws_iam_role" "ecs_task" {
  name = "brf-booker-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "brf-booker-ecs-task"
  }
}

# Policy to allow ECS tasks to access SSM Parameter Store
resource "aws_iam_policy" "ssm_access" {
  name        = "brf-booker-ssm-access"
  description = "Allow access to SSM parameters for brf-booker"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:ssm:${var.aws_region}:*:parameter/${var.environment}/brf-booker/*"
      }
    ]
  })
}

# Attach the SSM access policy to the task role
resource "aws_iam_role_policy_attachment" "ssm_access" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = aws_iam_policy.ssm_access.arn
}

# ECS Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = "brf-booker-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["EC2"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "brf-booker-app"
      image     = "${aws_ecr_repository.app.repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        }
      ]
      
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_ssm_parameter.database_url.arn
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      # healthCheck = {
      #   command     = ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"]
      #   interval    = 30
      #   timeout     = 5
      #   retries     = 3
      #   startPeriod = 60
      # }
    }
  ])

  tags = {
    Name = "brf-booker-app-task"
  }
}

# ECS Task Definition for Database Migrations
resource "aws_ecs_task_definition" "migrations" {
  family                   = "brf-booker-migrations"
  network_mode             = "awsvpc"
  requires_compatibilities = ["EC2"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "migrations"
      image     = "${aws_ecr_repository.app.repository_url}:latest"
      essential = true
      
      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        }
      ]
      
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_ssm_parameter.database_url.arn
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "migrations"
        }
      }
      
      command = ["npx", "prisma", "migrate", "deploy"]
    }
  ])

  tags = {
    Name = "brf-booker-migrations-task"
  }
}

# ECS Service
resource "aws_ecs_service" "app" {
  name            = "brf-booker-app"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "EC2"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "brf-booker-app"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.app]

  tags = {
    Name = "brf-booker-app-service"
  }
}

# Security Group for ECS Tasks
resource "aws_security_group" "ecs" {
  name        = "brf-booker-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "Allow traffic from ALB"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name = "brf-booker-ecs-sg"
  }
}

# IAM Role for ECS EC2 Instances
resource "aws_iam_role" "ecs_instance" {
  name = "brf-booker-ecs-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "brf-booker-ecs-instance-role"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_instance" {
  role       = aws_iam_role.ecs_instance.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_instance" {
  name = "brf-booker-ecs-instance-profile"
  role = aws_iam_role.ecs_instance.name
}

# Launch Template for ECS EC2 Instances
resource "aws_launch_template" "ecs_ec2" {
  name_prefix   = "brf-booker-ecs-ec2-"
  image_id      = data.aws_ami.ecs_optimized.id
  instance_type = var.ecs_instance_type
  # key_name      = var.ecs_ec2_key_name

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_instance.name
  }

  network_interfaces {
    security_groups = [aws_security_group.ec2.id]
    associate_public_ip_address = false
  }

  user_data = base64encode(<<EOF
#!/bin/bash
echo ECS_CLUSTER=${aws_ecs_cluster.main.name} >> /etc/ecs/ecs.config
EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "brf-booker-ecs-ec2"
    }
  }
}

# Auto Scaling Group for ECS EC2 Instances
resource "aws_autoscaling_group" "ecs_ec2" {
  name                      = "brf-booker-ecs-ec2-asg"
  min_size                  = var.ecs_asg_min_size
  max_size                  = var.ecs_asg_max_size
  desired_capacity          = var.ecs_asg_desired_capacity
  vpc_zone_identifier       = aws_subnet.private[*].id
  health_check_type         = "EC2"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.ecs_ec2.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "brf-booker-ecs-ec2"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
} 
