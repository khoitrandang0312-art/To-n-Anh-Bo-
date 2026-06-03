@echo off
echo ==============================================
echo    KHOI DONG NGAN HANG TOAN ANH BO (LOCAL)
echo ==============================================
echo.

echo [1/2] Dang khoi dong Backend (Node.js) o cong 3000...
start "ToanAnhBo - Backend" cmd /k "cd backend && node server.js"

echo [2/2] Dang khoi dong Frontend (Vite React) o cong 5173...
start "ToanAnhBo - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==============================================
echo He thong dang duoc khoi dong trong 2 cua so moi.
echo Vui long doi vai giay va mo trinh duyet truy cap:
echo http://localhost:5173
echo ==============================================
echo De tat he thong, hay dong 2 cua so mau den do lai.
pause
