#!/usr/bin/env bash
set -euo pipefail

root=${1:?Dossier de déploiement requis}
revision=${2:?Révision Git requise}
[[ "$root" =~ ^/([a-zA-Z0-9_.-]+/)*[a-zA-Z0-9_.-]+$ && "$root/" != *'/../'* && "$root/" != *'/./'* ]] || { echo 'Chemin de déploiement invalide.' >&2; exit 1; }
[[ "$revision" =~ ^[a-f0-9]{40}$ ]] || { echo 'Révision Git invalide.' >&2; exit 1; }
[[ -f "$root/.env" ]] || { echo 'Créer le fichier .env du serveur avant le premier déploiement.' >&2; exit 1; }
[[ ! -e "$root/current" || -L "$root/current" ]] || { echo 'current doit être un lien symbolique.' >&2; exit 1; }
release="$root/releases/$revision"
[[ -f "$release/compose.yaml" ]] || { echo 'Archive de livraison incomplète.' >&2; exit 1; }

# The project name and .env stay stable; each revision gets its own image tag.
export IMAGE_TAG="$revision"
previous=''
if [[ -L "$root/current" ]]; then previous=$(readlink "$root/current"); fi
compose=(docker compose --project-name portfolio --env-file "$root/.env" -f "$release/compose.yaml")
"${compose[@]}" config --quiet
"${compose[@]}" build --pull portfolio
if ! "${compose[@]}" up -d --no-build --wait --wait-timeout 120 portfolio; then
  echo 'Échec du contrôle de santé. Tentative de retour à la version précédente.' >&2
  if [[ "$previous" =~ ^releases/([a-f0-9]{40})$ && -f "$root/$previous/compose.yaml" ]]; then
    export IMAGE_TAG="${BASH_REMATCH[1]}"
    docker compose --project-name portfolio --env-file "$root/.env" -f "$root/$previous/compose.yaml" \
      up -d --no-build --wait --wait-timeout 120 portfolio || echo 'Le retour arrière a également échoué ; intervention nécessaire.' >&2
  else
    echo 'Aucune version précédente disponible pour un retour arrière.' >&2
  fi
  exit 1
fi
ln -sfn "releases/$revision" "$root/current"
"${compose[@]}" ps
printf 'Version déployée : %s\n' "$revision"
