# Setup de Terraform para CI/CD

Este documento explica cómo configurar Terraform para que funcione en GitHub Actions.

## El Problema

Cuando ejecutas Terraform en GitHub Actions, cada ejecución es un entorno nuevo. Si no configuras un backend remoto:
- El archivo `terraform.tfstate` se pierde entre ejecuciones
- Terraform intenta crear recursos que ya existen
- Obtienes errores como: "resource already exists"

## La Solución: Backend Remoto

Necesitas un backend remoto para almacenar el state de Terraform. Hay varias opciones:

### Opción 1: Terraform Cloud (Recomendado - Gratis)

**Ventajas:**
- ✅ Gratis para equipos pequeños
- ✅ Fácil de configurar
- ✅ Incluye UI para ver el state
- ✅ Incluye remote execution

**Pasos:**

1. Crea una cuenta en https://app.terraform.io/
2. Crea una organización
3. Crea un workspace llamado `plataforma-pagos-vercel`
4. Genera un token de API
5. Agrega el token a GitHub Secrets: `TF_API_TOKEN`
6. Descomenta la configuración en `backend.tf`:

```hcl
terraform {
  cloud {
    organization = "tu-organizacion"
    workspaces {
      name = "plataforma-pagos-vercel"
    }
  }
}
```

7. En GitHub Actions, el workflow ya está configurado para usar el token

### Opción 2: AWS S3

**Ventajas:**
- ✅ Control total
- ✅ Integrado con AWS

**Desventajas:**
- ❌ Requiere cuenta AWS
- ❌ Puede tener costo (mínimo)
- ❌ Más complejo de configurar

**Pasos:**

1. Crea un bucket S3: `tu-bucket-terraform-state`
2. Crea una tabla DynamoDB para locking: `terraform-state-lock`
3. Crea un IAM user con permisos a S3 y DynamoDB
4. Agrega las credenciales a GitHub Secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
5. Descomenta la configuración en `backend.tf`
6. Modifica el workflow para configurar AWS credentials

## Importar State Inicial

Después de configurar el backend remoto, necesitas importar los proyectos existentes **UNA VEZ**:

```bash
# Configurar credenciales
export VERCEL_API_TOKEN="tu-token"

# Cambiar a directorio de terraform
cd infrastructure/terraform

# Inicializar con el backend remoto
terraform init

# Obtener IDs de proyectos
./get-project-ids.sh

# Importar proyectos (usar los IDs del comando anterior)
terraform import vercel_project.api prj_xxxxxxxxxxxxx
terraform import vercel_project.web prj_yyyyyyyyyyyyy

# Verificar
terraform plan

# Aplicar si todo se ve bien
terraform apply
```

Después de este paso inicial, GitHub Actions podrá ejecutar `terraform apply` sin problemas.

## GitHub Secrets Necesarios

Asegúrate de tener estos secrets configurados en tu repositorio:

- `VERCEL_API_TOKEN`: Token de Vercel
- `API_NODE_ENV`: Valor de NODE_ENV para API
- `API_ENVIRONMENT`: Valor de ENVIRONMENT para API
- `WEB_NODE_ENV`: Valor de NODE_ENV para Web
- `WEB_ENVIRONMENT`: Valor de ENVIRONMENT para Web
- `TF_API_TOKEN`: Token de Terraform Cloud (si usas Terraform Cloud)

## Workflow de Desarrollo

1. **PR a develop**: No ejecuta Terraform (solo build/test)
2. **PR de develop a main**: 
   - Ejecuta `terraform plan` (muestra cambios)
   - NO aplica cambios todavía
3. **Merge a main**: 
   - Ejecuta `terraform apply -auto-approve`
   - Aplica cambios automáticamente

## Troubleshooting

### Error: "resource already exists"
- Los proyectos no están importados en el state de Terraform
- Solución: Importar manualmente los proyectos

### Error: "GitHub integration not installed"
- La integración de GitHub no está instalada en Vercel
- Solución: Instalar desde https://vercel.com/dashboard/integrations

### Error: "failed to retrieve state"
- El backend remoto no está configurado o las credenciales son incorrectas
- Solución: Verificar configuración de backend y credenciales

