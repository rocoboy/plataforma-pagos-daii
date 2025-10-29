# Gestión de Ambientes con Terraform

## 📋 Resumen

Este proyecto usa Terraform para gestionar las variables de entorno de los proyectos de Vercel. Los ambientes se manejan mediante archivos `.tfvars` separados.

## 🌍 Ambientes

### 1. Development (Local)
- **Archivo**: `environments/development.tfvars`
- **Uso**: Desarrollo local y testing
- **Variables**: `api_node_env=development`, `api_environment=development`, etc.

### 2. Preview (develop branch)
- **Archivo**: `environments/preview.tfvars`
- **Branch**: `develop`
- **Uso**: Pre-producción, testing de integración
- **Variables**: `api_node_env=preview`, `api_environment=preview`, etc.

### 3. Production (main branch)
- **Archivo**: `environments/production.tfvars`
- **Branch**: `main`
- **Uso**: Producción
- **Variables**: `api_node_env=production`, `api_environment=production`, etc.

## 🔄 Flujo de Trabajo (Workflow)

### Escenario 1: PR a `develop`
```
PR: feature/* → develop
Workflow: terraform-deploy.yml
Terraform: plan con environments/preview.tfvars
Resultado: Solo validación, NO aplica cambios
```

### Escenario 2: Push a `develop`
```
Push: develop
Workflow: terraform-deploy.yml
Terraform: apply con environments/preview.tfvars
Resultado: Aplica cambios en variables de ambiente PREVIEW de Vercel
```

### Escenario 3: PR de `develop` a `main`
```
PR: develop → main
Workflow: terraform-deploy.yml
Terraform: plan con environments/production.tfvars
Resultado: Solo validación, muestra qué cambios se aplicarán en producción
```

### Escenario 4: Merge a `main`
```
Push: main
Workflow: terraform-deploy.yml
Terraform: apply con environments/production.tfvars
Resultado: Aplica cambios en variables de ambiente PRODUCTION de Vercel
```

### Escenario 5: Cambios en `/infrastructure/terraform/**`
```
Push/PR: main (solo archivos terraform)
Workflow: terraform.yml (específico para infra)
Terraform: apply con environments/production.tfvars
Resultado: Solo se ejecuta si hay cambios en archivos de Terraform
```

## 🎯 Workflows

### `terraform-deploy.yml`
- **Triggers**: Push/PR a `main` o `develop`
- **Propósito**: Deploy principal para ambos ambientes
- **Lógica**: Detecta automáticamente el ambiente según el branch

### `terraform.yml`
- **Triggers**: Push/PR a `main` solo si hay cambios en `infrastructure/terraform/**`
- **Propósito**: Deploy específico cuando se modifican archivos de Terraform
- **Ambiente**: Siempre usa `production.tfvars`

## 📝 Ejemplo Completo

### Flujo típico de una feature:

1. **Developer crea feature branch y PR a develop**
   ```
   feature/nueva-funcionalidad → develop (PR)
   ✅ Terraform valida con preview.tfvars
   ```

2. **Merge a develop**
   ```
   develop (push)
   ✅ Terraform aplica cambios con preview.tfvars
   📦 Variables de entorno actualizadas en Vercel PREVIEW
   ```

3. **Después de testing, PR a main**
   ```
   develop → main (PR)
   ✅ Terraform valida con production.tfvars
   ℹ️ Muestra qué cambios se aplicarán en producción
   ```

4. **Merge a main**
   ```
   main (push)
   ✅ Terraform aplica cambios con production.tfvars
   🚀 Variables de entorno actualizadas en Vercel PRODUCTION
   ```

## ⚙️ Variables Configurables

Cada archivo `.tfvars` puede configurar:

- `api_node_env`: NODE_ENV para el proyecto API
- `api_environment`: ENVIRONMENT para el proyecto API
- `web_node_env`: NODE_ENV para el proyecto Web
- `web_environment`: ENVIRONMENT para el proyecto Web

## 🔐 Secrets Requeridos en GitHub

- `VERCEL_API_TOKEN`: Token de API de Vercel
- Se pasa como `TF_VAR_vercel_api_token` al workflow

## 🚨 Notas Importantes

1. **Los proyectos de Vercel son los mismos** para todos los ambientes
   - No se crean proyectos separados por ambiente
   - Vercel maneja automáticamente preview vs production según el branch

2. **Solo se gestionan variables de entorno**
   - Terraform NO crea/destruye proyectos
   - Solo actualiza las variables de entorno

3. **Los workflows detectan automáticamente el ambiente**
   - Basado en `github.base_ref` (para PRs)
   - Basado en `github.ref` (para pushes)

4. **Testing local**
   ```bash
   cd infrastructure/terraform
   
   # Preview
   terraform plan -var-file="environments/preview.tfvars"
   
   # Production
   terraform plan -var-file="environments/production.tfvars"
   ```

## 🔍 Troubleshooting

### Error: "No such file or directory: environments/X.tfvars"
- Verifica que el archivo existe
- Verifica que estás en el directorio `infrastructure/terraform`

### Variables no se actualizan en Vercel
- Verifica que el workflow completó exitosamente
- Verifica que tienes `VERCEL_API_TOKEN` configurado en GitHub Secrets
- Verifica que el proyecto existe en Vercel y está importado en Terraform

### Workflow usa el ambiente incorrecto
- Revisa el step "Determine Environment" en los logs del workflow
- Verifica que el branch base es correcto (develop o main)

