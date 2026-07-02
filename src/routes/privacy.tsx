import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية — NexMind" },
      { name: "description", content: "سياسة خصوصية منصة NexMind." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen px-6 py-12" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← العودة للرئيسية</Link>
        <h1 className="text-3xl font-semibold mt-6 mb-2">سياسة الخصوصية</h1>
        <p className="text-sm text-muted-foreground mb-10">آخر تحديث: {new Date().toLocaleDateString("ar-EG")}</p>

        <div className="space-y-8 text-sm leading-7">
          <Section title="1. من نحن">
            <strong>NexMind</strong> منصة ذكاء اصطناعي يديرها المهندس فارس درويش. نحن نهتم بخصوصيتك ونلتزم بحماية بياناتك.
          </Section>

          <Section title="2. البيانات التي نجمعها">
            <ul className="list-disc pr-6 mt-2 space-y-1">
              <li><strong>بيانات الحساب:</strong> البريد الإلكتروني والاسم.</li>
              <li><strong>بيانات الاستخدام:</strong> عدد الرسائل، المدة الصوتية، نوع الاشتراك.</li>
              <li><strong>المحادثات:</strong> نخزّن محادثاتك لتمكين سجل المحادثات. يمكنك حذفها في أي وقت.</li>
              <li><strong>بيانات الدفع:</strong> تُعالَج عبر بوابة دفع آمنة (Stripe/Paddle) — لا نخزن بيانات بطاقتك.</li>
            </ul>
          </Section>

          <Section title="3. كيف نستخدم بياناتك">
            <ul className="list-disc pr-6 mt-2 space-y-1">
              <li>تقديم الخدمة وتشغيل ميزات NexMind.</li>
              <li>تحسين جودة الردود والأداء.</li>
              <li>إرسال إشعارات مهمة عن الحساب أو الفواتير.</li>
              <li>منع إساءة الاستخدام والاحتيال.</li>
            </ul>
          </Section>

          <Section title="4. مشاركة البيانات">
            لا نبيع بياناتك. قد نشاركها فقط مع:
            <ul className="list-disc pr-6 mt-2 space-y-1">
              <li>مزودي البنية التحتية (الاستضافة، قواعد البيانات) — ضمن اتفاقيات سرية صارمة.</li>
              <li>الجهات الحكومية إذا طُلب ذلك قانونياً.</li>
            </ul>
          </Section>

          <Section title="5. الأمان">
            نستخدم تشفيراً قوياً (HTTPS/TLS) في النقل، وتشفيراً في التخزين. الوصول للبيانات محصور بالعاملين المخوّلين فقط.
          </Section>

          <Section title="6. حقوقك">
            لديك الحق في:
            <ul className="list-disc pr-6 mt-2 space-y-1">
              <li>الوصول إلى بياناتك أو تصحيحها.</li>
              <li>حذف حسابك وجميع محادثاتك نهائياً.</li>
              <li>تصدير محادثاتك (PDF/Word).</li>
              <li>إلغاء الاشتراك في أي إشعارات تسويقية.</li>
            </ul>
            للتنفيذ: راسلنا على <a href="mailto:support@nexmind.ai" className="text-primary underline">support@nexmind.ai</a>
          </Section>

          <Section title="7. ملفات تعريف الارتباط (Cookies)">
            نستخدم cookies أساسية لتسجيل الدخول وحفظ تفضيلاتك. لا نستخدم cookies تتبّع إعلانية.
          </Section>

          <Section title="8. الأطفال">
            الخدمة غير مخصصة لمن هم دون 13 عاماً. إذا اكتشفنا حساباً لطفل سنقوم بحذفه فوراً.
          </Section>

          <Section title="9. التعديلات">
            قد نحدّث هذه السياسة من وقت لآخر. سنخطرك بالتغييرات الجوهرية عبر البريد الإلكتروني.
          </Section>

          <Section title="10. التواصل">
            لأي سؤال عن الخصوصية: <a href="mailto:privacy@nexmind.ai" className="text-primary underline">privacy@nexmind.ai</a>
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
