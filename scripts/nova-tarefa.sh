#!/usr/bin/env bash
# Cria uma worktree (cópia isolada da pasta) e a branch de uma tarefa, a partir da main do GitHub.
# Uso: scripts/nova-tarefa.sh <feat|fix|chore|docs> <slug> [porta]
#   ex.: scripts/nova-tarefa.sh fix mobile-menu 4331
# Variáveis: PORTFOLIO_WORKTREES_DIR (pasta das tarefas; padrão ../portfolio-tarefas) e SKIP_INSTALL=1 (pula o npm ci).
set -euo pipefail

tipo="${1:-}"
slug="${2:-}"
porta="${3:-}"

if [[ ! "$tipo" =~ ^(feat|fix|chore|docs)$ ]]; then
  echo "Tipo inválido '$tipo': use feat, fix, chore ou docs." >&2
  echo "Uso: scripts/nova-tarefa.sh <feat|fix|chore|docs> <slug> [porta]" >&2
  exit 1
fi
if [[ ! "$slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Slug inválido '$slug': use letras minúsculas, números e hífens (ex.: mobile-menu)." >&2
  exit 1
fi

raiz="$(git rev-parse --show-toplevel)"
base="${PORTFOLIO_WORKTREES_DIR:-$(cd "$raiz/.." && pwd)/portfolio-tarefas}"
branch="$tipo/$slug"
dir="$base/$tipo-$slug"

if [[ -e "$dir" ]]; then
  echo "Essa tarefa já existe: $dir" >&2
  exit 1
fi

git -C "$raiz" fetch origin main --quiet
if git -C "$raiz" show-ref --verify --quiet "refs/heads/$branch" || git -C "$raiz" show-ref --verify --quiet "refs/remotes/origin/$branch"; then
  echo "A branch $branch já existe (local ou no GitHub). Escolha outro slug." >&2
  exit 1
fi

porta_livre() { ! (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }
if [[ -z "$porta" ]]; then
  for candidata in 4330 4331 4332 4333 4334 4335 4336 4337 4338 4339; do
    if porta_livre "$candidata"; then porta="$candidata"; break; fi
  done
fi
if [[ -z "$porta" ]]; then
  echo "Nenhuma porta livre entre 4330 e 4339." >&2
  exit 1
fi

mkdir -p "$base"
git -C "$raiz" worktree add -b "$branch" "$dir" origin/main --quiet

if [[ "${SKIP_INSTALL:-}" != "1" ]]; then
  (cd "$dir" && npm ci --silent)
fi

cat <<MSG
Tarefa criada.
  Pasta:   $dir
  Branch:  $branch (a partir de origin/main)
  Porta:   $porta

Próximos passos:
  cd "$dir"
  npm run dev -- --port $porta      # servidor local desta tarefa
Leia docs/DESENVOLVIMENTO.md e use as Skills do Superpowers (brainstorming, TDD, verificação) em todo o trabalho.
Ao terminar: npm test && npm run check && npm run test:build, git push -u origin $branch e abra o PR. Quem integra é a sessão integradora.
MSG
