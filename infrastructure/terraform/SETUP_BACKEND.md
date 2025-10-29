# 🚀 Setup de Backend Remoto (Terraform Cloud)

## ❗ Por Qué Es Necesario

Sin un backend remoto:
- ❌ GitHub Actions NO puede mantener el state entre ejecuciones
- ❌ Cada workflow intenta crear recursos que ya existen
- ❌ No puedes colaborar con el equipo (cada uno tiene su propio state)

Con Terraform Cloud:
- ✅ State compartido y seguro
- ✅ GitHub Actions funciona correctamente
- ✅ Gratis para equipos pequeños
- ✅ UI para ver el state y cambios

## 📋 Paso 1: Crear Cuenta en Terraform Cloud

1. Ve a https://app.terraform.io/signup
2. Crea una cuenta (usa tu email de GitHub)
3. Verifica tu email

## 📋 Paso 2: Crear Organización y Workspace

1. En Terraform Cloud, crea una nueva organización:
   - Nombre sugerido: `plataforma-pagos-team` (o el que prefieras)
   - Plan: Free (es suficiente)

2. Crea un nuevo workspace:
   - Click en "New Workspace"
   - Tipo: **"CLI-driven workflow"** (importante!)
   - Nombre: `plataforma-pagos-vercel`
   - Description: "Gestión de proyectos Vercel"

3. En el workspace, ve a Settings:
   - **Execution Mode**: Remote (default)
   - **Apply Method**: Manual Apply (recomendado para empezar)

## 📋 Paso 3: Generar API Token

1. En Terraform Cloud, click en tu avatar (arriba a la derecha)
2. User Settings → Tokens
3. "Create an API token"
   - Description: "GitHub Actions Token"
   - Expiration: 90 days (o el que prefieras)
4. **COPIA EL TOKEN** (solo se muestra una vez)

## 📋 Paso 4: Configurar GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Agrega estos secrets:

| Secret Name | Valor | Descripción |
|-------------|-------|-------------|
| `TF_API_TOKEN` | (token de Terraform Cloud) | Para acceder al backend remoto |
| `VERCEL_API_TOKEN` | (token de Vercel) | Para gestionar recursos en Vercel |

## 📋 Paso 5: Actualizar backend.tf

Edita `infrastructure/terraform/backend.tf`:

```hcl
terraform {
  cloud {
    organization = "plataforma-pagos-team"  # CAMBIAR por tu org
    workspaces {
      name = "plataforma-pagos-vercel"
    }
  }
}
```

**Cambia** `"plataforma-pagos-team"` por el nombre de tu organización de Terraform Cloud.

## 📋 Paso 6: Inicializar y Migrar State

En tu máquina local:

```bash
cd infrastructure/terraform

# Login a Terraform Cloud
terraform login

# Reinicializar con el nuevo backend
terraform init

# Te preguntará si quieres migrar el state local al remoto
# Responde: yes

# Si NO tenías state local, simplemente inicializa
```

## 📋 Paso 7: Importar Proyectos de Vercel Existentes

Primero, obtén los IDs de los proyectos:

```bash
# Configura tu token de Vercel
export VERCEL_API_TOKEN="tu-token-vercel"

# Obtén los IDs
curl -H "Authorization: Bearer $VERCEL_API_TOKEN" \
  "https://api.vercel.com/v9/projects" | jq '.projects[] | {name: .name, id: .id}'
```

O usa el script helper:

```bash
chmod +x get-project-ids.sh
./get-project-ids.sh
```

Luego importa los proyectos:

```bash
# Configura las variables necesarias
export TF_VAR_vercel_api_token="tu-token-vercel"

# Importa el proyecto API
terraform import vercel_project.api prj_XXXXXXXXXXXXX

# Importa el proyecto Web
terraform import vercel_project.web prj_YYYYYYYYYYY
```

Reemplaza `prj_XXXXXXXXXXXXX` y `prj_YYYYYYYYYYY` con los IDs reales.

## 📋 Paso 8: Verificar que Todo Funciona

```bash
# Plan con preview
terraform plan -var-file="environments/preview.tfvars"

# Debería mostrar:
# No changes. Your infrastructure matches the configuration.
```

Si muestra cambios, revisa que:
- Los proyectos estén correctamente importados
- Los valores en los .tfvars coincidan con lo que está en Vercel

## 📋 Paso 9: Push de Cambios

```bash
git add backend.tf
git commit -m "feat: Configure Terraform Cloud backend"
git push origin terraform
```

## 🎯 Verificar en GitHub Actions

1. Crea una PR de `terraform` a `develop`
2. El workflow debería:
   - ✅ Inicializar correctamente
   - ✅ Conectarse a Terraform Cloud
   - ✅ Ejecutar plan sin errores
   - ✅ NO intentar crear proyectos (porque ya están en el state)

## 🔍 Troubleshooting

### Error: "No valid credential sources found"
**Causa**: `TF_API_TOKEN` no está configurado en GitHub Secrets  
**Solución**: Agrega el secret en GitHub

### Error: "Workspace not found"
**Causa**: El workspace no existe o el nombre no coincide  
**Solución**: Verifica que el workspace existe en Terraform Cloud con el nombre exacto

### Error: "organization does not exist"
**Causa**: El nombre de la organización en backend.tf no coincide  
**Solución**: Actualiza backend.tf con el nombre correcto de tu org

### Error: "To link a GitHub repository, you need to install the GitHub integration first"
**Causa**: Los proyectos no están importados en el state  
**Solución**: Sigue el Paso 7 para importar los proyectos

### Los proyectos no aparecen en el state
**Causa**: No ejecutaste `terraform import`  
**Solución**: Ejecuta los comandos de import del Paso 7

## 📊 Verificar State en Terraform Cloud

1. Ve a tu workspace en Terraform Cloud
2. Click en "States"
3. Deberías ver el state con los 2 proyectos importados

## ✅ Checklist Final

- [ ] Cuenta en Terraform Cloud creada
- [ ] Organización creada
- [ ] Workspace "plataforma-pagos-vercel" creado (CLI-driven)
- [ ] API token generado
- [ ] `TF_API_TOKEN` agregado a GitHub Secrets
- [ ] `VERCEL_API_TOKEN` agregado a GitHub Secrets
- [ ] `backend.tf` actualizado con tu organización
- [ ] `terraform init` ejecutado localmente
- [ ] `terraform login` completado
- [ ] Proyectos importados (`vercel_project.api` y `vercel_project.web`)
- [ ] `terraform plan` muestra "No changes"
- [ ] Cambios pusheados a GitHub
- [ ] Workflow de GitHub Actions funciona correctamente

## 🎉 ¡Listo!

Una vez completados todos estos pasos, tu configuración de Terraform estará lista para CI/CD y podrás:
- Hacer PRs de develop a main sin errores
- Terraform validará y aplicará cambios correctamente
- El state estará sincronizado entre local y GitHub Actions

