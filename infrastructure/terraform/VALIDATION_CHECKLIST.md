# ✅ Checklist de Validación - Terraform + GitHub Actions

## 📋 Configuración Actual

### Archivos de Variables por Ambiente

- ✅ `environments/development.tfvars` → development
- ✅ `environments/preview.tfvars` → develop branch (preview)
- ✅ `environments/production.tfvars` → main branch (production)

### Variables Declaradas en `variables.tf`

- ✅ `vercel_api_token` (sensitive)
- ✅ `api_node_env` (sensitive)
- ✅ `api_environment` (sensitive)
- ✅ `web_node_env` (sensitive)
- ✅ `web_environment` (sensitive)

### Workflows de GitHub Actions

#### 1. `terraform-deploy.yml`
- **Triggers**: 
  - Push a `main` o `develop`
  - PR a `main` o `develop`
- **Comportamiento**:
  - Detecta automáticamente el ambiente
  - PRs → Solo `terraform plan` (validación)
  - Push → `terraform apply` (aplica cambios)
- **Archivos usados**:
  - PR/Push a `main` → `environments/production.tfvars`
  - PR/Push a `develop` → `environments/preview.tfvars`

#### 2. `terraform.yml`
- **Triggers**:
  - Push a `main` con cambios en `infrastructure/terraform/**`
  - PR a `main` con cambios en `infrastructure/terraform/**`
- **Comportamiento**:
  - Solo se ejecuta si hay cambios en archivos de Terraform
  - Siempre usa `environments/production.tfvars`

## 🔍 Matriz de Escenarios

| Acción | Branch Origen | Branch Destino | Workflow | Archivo .tfvars | Aplica Cambios |
|--------|---------------|----------------|----------|-----------------|----------------|
| PR | feature/* | develop | terraform-deploy.yml | preview.tfvars | ❌ No (solo plan) |
| Push | - | develop | terraform-deploy.yml | preview.tfvars | ✅ Sí |
| PR | develop | main | terraform-deploy.yml | production.tfvars | ❌ No (solo plan) |
| Push | - | main | terraform-deploy.yml | production.tfvars | ✅ Sí |
| PR (terraform) | feature/* | main | terraform.yml | production.tfvars | ❌ No (solo plan) |
| Push (terraform) | - | main | terraform.yml | production.tfvars | ✅ Sí |

## ✅ Validaciones Necesarias

### 1. Validar que todos los archivos están correctos

```bash
cd infrastructure/terraform

# Verificar que variables.tf tiene todas las variables
grep "variable" variables.tf

# Verificar que los archivos .tfvars existen
ls -la environments/*.tfvars

# Verificar contenido de cada archivo
cat environments/development.tfvars
cat environments/preview.tfvars
cat environments/production.tfvars
```

### 2. Validar Terraform localmente

```bash
cd infrastructure/terraform

# Inicializar
terraform init

# Validar sintaxis
terraform validate

# Plan con cada ambiente
export TF_VAR_vercel_api_token="your-token-here"

terraform plan -var-file="environments/development.tfvars"
terraform plan -var-file="environments/preview.tfvars"
terraform plan -var-file="environments/production.tfvars"
```

### 3. Validar GitHub Secrets

Verifica que estos secrets estén configurados en GitHub:
- `VERCEL_API_TOKEN` ✅

### 4. Validar Workflows

```bash
# Verificar sintaxis de workflows
cd .github/workflows
cat terraform-deploy.yml
cat terraform.yml
```

## 🚀 Testing del Flujo Completo

### Test 1: PR a develop
1. Crea un feature branch
2. Haz un cambio (ej: en environments/preview.tfvars)
3. Crea PR a develop
4. **Esperado**: 
   - ✅ Workflow `terraform-deploy.yml` se ejecuta
   - ✅ Usa `preview.tfvars`
   - ✅ Solo hace `plan`, NO aplica cambios

### Test 2: Merge a develop
1. Mergea la PR a develop
2. **Esperado**:
   - ✅ Workflow `terraform-deploy.yml` se ejecuta
   - ✅ Usa `preview.tfvars`
   - ✅ Aplica cambios con `terraform apply`
   - ✅ Variables de entorno se actualizan en Vercel

### Test 3: PR de develop a main
1. Crea PR de develop a main
2. **Esperado**:
   - ✅ Workflow `terraform-deploy.yml` se ejecuta
   - ✅ Usa `production.tfvars`
   - ✅ Solo hace `plan`, muestra qué se aplicará
   - ✅ NO aplica cambios aún

### Test 4: Merge a main
1. Mergea la PR a main
2. **Esperado**:
   - ✅ Workflow `terraform-deploy.yml` se ejecuta
   - ✅ Usa `production.tfvars`
   - ✅ Aplica cambios con `terraform apply`
   - ✅ Variables de entorno de PRODUCCIÓN se actualizan

### Test 5: Cambio en archivo de Terraform
1. Modifica `infrastructure/terraform/main.tf`
2. Crea PR a main
3. **Esperado**:
   - ✅ Workflow `terraform.yml` se ejecuta (por el path filter)
   - ✅ Usa `production.tfvars`
   - ✅ Solo hace `plan`

## ⚠️ Problemas Comunes y Soluciones

### Problema 1: "Value for undeclared variable"
**Causa**: Archivo .tfvars tiene una variable que no está en variables.tf  
**Solución**: Eliminar la variable del .tfvars o declararla en variables.tf

### Problema 2: "Unable to find api_token"
**Causa**: `TF_VAR_vercel_api_token` no está configurado  
**Solución**: Verificar que `VERCEL_API_TOKEN` existe en GitHub Secrets

### Problema 3: Workflow usa el ambiente incorrecto
**Causa**: Lógica de detección de ambiente incorrecta  
**Solución**: Revisar el step "Determine Environment" en los logs

### Problema 4: Variables no se actualizan en Vercel
**Causa**: Proyecto no está importado en Terraform state  
**Solución**: Importar proyecto con `terraform import`

## 📊 Estado Actual del Fix

### ✅ Completado
1. ✅ Declarada variable `vercel_api_token` en `variables.tf`
2. ✅ Configurado provider de Vercel para usar la variable
3. ✅ Actualizados archivos .tfvars con variables correctas
4. ✅ Actualizado workflow `terraform-deploy.yml` para usar archivos por ambiente
5. ✅ Actualizado workflow `terraform.yml` para consistencia
6. ✅ Agregado `deployment_type` a `vercel_authentication`
7. ✅ Eliminadas variables no declaradas de los .tfvars

### 🎯 Resultado Esperado
- ✅ PR a develop → Valida con preview.tfvars
- ✅ Push a develop → Aplica con preview.tfvars
- ✅ PR a main → Valida con production.tfvars
- ✅ Push a main → Aplica con production.tfvars

## 🔐 Secrets en GitHub (Recordatorio)

Solo necesitas **UN** secret:
- `VERCEL_API_TOKEN` → Tu token de API de Vercel

Las demás variables (NODE_ENV, ENVIRONMENT) vienen de los archivos .tfvars por ambiente.

