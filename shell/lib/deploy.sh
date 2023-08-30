#!/usr/bin/env bash

# shellcheck disable=SC2317
cmd deploy,d Deploy to environments
deploy () {
	if [ -n "${VAULT_SSH_PATH}" ]; then
		run-vault-ssh
	fi

	chmod 0600 "${DIR}/id_rsa"

	for host in ${DEPLOY_HOSTS}; do
		printf "Deploying ${APP_NAME} to %s..." "${host%:*}"

		try "ssh -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -i ${DIR}/id_rsa -p ${host#*:} root@${host%:*}"
	done

	run deploy-post
}
d () {
	deploy
}
