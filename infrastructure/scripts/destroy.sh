#!/bin/bash

# Script para destruir infraestructura con Terraform
# Uso: ./destroy.sh [environment]
# Ejemplo: ./destroy.sh production

set -e

ENVIRONMENT=${1:-production}
TERRAFORM_DIR="../terraform"

echo "⚠️  DESTRUYENDO infraestructura para entorno: $ENVIRONMENT"

cd "$TERRAFORM_DIR"

# Verificar que el archivo de variables existe
if [ ! -f "environments/$ENVIRONMENT.tfvars" ]; then
    echo "❌ Error: No se encontró el archivo environments/$ENVIRONMENT.tfvars"
    echo "Entornos disponibles:"
    ls environments/*.tfvars | sed 's/environments\///g' | sed 's/.tfvars//g'
    exit 1
fi

echo "⚠️  ADVERTENCIA: Esto destruirá TODOS los recursos del entorno $ENVIRONMENT"
echo "❓ ¿Estás seguro? Escribe 'destroy' para confirmar:"
read -r response
if [[ "$response" == "destroy" ]]; then
    echo "💥 Ejecutando terraform destroy..."
    terraform destroy -var-file="environments/$ENVIRONMENT.tfvars"
    echo "✅ Recursos destruidos!"
else
    echo "❌ Destrucción cancelada"
    exit 1
fi
