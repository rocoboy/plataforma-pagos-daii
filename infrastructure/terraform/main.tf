terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }
}

provider "vercel" {
  # El token se obtiene de la variable de entorno VERCEL_API_TOKEN
}

# Importar proyecto existente para backend (API)
# Comando para importar: terraform import vercel_project.api <project_id>
resource "vercel_project" "api" {
  name = "plataforma-pagos-daii"

  framework        = "nextjs"
  root_directory   = "apps/api"
  build_command    = "cd apps/api && bun run build"
  output_directory = "apps/api/.next"

  git_repository = {
    type = "github"
    repo = "rbianucci/plataforma-pagos-daii"
  }

  vercel_authentication = {
    deployment_type    = "none"
    protect_production = false
  }
}

# Importar proyecto existente para frontend (Web)
# Comando para importar: terraform import vercel_project.web <project_id>
resource "vercel_project" "web" {
  name = "plataforma-pagos-daii-web"

  framework        = "create-react-app"
  root_directory   = "apps/web"
  build_command    = "cd apps/web && pnpm run build"
  output_directory = "apps/web/build"

  git_repository = {
    type = "github"
    repo = "rbianucci/plataforma-pagos-daii"
  }

  vercel_authentication = {
    deployment_type    = "none"
    protect_production = false
  }
}

# Variables de entorno para API
resource "vercel_project_environment_variable" "api_node_env" {
  project_id = vercel_project.api.id
  key        = "NODE_ENV"
  value      = var.api_node_env
  target     = ["preview", "production"]
}

resource "vercel_project_environment_variable" "api_environment" {
  project_id = vercel_project.api.id
  key        = "ENVIRONMENT"
  value      = var.api_environment
  target     = ["preview", "production"]
}

# Variables de entorno para Web
resource "vercel_project_environment_variable" "web_node_env" {
  project_id = vercel_project.web.id
  key        = "NODE_ENV"
  value      = var.web_node_env
  target     = ["preview", "production"]
}

resource "vercel_project_environment_variable" "web_environment" {
  project_id = vercel_project.web.id
  key        = "ENVIRONMENT"
  value      = var.web_environment
  target     = ["preview", "production"]
}

