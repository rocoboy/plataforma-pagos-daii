# Backend configuration para Terraform State
# 
# IMPORTANTE: El state de Terraform debe ser compartido entre todos los que ejecuten terraform.
# Para GitHub Actions, necesitas usar un backend remoto.
#
# Opciones:
# 1. Terraform Cloud (Recomendado - Gratis para equipos pequeños)
# 2. AWS S3 + DynamoDB
# 3. Azure Storage
# 4. Google Cloud Storage
#
# DESCOMENTAR Y CONFIGURAR UNA DE LAS SIGUIENTES OPCIONES:

# Opción 1: Terraform Cloud (Recomendado)
# terraform {
#   cloud {
#     organization = "tu-organizacion"
#     workspaces {
#       name = "plataforma-pagos-vercel"
#     }
#   }
# }

# Opción 2: AWS S3
# terraform {
#   backend "s3" {
#     bucket         = "tu-bucket-terraform-state"
#     key            = "vercel/terraform.tfstate"
#     region         = "us-east-1"
#     encrypt        = true
#     dynamodb_table = "terraform-state-lock"
#   }
# }

# NOTA: Sin backend remoto, el state se guarda localmente y NO funcionará en CI/CD
# porque cada ejecución de GitHub Actions es un entorno nuevo sin el state anterior.

