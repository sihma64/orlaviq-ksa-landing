export default function SiteHeader() {
  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 border-b border-[#eadfce] bg-[#f7f2ea]/95 backdrop-blur"
    >
      <div className="relative mx-auto flex h-[64px] max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <span className="pointer-events-none absolute inset-x-[96px] top-1/2 hidden -translate-y-1/2 text-center text-[8px] font-semibold leading-3 text-[#5f574f] min-[430px]:block sm:hidden">
  موزع روائح بإضاءة دافئة ورذاذ ناعم
</span>
        <a href="/" className="flex min-w-fit flex-col items-center leading-none">
          <span className="text-xl font-black tracking-[0.14em] text-[#191613] sm:text-2xl">
            ORLAVIQ
          </span>

          <span className="mt-1 text-sm font-extrabold text-[#0f766e] sm:text-base">
            أورلافيق
          </span>
        </a>

        <p className="hidden flex-1 text-center text-base font-black text-[#7a7068] md:block">
          موزع روائح بإضاءة دافئة ورذاذ ناعم
        </p>

        <a
          href="/#order"
          className="cta-shake shrink-0 rounded-full bg-[#0f766e] px-5 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-[#115e59] sm:px-6"
        >
          حوّل أجواء غرفتك
        </a>
      </div>
    </header>
  );
}