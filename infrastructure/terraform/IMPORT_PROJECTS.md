# 🚀 Importar Proyectos de Vercel - Paso a Paso

Ya tenés configurado:
- ✅ Organización: `plataforma-pagos-daii`
- ✅ Workspace: `plataforma-pagos-vercel`
- ✅ `backend.tf` actualizado

## 📋 Paso 1: Generar API Token de Terraform Cloud

1. Ve a Terraform Cloud: https://app.terraform.io
2. Click en tu avatar → User Settings → Tokens
3. "Create an API token"
   - Description: "Local CLI + GitHub Actions"
   - Expiration: 90 days (o sin expiración)
4. **COPIA EL TOKEN** y guárdalo

## 📋 Paso 2: Agregar Token a GitHub Secrets

1. Ve a tu repo: https://github.com/rbianucci/plataforma-pagos-daii
2. Settings → Secrets and variables → Actions
3. "New repository secret"
   - Name: `TF_API_TOKEN`
   - Value: (el token que copiaste)
4. Verificar que también existe: `VERCEL_API_TOKEN`

## 📋 Paso 3: Login a Terraform Cloud (Local)

Abrí PowerShell en la carpeta del proyecto:

```powershell
cd infrastructure/terraform

# Login a Terraform Cloud
terraform login
```

Te va a abrir el navegador. Logueate y vuelve a la terminal.

## 📋 Paso 4: Reinicializar Terraform

```powershell
# Si tenés un .terraform/ anterior, borralo
Remove-Item -Recurse -Force .terraform -ErrorAction SilentlyContinue
Remove-Item terraform.tfstate* -ErrorAction SilentlyContinue

# Reinicializar con el backend de Terraform Cloud
terraform init
```

Debería decir: "Terraform has been successfully initialized!"

## 📋 Paso 5: Obtener IDs de Proyectos de Vercel

Opción A - Usando curl:
```powershell
# Configurar token
$env:VERCEL_API_TOKEN = "tu-vercel-token-aqui"

# Obtener proyectos
curl -H "Authorization: Bearer $env:VERCEL_API_TOKEN" "https://api.vercel.com/v9/projects"
```

Opción B - Desde Vercel Dashboard:
1. Ve a https://vercel.com/dashboard
2. Click en cada proyecto
3. Settings → General → Project ID

**BUSCA ESTOS NOMBRES:**
- `plataforma-pagos-daii` → Project ID: `prj_XXXXX`
- `plataforma-pagos-daii-web` → Project ID: `prj_YYYYY`

## 📋 Paso 6: Importar Proyectos

```powershell
# Configurar token de Vercel
$env:TF_VAR_vercel_api_token = "tu-vercel-token-aqui"

# Importar proyecto API (REEMPLAZA prj_XXXXX con el ID real)
terraform import vercel_project.api prj_XXXXXXXXXXXXX

# Importar proyecto Web (REEMPLAZA prj_YYYYY con el ID real)
terraform import vercel_project.web prj_YYYYYYYYYYY
```

**Ejemplo real:**
```powershell
terraform import vercel_project.api prj_abc123def456
terraform import vercel_project.web prj_xyz789ghi012
```

## 📋 Paso 7: Verificar Importación

```powershell
# Ver qué hay en el state
terraform state list

# Deberías ver:
# vercel_project.api
# vercel_project.web
```

## 📋 Paso 8: Hacer Plan

```powershell
# Plan con preview
terraform plan -var-file="environments/preview.tfvars"

# Debería decir:
# Plan: X to add, 0 to change, 0 to destroy.
# (Solo las variables de entorno, no los proyectos)
```

Si dice que va a crear los proyectos (`+ create vercel_project.api`), significa que **NO se importaron correctamente**. Repetí el Paso 6.

## 📋 Paso 9: Aplicar Variables de Entorno (Opcional)

Si querés aplicar las variables de entorno en preview:

```powershell
terraform apply -var-file="environments/preview.tfvars"
```

Debería crear solo las variables de entorno, **NO los proyectos**.

## 📋 Paso 10: Commit y Push

```powershell
cd ../..  # Volver a la raíz del repo
git add infrastructure/terraform/backend.tf
git commit -m "fix: Update backend.tf with correct organization name"
git push origin terraform
```

## ✅ Verificación Final

En Terraform Cloud:
1. Ve a tu workspace: https://app.terraform.io/app/plataforma-pagos-daii/workspaces/plataforma-pagos-vercel
2. Click en "States"
3. Deberías ver el state con los recursos importados

En GitHub:
1. Crea una PR de `terraform` a `develop`
2. El workflow debería ejecutarse sin errores
3. NO debería intentar crear proyectos

## 🚨 Troubleshooting

### Error: "No valid credential sources found"
```powershell
# Hacer login de nuevo
terraform login
```

### Error: "resource already exists in state"
El proyecto ya está importado. Todo bien! Seguí al siguiente paso.

### Error: "Cannot import non-existent remote object"
El Project ID es incorrecto. Verificá el ID en Vercel Dashboard.

### Plan quiere crear proyectos nuevos
Los proyectos no se importaron. Repetí el Paso 6 con los IDs correctos.

## 📞 Necesitás Ayuda?

Si algo falla, mandame:
1. El comando que ejecutaste
2. El error completo
3. El output de `terraform state list`

