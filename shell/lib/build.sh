#!/usr/bin/env bash

cmd build-go,bg Build Go
build-go () {
	install-go

	printf "Building go/%s..." "${BUILD_NAME}"
	try "cd ${DIR}/go/${BUILD_GO_DIR} && CGO_ENABLED=0 GOOS=${BUILD_TARGET_OS} GOARCH=${BUILD_TARGET_ARCH} go build -tags ${BUILD_GO_TAGS} -v -ldflags '-X github.com/candiddev/shared/go/cli.BuildDate=${BUILD_DATE} -X github.com/candiddev/shared/go/cli.BuildVersion=${BUILD_VERSION} ${BUILD_GO_VARS} -w' -o ${DIR}/${BUILD_NAME} ."
}
bg () {
	build-go
}

cmd build-hugo,bh Build Hugo
build-hugo () {
	install-hugo

	printf "Building hugo..."
	try "cd ${DIR}/hugo; hugo -e prd --gc --minify"
}
bh () {
	build-hugo
}

cmd build-web,bw Build Web
build-web () {
	install-node

	printf "Building web..."
	export BUILD_TAGS=release
	try "(cd ${DIR}/web; ${EXEC_NPM} run build)"
}
bw () {
	build-web
}

cmd build-yaml8n-generate,byg Build YAML8n generate
build-yaml8n-generate () {
	for i in "${DIR}"/yaml8n/*; do
		# shellcheck disable=SC2086
		${EXEC_YAML8N} generate "${DIR}/yaml8n/$(basename "${i}")"
	done
}
byg () {
	build-yaml8n-generate
}

cmd build-yaml8n-translate,byt Build YAML8n translations
build-yaml8n-translate () {
	for i in "${DIR}"/yaml8n/*; do
		# shellcheck disable=SC2086
		${EXEC_YAML8N} translate "${DIR}/yaml8n/$(basename "${i}")"
	done
}
byt () {
	build-yaml8n-translate
}
