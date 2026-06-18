type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalPageProps = {
  title: string;
  intro: string;
  sections: LegalSection[];
  lastUpdated?: string;
};

export default function LegalPage({
  title,
  intro,
  sections,
  lastUpdated = "2026",
}: LegalPageProps) {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f2ea] px-5 py-14 text-[#191613]"
    >
      <section className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex w-fit rounded-full bg-[#191613] px-4 py-2 text-sm font-black text-white">
              ORLAVIQ
            </p>

            <a
              href="/"
              className="inline-flex w-fit rounded-2xl border border-[#eadfce] bg-[#fffaf2] px-5 py-3 text-sm font-black text-[#191613] transition hover:bg-[#f7f2ea]"
            >
              العودة إلى الصفحة الرئيسية
            </a>
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight text-[#191613] sm:text-5xl">
            {title}
          </h1>

          <p className="mt-6 text-lg leading-9 text-[#4b453f]">{intro}</p>

          <p className="mt-5 text-sm text-[#7a7068]">
            آخر تحديث: {lastUpdated}
          </p>
        </div>

        <div className="mt-8 space-y-5">
          {sections.map((section) => (
            <article
              key={section.heading}
              className="rounded-[2rem] bg-white p-7 shadow-sm"
            >
              <h2 className="text-2xl font-black text-[#191613]">
                {section.heading}
              </h2>

              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-4 leading-9 text-[#4b453f]">
                  {paragraph}
                </p>
              ))}

              {section.bullets ? (
                <ul className="mt-5 space-y-3 leading-8 text-[#4b453f]">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#0f766e]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-[#eadfce] bg-[#fffaf2] p-6 text-sm leading-8 text-[#5f574f]">
          قد يتم تحديث هذه المعلومات حسب شريك التشغيل، شركة التوصيل، الدولة
          المستهدفة، أو متطلبات البيع والتجربة التشغيلية.
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex rounded-2xl bg-[#0f766e] px-8 py-4 text-base font-black text-white shadow-sm transition hover:bg-[#115e59]"
          >
            العودة إلى الصفحة الرئيسية
          </a>
        </div>
      </section>
    </main>
  );
}