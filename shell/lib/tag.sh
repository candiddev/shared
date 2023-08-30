#!/usr/bin/env bash

cmd tag Tag a new release
tag () {
	TAG="v$(date +%Y.%m.%d)"
	if [[ ${BUILD_TAG} == "main" ]]; then
		TAG=main
	fi

	git -c "user.name=Engineering" -c "user.email=support@candid.dev" tag -fam "${TAG}" "${TAG}"
	git push -f origin "refs/tags/${TAG}"
}

cmd tag-github-release Create a new GitHub release from the latest tag
tag-github-release () {
	path="${GITHUB_PATH}/releases"
	releaseid=$(run-github-release-id)

	m="POST"
	if [[ -n ${releaseid} ]]; then
		m="PATCH"
		path="${path}/${releaseid}"
	fi

	export body="${APP_NAME} ${BUILD_TAG}"
	export prerelease=false
	if [[ ${BUILD_TAG} == "main" ]]; then
		#shellcheck disable=SC2034
		prerelease=true
	fi

	run-github "${path}" "${m}" "$(jq -cn '{body: "\($ENV.APP_NAME) \($ENV.BUILD_TAG)", prerelease: $ENV.prerelease | test("true"), tag_name: $ENV.BUILD_TAG}')"
}
