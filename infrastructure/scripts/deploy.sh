#!/bin/bash

# Script para desplegar infraestructura con Terraform
# Uso: ./deploy.sh [environment]
# Ejemplo: ./deploy.sh production

set -e

ENVIRONMENT=${1:-production}
TERRAFORM_DIR="../terraform"

echo "🚀 Desplegando infraestructura para entorno: $ENVIRONMENT"

cd "$TERRAFORM_DIR"

# Verificar que el archivo de variables existe
if [ ! -f "environments/$ENVIRONMENT.tfvars" ]; then
    echo "❌ Error: No se encontró el archivo environments/$ENVIRONMENT.tfvars"
    echo "Entornos disponibles:"
    ls environments/*.tfvars | sed 's/environments\///g' | sed 's/.tfvars//g'
    exit 1
fi

# Verificar que terraform.tfvars existe
if [ ! -f "terraform.tfvars" ]; then
    echo "❌ Error: No se encontró terraform.tfvars"
    echo "Copia terraform.tfvars.example y configura tus valores:"
    echo "cp terraform.tfvars.example terraform.tfvars"
    exit 1
fi

echo "📋 Ejecutando terraform plan..."
terraform plan -var-file="environments/$ENVIRONMENT.tfvars"

echo "❓ ¿Continuar con el despliegue? (y/N)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🚀 Ejecutando terraform apply..."
    terraform apply -var-file="environments/$ENVIRONMENT.tfvars"
    echo "✅ Despliegue completado!"
else
    echo "❌ Despliegue cancelado"
    exit 1
fi
