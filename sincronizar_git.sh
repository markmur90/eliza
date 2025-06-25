#!/bin/bash

echo "=== Sincronización forzada con origin/main ==="

# Verifica que estés en una repo Git
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  echo "Este directorio no es un repositorio Git."
  exit 1
fi

# Nombre de la rama principal
MAIN_BRANCH="main"

# Guardar estado inicial
current_branch=$(git branch --show-current)

echo "→ Cambiando a $MAIN_BRANCH"
git checkout "$MAIN_BRANCH" &>/dev/null || git checkout -b "$MAIN_BRANCH"

echo "→ Obteniendo últimos cambios de origin..."
git fetch --all --tags --prune

echo "→ Reiniciando rama local a origin/main (perderás cambios locales)..."
git reset --hard origin/main

echo "→ Eliminando archivos no rastreados y directorios..."
git clean -fd

echo "→ Sincronización completada."

# Regresar a la rama anterior si era distinta
if [[ "$current_branch" != "$MAIN_BRANCH" ]]; then
  echo "→ Regresando a la rama anterior: $current_branch"
  git checkout "$current_branch"
fi

echo "✅ Estado actual:"
git status -sb
