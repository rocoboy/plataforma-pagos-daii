# Configuración de Terraform para Vercel

La configuración de Terraform se ha movido a `infrastructure/terraform/` para mejor organización.

## 📁 Nueva Estructura

```
infrastructure/
├── terraform/                     # Configuración de Terraform
│   ├── main.tf                   # Configuración principal
│   ├── environments/             # Configuraciones por entorno
│   │   ├── production.tfvars
│   │   ├── preview.tfvars
│   │   └── development.tfvars
│   ├── terraform.tfvars.example  # Plantilla de variables
│   └── README.md                 # Documentación específica
└── scripts/                      # Scripts de automatización
    ├── deploy.sh
    └── destroy.sh
```

## 🚀 Uso Rápido

```bash
# Ir a la carpeta de infraestructura
cd infrastructure/terraform

# Configurar variables
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars con tus valores

# Desplegar
../scripts/deploy.sh production
```

Para más detalles, consulta `infrastructure/terraform/README.md`.

## Configuración Inicial

### 1. Instalar Terraform
Asegúrate de tener Terraform instalado en tu sistema.

### 2. Configurar variables
1. Copia el archivo de ejemplo:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edita `terraform.tfvars` con tus valores:
   - `vercel_team_id`: Encuentra tu team ID en el dashboard de Vercel (Settings > General > Team ID)
   - `project_name`: Nombre base para tus proyectos (opcional)

### 3. Configurar autenticación de Vercel
Necesitas un token de API de Vercel:

1. Ve a Vercel Dashboard > Settings > Tokens
2. Crea un nuevo token
3. Configura la variable de entorno:
   ```bash
   export VERCEL_TOKEN="tu_token_aqui"
   ```

### 4. Inicializar y aplicar
```bash
# Inicializar Terraform
terraform init

# Ver el plan de despliegue
terraform plan

# Aplicar la configuración
terraform apply
```

## Estructura del Proyecto

La configuración crea proyectos en Vercel según el entorno:

### Producción (main branch)
- **API**: `plataforma-pagos-daii-api` (Next.js)
- **Web**: `plataforma-pagos-daii-web` (Create React App)

### Preview (develop branch)
- **API**: `plataforma-pagos-daii-api-preview` (Next.js)
- **Web**: `plataforma-pagos-daii-web-preview` (Create React App)

### Desarrollo (otras ramas)
- **API**: `plataforma-pagos-daii-api-development` (Next.js)
- **Web**: `plataforma-pagos-daii-web-development` (Create React App)

## Configuración de Build

### API (Next.js)
- Root directory: `apps/api`
- Build command: `cd apps/api && bun run build`
- Output directory: `apps/api/.next`
- Package manager: Bun

### Web (React)
- Root directory: `apps/web`
- Build command: `cd apps/web && pnpm run build`
- Output directory: `apps/web/build`
- Package manager: PNPM

## Variables de Entorno

Las variables de entorno se pueden configurar:
1. En el archivo Terraform (sección `env`)
2. En el dashboard de Vercel
3. Usando el CLI de Vercel

## Dominios Personalizados

Para configurar dominios personalizados, descomenta las secciones correspondientes en `main.tf` y configura tus dominios.

## Flujo de Entornos

### 🚀 Producción (main)
- **Trigger**: Push a `main`
- **Entorno**: `production`
- **NODE_ENV**: `production`
- **URLs**: `plataforma-pagos-daii-api.vercel.app`

### 🔍 Preview (develop)
- **Trigger**: Push a `develop`
- **Entorno**: `preview`
- **NODE_ENV**: `development`
- **URLs**: `plataforma-pagos-daii-api-preview.vercel.app`

### 🛠️ Desarrollo (feature branches)
- **Trigger**: Push a cualquier otra rama
- **Entorno**: `development`
- **NODE_ENV**: `development`
- **URLs**: `plataforma-pagos-daii-api-development.vercel.app`

## Comandos Útiles

```bash
# Ver el estado actual
terraform show

# Desplegar a un entorno específico
terraform apply -var-file="environments/preview.tfvars"

# Destruir los recursos
terraform destroy

# Actualizar solo un recurso específico
terraform apply -target=vercel_project.api
```
