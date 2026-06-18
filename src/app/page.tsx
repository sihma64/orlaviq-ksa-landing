"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/tracking";

const WHATSAPP_NUMBER = "212716296177";

const offers = [
  {
    id: "1",
    label: "قطعة واحدة",
    price: "99 ريال",
    note: "تجربة أولى",
  },
  {
    id: "2",
    label: "قطعتين",
    price: "169 ريال",
    note: "الأكثر اختياراً",
  },
  {
    id: "3",
    label: "3 قطع",
    price: "229 ريال",
    note: "للبيت كامل",
  },
];

const videos = [
  {
    title: "لقطة المنتج",
    file: "/videos/01_hook_direct_ksa_ar.mp4",
  },
  {
    title: "تجربة داخل الغرفة",
    file: "/videos/02_problem_story_ksa_ar.mp4",
  },
  {
    title: "تأثير الضوء والرذاذ",
    file: "/videos/03_solution_cta_ksa_ar.mp4",
  },
];

const benefits = [
  "تأثير ضوئي يشبه اللهب عبر الرذاذ والإضاءة",
  "مناسب لغرفة النوم والمجلس والمكتب",
  "يعمل مع 2 إلى 3 قطرات من الزيت العطري",
  "خزان ماء بسعة 180 مل",
  "مستويان للإضاءة",
  "تصميم ديكوري أنيق",
];

const specs = [
  "تأثير ضوئي يشبه اللهب عبر الضوء والرذاذ",
  "خزان ماء: 180 مل",
  "يعمل بكابل USB",
  "مستويان للإضاءة",
  "زر تشغيل",
  "حساس مدمج لمستوى الماء",
  "الأبعاد: 10 × 7.5 × 17 سم",
  "الوزن: 0.4 كجم",
  "المحتويات: الجهاز + كابل USB + عصا قطنية + دليل المستخدم",
];

const howToSteps = [
  "افتح الغطاء العلوي",
  "أضف الماء داخل الخزان بسعة تصل إلى 180 مل",
  "أضف 2 إلى 3 قطرات من الزيت العطري",
  "وصّل الجهاز بكابل USB",
  "اضغط زر التشغيل واختر مستوى الإضاءة",
  "استمتع بتأثير الضوء والرذاذ داخل الغرفة",
];

export default function Home() {
  const [selectedOffer, setSelectedOffer] = useState("2");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const offer = useMemo(
    () => offers.find((item) => item.id === selectedOffer) ?? offers[1],
    [selectedOffer]
  );

  useEffect(() => {
    trackEvent("ViewContent", {
      brand: "ORLAVIQ",
      product: "flame_aroma_diffuser",
      market: "KSA",
      page: "home",
    });
  }, []);

  function buildWhatsappMessage() {
    const cityLine = city.trim() ? `\nالمدينة: ${city}` : "";

    return `السلام عليكم، أريد تأكيد طلب موزع روائح بتأثير اللهب من ORLAVIQ.

الطلب: ${offer.label}
السعر: ${offer.price}

الاسم الشخصي: ${fullName}
رقم الجوال: ${phone}${cityLine}

طريقة الدفع: الدفع عند الاستلام`;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    trackEvent("OrderFormSubmit", {
      brand: "ORLAVIQ",
      product: "flame_aroma_diffuser",
      offer_id: offer.id,
      offer_label: offer.label,
      offer_price: offer.price,
      has_city: Boolean(city.trim()),
    });

    const message = encodeURIComponent(buildWhatsappMessage());
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    trackEvent("WhatsAppConfirmClick", {
      brand: "ORLAVIQ",
      product: "flame_aroma_diffuser",
      offer_id: offer.id,
      offer_label: offer.label,
      offer_price: offer.price,
      whatsapp_number: WHATSAPP_NUMBER,
    });

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main 
    id="top"
    dir="rtl" className="min-h-screen overflow-x-hidden bg-[#f7f2ea] text-[#191613]">
      <section className="mx-auto grid max-w-[1120px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.35fr)_360px] lg:items-center lg:px-8 lg:pt-10 lg:pb-4">
        <div className="order-2 lg:order-1">
          <p className="mb-4 inline-flex rounded-full bg-[#191613] px-4 py-2 text-sm font-semibold text-white">
            الدفع عند الاستلام
          </p>

          <h1 className="max-w-[620px] text-4xl font-black leading-tight sm:text-5xl lg:text-[52px]">
           إضاءة دافئة ورذاذ يضيفان لمسة هادئة لغرفتك
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5f574f]">
              موزع روائح أنيق يجمع بين الرذاذ والإضاءة ليمنح غرفتك مظهراً دافئاً
بإحساس هادئ ومريح. مناسب لغرفة النوم، المجلس، أو المكتب.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {offers.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedOffer(item.id);
                  trackEvent("SelectOffer", {
                    offer_id: item.id,
                    offer_label: item.label,
                    offer_price: item.price,
                  });
                }}
                className={`rounded-3xl border p-5 text-right transition ${
                  selectedOffer === item.id
                    ? "border-[#0f766e] bg-[#0f766e] text-white shadow-lg"
                    : "border-[#e0d6c9] bg-white text-[#191613]"
                }`}
              >
                <p className="text-lg font-black">{item.label}</p>
                <p className="mt-2 text-2xl font-black">{item.price}</p>
                <p className="mt-1 text-sm opacity-80">{item.note}</p>
              </button>
            ))}
          </div>

          <a
            href="#order"
            className="cta-shake mt-8 inline-block rounded-2xl bg-[#0f766e] px-8 py-4 text-center text-lg font-bold text-white shadow-lg transition hover:bg-[#115e59]"
          >
            حوّل أجواء غرفتك الآن
          </a>

          <p className="mt-4 text-lg font-medium leading-8 text-[#7a7068]">
            بعد تسجيل الطلب، يتم تأكيده عبر واتساب قبل التجهيز.
          </p>
        </div>

        <div className="order-1 mx-auto w-full max-w-[320px] rounded-[2rem] bg-white p-3 shadow-2xl lg:order-2 lg:ml-0 lg:mr-auto lg:max-w-[340px]">
          <img
  src="/images/how-to/howto-05-power-on.webp"
  alt="موزع روائح بإضاءة دافئة ورذاذ ناعم"
  className="h-full w-full rounded-[1.5rem] object-cover"
/>
        </div>
      </section>

      <section id="order" className="mx-auto max-w-[1120px] px-4 pt-2 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-[1.6rem] bg-white p-4 shadow-2xl sm:p-5">
  <div className="mb-4 rounded-2xl bg-[#0f766e] px-5 py-2.5 text-white">
    <p className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-black tracking-tight text-[#0f766e]">
      طلبك الحالي

    </p>

    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        
        <p className="mt-1 text-2xl font-black">{offer.label}</p>
      </div>

      <p className="text-3xl font-black">{offer.price}</p>
    </div>

    <p className="mt-3 text-sm text-white/75">
      الدفع عند الاستلام — تأكيد الطلب عبر واتساب قبل التجهيز
    </p>
  </div>

  <form onSubmit={handleSubmit} className="space-y-5">
            

            <div>
              <label className="mb-2 block font-bold">الاسم الشخصي *</label>
              <input
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="نورة"
                className="w-full rounded-2xl border border-[#e0d6c9] bg-[#fffaf2] px-4 py-4 text-lg outline-none focus:border-[#0f766e]"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold">رقم الجوال *</label>
              <input
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="05xxxxxxxx"
                className="w-full rounded-2xl border border-[#e0d6c9] bg-[#fffaf2] px-4 py-4 text-lg outline-none focus:border-[#0f766e]"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold">
                المدينة{" "}
                <span className="text-sm font-normal text-[#7a7068]">
                  (اختياري)
                </span>
              </label>
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="مثال: الرياض"
                className="w-full rounded-2xl border border-[#e0d6c9] bg-[#fffaf2] px-4 py-4 text-lg outline-none focus:border-[#0f766e]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#0f766e] px-8 py-5 text-xl font-black text-white shadow-lg transition hover:bg-[#115e59]"
            >
              تأكيد الطلب عبر واتساب
            </button>

            <p className="text-center text-base font-black leading-8 text-[#5f574f]">
              لن يتم تجهيز الطلب قبل تأكيده عبر واتساب.
            </p>
          </form>
        </div>
      </section>

      <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
  <div className="mx-auto max-w-[1040px] rounded-[1.75rem] border border-[#eadfce] bg-[#fffaf2] px-5 py-7 sm:px-7 sm:py-8">
    <div className="text-center">
      <p className="text-base font-black text-[#0f766e]">
        مناسب للاستخدام اليومي
      </p>

      <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
        مناسب لهذه المساحات داخل البيت
      </h2>

      <p className="mx-auto mt-4 max-w-3xl text-base font-medium leading-8 text-[#5f574f]">
        يمكن وضع موزع الروائح على طاولة جانبية أو مكتب أو زاوية ديكور لإضافة
        إضاءة دافئة ورذاذ ناعم داخل الغرفة.
      </p>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        "غرفة النوم",
        "المجلس",
        "المكتب",
        "زاوية الديكور",
      ].map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3.5 text-center text-base font-black shadow-sm"
        >
          {item}
        </div>
      ))}
    </div>
  </div>
</section>

      <section className="mx-auto max-w-[1120px] px-4 pt-5 pb-4 sm:px-6 lg:px-8">
  <div className="text-center">
    <h2 className="text-3xl font-black">ما الذي يميز ORLAVIQ؟</h2>
    <p className="mx-auto mt-2 max-w-2xl leading-7 text-[#5f574f]">
      موزع روائح بتصميم ديكوري يجمع بين الرذاذ الناعم والإضاءة الدافئة ليضيف
      لمسة مختلفة لغرفتك.
    </p>
  </div>

  <div className="mt-5 grid gap-5 md:grid-cols-3">
    {[
      {
        title: "إضاءة تشبه شكل اللهب",
        text: "تأثير ضوئي دافئ مع الرذاذ، بدون لهب حقيقي أو نار.",
      },
      {
        title: "موزع للزيوت العطرية",
        text: "يمكن استخدامه مع 2 إلى 3 قطرات فقط من الزيت العطري حسب الرغبة.",
      },
      {
        title: "قطعة ديكور عملية",
        text: "مناسب لغرفة النوم، المجلس، المكتب، أو زاوية الاسترخاء في البيت.",
      },
    ].map((item) => (
      <div
        key={item.title}
        className="rounded-[2rem] bg-white p-6 text-center shadow-sm"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0f766e] text-xl font-black text-white">
          ✓
        </div>
        <h3 className="mt-5 text-xl font-black">{item.title}</h3>
        <p className="mt-3 leading-8 text-[#5f574f]">{item.text}</p>
      </div>
    ))}
  </div>

  <section className="mx-auto max-w-[1040px] px-4 pt-8 pb-0 sm:px-6 lg:px-8">
  <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-[#eadfce]">
    <div className="border-b border-[#eadfce] px-6 py-6 text-right">
      <h2 className="text-3xl font-black">مواصفات المنتج</h2>
      <p className="mt-2 text-base font-medium leading-8 text-[#5f574f]">
        تفاصيل مختصرة لمساعدتك على معرفة حجم المنتج وطريقة تشغيله.
      </p>
    </div>

    <div className="relative grid lg:grid-cols-2">
      <div className="hidden lg:block absolute inset-y-0 left-1/2 z-10 w-[4px] -translate-x-1/2 bg-[#0f766e]" />

      <div className="divide-y divide-[#eadfce]">
        {[
          ["نوع المنتج", "موزع روائح مع رذاذ وإضاءة"],
          ["سعة الخزان", "180 مل"],
          ["طريقة التشغيل", "كابل USB"],
          ["الإضاءة", "مستويان للإضاءة"],
          ["زر التشغيل", "زر باور للتحكم"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[140px_1fr] items-center gap-4 px-6 py-5"
          >
            <p className="text-right font-bold text-[#6b6259]">{label}</p>
            <p className="text-right text-lg font-black text-[#191613]">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="divide-y divide-[#eadfce] border-t border-[#eadfce] lg:border-t-0">
        {[
          ["الزيت العطري", "2 إلى 3 قطرات فقط"],
          ["مستشعر الماء", "حساس مدمج لمستوى الماء"],
          ["الأبعاد", "10 × 7.5 × 17 سم"],
          ["الوزن", "0.4 كجم"],
          ["المحتويات", "الجهاز + كابل USB + عصا قطنية + دليل المستخدم"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[140px_1fr] items-center gap-4 px-6 py-5"
          >
            <p className="text-right font-bold text-[#6b6259]">{label}</p>
            <p className="text-right text-lg font-black text-[#191613]">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>

 <p className="mx-auto mt-3 max-w-3xl rounded-2xl bg-white px-4 py-3 text-center text-base leading-6 text-[#7a7068] shadow-sm">
    ملاحظة: المنتج غير طبي ولا يحتوي على لهب حقيقي. التأثير الظاهر ناتج عن
    الإضاءة والرذاذ فقط.
  </p>
</section>
  
</section>

      <section className="mx-auto max-w-[1040px] px-4 pt-1 pb-8 sm:px-6 lg:px-8">
  <div className="rounded-[1.75rem] bg-[#191613] px-5 py-5 text-white sm:px-6 sm:py-6">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-black sm:text-3xl">طريقة الاستخدام</h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-white/70">
          ست خطوات بسيطة لتشغيل موزع الروائح والاستمتاع بتأثير الضوء والرذاذ داخل الغرفة.
        </p>
      </div>

      <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/80">
        6 خطوات فقط
      </span>
    </div>

    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[
        {
          number: 1,
          image: "/images/how-to/howto-01-open-cover.webp",
          title: "افتح الغطاء",
          text: "افتح الغطاء العلوي للجهاز برفق.",
        },
        {
          number: 2,
          image: "/images/how-to/howto-02-add-water.webp",
          title: "أضف الماء",
          text: "أضف الماء داخل الخزان دون تجاوز 180 مل.",
        },
        {
          number: 3,
          image: "/images/how-to/howto-03-add-oil.webp",
          title: "أضف الزيت العطري",
          text: "أضف 2 إلى 3 قطرات فقط من الزيت العطري.",
        },
        {
          number: 4,
          image: "/images/how-to/howto-04-plug-usb.webp",
          title: "وصّل كابل USB",
          text: "وصّل الجهاز بمصدر طاقة مناسب عبر كابل USB.",
        },
        {
          number: 5,
          image: "/images/how-to/howto-05-power-on.webp",
          title: "اضغط زر التشغيل",
          text: "اضغط زر التشغيل واختر مستوى الإضاءة المناسب.",
        },
        {
          number: 6,
          image: "/images/how-to/howto-06-enjoy.gif",
          title: "استمتع بالأجواء",
          text: "استمتع بتأثير الضوء والرذاذ داخل الغرفة.",
        },
      ].map((item) => (
        <article
          key={item.number}
          className="overflow-hidden rounded-[1.35rem] bg-white text-[#191613] shadow-sm"
        >
          <div className="relative flex h-[190px] items-center justify-center bg-[#f7f2ea] p-1.5">
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full rounded-[1rem] object-contain"
            />

            <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#0f766e] text-sm font-black text-white shadow-md">
              {item.number}
            </div>
          </div>

          <div className="h-[92px] px-4 py-3">
  <h3 className="text-base font-black leading-6">{item.title}</h3>
  <p className="mt-2 text-base font-medium leading-7 text-[#5f574f]">
    {item.text}
  </p>
</div>
        </article>
      ))}
    </div>

    <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-center text-base font-medium leading-7 text-white/80">
      ملاحظة: لا تتجاوز سعة الخزان 180 مل. لا تستخدم الجهاز بدون ماء. استخدم
      2 إلى 3 قطرات فقط من الزيت العطري، واتبع التعليمات المرفقة مع المنتج.
    </p>

    <a
      href="#order"
      className="mt-4 block rounded-2xl bg-white px-8 py-3 text-center text-base font-black text-[#191613]"
    >
      أضف لمسة هادئة لغرفتك
    </a>
  </div>
</section>

      

      <section className="mx-auto max-w-[1120px] px-4 pt-5 pb-10 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-black">أسئلة شائعة</h2>

        <div className="mt-6 space-y-4">
          <details className="rounded-2xl bg-white p-5 shadow-sm">
            <summary className="cursor-pointer font-black">
              هل المنتج طبي؟
            </summary>
            <p className="mt-3 leading-8 text-[#5f574f]">
              لا. المنتج غير طبي ولا يعالج أي حالة صحية. استخدامه مخصص لتجربة
              الرذاذ والإضاءة والروائح داخل الغرفة فقط.
            </p>
          </details>

          <details className="rounded-2xl bg-white p-5 shadow-sm">
            <summary className="cursor-pointer font-black">
              هل الزيت العطري ضروري؟
            </summary>
            <p className="mt-3 leading-8 text-[#5f574f]">
              يمكن استخدام الجهاز مع الماء، وإضافة الزيت العطري اختيارية حسب
              الرغبة. عند استخدام الزيت، تكفي 2 إلى 3 قطرات فقط.
            </p>
          </details>

          <details className="rounded-2xl bg-white p-5 shadow-sm">
            <summary className="cursor-pointer font-black">
              هل يوجد دفع عند الاستلام؟
            </summary>
            <p className="mt-3 leading-8 text-[#5f574f]">
              نعم، الدفع عند الاستلام متاح حسب توفر الخدمة. يتم تأكيد الطلب عبر
              واتساب قبل التجهيز.
            </p>
          </details>
        </div>
      </section>
      <a
  href="#top"
  aria-label="العودة إلى أعلى الصفحة"
  className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f766e] text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#115e59]"
>
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
</a>
    </main>
  );
}