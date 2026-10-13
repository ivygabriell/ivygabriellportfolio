#!/usr/bin/env bash
# Remove a worktree de uma tarefa (a branch é mantida, a menos que você peça para apagá-la).
# Uso: scripts/remover-tarefa.sh <feat|fix|chore|docs> <slug> [--apagar-branch]
#   --apagar-branch: depois de remover, apaga a branch local com `git branch -d` (só funciona se ela já foi integrada).
set -euo pipefail

tipo="${1:-}"
slug="${2:-}"
apagar="${3:-}"

if [[ ! "$tipo" =~ ^(feat|fix|chore|docs)$ || -z "$slug" ]]; then
  echo "Uso: scripts/remover-tarefa.sh <feat|fix|chore|docs> <slug> [--apagar-branch]" >&2
  exit 1
fi

raiz="$(git rev-parse --show-toplevel)"
base="${PORTFOLIO_WORKTREES_DIR:-$(cd "$raiz/.." && pwd)/portfolio-tarefas}"
branch="$tipo/$slug"
dir="$base/$tipo-$slug"

if [[ ! -d "$dir" ]]; then
  echo "Tarefa não encontrada: $dir" >&2
  exit 1
fi
if [[ -n "$(git -C "$dir" status --porcelain)" ]]; then
  echo "Há mudanças não salvas em $dir. Faça commit ou descarte antes de remover." >&2
  exit 1
fi

git -C "$raiz" worktree remove "$dir"
echo "Worktree removida: $dir"

if [[ "$apagar" == "--apagar-branch" ]]; then
  git -C "$raiz" branch -d "$branch"
else
  echo "A branch $branch foi mantida. Depois do merge: git branch -d $branch"
fi
