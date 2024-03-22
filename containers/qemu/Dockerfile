FROM --platform=$TARGETPLATFORM docker.io/debian:bookworm

LABEL org.opencontainers.image.base.name=docker.io/debian:bookworm
LABEL org.opencontainers.image.licenses=AGPL-3.0-only
LABEL org.opencontainers.image.source=https://github.com/candiddev/shared

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      btrfs-progs \
      dnsmasq \
      genisoimage \
      iproute2 \
      ovmf \
      parted \
      python3 \
      qemu-efi \
      qemu-efi-aarch64 \
      qemu-efi-arm \
      qemu-system-arm \
      qemu-system-x86 \
      qemu-utils \
      swtpm && \
    groupadd -g 999 qemu && \
    useradd -rm -d /var/lib/qemu -g qemu -s /usr/sbin/nologin qemu && \
    chown -R qemu:qemu /usr/share/OVMF

COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENV ARCH=amd64
ENV BIOS=""
ENV DNSMASQARGS=""
ENV QEMUARGS=""
ENV QEMUEFIVARSFILE="/tmp/ovmf.fd"
ENV MEMORY=2G
ENV SERIALPORT=23
ENV SMP=2
ENV TPM=yes
ENV WEBDIR=/cloudinit

USER qemu

CMD ["/entrypoint.sh"]
