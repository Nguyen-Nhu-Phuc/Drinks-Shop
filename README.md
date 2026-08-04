# Frontend – Drinks Shop

## Cài đặt

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

`NEXT_PUBLIC_API_URL` mặc định: `http://localhost:5000/api`

## Scripts

- `npm run dev` — Next.js dev server (port 3000)
- `npm run build` / `npm start` — production
- `npm run lint` — ESLint

### CMS / Page builder

Admin → **Giao diện** (`/admin/site`):
- Kéo-thả sắp xếp section trang chủ
- Bật/tắt, thêm/xoá section (Hero, Marquee, Categories, Product grid, CTA, Rich text, Coupon banner)
- Sửa brand, menu nav, footer, AI widget

API: `GET /api/site/public` · `PUT /api/site/admin` · reorder/sections endpoints

## Auth note

Token JWT lưu trong `localStorage` và gắn vào Axios interceptor. Backend cũng set httpOnly cookie. Xem README gốc về đánh đổi bảo mật.
