#!/usr/bin/env bash

cmd () {
	if [ -n "${COMMANDS}" ]; then
		COMMANDS="${COMMANDS}\n"
	fi

	COMMANDS="${COMMANDS}${1}_${*: 2}"
}

not_running () {
	! ${CR} inspect "${1}" &> /dev/null
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
