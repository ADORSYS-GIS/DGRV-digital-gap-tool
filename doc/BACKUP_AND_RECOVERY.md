# Backup & Recovery — DGRV Digital Gap Assessment Tool

> Operational runbook for backup and restore. The scripts are
> `scripts/backup.sh` and `scripts/restore.sh`. Read this before you need it.

## 1. What Gets Backed Up

| Component | What | Format |
|---|---|---|
| Application DB (`dgat`) | entire database | `pg_dump -F c` (custom, compressed) |
| Keycloak DB (`keycloak`) | entire database | `pg_dump -F c` |
| MinIO report files | `/data` volume | `tar czf` of the volume |
| `.env` | environment config + secrets | file copy (`.env.bak`) |
| Keycloak realm | realm `digital-gap` (with users) | `kc.sh export` (best-effort) |

Everything is bundled into a timestamped `.tar.gz` under `/opt/dgrv-backups`.

## 2. Backup — `scripts/backup.sh`

Run **on the server host** (needs Docker access and the `.env` for credentials). It
assumes the container names from `docker-compose.yml`:

- `dgrv-db` (app Postgres), `dgrv-keycloak-db` (Keycloak Postgres),
  `dgrv-minio` (MinIO), `dgrv-keycloak` (Keycloak).

### Behavior

1. Creates `/opt/dgrv-backups/<YYYY-MM-DD_HH-MM-SS>/`.
2. **App DB**: `docker exec dgrv-db pg_dump -U postgres -d dgat -F c -f
   /tmp/dgat_backup.dump`; `docker cp` to the backup dir; removes the temp file.
3. **Keycloak DB**: same against `dgrv-keycloak-db` (`-d keycloak`). Falls back to a
   legacy mode scanning the app DB's `keycloak` schema if `dgrv-keycloak-db` is absent
   (for older single-DB deployments).
4. **MinIO**: `docker run --rm --volumes-from dgrv-minio -v <backup>:/backup alpine tar
   czf /backup/minio-data.tar.gz /data`.
5. **`.env`**: copies `/root/DGRV-digital-gap-tool/.env` → `.env.bak`.
6. **Realm export**: logs into master realm via `kcadm.sh`, then
   `kc.sh export --dir /tmp/realm-export --realm digital-gap --users realm_file` (best
   effort; failures tolerated).
7. Compresses the whole folder into `/opt/dgrv-backups/<DATE>.tar.gz` and removes the
   uncompressed folder.
8. **Retention**: deletes local `.tar.gz` backups older than `RETENTION_DAYS` (default **7**).
9. **Off-site** (optional): if `RCLONE_REMOTE` is set and `rclone` is installed, copies
   the archive to `rclone <remote>:<bucket>/` and removes off-site backups older than
   `OFFSITE_RETENTION_DAYS` (default **30**).

### Schedule (example cron)

```cron
# /etc/cron.d/dgrv-backup — daily 02:30, keep 7 local, push to S3-compatible remote
30 2 * * * root RCLONE_REMOTE=s3-dgrv RCLONE_BUCKET=dgrv-backups /root/DGRV-digital-gap-tool/scripts/backup.sh >> /var/log/dgrv-backup.log 2>&1
```

Set up the rclone remote once: `rclone config` (e.g. name `s3-dgrv`, type S3, with
your off-site provider creds).

## 3. Restore — `scripts/restore.sh`

Usage:

```bash
./scripts/restore.sh /opt/dgrv-backups/2026-04-07_12-00-00.tar.gz
```

Steps:
1. Extracts the archive to `/tmp/dgrv-restore` (`--strip-components=1`).
2. **App DB**: copies `dgat.dump` into `dgrv-db`, then `psql` `DROP DATABASE IF EXISTS
   dgat; CREATE DATABASE dgat;` and `pg_restore -U postgres -d dgat`.
3. **Keycloak DB**: same against `dgrv-keycloak-db` (`-d keycloak`).
4. **`.env`**: copies `.env.bak` back to `/root/DGRV-digital-gap-tool/.env`.
5. Removes the temp restore dir.
6. Prints: `Restore completed. Restart services with: docker compose restart`.

### Restoring MinIO data (not automated by `restore.sh`)

`restore.sh` does **not** restore MinIO data. To do it manually:

```bash
# Stop MinIO, replace the volume, restart
docker compose stop minio
# (extract minio-data.tar.gz into the MinIO volume's data dir)
docker volume inspect dgrv-digital-gap-tool_minio-data --format '{{ .Mountpoint }}'
# e.g. /var/lib/docker/volumes/dGRV-digital-gap-tool_minio-data/_data
tar xzf <backup>/minio-data.tar.gz -C <that-mountpoint>  # adjust path inside the tar
docker compose up -d minio
```

## 4. Recovery Procedure (full disaster)

Assumes a **fresh server** (see `DEPLOYMENT.md` for the initial setup), then restore:

```bash
ssh -i <key.pem> ubuntu@gat.dgrvcoop360.com

# 1. Provision the host (Docker, Nginx, certbot) — see DEPLOYMENT.md §2
# 2. Clone & bring up a clean stack
cd ~
git clone https://github.com/<owner>/DGRV-digital-gap-tool.git
cd DGRV-digital-gap-tool
cp .env.example .env       # placeholder; restore.sh will overwrite it
docker compose up -d

# 3. Restore data (stops are NOT done by the script — do them yourself for consistency)
docker compose stop backend keycloak
bash scripts/restore.sh /opt/dgrv-backups/<DATE>.tar.gz

# 4. Restore MinIO data (see §3)
# 5. Re-import the Keycloak realm if Keycloak DB restore was incomplete:
docker compose exec keycloak /opt/keycloak/bin/kc.sh import \
  --file /tmp/realm-export/digital-gap-realm.json --override true
# (or simply rely on the keycloak-db restore, which usually suffices)

# 6. Reissue TLS cert if the host changed
sudo certbot --nginx -d gat.dgrvcoop360.com --redirect

# 7. Bring everything back up
docker compose up -d
docker compose logs -f backend
```

## 5. RTO / RPO Targets

- **RPO (data loss tolerance):** with daily 02:30 backups, up to ~24h of app/Keycloak DB
  changes and MinIO uploads could be lost. Reduce cron frequency for tighter RPO.
- **RTO (recovery time):** < 1 hour on a pre-provisioned host (most time is
  `certbot` + `docker compose pull`); expect longer on a truly fresh host.

## 6. Important Notes & Caveats

1. `restore.sh` **drops and recreates** the `dgat` and `keycloak` databases — any data
   added after the backup is lost. Stop the backend and keycloak first to avoid writes
   during restore.
2. Hardcoded paths: backup writes to `/opt/dgrv-backups`; `.env` path assumes
   `/root/DGRV-digital-gap-tool/.env`. If you deploy elsewhere, edit the scripts or
   symlink.
3. Keycloak realm export uses `--users realm_file`; for a full user-bearing export this
  needs Keycloak to be running. The backup script tolerates export failure, so treat
  the `keycloak.dump` (DB-level) as the authoritative Keycloak restore source.
4. **MinIO restore is manual.** Track it as part of your DR drill.
5. Test restores regularly — an untested backup is not a backup.