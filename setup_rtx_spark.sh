#!/usr/bin/env bash
# setup_rtx_spark.sh
# Linux / WSL2 Provisioning Wrapper for NVIDIA RTX Spark AI Setup

set -e

echo -e "\033[1;36m============================================================\033[0m"
echo -e "\033[1;36m   NVIDIA RTX Spark — Sovereign AI Provisioning (Linux/WSL2) \033[0m"
echo -e "\033[1;36m============================================================\033[0m"

# 1. Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "\033[1;31m[ERROR] Python3 is not installed or not in PATH.\033[0m"
    echo "Install with: sudo apt update && sudo apt install -y python3 python3-pip python3-venv"
    exit 1
fi

PY_VER=$(python3 -c "import sys; print(sys.version.split()[0])")
echo -e "\033[1;32m[OK] Detected Python ${PY_VER}\033[0m"

# 2. Virtual environment activation
if [ -f ".venv/bin/activate" ]; then
    echo -e "\033[1;33m[INFO] Activating virtual environment (.venv)...\033[0m"
    source .venv/bin/activate
elif [ -z "$VIRTUAL_ENV" ]; then
    echo -e "\033[1;90m[INFO] No virtual environment active. Creating one at .venv...\033[0m"
    python3 -m venv .venv
    source .venv/bin/activate
fi

# 3. Run master setup script
python3 setup_rtx_spark.py "$@"

echo -e "\n\033[1;32m[SUCCESS] RTX Spark setup script finished.\033[0m"
