#!/usr/bin/env bash

cmd lint-go Lint Go Code
lint-go () {
	install-go
	install-golangci-lint

	printf "Linting Go..."
	try "(${EXEC_GOLANGCILINT} --verbose --timeout=5m run && ${EXEC_GOVULNCHECK} -tags release ./...)"
}

cmd lint-shell Lint Shell code
lint-shell () {
	install-shellcheck

	printf "Linting Shell..."
	# shellcheck disable=SC2016
	try 'for f in m $(find -L "${DIR}/shell" -type f); do
		${EXEC_SHELLCHECK} -e SC2153 -x ${f}
	done'
}

cmd lint-web Lint Web code
lint-web () {
	install-node

	printf "Linting Web..."
	try "${EXEC_NPM} run lint"
}

cmd lint-yaml8n Lint YAML8n translations
lint-yaml8n() {
	for i in "${DIR}"/yaml8n/*; do
		name=$(basename "${i}")
		printf "Validating %s..." "${name}"
		try "${EXEC_YAML8N} validate yaml8n/${name}"

		printf "Comparing %s..." "${name}"
		try "${EXEC_YAML8N} generate yaml8n/${name}
git diff --exit-code"
	done
}
