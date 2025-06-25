#!/usr/bin/env bash

echo "=== Inicializando submódulos Git ==="

# Asegurarse de que estamos en un repo Git
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  echo "Este directorio no es un repositorio Git."
  exit 1
fi

# Si no hay .gitmodules, saltar
if [[ ! -f .gitmodules ]]; then
  echo "No se encontró .gitmodules, nada que inicializar."
  exit 0
fi

# Extraer rutas de submódulos
readarray -t modules < <(git config --file .gitmodules --get-regexp path | awk '{print $2}')

if [[ ${#modules[@]} -eq 0 ]]; then
  echo "No hay submódulos definidos en .gitmodules."
  exit 0
fi

# Inicializar y actualizar cada submódulo con URL válida
for module in "${modules[@]}"; do
  url=$(git config --file .gitmodules --get submodule."$module".url)
  if [[ -z "$url" ]]; then
    echo "⚠️  Warning: submódulo '$module' SIN url en .gitmodules. Se omite."
    continue
  fi

  echo "→ Inicializando '$module' desde $url"
  git submodule init "$module"
  git submodule update --recursive "$module"
done

echo "✅ Submódulos procesados."
