# Server Security Hardening Guide

This guide covers how to secure a Linux server that is accessible via SSH, how to set up proper authentication, logging, and access control. Follow the steps in order — each builds on the previous.

---

## Table of Contents

1. [SSH Key Authentication](#1-ssh-key-authentication)
2. [Two-Factor Authentication — Key + Password](#2-two-factor-authentication--key--password)
3. [Adding SSH Keys for Other Users](#3-adding-ssh-keys-for-other-users)
4. [Creating Individual User Accounts](#4-creating-individual-user-accounts)
5. [Change the SSH Port](#5-change-the-ssh-port)
6. [Firewall with UFW](#6-firewall-with-ufw)
7. [Fail2ban — Brute Force Protection](#7-fail2ban--brute-force-protection)
8. [Command Logging with auditd](#8-command-logging-with-auditd)
9. [Timestamped Shell History](#9-timestamped-shell-history)
10. [Viewing Login History](#10-viewing-login-history)
11. [Revoking Access](#11-revoking-access)

---

## 1. SSH Key Authentication

**Why:** Passwords can be guessed or brute-forced. SSH keys are cryptographic — nearly impossible to crack. A key pair works like a lock and key: you keep the private key on your machine, and the server holds the public key.

### Step 1 — Generate a key on your local machine

```bash
ssh-keygen -t ed25519 -C "your-name"
```

This creates two files:
- `~/.ssh/id_ed25519` — your **private key** (never share this)
- `~/.ssh/id_ed25519.pub` — your **public key** (safe to share)

### Step 2 — Copy your public key to the server

```bash
ssh-copy-id root@your-server-ip
```

Or manually append it on the server:

```bash
cat ~/.ssh/id_ed25519.pub >> /root/.ssh/authorized_keys
```

### Step 3 — Test key login before changing anything

```bash
ssh -i ~/.ssh/id_ed25519 root@your-server-ip
```

Make sure this works before disabling password login.

### Step 4 — Disable password authentication

Edit the SSH config on the server:

```bash
nano /etc/ssh/sshd_config
```

Set:

```
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin prohibit-password
```

Restart SSH:

```bash
systemctl restart sshd
```

Now only key holders can log in. Password-only attempts are rejected.

---

## 2. Two-Factor Authentication — Key + Password

**Why:** Requires both a valid SSH key AND the account password. Stolen password alone won't work. Stolen key alone won't work. An attacker needs both.

Edit `/etc/ssh/sshd_config`:

```
AuthenticationMethods publickey,password
PasswordAuthentication yes
PubkeyAuthentication yes
```

```bash
systemctl restart sshd
```

Login flow:
```
$ ssh root@your-server-ip
# SSH uses your key automatically, then prompts:
root@your-server-ip's password: ▌
```

Both must succeed to get in.

---

## 3. Adding SSH Keys for Other Users

**Why:** Each person should have their own key. This way you can revoke one person's access without affecting others.

### The other person does this on their machine:

```bash
ssh-keygen -t ed25519 -C "their-name"
cat ~/.ssh/id_ed25519.pub
```

They send you the output — it looks like:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxxxxx... their-name
```

### You add it on the server:

```bash
nano /root/.ssh/authorized_keys
```

Paste their public key on a new line. Each line is one person:

```
ssh-ed25519 AAAAC3... your-key
ssh-ed25519 AAAAC3... colleague-name
ssh-ed25519 AAAAC3... another-person
```

Save and exit. No restart needed — changes take effect immediately.

---

## 4. Creating Individual User Accounts

**Why:** If everyone logs in as `root`, you can't tell who did what in the logs. Individual accounts give each person their own identity, and you can restrict what they can do.

### Create a new user:

```bash
adduser john
```

### Give them sudo access (if they need it):

```bash
usermod -aG sudo john
```

### Set up their SSH key:

```bash
mkdir -p /home/john/.ssh
nano /home/john/.ssh/authorized_keys
# paste their public key here
```

### Set correct permissions:

```bash
chown -R john:john /home/john/.ssh
chmod 700 /home/john/.ssh
chmod 600 /home/john/.ssh/authorized_keys
```

Now when `john` logs in, audit logs and `last` will show `john` — not `root`. This makes accountability much cleaner.

---

## 5. Change the SSH Port

**Why:** Port 22 is constantly scanned and attacked by automated bots worldwide. Moving to a different port eliminates almost all of that noise without affecting real security.

Edit `/etc/ssh/sshd_config`:

```
Port 2222
```

If using UFW, allow the new port first (before restarting SSH):

```bash
ufw allow 2222/tcp
```

Then restart:

```bash
systemctl restart sshd
```

Connect with:

```bash
ssh -p 2222 root@your-server-ip
```

> **Warning:** Don't close your current session until you've confirmed the new port works in a new terminal window.

---

## 6. Firewall with UFW

**Why:** A firewall blocks all incoming traffic except what you explicitly allow. If a service has a vulnerability, the firewall prevents attackers from even reaching it.

```bash
apt install ufw

# Default: block all incoming, allow all outgoing
ufw default deny incoming
ufw default allow outgoing

# Allow your services
ufw allow 2222/tcp    # SSH (use your chosen port)
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS

# Enable
ufw enable

# Check status
ufw status verbose
```

To block a specific IP (e.g. if you spot suspicious activity):

```bash
ufw deny from 1.2.3.4
```

---

## 7. Fail2ban — Brute Force Protection

**Why:** Even with keys required, bots still probe servers constantly. Fail2ban monitors logs and automatically bans IPs that repeatedly fail authentication.

```bash
apt install fail2ban
```

Create a local config:

```bash
nano /etc/fail2ban/jail.local
```

```ini
[sshd]
enabled = true
port = 2222
maxretry = 3
bantime = 1h
findtime = 10m
```

- `maxretry = 3` — ban after 3 failed attempts
- `bantime = 1h` — ban lasts 1 hour
- `findtime = 10m` — within a 10-minute window

```bash
systemctl enable fail2ban
systemctl start fail2ban
```

Check banned IPs:

```bash
fail2ban-client status sshd
```

Manually unban an IP:

```bash
fail2ban-client set sshd unbanip 1.2.3.4
```

---

## 8. Command Logging with auditd

**Why:** Records every command executed on the server, by whom, and when. Essential for investigating incidents — you'll never be in the situation of not knowing who ran what.

```bash
apt install auditd
```

Add rules to log all executed commands:

```bash
auditctl -a always,exit -F arch=b64 -S execve -k commands
auditctl -a always,exit -F arch=b32 -S execve -k commands
```

Make the rules persistent across reboots:

```bash
cat >> /etc/audit/rules.d/audit.rules << 'EOF'
-a always,exit -F arch=b64 -S execve -k commands
-a always,exit -F arch=b32 -S execve -k commands
EOF

systemctl restart auditd
```

### Querying audit logs:

```bash
# Summary of all commands run
ausearch -k commands | aureport -x --summary

# Commands run by a specific user
ausearch -k commands -ua john

# Commands run in the last hour
ausearch -k commands --start recent

# Full detail on a specific search
ausearch -k commands | less
```

---

## 9. Timestamped Shell History

**Why:** A quick way to see a timestamped record of commands run in bash sessions. Simpler than auditd for day-to-day checks.

Add to `/root/.bashrc` (and each user's `~/.bashrc`):

```bash
cat >> /root/.bashrc << 'EOF'

# Timestamped history
export HISTTIMEFORMAT="%F %T "
export HISTSIZE=50000
export HISTFILESIZE=100000
export HISTCONTROL=ignoredups
shopt -s histappend
PROMPT_COMMAND="history -a"
EOF

source /root/.bashrc
```

Now `history` shows:

```
1985  2024-11-12 14:32:01 tar -czpf /root/backup.tar.gz ...
1986  2024-11-12 14:33:45 scp root@x.x.x.x:/root/*.tar.gz ~/backups/
```

> Note: This only works for interactive bash sessions. For full coverage of all processes, use auditd (step 8).

---

## 10. Viewing Login History

**Why:** Lets you see who logged in, from where, and when.

```bash
# All recent logins
last | head -30

# Failed login attempts
lastb | head -20

# Last login per user
lastlog

# SSH login events from the journal
journalctl -u ssh --since "7 days ago" | grep "Accepted"

# See currently logged in users
who
w
```

---

## 11. Revoking Access

### Remove an SSH key:

Open the authorized_keys file and delete the relevant line:

```bash
nano /root/.ssh/authorized_keys
# or for a specific user:
nano /home/john/.ssh/authorized_keys
```

Each line is one key. Delete the line for the person you want to remove. Takes effect immediately — no restart needed.

### Disable a user account:

```bash
# Lock the account (they can't log in)
usermod -L john

# Or delete the account entirely
deluser --remove-home john
```

---

## Quick Reference — Priority Order

| Priority | Step | Impact |
|----------|------|--------|
| 1 | SSH keys + disable password auth | Eliminates brute force entirely |
| 2 | UFW firewall | Blocks all unrequired ports |
| 3 | Fail2ban | Auto-bans probing IPs |
| 4 | auditd | Full command audit trail |
| 5 | Change SSH port | Reduces scan noise |
| 6 | Individual user accounts | Accountability per person |
| 7 | Timestamped history | Quick session-level audit |
