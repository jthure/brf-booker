# BRF Booker - AWS Infrastructure

This directory contains Terraform configurations to provision AWS infrastructure for the BRF Booker application. The infrastructure includes:

- VPC with public and private subnets
- RDS PostgreSQL database
- ECS Fargate cluster for running the Next.js application
- ECR repository for storing Docker images
- Application Load Balancer (ALB) for routing traffic
- Security groups, IAM roles, and other supporting resources

## Prerequisites

1. [Terraform](https://www.terraform.io/downloads.html) (version >= 1.2.0)
2. [AWS CLI](https://aws.amazon.com/cli/) installed and configured with appropriate credentials
3. [Docker](https://www.docker.com/get-started) installed for building and pushing images
4. An SSH key pair registered with AWS (for EC2 access if needed)

## Getting Started

1. Copy the example variables file and customize it:

```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Edit `terraform.tfvars` and set the appropriate values for your environment.

3. Initialize Terraform:

```bash
terraform init
```

4. Plan the changes:

```bash
terraform plan
```

5. Apply the changes:

```bash
terraform apply
```

## Building and Pushing Docker Images

After the infrastructure is deployed, you can build and push your Docker image to ECR:

1. Authenticate Docker to your ECR registry:

```bash
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin $(terraform output -raw ecr_repository_url)
```

2. Build your Docker image:

```bash
docker build -t brf-booker-app .
```

3. Tag your image:

```bash
docker tag brf-booker-app:latest $(terraform output -raw ecr_repository_url):latest
```

4. Push your image to ECR:

```bash
docker push $(terraform output -raw ecr_repository_url):latest
```

## Important Notes

- The DB password is stored in `terraform.tfvars`. Make sure this file is not committed to version control.
- For production use, consider enabling the S3 backend (uncomment the backend block in `main.tf`).
- The ECS service is configured to use Fargate, which is serverless and doesn't require managing EC2 instances.
- The ALB is configured for HTTP by default. For production, uncomment and configure the HTTPS listener in `alb.tf`.
- Consider setting up a CI/CD pipeline (e.g., GitHub Actions, AWS CodePipeline) for automated deployments.

## Connecting to Resources

After deployment, you can access your resources:

- Next.js Application: Access via the ALB DNS name (http://[ALB_DNS_NAME])
- Database: The connection details are stored in AWS Systems Manager Parameter Store. Use the `database_url_parameter` output to retrieve the parameter name.
- ECR Repository: Use the `ecr_repository_url` output to get the URL of your ECR repository.

## Extending the Configuration

- For HTTPS support, uncomment and configure the HTTPS listener in `alb.tf` and add an ACM certificate.
- For scalability, adjust the `ecs_desired_count` variable or set up auto-scaling.
- For better deployment practices, consider using AWS ECS Blue/Green deployments.
- For monitoring, consider adding CloudWatch alarms and dashboards.

## Destroying Resources

To tear down the infrastructure:

```bash
terraform destroy
```

**⚠️ Warning**: This will destroy all resources managed by this Terraform configuration, including the database. Make sure to back up any important data before running this command. 
