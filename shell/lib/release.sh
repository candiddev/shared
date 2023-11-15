#!/usr/bin/env bash

cmd release Release all artifacts
release () {
	export BUILD_GO_TAGS=release
	run-vault-secrets-github

	release-binary

	if [[ ${BUILD_SOURCE} != "dev" ]]; then
		release-container
	fi
}

releaseassets=""
releaseid=""

cmd release-go-binary Release the go binary
release-binary () {
	run release-binary-pre

	run-vault-secrets-github

	releaseid=$(run-github-release-id)
	releaseassets=$(run-github "${GITHUB_PATH}/releases/${releaseid}/assets")

	jq -c '.[]' <<< "${releaseassets}" | while read -r i; do
		run-github "$(jq -r '.url' <<< "${i}" | grep -oP 'api.github.com\K.*')" DELETE
	done

	# shellcheck disable=SC2153
	for target in ${BUILD_TARGETS_BINARY}; do
		export BUILD_TARGET_ARCH_PART=${target#*/}
		export BUILD_TARGET_ARCH=${BUILD_TARGET_ARCH_PART%/*}
		export BUILD_TARGET_OS=${target%%/*}
		export BUILD_NAME=${APP_NAME}_${BUILD_TARGET_OS}_${BUILD_TARGET_ARCH}

		build-go

		printf "Creating release artifacts for %s..." "${BUILD_NAME}"
		try "tar -czf ${BUILD_NAME}.tar.gz --transform='s/_.*//' ${BUILD_NAME} LICENSE.md
sha256sum -b ${BUILD_NAME}.tar.gz > ${BUILD_NAME}.tar.gz.sha256"

		for i in tar.gz tar.gz.sha256; do
			printf "Uploading release artifact %s..." "${BUILD_NAME}.${i}"
			try "curl -fsL -X POST -H \"Accept: application/vnd.github+json\" -H \"Authorization: Bearer ${GITHUB_TOKEN}\" -H \"X-GitHub-Api-Version: 2022-11-28\" -H \"Content-Type: application/octet-stream\" \"https://uploads.github.com/repos/candiddev/${APP_NAME}/releases/${releaseid}/assets?name=${BUILD_NAME}.${i}\" --data-binary \"@${BUILD_NAME}.${i}\""
		done
	done

	printf "Uploading version file..."
	try "curl -fsL -X POST -H \"Accept: application/vnd.github+json\" -H \"Authorization: Bearer ${GITHUB_TOKEN}\" -H \"X-GitHub-Api-Version: 2022-11-28\" -H \"Content-Type: application/octet-stream\" \"https://uploads.github.com/repos/candiddev/${APP_NAME}/releases/${releaseid}/assets?name=version\" --data ${BUILD_VERSION}"
}

cmd release-container Release the container to the registry
release-container () {
	GITHUB_TOKEN=$(run-vault-secrets-kv token kv/prd/github)

	tags="-t ${CR_REGISTRY}/candiddev/${APP_NAME}:${BUILD_TAG}"

	if [[ ${BUILD_SOURCE} == "tag" ]]; then
		tags="${tags} -t ${CR_REGISTRY}/candiddev/${APP_NAME}:latest"
	fi

	printf "Releasing container..."
	# shellcheck disable=SC2153
	try "${CR} login -u $ -p ${GITHUB_TOKEN} ${CR_REGISTRY}
${CR} buildx create --name ${APP_NAME} || true
${CR} buildx use ${APP_NAME}
${CR} buildx build --build-arg=REPOSITORY=${APP_NAME} --provenance=false -f ${DIR}/Dockerfile --platform ${BUILD_TARGETS_CONTAINER// /,} ${tags} --push ."
}
