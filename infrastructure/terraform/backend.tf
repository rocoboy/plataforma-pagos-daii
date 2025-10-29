# Backend configuration para Terraform State
# 
# IMPORTANTE: El state de Terraform debe ser compartido entre todos los que ejecuten terraform.
# Para GitHub Actions, necesitas usar un backend remoto.

# Terraform Cloud Backend (Activo)
# INSTRUCCIONES:
# 1. Cambia "tu-organizacion" por el nombre de tu organización en Terraform Cloud
# 2. Asegúrate de que el workspace "plataforma-pagos-vercel" existe
# 3. Agrega TF_API_TOKEN como secret en GitHub Actions

terraform {
  cloud {
    organization = "tu-organizacion"  # CAMBIAR ESTO
    workspaces {
      name = "plataforma-pagos-vercel"
    }
  }
}

# NOTA: Una vez configurado el backend:
# 1. Ejecuta: terraform init (te pedirá autenticación)
# 2. Importa los proyectos existentes:
#    terraform import vercel_project.api prj_XXXXX
#    terraform import vercel_project.web prj_YYYYY
# 3. El state se guardará en Terraform Cloud automáticamente

