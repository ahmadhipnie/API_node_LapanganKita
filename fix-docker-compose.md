# 🔧 Fix: docker-compose command not found

## Problem
Error: `-bash: docker-compose: command not found`

## Solutions (Pilih salah satu yang berhasil)

### Method 1: Install via apt (Recommended untuk Ubuntu/Debian)
```bash
sudo apt update
sudo apt install docker-compose -y
```

### Method 2: Install Docker Compose Plugin (Docker v2)
```bash
# Install Docker Compose Plugin
sudo apt update
sudo apt install docker-compose-plugin -y

# Gunakan dengan syntax baru:
docker compose up -d --build
# (perhatikan: "docker compose" bukan "docker-compose")
```

### Method 3: Download Binary Manual (jika method 1-2 gagal)
```bash
# Download latest version
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Test
docker-compose --version
```

### Method 4: Install via pip (Python)
```bash
sudo apt install python3-pip -y
sudo pip3 install docker-compose
```

## Test Installation
```bash
# Test docker-compose
docker-compose --version

# atau test docker compose plugin
docker compose version
```

## Deploy Commands

Setelah docker-compose terinstall, gunakan salah satu:

### Jika menggunakan docker-compose (v1):
```bash
docker-compose up -d --build
```

### Jika menggunakan docker compose plugin (v2):
```bash
docker compose up -d --build
```

## Quick Fix Script
Jalankan script ini untuk auto-install:

```bash
#!/bin/bash
echo "🔧 Installing Docker Compose..."

# Try method 1
sudo apt update
sudo apt install docker-compose -y

# Check if successful
if command -v docker-compose &> /dev/null; then
    echo "✅ docker-compose installed successfully!"
    docker-compose --version
else
    echo "⚠️ Method 1 failed, trying method 2..."
    
    # Try method 2 - Docker Compose Plugin
    sudo apt install docker-compose-plugin -y
    
    if docker compose version &> /dev/null; then
        echo "✅ docker compose plugin installed successfully!"
        echo "📝 Use: docker compose up -d --build"
        docker compose version
    else
        echo "⚠️ Method 2 failed, trying method 3..."
        
        # Try method 3 - Manual download
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        
        if command -v docker-compose &> /dev/null; then
            echo "✅ docker-compose installed manually!"
            docker-compose --version
        else
            echo "❌ All methods failed. Please install manually."
        fi
    fi
fi
```