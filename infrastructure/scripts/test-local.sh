#!/bin/bash

# Script para probar Terraform localmente
# Uso: ./test-local.sh [environment]
# Ejemplo: ./test-local.sh preview

set -e

ENVIRONMENT=${1:-preview}
TERRAFORM_DIR="../terraform"

echo "🧪 Probando configuración de Terraform para entorno: $ENVIRONMENT"

cd "$TERRAFORM_DIR"

# Verificar que terraform.tfvars existe
if [ ! -f "terraform.tfvars" ]; then
    echo "❌ Error: No se encontró terraform.tfvars"
    echo "Copia terraform.tfvars.example y configura tus valores:"
    echo "cp terraform.tfvars.example terraform.tfvars"
    exit 1
fi

# Verificar que el archivo de variables del entorno existe
if [ ! -f "environments/$ENVIRONMENT.tfvars" ]; then
    echo "❌ Error: No se encontró el archivo environments/$ENVIRONMENT.tfvars"
    echo "Entornos disponibles:"
    ls environments/*.tfvars | sed 's/environments\///g' | sed 's/.tfvars//g'
    exit 1
fi

# Verificar que VERCEL_TOKEN está configurado
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN no está configurado"
    echo "Configura tu token de Vercel:"
    echo "export VERCEL_TOKEN=\"tu_token_de_vercel\""
    exit 1
fi

echo "✅ Configuración verificada"

echo "📋 Ejecutando terraform plan (solo lectura)..."
terraform plan -var-file="environments/$ENVIRONMENT.tfvars"

echo "✅ Plan ejecutado exitosamente!"
echo "💡 Para aplicar los cambios, usa: ../scripts/deploy.sh $ENVIRONMENT"
