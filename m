#!/usr/bin/env bash

set -ue

COMMANDS=""
DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
export DIR
export CDIR=${CDIR:-"${HOME}/.candid"}
export BINDIR=${BINDIR:-"${CDIR}/bin"}
export LIBDIR=${LIBDIR:-"${CDIR}/lib"}
export PATH="${BINDIR}:${DIR}:${PATH}"

cmd () {
	if [ -n "${COMMANDS}" ]; then
		COMMANDS="${COMMANDS}\n"
	fi

	COMMANDS="${COMMANDS}${1}_${*: 2}"
}

not-running () {
	if ${CR} inspect "${1}" &> /dev/null; then
		false
	else
		true
	fi
}

run () {
	IFS=$'\n'
	for cmd in $(declare -F | cut -d\  -f3); do
		# shellcheck disable=SC2053
		if [[ ${cmd} == ${1} ]]; then
			${cmd}
		fi
	done
	unset IFS
}

try () {
	set +e
	start=$(date +%s)
	output=$(bash -xec "$@" 2>&1)
	ec=${?}
	runtime=$(($(date +%s)-start))

	# shellcheck disable=SC2181
	if [[ ${ec} == 0 ]]; then
		printf " \033[0;32mOK\033[0m [%ss]\n" ${runtime}

		if [[ -n "${DEBUG}" ]]; then
			printf "%s\n" "${output}"
		fi

		set -e
		return 0
	fi

	printf " \033[0;31mFAIL [%ss]\n\nError:\n" ${runtime}
	printf "%s\n\033[0m" "${output}"
	exit 1
}

for f in "${DIR}"/shell/lib/*; do
		#shellcheck disable=SC1090
	source "${f}"
done

for f in "${DIR}"/shell/*; do
	if ! [[ ${f} == "${DIR}/shell/lib" ]]; then
			#shellcheck disable=SC1090
		source "${f}"
	fi
done

source "${DIR}/shell/lib/vars.sh"

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
	mkdir -p "${BINDIR}"
	mkdir -p "${LIBDIR}"

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
