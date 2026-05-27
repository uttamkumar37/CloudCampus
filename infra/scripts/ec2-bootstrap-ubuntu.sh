#!/usr/bin/env sh
set -eu

APP_USER="${APP_USER:-cloudcampus}"
APP_DIR="${APP_DIR:-/opt/cloudcampus}"
ENABLE_UFW="${ENABLE_UFW:-true}"
INSTALL_CERTBOT="${INSTALL_CERTBOT:-true}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this script as root, for example: sudo sh infra/scripts/ec2-bootstrap-ubuntu.sh" >&2
  exit 1
fi

if [ -r /etc/os-release ]; then
  . /etc/os-release
else
  echo "Cannot detect operating system. /etc/os-release is missing." >&2
  exit 1
fi

if [ "${ID:-}" != "ubuntu" ]; then
  echo "This bootstrap script is intended for Ubuntu EC2 hosts. Detected: ${ID:-unknown}" >&2
  exit 1
fi

echo "Updating apt package index..."
apt-get update

echo "Installing base packages..."
apt-get install -y ca-certificates curl gnupg git nginx ufw unattended-upgrades

echo "Installing Docker official apt repository..."
install -m 0755 -d /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

ARCH="$(dpkg --print-architecture)"
VERSION_CODENAME="${VERSION_CODENAME:-noble}"
echo "deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Enabling services..."
systemctl enable --now docker
systemctl enable --now nginx
systemctl enable --now unattended-upgrades

if ! id "$APP_USER" >/dev/null 2>&1; then
  echo "Creating application user: $APP_USER"
  useradd --system --create-home --shell /bin/bash "$APP_USER"
fi

usermod -aG docker "$APP_USER"

echo "Preparing application directory: $APP_DIR"
mkdir -p "$APP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"
chmod 750 "$APP_DIR"

echo "Preparing backup directory..."
mkdir -p /var/backups/cloudcampus
chown "$APP_USER:$APP_USER" /var/backups/cloudcampus
chmod 750 /var/backups/cloudcampus

if [ "$ENABLE_UFW" = "true" ]; then
  echo "Configuring UFW. Ensure SSH is already restricted by the EC2 security group."
  ufw allow OpenSSH
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable
fi

if [ "$INSTALL_CERTBOT" = "true" ]; then
  echo "Installing Certbot..."
  apt-get install -y certbot python3-certbot-nginx
fi

cat >/etc/logrotate.d/cloudcampus-docker <<'LOGROTATE'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=50M
    missingok
    delaycompress
    copytruncate
}
LOGROTATE

echo "Bootstrap complete."
echo "Next steps:"
echo "1. Clone or copy the CloudCampus repo into $APP_DIR."
echo "2. Create .env.staging or .env.production on the server with real secret values."
echo "3. Copy infra/nginx/cloudcampus.conf to /etc/nginx/conf.d/cloudcampus.conf and replace the domain."
echo "4. Run certbot for the real domain."
echo "5. Start CloudCampus with docker compose."
