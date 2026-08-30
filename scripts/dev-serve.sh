#!/usr/bin/env bash
# Serveur de dev Next.js piloté par fichier PID, pour le testeur (navigateur piloté).
#   scripts/dev-serve.sh start <port>   lance `next dev` en arrière-plan, attend que la page réponde
#   scripts/dev-serve.sh stop <port>    arrête le serveur (et ses enfants), libère le port
#   scripts/dev-serve.sh status <port>  affiche le PID ou « arrêté »
# Fichier PID : ${TMPDIR:-/tmp}/watido-dev-<port>.pid

set -euo pipefail

usage() {
  echo "usage : $0 start|stop|status <port>" >&2
  exit 2
}

http_ok() {
  [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$url" || true)" = "200" ]
}

port_listening() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

# Tue tout processus qui écoute encore sur le port (`next-server` est un petit-enfant du PID
# du script : `pkill -P` ne l'atteint pas), puis attend jusqu'à 5 s que le port soit libre.
# Échec explicite (exit 1) s'il ne l'est pas.
free_port() {
  local p="$1" pids
  pids="$(lsof -nP -iTCP:"$p" -sTCP:LISTEN -t 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    # shellcheck disable=SC2086
    kill -TERM $pids 2>/dev/null || true
  fi
  for _ in $(seq 1 5); do
    port_listening "$p" || return 0
    sleep 1
  done
  pids="$(lsof -nP -iTCP:"$p" -sTCP:LISTEN -t 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    # shellcheck disable=SC2086
    kill -KILL $pids 2>/dev/null || true
    sleep 1
  fi
  if port_listening "$p"; then
    echo "port $p encore occupé" >&2
    return 1
  fi
}

# Lit le fichier PID dans la variable `filepid` (vide si absent). Fichier corrompu (autre chose
# que des chiffres) : message et sortie 1. Appelée hors substitution de commande pour que
# l'`exit` arrête bien le script.
read_pidfile() {
  filepid=""
  [ -f "$pidfile" ] || return 0
  filepid="$(tr -d '[:space:]' <"$pidfile")"
  case "$filepid" in
    *[!0-9]*|'')
      echo "fichier PID corrompu : $pidfile" >&2
      exit 1
      ;;
  esac
}

# PID du serveur si ce PID est vivant et correspond bien à un processus `next`.
running_pid() {
  [ -n "$filepid" ] || return 1
  kill -0 "$filepid" 2>/dev/null || return 1
  case "$(ps -o command= -p "$filepid" 2>/dev/null)" in
    *next*) echo "$filepid" ;;
    *) return 1 ;;
  esac
}

main() {
[ $# -eq 2 ] || usage
command="$1"
port="$2"
case "$port" in
  ''|*[!0-9]*) usage ;;
esac

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
pidfile="${TMPDIR:-/tmp}/watido-dev-${port}.pid"
url="http://localhost:${port}/"
TIMEOUT=60

read_pidfile

case "$command" in
  start)
    if pid="$(running_pid)"; then
      echo "déjà lancé (PID $pid) sur $url"
      exit 0
    fi
    if port_listening "$port"; then
      echo "port $port déjà occupé par un autre processus" >&2
      exit 1
    fi
    # Sous-shell remplacé par `next dev` (exec) : aucun shell intermédiaire ne survit, et
    # ses trois descripteurs sont détachés du terminal ou du tube de l'appelant.
    (cd "$root" && exec nohup npx next dev -p "$port") </dev/null >"${pidfile%.pid}.log" 2>&1 &
    pid=$!
    echo "$pid" >"$pidfile"
    for _ in $(seq 1 "$TIMEOUT"); do
      if http_ok; then
        echo "lancé (PID $pid) sur $url"
        exit 0
      fi
      if ! kill -0 "$pid" 2>/dev/null; then
        echo "next dev s'est arrêté avant de répondre ; voir ${pidfile%.pid}.log" >&2
        rm -f "$pidfile"
        exit 1
      fi
      sleep 1
    done
    echo "pas de réponse 200 sur $url après ${TIMEOUT} s" >&2
    "$0" stop "$port" || true
    exit 1
    ;;
  stop)
    if pid="$(running_pid)"; then
      pkill -TERM -P "$pid" 2>/dev/null || true
      kill -TERM "$pid" 2>/dev/null || true
      for _ in $(seq 1 10); do
        kill -0 "$pid" 2>/dev/null || break
        sleep 1
      done
      if kill -0 "$pid" 2>/dev/null; then
        pkill -KILL -P "$pid" 2>/dev/null || true
        kill -KILL "$pid" 2>/dev/null || true
      fi
    fi
    rm -f "$pidfile" "${pidfile%.pid}.log"
    free_port "$port" || exit 1
    echo "arrêté (port $port libre)"
    ;;
  status)
    if pid="$(running_pid)"; then
      echo "PID $pid ($url)"
    else
      rm -f "$pidfile"
      echo "arrêté"
    fi
    ;;
  *) usage ;;
esac
}

# Exécuté directement : lance `main`. Sourcé (tests) : expose seulement les fonctions.
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  main "$@"
fi
