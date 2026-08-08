#!/bin/bash

echo "==================================================="
echo "   درحال راه اندازی برنامه مدیریت کلاس و معلم...   "
echo "==================================================="

if ! command -v node &> /dev/null
then
    echo "[خطا] نرم افزار Node.js روی سیستم شما نصب نیست!"
    echo "لطفاً ابتدا Node.js را از سایت https://nodejs.org دانلود کنید."
    exit 1
fi

if [ ! -d "node_modules/vite" ]; then
    echo "درحال نصب پیش نیازها (فقط بار اول)..."
    npm install
fi

if command -v open &> /dev/null; then
    (sleep 2 && open http://localhost:3000) &
elif command -v xdg-open &> /dev/null; then
    (sleep 2 && xdg-open http://localhost:3000) &
fi

npm run dev
