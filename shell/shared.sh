#!/usr/bin/env bash

cmd release-containers Release containers to the registry
release-containers () {
	GITHUB_TOKEN=$(run-vault-secrets-kv token kv/prd/github)

	# shellcheck disable=SC2044
	for d in $(find "${DIR}/containers" -mindepth 1 -type d); do
		name=$(basename "${d}")
		printf "Releasing container %s..." "${name}"
		# shellcheck disable=SC2153
		try "${CR} login -u $ -p ${GITHUB_TOKEN} ${CR_REGISTRY}
${CR} buildx create --name build || true
${CR} buildx use build
${CR} buildx build --provenance=false -f ${d}/Dockerfile --platform ${BUILD_TARGETS_CONTAINER// /,} -t ${CR_REGISTRY}/candiddev/${name}:latest --push ${d}"
	done
}

test-go-pre() {
	run-postgresql-start
}
