export default function SiteFooter() {
  return (
    <footer
      dir="rtl"
      className="border-t border-[#2b2723] bg-[#191613] px-4 py-8 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1040px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <h2 className="text-2xl font-black tracking-[0.22em] text-white sm:text-3xl">
  ORLAVIQ
</h2>

<p className="mt-1 text-sm font-extrabold text-[#d8b56d] sm:text-base">
             
  أورلافيق
</p>
          </div>

          <p className="max-w-3xl text-sm leading-7 text-white/70">
            موزع روائح بإضاءة دافئة ورذاذ ناعم. المنتج غير طبي ولا يحتوي على
            لهب حقيقي، والتأثير الظاهر ناتج عن الإضاءة والرذاذ فقط.
          </p>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-bold text-white/80">
            <a href="/privacy" className="hover:text-white">
              سياسة الخصوصية
            </a>
            <a href="/terms" className="hover:text-white">
              الشروط والأحكام
            </a>
            <a href="/terms-of-sale" className="hover:text-white">
              شروط البيع
            </a>
            <a href="/shipping-policy" className="hover:text-white">
              سياسة الشحن
            </a>
            <a href="/return-policy" className="hover:text-white">
              الاستبدال والاسترجاع
            </a>
            <a href="/payment" className="hover:text-white">
              الدفع عند الاستلام
            </a>
            <a href="/faq" className="hover:text-white">
              الأسئلة الشائعة
            </a>
            <a href="/contact" className="hover:text-white">
              تواصل معنا
            </a>
          </nav>

          <p className="border-t border-white/10 pt-6 text-xs text-white/45">
            © 2026 ORLAVIQ. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}