terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.3"
    }
  }
}

provider "vercel" {
  # El team_id se configura como variable de entorno VERCEL_TEAM_ID
  # o se pasa como variable en terraform.tfvars
}

variable "vercel_team_id" {
  description = "ID del team de Vercel"
  type        = string
}

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "plataforma-pagos-daii"
}

variable "environment" {
  description = "Entorno de despliegue (production, preview, development)"
  type        = string
  default     = "production"
}

variable "branch" {
  description = "Rama de Git para el despliegue"
  type        = string
  default     = "main"
}

resource "vercel_project" "api" {
  name    = var.environment == "production" ? "${var.project_name}-api" : "${var.project_name}-api-${var.environment}"
  team_id = var.vercel_team_id

  framework = "nextjs"

  build_command    = "cd apps/api && bun run build"
  output_directory = "apps/api/.next"
  root_directory   = "apps/api"

  git_repository = {
    type = "github"
    repo = "rbianucci/plataforma-pagos-daii"
  }
}

resource "vercel_project" "web" {
  name    = var.environment == "production" ? "${var.project_name}-web" : "${var.project_name}-web-${var.environment}"
  team_id = var.vercel_team_id

  framework = "create-react-app"

  build_command    = "cd apps/web && pnpm run build"
  output_directory = "apps/web/build"
  root_directory   = "apps/web"

  git_repository = {
    type = "github"
    repo = "rbianucci/plataforma-pagos-daii"
  }
}

# Variables de entorno para la API
resource "vercel_project_environment_variable" "api_node_env" {
  project_id = vercel_project.api.id
  key        = "NODE_ENV"
  value      = var.environment == "production" ? "production" : "development"
  target     = ["production", "preview"]
}

resource "vercel_project_environment_variable" "api_environment" {
  project_id = vercel_project.api.id
  key        = "ENVIRONMENT"
  value      = var.environment
  target     = ["production", "preview"]
}

# Variables de entorno para la Web
resource "vercel_project_environment_variable" "web_node_env" {
  project_id = vercel_project.web.id
  key        = "NODE_ENV"
  value      = var.environment == "production" ? "production" : "development"
  target     = ["production", "preview"]
}

resource "vercel_project_environment_variable" "web_environment" {
  project_id = vercel_project.web.id
  key        = "ENVIRONMENT"
  value      = var.environment
  target     = ["production", "preview"]
}
