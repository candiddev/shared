#!/usr/bin/env bash

case $(uname) in
	Darwin)
		export OSNAME="darwin"
		;;
	Linux)
		export OSNAME="linux"
		;;
esac

case $(uname -m) in
	arm64)
		export OSARCH="arm64"
		;;
	x86_64)
		export OSARCH="amd64"
		;;
esac

export APP_NAME=${APP_NAME:-}

export BUILD_COMMIT=${BUILD_COMMIT:-$(git rev-parse --short HEAD 2>/dev/null)}
export BUILD_DATE=${BUILD_DATE:-$(date "+%Y-%m-%d")}
export BUILD_ENV=${BUILD_ENV:-dev}
export BUILD_GO_DIR=${BUILD_GO_DIR:-}
export BUILD_GO_TAGS=${BUILD_GO_TAGS:-develop}
export BUILD_GO_VARS=${BUILD_GO_VARS:-}
export BUILD_TAG=${BUILD_TAG:-dev}
export BUILD_TARGETS_BINARY=${BUILD_TARGETS_BINARY:-darwin/amd64 darwin/arm64 linux/amd64 linux/arm64 linux/arm/v7}
export BUILD_TARGETS_CONTAINER=${BUILD_TARGETS_CONTAINER:-linux/amd64 linux/arm64 linux/arm/v7}
export BUILD_TARGET_ARCH=${BUILD_TARGET_ARCH:-${OSARCH}}
export BUILD_TARGET_OS=${BUILD_TARGET_OS:-${OSNAME}}

export BUILD_NAME=${APP_NAME}_${BUILD_TARGET_OS}_${BUILD_TARGET_ARCH}

case ${BUILD_SOURCE} in
	main)
		BUILD_ENV="stg"
		BUILD_TAG="main"
		;;
	tag)
		BUILD_ENV="prd"
		BUILD_TAG=$(git tag --points-at HEAD | grep -v main)
		;;
	*)
		BUILD_COMMIT=latest
esac

export BUILD_VERSION=${BUILD_TAG}+${BUILD_COMMIT}

export CR=${CR:-}

if [ -n "${CR}" ]; then
	export CR
elif command -v docker > /dev/null; then
	export CR=docker
elif command -v podman > /dev/null; then
	export CR="sudo podman"
fi

export CR_EXEC_POSTGRESQL="-i -e PGPASSWORD=postgres candiddev_postgresql psql -U postgres"

export CR_IMAGE=docker.io/debian:stable-slim
export CR_LOGOPTS="--log-opt max-file=1 --log-opt max-size=100k"
export CR_REGISTRY=ghcr.io
export CR_REPOSITORY=${CR_REPOSITORY:-}
CR_USER="-u $(id -u):$(id -g)"
export CR_USER
export CR_VOLUME="-e HOME=/work -v ${DIR}:/work -v ${DIR}/containers/ca-certificates.crt:/etc/ssl/certs/ca-certificates.crt -w /work"

export CUSTOMGOROOT=${CUSTOMGOROOT:-${BINDIR}/go/lib}
export DEBUG=${DEBUG:-}
export DEPLOY_HOSTS=${DEPLOY_HOSTS:-}

export EXEC_AIR=${BINDIR}/go/local/bin/air
export EXEC_ETCHA=${BINDIR}/etcha
export EXEC_GO=${BINDIR}/go/lib/bin/go
export EXEC_GOLANGCILINT="${BINDIR}/golangci-lint"
export EXEC_GOVULNCHECK=${BINDIR}/go/local/bin/govulncheck
export EXEC_HUGO=${BINDIR}/hugo
export EXEC_NPM=${NPM:-${BINDIR}/node/bin/npm --prefix ${DIR}/web}
export EXEC_NODE=${BINDIR}/node/bin/node
export EXEC_RCLONE=${BINDIR}/rclone
export EXEC_SHELLCHECK=${BINDIR}/shellcheck
export EXEC_SWAG=${BINDIR}/swag
export EXEC_TERRAFORM=${BINDIR}/terraform
export EXEC_VAULT=${BINDIR}/vault
export EXEC_YAML8N="${CR} run --rm ${CR_USER} --pull always ${CR_VOLUME} ${CR_REGISTRY}/candiddev/yaml8n:latest"

export GITHUB_PATH="/repos/candiddev/${APP_NAME}"
export GITHUB_TOKEN=${GITHUB_TOKEN:-}

export GOCACHE=${DIR}/.cache/go
export GOPATH=${BINDIR}/go/local
export GOROOT=${CUSTOMGOROOT}

export INSTALL_ALL=${INSTALL_ALL:-"install-go install-golangci-lint install-node install-shellcheck"}

export RUN_GO_ARGS=${RUN_GO_ARGS:-}

export VAULT_SSH_ROLE=${VAULT_SSH_ROLE:-}
export VAULT_TOKEN=${VAULT_TOKEN:-$(vault token lookup &>/dev/null && cat ~/.vault-token 2>/dev/null)}

export VERSION_AIR=1.45.0 # https://github.com/cosmtrek/air/releases
export VERSION_GO=1.21.5 # https://golang.org/dl/
export VERSION_GOLANGCILINT=1.55.2 # https://github.com/golangci/golangci-lint/releases
export VERSION_HUGO=0.120.4 # https://github.com/gohugoio/hugo/releases
export VERSION_NODE=20.10.0 # https://nodejs.org/en/download/
export VERSION_POSTGRESQL=16 # https://hub.docker.com/_/postgres/tags
export VERSION_RCLONE=1.65.0 # https://github.com/rclone/rclone/releases
export VERSION_SHELLCHECK=0.9.0 # https://github.com/koalaman/shellcheck/releases
export VERSION_SWAG=1.16.2 # https://github.com/swaggo/swag/releases
export VERSION_TERRAFORM=1.6.5 # https://www.terraform.io/downloads
export VERSION_VAULT=1.15.3 # https://www.vaultproject.io/downloads
