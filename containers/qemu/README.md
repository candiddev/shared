# QEMU Container

> Run QEMU in containers using common cloud interfaces like cloud-init

This container comes with everything you need to run virtual machines using QEMU in Docker:

- DNSMASQ, for custom DNS resolution
- genisoimage, for creating ISOs for cloud-init
- OVMF, for UEFI VMs
- Python3, for running a simple HTTP webservice for cloud-init
- QEMU, for running aarch64, arm, and x86 VMs
- TPM, for emulating TPMs

The container is currently hosted on GitHub: https://github.com/candiddev/shared/pkgs/container/qemu.

## Environment Variables

- `ARCH` The QEMU arch to emulate.  Valid values are `amd64`, `arm`, and `arm64`.  Default: `amd64`
- `BIOS` If set to a value, will enable BIOS boot.  Default: UEFI boot.
- `DNSMASQARGS` Arguments to pass to DNSMASQ.  Default: `""`
- `QEMUARGS` Arguments to pass to QEMU.  Default: `""`
- `WEBDIR` The path to a webdir to expose via python HTTP.  Default: `/cloudinit`

## Usage Examples

```bash
docker run $(if [[ -e /dev/kvm ]]; then echo "--device /dev/kvm"; fi) \
  -e ARCH=amd64 \
  -e DNSMASQARGS="-A /metadata.google.internal/169.254.169.254" \
  -e QEMUARGS="-drive file=/work/disk.raw,if=virtio,media=disk,format=qcow2,cache=none,index=0 -drive file=/work/cidata.iso,media=cdrom,if=virtio,index=1 -nic user,hostfwd=tcp::22-:22" \
  -d \
  --cap-add=NET_ADMIN \
  -p 22 \
  -p 23 \
  -v /work:/work \
  -v /cloudinit:/cloudinit \
  ghcr.io/candiddev/qemu:latest
```

This example will:
- Mount /dev/kvm into the container if it's available
- Setup a DNSMASQ entry for metadata.google.internal (for emulating a Google Cloud metadata response)
- Have QEMU boot a disk.raw file and mount a cidata ISO as a cdrom
- Have QEMU attach a NIC using user mode networking and forward port 22
- Add the NET_ADMIN capability so the container can add the 169.254.169.254 IP to its localhost for metadata servers
- Expose port 22 (VM SSH)
- Expose port 23 (serial connection, use `nc ::1 <port>` to connect to it)
