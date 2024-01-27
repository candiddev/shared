FROM --platform=$TARGETPLATFORM docker.io/debian:bookworm

LABEL org.opencontainers.image.base.name=docker.io/debian:bookworm
LABEL org.opencontainers.image.licenses=AGPL-3.0-only
LABEL org.opencontainers.image.source=https://github.com/candiddev/shared

RUN apt-get update && apt-get install -y --no-install-recommends \
  dnsmasq \
  genisoimage \
  iproute2 \
  ovmf \
  python3 \
  qemu-efi \
  qemu-efi-aarch64 \
  qemu-efi-arm \
  qemu-system-arm \
  qemu-system-x86 \
  qemu-utils \
  swtpm

COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENV ARCH=amd64
ENV BIOS=""
ENV DNSMASQARGS=""
ENV QEMUARGS=""
ENV MEMORY=""
ENV SMP=""
ENV WEBDIR=/cloudinit

CMD ["/entrypoint.sh"]
