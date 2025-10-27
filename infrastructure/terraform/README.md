# Infraestructura con Terraform

Este directorio contiene toda la configuración de infraestructura como código (IaC) para el proyecto.

## Estructura

```
infrastructure/
├── terraform/
│   ├── main.tf                    # Configuración principal
│   ├── environments/              # Configuraciones por entorno
│   │   ├── production.tfvars
│   │   ├── preview.tfvars
│   │   └── development.tfvars
│   ├── terraform.tfvars.example   # Plantilla de variables
│   └── README.md                  # Esta documentación
└── scripts/                       # Scripts de automatización
    ├── deploy.sh
    └── destroy.sh
```

## Uso

### Configuración inicial
```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edita terraform.tfvars con tus valores
```

### Desplegar a un entorno específico
```bash
# Producción
terraform apply -var-file="environments/production.tfvars"

# Preview
terraform apply -var-file="environments/preview.tfvars"

# Desarrollo
terraform apply -var-file="environments/development.tfvars"
```

### Comandos básicos
```bash
# Inicializar
terraform init

# Ver plan
terraform plan

# Aplicar cambios
terraform apply

# Destruir recursos
terraform destroy
```

## Variables requeridas

- `vercel_team_id`: ID del team de Vercel
- `vercel_token`: Token de API (variable de entorno)

## Entornos

- **production**: Despliegue en main branch
- **preview**: Despliegue en develop branch (pre-producción)
- **development**: Despliegue en feature branches
