import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "شروط الاستخدام — NexMind" },
      { name: "description", content: "شروط استخدام منصة NexMind." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen px-6 py-12" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← العودة للرئيسية</Link>
        <h1 className="text-3xl font-semibold mt-6 mb-2">شروط الاستخدام</h1>
        <p className="text-sm text-muted-foreground mb-10">آخر تحديث: {new Date().toLocaleDateString("ar-EG")}</p>

        <div className="space-y-8 text-sm leading-7">
          <Section title="1. مقدمة">
            مرحباً بك في <strong>NexMind</strong>، منصة ذكاء اصطناعي تم تطويرها وإدارتها بالكامل بواسطة المهندس فارس درويش.
            باستخدامك للمنصة فإنك توافق على هذه الشروط بالكامل. إذا كنت لا توافق، يرجى التوقف عن استخدام الخدمة.
          </Section>

          <Section title="2. الحساب">
            أنت مسؤول عن سرية بيانات الدخول الخاصة بك وعن جميع الأنشطة التي تتم من خلال حسابك.
            يحق لنا تعليق أو حذف أي حساب يخالف هذه الشروط.
          </Section>

          <Section title="3. الاستخدام المقبول">
            يُمنع استخدام NexMind في:
            <ul className="list-disc pr-6 mt-2 space-y-1">
              <li>أي نشاط غير قانوني أو يضر بالغير.</li>
              <li>توليد محتوى مسيء أو عنصري أو ينتهك حقوق الملكية الفكرية.</li>
              <li>محاولة اختراق المنصة أو إساءة استخدام الـ API.</li>
              <li>إعادة بيع المخرجات على أنها خدمة منافسة دون إذن.</li>
            </ul>
          </Section>

          <Section title="4. الاشتراكات والدفع">
            الخطط المدفوعة تُجدَّد تلقائياً شهرياً. يمكنك الإلغاء في أي وقت من إعدادات الحساب،
            وسيظل اشتراكك فعّالاً حتى نهاية الفترة المدفوعة. لا توجد استردادات جزئية.
          </Section>

          <Section title="5. حدود الاستخدام">
            لكل خطة حدود يومية/شهرية للرسائل والصوت. تجاوز الحد يؤدي إلى إيقاف مؤقت حتى التجديد أو ترقية الخطة.
          </Section>

          <Section title="6. المحتوى المُولَّد">
            أنت تملك المحتوى الذي تُدخله. المحتوى المُولَّد بواسطة الذكاء الاصطناعي يُقدَّم "كما هو"
            ولا نضمن دقته. أنت مسؤول عن مراجعته قبل استخدامه في قرارات حساسة (طبية، قانونية، مالية).
          </Section>

          <Section title="7. إخلاء المسؤولية">
            NexMind خدمة "كما هي" دون أي ضمانات صريحة أو ضمنية. لن نكون مسؤولين عن أي أضرار مباشرة
            أو غير مباشرة ناتجة عن استخدام أو عدم القدرة على استخدام الخدمة.
          </Section>

          <Section title="8. التعديلات">
            نحتفظ بحق تعديل هذه الشروط في أي وقت. التعديلات تصبح سارية فور نشرها على هذه الصفحة.
          </Section>

          <Section title="9. التواصل">
            لأي استفسار: <a href="mailto:support@nexmind.ai" className="text-primary underline">support@nexmind.ai</a>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="text-muted-foreground">{children}</div>
    </section>
  );
}
