# Terraform Configuration for Vercel Projects

Esta configuración de Terraform gestiona **completamente** los proyectos de Vercel para la plataforma de pagos.

## Proyectos

- **Backend (API)**: `plataforma-pagos-daii`
- **Frontend (Web)**: `plataforma-pagos-daii-web`

Cada proyecto tiene dos ambientes: **preview** y **production**.

## ⚠️ Importante: Gestión con Terraform

Esta configuración asume que los proyectos **ya existen** en Vercel. Terraform los **importará** y luego los gestionará completamente. NO se deben hacer cambios manuales en Vercel después de importarlos.

## Requisitos Previos

1. **Instalar Terraform**: https://www.terraform.io/downloads
2. **Token de Vercel**: Obtener desde https://vercel.com/account/tokens
3. **Integración de GitHub en Vercel**: CRÍTICO - Debe estar instalada primero

## Configuración Inicial

### 1. Instalar la Integración de GitHub en Vercel (OBLIGATORIO)

**ESTE PASO ES OBLIGATORIO** antes de ejecutar Terraform:

1. Ve a https://vercel.com/dashboard
2. Ve a Settings → Integrations
3. Instala/configura la integración de **GitHub**
4. Da acceso al repositorio `rbianucci/plataforma-pagos-daii`

Sin este paso, Terraform fallará con: "To link a GitHub repository, you need to install the GitHub integration first"

### 2. Configurar Token de Vercel

```bash
export VERCEL_API_TOKEN="tu-token-aqui"
```

### 3. Importar Proyectos Existentes (CRÍTICO ANTES DEL PRIMER APPLY)

⚠️ **IMPORTANTE**: Si intentas hacer `terraform apply` sin importar primero, fallará intentando crear proyectos que ya existen.

```bash
cd infrastructure/terraform

# Configurar tu token de Vercel
export VERCEL_API_TOKEN="tu-token-de-vercel"

# Inicializar Terraform
terraform init

# Obtener los IDs de los proyectos automáticamente
chmod +x get-project-ids.sh
./get-project-ids.sh

# El script anterior te dará los comandos exactos, ejemplo:
terraform import vercel_project.api prj_xxxxxxxxxxxxx
terraform import vercel_project.web prj_yyyyyyyyyyyyy

# Después de importar, verificar que todo esté correcto
terraform plan

# Si el plan se ve bien, aplicar cambios
terraform apply
```

### 3.1 Para GitHub Actions (CI/CD)

El proceso de importación debe hacerse **una sola vez** de forma manual o en el primer workflow run. Después, el state de Terraform debe guardarse en un backend remoto (S3, Terraform Cloud, etc.) para que los workflows posteriores puedan usarlo.

**Opción 1: Backend Remoto (Recomendado para CI/CD)**
```hcl
# Agregar a main.tf
terraform {
  backend "s3" {
    bucket = "tu-bucket-terraform-state"
    key    = "vercel/terraform.tfstate"
    region = "us-east-1"
  }
}
```

**Opción 2: Usar Data Sources en lugar de Resources (Alternativa)**
Si no quieres gestionar el ciclo de vida de los proyectos, usa `data` sources en lugar de `resource`.

### 4. Obtener los IDs de los Proyectos

Puedes obtener los IDs de los proyectos usando la API de Vercel:

```bash
curl -H "Authorization: Bearer $VERCEL_API_TOKEN" \
  "https://api.vercel.com/v9/projects" | jq '.projects[] | {name: .name, id: .id}'
```

O directamente desde el dashboard de Vercel en: Settings → General → Project ID

## Variables de Entorno

Las variables de entorno se configuran en `variables.tf`. Para valores personalizados, crea un archivo `terraform.tfvars`:

```hcl
api_node_env     = "production"
api_environment  = "production"
web_node_env     = "production"
web_environment  = "production"
```

**Importante**: No subas el archivo `terraform.tfvars` al repositorio (está en `.gitignore`).

## Uso

```bash
# Ver cambios que se aplicarán
terraform plan

# Aplicar cambios
terraform apply

# Aplicar sin confirmación (usar con cuidado)
terraform apply -auto-approve

# Destruir recursos (solo variables de entorno, no los proyectos)
terraform destroy
```

## Notas Importantes

- Los proyectos de Vercel **ya existen** y se importan a Terraform, no se crean desde cero
- Terraform solo gestionará las variables de entorno y configuraciones
- Si necesitas recrear un proyecto, hazlo manualmente en Vercel y luego importa nuevamente

