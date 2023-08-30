#!/usr/bin/env bash

set -ue

COMMANDS=""
DIR=$(cd -- "$(dirname "$0")" >/dev/null 2>&1; pwd -P)
export DIR
export BINDIR=${BINDIR:-${DIR}/.bin}
export BUILD_SOURCE=${BUILD_SOURCE:-dev}

mkdir -p "${BINDIR}"
mkdir -p "${DIR}/.cache"

export PATH="${BINDIR}/go/lib/bin:${BINDIR}/go/local/bin:${BINDIR}/node/bin:${BINDIR}:${PATH}"

source "${DIR}/shell/lib/helpers.sh"

for f in "${DIR}"/shell/*; do
	if ! [[ ${f} == "${DIR}/shell/lib" ]]; then
			#shellcheck disable=SC1090
		source "${f}"
	fi
done

for f in "${DIR}"/shell/lib/*; do
		#shellcheck disable=SC1090
	source "${f}"
done

set -ue

USAGE="Usage: m [flags] [command]

m is like Make but with more spaghetti.

Commands:"

IFS=$'\n'
COMMANDS=$(echo -e "${COMMANDS}" | sort -t_ -k1,1)
for cmd in $(echo -e "${COMMANDS}"); do
	c=${cmd%_*}
	USAGE="${USAGE}
  ${c//,/ }
    	${cmd#*_}"
done
USAGE="${USAGE}

Flags:
  -d	Enable debug logging"
unset IFS

if [[ "${1:-""}" == "-d" ]] || [[ -n "${RUNNER_DEBUG+x}" ]]; then
	export DEBUG=yes
	set -x

	if [[ "${1:-""}" == "-d" ]]; then
		shift 1
	fi
fi

if [ "$0" == "${BASH_SOURCE[0]}" ]; then
	# shellcheck disable=2086
	if [ "$(type -t ${1:-not-a-command})" != function ]; then
		if [[ -n "${1+x}" ]]; then
			echo "Unknown command: " "${@}"
		fi

		echo "${USAGE}"

		exit 1
	fi

	"$@"
fi
