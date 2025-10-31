#!/bin/bash

# Script para obtener los IDs de los proyectos de Vercel
# Uso: ./get-project-ids.sh

if [ -z "$VERCEL_API_TOKEN" ]; then
    echo "Error: VERCEL_API_TOKEN no está configurado"
    echo "Ejecuta: export VERCEL_API_TOKEN='tu-token-aqui'"
    exit 1
fi

echo "Obteniendo proyectos de Vercel..."
echo ""

# Obtener todos los proyectos
PROJECTS=$(curl -s -H "Authorization: Bearer $VERCEL_API_TOKEN" \
  "https://api.vercel.com/v9/projects")

# Buscar proyectos específicos
API_PROJECT=$(echo $PROJECTS | jq -r '.projects[] | select(.name == "plataforma-pagos-daii") | {name: .name, id: .id}')
WEB_PROJECT=$(echo $PROJECTS | jq -r '.projects[] | select(.name == "plataforma-pagos-daii-web") | {name: .name, id: .id}')

echo "📦 Proyectos encontrados:"
echo ""
echo "Backend (API): plataforma-pagos-daii"
echo $API_PROJECT | jq '.'
echo ""
echo "Frontend (Web): plataforma-pagos-daii-web"
echo $WEB_PROJECT | jq '.'
echo ""

# Extraer solo los IDs
API_ID=$(echo $PROJECTS | jq -r '.projects[] | select(.name == "plataforma-pagos-daii") | .id')
WEB_ID=$(echo $PROJECTS | jq -r '.projects[] | select(.name == "plataforma-pagos-daii-web") | .id')

echo "🔧 Comandos para importar:"
echo ""
echo "terraform import vercel_project.api $API_ID"
echo "terraform import vercel_project.web $WEB_ID"

