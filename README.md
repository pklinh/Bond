# Bond - Setup va Chay Chuong Trinh

Du an su dung `Vite + React + TypeScript`, co API proxy cho FireAnt.

## 1) Yeu cau moi truong

- Node.js 18+ (khuyen nghi Node.js 20 LTS)
- npm di kem Node.js

Kiem tra phien ban:

```bash
node -v
npm -v
```

## 2) Cai dat dependencies

Tai thu muc du an, chay:

```bash
npm install
```

Neu ban dung PowerShell va gap loi `running scripts is disabled`, dung lenh sau:

```bash
npm.cmd install
```

## 3) Cau hinh bien moi truong

Du an dung token FireAnt qua bien:

- `VITE_FIREANT_ACCESS_TOKEN`

Buoc thuc hien:

1. Tao file `.env.local` (hoac `.env`) trong thu muc goc.
2. Them bien:

```env
VITE_FIREANT_ACCESS_TOKEN=your_token_here
```

> Co the tham khao gia tri mau trong file `.env.example`.

## 4) Chay o che do development

```bash
npm run dev
```

Neu dung PowerShell va bi chan script:

```bash
npm.cmd run dev
```

Sau khi chay thanh cong, mo:

- [http://localhost:3000](http://localhost:3000)

## 5) Build production

```bash
npm run build
```

## 6) Preview ban build

```bash
npm run preview
```

## 7) Script co san

- `npm run dev`: Chay server dev (`tsx server.ts`)
- `npm run build`: Build frontend voi Vite
- `npm run preview`: Preview ban build
- `npm run lint`: Kiem tra TypeScript (`tsc --noEmit`)

## 8) Deploy len Vercel

Project da duoc cau hinh API serverless cho Vercel:

- `/api/fireant/*`: Proxy sang `https://restv2.fireant.vn/*`
- `/api/news`: Lay du lieu news (co fallback source)
- `/api/health`: Health check endpoint

Cau hinh can dam bao tren Vercel:

- Build command: `npm run build`
- Output directory: `dist`

Sau deploy, frontend se tiep tuc goi duoc cac route `/api/...` tren cung domain Vercel.

Test nhanh sau deploy:

```bash
curl https://<your-vercel-domain>/api/health
```

Ky vong ket qua:

```json
{
  "ok": true,
  "service": "bond-api",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```
