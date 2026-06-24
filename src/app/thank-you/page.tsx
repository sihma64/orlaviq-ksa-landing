"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ThankYouPage() {
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const url = sessionStorage.getItem("whatsappUrl");
    const id = sessionStorage.getItem("orderId");
    if (url) {
      setWhatsappUrl(url);
    }
    if (id) {
      setOrderId(id);
    }
  }, []);

  const handleWhatsAppConfirmation = async () => {
    if (!orderId || !whatsappUrl) return;

    setIsConfirming(true);

    try {
      const response = await fetch("/api/confirm-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      } else {
        console.error("Failed to confirm WhatsApp", await response.json());
        // Still open whatsapp, as per instructions
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error confirming WhatsApp:", error);
      // Still open whatsapp
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#fdfaf6] p-4 text-[#4a4a4a]"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg transition-transform duration-500 ease-in-out hover:shadow-xl">
        <div className="text-center">
          <p className="mb-2 text-sm font-medium text-[#c8a97e]">
            موزع روائح بإضاءة دافئة ورذاذ ناعم
          </p>

          <h1 className="mb-3 text-3xl font-extrabold text-[#3a3a3a]">
            تم استلام طلبك بنجاح
          </h1>

          <p className="mb-8 text-base text-[#6a6a6a]">
            شكراً لك، تم تسجيل طلبك بنجاح وسيتم التواصل معك لتأكيد التفاصيل قبل التجهيز.
          </p>

          {whatsappUrl && (
            <div className="mb-8 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-6">
              <h2 className="mb-2 text-lg font-bold text-[#3a3a3a]">
                تأكيد الطلب عبر واتساب
              </h2>

              <p className="mb-6 text-sm text-[#6a6a6a]">
                يمكنك تأكيد طلبك عبر واتساب لتسهيل التواصل معك بخصوص الطلب.
              </p>

              <button
                onClick={handleWhatsAppConfirmation}
                disabled={isConfirming}
                className="w-full rounded-lg bg-[#25D366] px-6 py-3 text-base font-bold text-white shadow-md transition-transform duration-300 hover:scale-105 hover:bg-[#128C7E] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isConfirming ? "جاري التأكيد..." : "تأكيد عبر واتساب"}
              </button>
            </div>
          )}

          <div className="mb-8">
            <Link href="/">
              <span className="inline-block w-full cursor-pointer rounded-lg border border-[#c8a97e] bg-transparent px-6 py-3 text-base font-bold text-[#c8a97e] transition-colors duration-300 hover:bg-[#c8a97e] hover:text-white">
                العودة إلى الصفحة الرئيسية
              </span>
            </Link>
          </div>

          <p className="mb-6 text-xs text-[#8a8a8a]">
            إذا لم تؤكد عبر واتساب، سيتواصل معك فريق خدمة العملاء لتأكيد الطلب.
          </p>

          <div className="flex flex-col items-center justify-center gap-2 text-xs text-[#8a8a8a]">
            <span className="flex items-center">
              <svg
                className="ml-1 h-4 w-4 text-[#c8a97e]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              الدفع عند الاستلام
            </span>

            <span className="flex items-center">
              <svg
                className="ml-1 h-4 w-4 text-[#c8a97e]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              لا توجد أي رسوم مخفية
            </span>

            <span className="flex items-center">
              <svg
                className="ml-1 h-4 w-4 text-[#c8a97e]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              سيتم التأكيد قبل تجهيز الطلب
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
