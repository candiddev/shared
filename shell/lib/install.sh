#!/usr/bin/env bash

cmd install,i Install required tools
install () {
	for i in ${INSTALL_ALL}; do
		"${i}"
	done
}
i () {
	install
}

cmd install-air Install Air, a Go hot-reload tool
install-air () {
	install-go

	if ! ${EXEC_AIR} -v > /dev/null 2>&1; then
		printf "Installing Air..."
		try "${EXEC_GO} install github.com/cosmtrek/air@v${VERSION_AIR}"
	fi
}

cmd install-etcha Install Etcha
install-etcha () {
	if ! ${EXEC_ETCHA} version 2>&1 | grep "$(curl -sL https://github.com/candiddev/etcha/releases/latest/download/version)" > /dev/null; then
		printf "Install Etcha..."
		try "curl -sL https://github.com/candiddev/etcha/releases/latest/download/etcha_${OSNAME}_${OSARCH}.tar.gz | tar -C ${BINDIR} -xz etcha"
	fi
}

cmd install-go Install Go
install-go () {
	if ! ${EXEC_GO} version 2>&1 | grep "${VERSION_GO}" > /dev/null; then 
		printf "Installing Go..."
		try "mkdir -p ${GOROOT}
curl -s -L https://dl.google.com/go/go${VERSION_GO}.${OSNAME}-${OSARCH}.tar.gz | tar --no-same-owner -C ${GOROOT} --strip-components=1 -xz
ln -sf ${GOROOT}/bin/* ${BINDIR}/
${EXEC_GO} install golang.org/x/tools/gopls@latest
${EXEC_GO} install golang.org/x/vuln/cmd/govulncheck@latest
ln -sf ${GOPATH}/bin/* ${BINDIR}/"
		fi

	if ! ${EXEC_GOVULNCHECK} -version | grep "${VERSION_GOVULNCHECK}" > /dev/null; then
		printf "Installing Govulncheck..."
		try "${EXEC_GO} install golang.org/x/vuln/cmd/govulncheck@v${VERSION_GOVULNCHECK}"
	fi

	if ! ${EXEC_GOLANGCILINT} version 2>&1 | grep "${VERSION_GOLANGCILINT}" > /dev/null; then
		printf "Installing Golangci-lint..."
		try "
	curl -s -L https://github.com/golangci/golangci-lint/releases/download/v${VERSION_GOLANGCILINT}/golangci-lint-${VERSION_GOLANGCILINT}-${OSNAME}-${OSARCH}.tar.gz | tar --no-same-owner -C ${BINDIR} -xz --strip-components=1 golangci-lint-${VERSION_GOLANGCILINT}-${OSNAME}-${OSARCH}/golangci-lint
	chmod +x ${BINDIR}/golangci-lint"
	fi
}

cmd install-hugo Install Hugo, a static site builder
install-hugo () {
	if ! ${EXEC_HUGO} version 2>&1 | grep "${VERSION_HUGO}" > /dev/null; then
		if [[ $OSNAME = "darwin" ]]; then
			osarch="universal"
		else
			osarch="${OSARCH}"
		fi

		printf "Installing Hugo..."
		try "curl -s -L https://github.com/gohugoio/hugo/releases/download/v${VERSION_HUGO}/hugo_extended_${VERSION_HUGO}_${OSNAME}-${osarch}.tar.gz | tar --no-same-owner -C ${BINDIR} -xz"
	fi
}

cmd install-node Install Node.js
install-node () {
	if ! ${EXEC_NODE} --version 2>&1 | grep "${VERSION_NODE}" > /dev/null; then
		printf "Installing Node..."
		try "rm -rf ${LOCALDIR}/lib/node
mkdir -p ${LOCALDIR}/lib/node
curl -s -L https://nodejs.org/dist/v${VERSION_NODE}/node-v${VERSION_NODE}-${OSNAME}-x64.tar.xz | tar --no-same-owner -C ${LOCALDIR}/lib/node --strip-components=1 -xJ
ln -sf ${LOCALDIR}/lib/node/bin/* ${BINDIR}/
"
	fi

	NPM_INSTALL=${EXEC_NPM}

	printf "Refreshing node_modules..."
	if [[ -d ${DIR}/shared ]]; then
		NPM_INSTALL="${EXEC_NPM} --prefix ${DIR}/shared/web"
	fi

	try "${NPM_INSTALL} install"
}

cmd install-rclone Install Rclone, a tool for managing files
install-rclone () {
	if ! ${EXEC_RCLONE} --version 2>&1 | grep "${VERSION_RCLONE}" > /dev/null; then
		printf "Installing rclone..."
		try "curl -L https://github.com/rclone/rclone/releases/download/v${VERSION_RCLONE}/rclone-v${VERSION_RCLONE}-${OSNAME}-${OSARCH}.zip -o rclone.zip
unzip -j -o rclone.zip rclone-v${VERSION_RCLONE}-${OSNAME}-${OSARCH}/rclone -d ${BINDIR}
rm rclone.zip"
	fi
}

cmd install-rot, Install Rot
install-rot () {
	if ! ${EXEC_ROT} version 2>&1 | grep "$(curl -sL https://github.com/candiddev/rot/releases/latest/download/version)" > /dev/null; then
		printf "Install Rot..."
		try "curl -sL https://github.com/candiddev/rot/releases/latest/download/rot_${OSNAME}_${OSARCH}.tar.gz | tar -C ${BINDIR} -xz rot"
	fi
}

cmd install-shellcheck Install Shellcheck, a tool for linting shell code
install-shellcheck () {
	if ! ${EXEC_SHELLCHECK} --version 2>&1 | grep "${VERSION_SHELLCHECK}" > /dev/null; then
		printf "Installing ShellCheck..."
		try "curl -s -L https://github.com/koalaman/shellcheck/releases/download/v${VERSION_SHELLCHECK}/shellcheck-v${VERSION_SHELLCHECK}.${OSNAME}.x86_64.tar.xz | tar  --no-same-owner -C ${BINDIR} -xJ --strip-components=1 shellcheck-v${VERSION_SHELLCHECK}/shellcheck"
	fi
}

cmd install-swag Install swag, a tool for generating API docs
install-swag () {
	if ! ${EXEC_SWAG} --version 2>&1 | grep "${VERSION_SWAG}" > /dev/null; then
		printf "Installing swag..."
		try "curl -s -L https://github.com/swaggo/swag/releases/download/v${VERSION_SWAG}/swag_${VERSION_SWAG}_${OSNAME}_x86_64.tar.gz | tar --no-same-owner -C ${BINDIR} -xz"
	fi
}

cmd install-terraform Install Terraform, a tool for infrastructure management
install-terraform () {
	if ! ${EXEC_TERRAFORM} --version 2>&1 | grep "Terraform v${VERSION_TERRAFORM}" > /dev/null; then
		printf "Installing Terraform..."
		try "curl -L https://releases.hashicorp.com/terraform/${VERSION_TERRAFORM}/terraform_${VERSION_TERRAFORM}_${OSNAME}_${OSARCH}.zip -o terraform.zip
unzip -o terraform.zip -d ${BINDIR}
rm terraform.zip
"
	fi

	printf "Refreshing terraform plugins..."
	try "${EXEC_TERRAFORM} -chdir=${DIR}/terraform init"
}

cmd install-vault Install Vault, a tool for accessing secrets
install-vault () {
	if ! ${EXEC_VAULT} --version 2>&1 | grep "Vault v${VERSION_VAULT}" > /dev/null; then

		printf "Installing Vault.."
		try "curl -L https://releases.hashicorp.com/vault/${VERSION_VAULT}/vault_${VERSION_VAULT}_${OSNAME}_${OSARCH}.zip -o vault.zip
unzip -o vault.zip -d ${BINDIR}
rm vault.zip"
	fi
}

cmd install-yaml8n, Install YAML8n
install-yaml8n () {
	if ! ${EXEC_YAML8N} version 2>&1 | grep "$(curl -sL https://github.com/candiddev/yaml8n/releases/latest/download/version)" > /dev/null; then
		printf "Install YAML8n..."
		try "curl -sL https://github.com/candiddev/yaml8n/releases/latest/download/yaml8n_${OSNAME}_${OSARCH}.tar.gz | tar -C ${BINDIR} -xz yaml8n"
	fi
}
