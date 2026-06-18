export default function ContactPage() {
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

          <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">
            تواصل معنا
          </h1>

          <p className="mt-6 text-lg leading-9 text-[#4b453f]">
            هذه الصفحة مخصصة لتوضيح قنوات التواصل المتاحة حالياً في مرحلة اختبار
            متجر ORLAVIQ.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <article className="rounded-[2rem] bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">تأكيد الطلبات</h2>

            <p className="mt-4 leading-9 text-[#4b453f]">
              في النسخة الحالية، يتم استخدام واتساب فقط لتأكيد الطلبات التي يتم
              إنشاؤها من نموذج الصفحة الرئيسية.
            </p>

            <p className="mt-4 leading-9 text-[#4b453f]">
              إذا كنت قد أرسلت طلباً، يرجى استخدام نفس محادثة واتساب التي فُتحت
              بعد الضغط على زر تأكيد الطلب.
            </p>
          </article>

          <article className="rounded-[2rem] bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">خدمة العملاء</h2>

            <p className="mt-4 leading-9 text-[#4b453f]">
              لم يتم تفعيل قناة خدمة عملاء عامة حتى الآن. لذلك لا نعرض رقم
              واتساب مؤقت كرقم دعم رسمي.
            </p>

            <p className="mt-4 leading-9 text-[#4b453f]">
              سيتم إضافة البريد الإلكتروني الرسمي أو رقم الدعم بعد تفعيل قناة
              تشغيل مناسبة.
            </p>
          </article>

          <article className="rounded-[2rem] bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">استفسارات التشغيل أو الشراكات</h2>

            <p className="mt-4 leading-9 text-[#4b453f]">
              للاستفسارات العامة أو الشراكات أو التشغيل، سيتم إضافة قناة تواصل
              رسمية بعد اعتماد البنية التشغيلية للمتجر.
            </p>

            <p className="mt-4 rounded-2xl bg-[#fffaf2] p-4 text-sm leading-8 text-[#5f574f]">
              ملاحظة: هذه الصفحة لا تمثل مركز دعم كامل حالياً، بل توضح حالة
              التواصل المتاحة في مرحلة الاختبار.
            </p>
          </article>
        </div>

        <div className="mt-8 flex flex-col gap-3 text-center sm:flex-row sm:justify-center">
          <a
            href="/#order"
            className="rounded-2xl bg-[#0f766e] px-8 py-4 text-base font-black text-white shadow-sm transition hover:bg-[#115e59]"
          >
            العودة إلى صفحة الطلب
          </a>

          <a
            href="/"
            className="rounded-2xl border border-[#eadfce] bg-white px-8 py-4 text-base font-black text-[#191613] shadow-sm transition hover:bg-[#fffaf2]"
          >
            الصفحة الرئيسية
          </a>
        </div>
      </section>
    </main>
  );
}