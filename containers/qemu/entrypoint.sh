#!/usr/bin/env bash

# Add userdata IP and start web listener
echo Starting web listener...

ip addr add 169.254.169.254/32 dev lo
python3 -m http.server 80 --directory "${WEBDIR}" &

# Start TPM
echo Starting TPM...

mkdir /tpm
swtpm socket --tpm2 --tpmstate dir=/tpm --ctrl type=unixio,path=/tpm.sock &

# Start DNSMASQ
echo Starting DNSMASQ...

# shellcheck disable=SC2086
dnsmasq -a 169.254.169.254 -d ${DNSMASQARGS} &
echo -e "nameserver 169.254.169.254\n$(cat /etc/resolv.conf)" > /etc/resolv.conf

qemu_accel="tcg,thread=multi"

if [[ -e /dev/kvm ]] && uname -a | grep "${ARCH}"; then
	qemu_accel="kvm"
fi

qemu_binary=""
qemu_efi_code="-drive if=pflash,unit=0,format=raw,readonly=on,file="
qemu_efi_vars="-drive if=pflash,unit=1,format=raw,file="
qemu_machine=""
qemu_tpm=""

case ${ARCH} in
	amd64)
		qemu_binary=qemu-system-x86_64
		qemu_efi_code="${qemu_efi_code}/usr/share/OVMF/OVMF_CODE_4M.ms.fd"
		qemu_efi_vars="${qemu_efi_vars}/usr/share/OVMF/OVMF_VARS_4M.ms.fd -global driver=cfi.pflash01,property=secure,value=on"
		qemu_machine=q35
		qemu_tpm=tpm-crb
	;;
	arm)
		qemu_binary=qemu-system-arm
		qemu_efi_code="${qemu_efi_code}/usr/share/AAVMF/AAVMF32_CODE.fd"
		qemu_efi_vars="${qemu_efi_vars}/usr/share/AAVMF/AAVMF32_VARS.fd"
		qemu_machine="virt"
	;;
	arm64)
		qemu_binary=qemu-system-aarch64
		qemu_efi_code="${qemu_efi_code}/usr/share/AAVMF/AAVMF_CODE.ms.fd"
		qemu_efi_vars="${qemu_efi_vars}/usr/share/AAVMF/AAVMF_VARS.ms.fd"
		qemu_machine="virt"
		qemu_tpm=tpm-tis-device
	;;
esac

if [[ -n "${BIOS}" ]]; then
	qemu_efi_code=""
	qemu_efi_vars=""
fi

if [[ -n ${qemu_tpm} ]]; then
	qemu_tpm="-device ${qemu_tpm},tpmdev=tpm0 -tpmdev emulator,id=tpm0,chardev=tpm"
fi

MEMORY=${MEMORY:-2G}
SMP=${SMP:-2}

echo Starting VM...

# shellcheck disable=SC2086
${qemu_binary} \
	-accel ${qemu_accel} \
	-chardev socket,id=tpm,path=/tpm.sock \
	-device virtio-rng-pci,rng=rng0 \
	${qemu_efi_code} \
	${qemu_efi_vars} \
	-m ${MEMORY} \
	-machine ${qemu_machine} \
	-nodefaults \
	-nographic \
	-object rng-random,filename=/dev/urandom,id=rng0 \
	-rtc base=utc,clock=host \
	-serial tcp::23,server=on,wait=off \
	-smp ${SMP} \
	${qemu_tpm} \
	${QEMUARGS}
