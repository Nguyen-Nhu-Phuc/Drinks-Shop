import Link from 'next/link';

const faqs = [
  {
    q: 'Giao hàng mất bao lâu?',
    a: 'Trong nội thành thường 1–3 giờ theo khung giờ bạn chọn lúc checkout.',
  },
  {
    q: 'Làm sao dùng mã giảm giá?',
    a: 'Tại trang thanh toán, nhập mã (VD: DRINKS10) rồi bấm Áp dụng trước khi thanh toán Stripe.',
  },
  {
    q: 'Tôi có thể huỷ đơn không?',
    a: 'Đơn ở trạng thái chờ thanh toán hoặc đã thanh toán (chưa chuẩn bị) có thể huỷ trong Tài khoản → Đơn hàng.',
  },
  {
    q: 'Wishlist là gì?',
    a: 'Danh sách yêu thích giúp bạn lưu món để mua sau. Cần đăng nhập; bấm icon ♡ trên thẻ sản phẩm.',
  },
  {
    q: 'AI gợi ý hoạt động thế nào?',
    a: 'Chatbot đọc danh mục thật trên MongoDB rồi trả lời bằng tiếng Việt, kèm link sản phẩm. Cần cấu hình ANTHROPIC_API_KEY ở backend.',
  },
];

export default function FaqPage() {
  return (
    <div className="section-pad mx-auto max-w-reading">
      <p className="text-xs uppercase tracking-[0.72px] text-shade-50">Hỗ trợ</p>
      <h1 className="mt-2 font-display text-display-md max-md:text-4xl">FAQ</h1>
      <p className="mt-3 text-shade-50">
        Câu hỏi thường gặp về đặt hàng, voucher và giao nhận.
      </p>
      <ul className="mt-10 space-y-6">
        {faqs.map((item) => (
          <li
            key={item.q}
            className="rounded-lg border border-hairline-light bg-canvas-light p-6"
          >
            <h2 className="font-display text-heading-md">{item.q}</h2>
            <p className="mt-3 text-shade-60">{item.a}</p>
          </li>
        ))}
      </ul>
      <Link href="/products" className="btn-primary mt-10 inline-flex">
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}
