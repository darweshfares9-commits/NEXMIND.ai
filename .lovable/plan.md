# خطة التطوير الشاملة لـ NexMind

## 💰 أولاً: الإجابة على سؤال الربح والتسعير

### هل 100 ج/شهر مناسب؟
**لا، السعر منخفض جداً** لو حسبنا التكاليف الفعلية:
- مستخدم Pro نشط يستهلك ~5-15 ج/شهر AI credits من Lovable
- + استضافة + ElevenLabs (~$0.30/1000 حرف صوت) + LiveKit
- صافي ربحك من 100 ج يبقى ~40-60 ج فقط

### اقتراح Pricing مدروس (بالجنيه المصري):
| الخطة | السعر | الحدود |
|------|-------|--------|
| **Free** | 0 ج | 20 رسالة/يوم، بدون صوت، بدون Export |
| **Starter** | 149 ج/شهر | 500 رسالة/شهر، Voice محدود، Export |
| **Pro** | 349 ج/شهر | غير محدود نصياً، Voice + Live Calls، كل المزايا |
| **Business** | 999 ج/شهر | فرق عمل، API access، أولوية |

### كيف الربح يكبر؟
1. **Conversion rate** متوقع: 2-5% من المستخدمين يدفعوا
2. لو وصلت 10,000 مستخدم → ~300 مشترك Pro = ~100,000 ج/شهر
3. الفلوس بتنزل على حساب Stripe/Paddle مباشرة

### إزاي نوصل لده؟
- SEO قوي (موجود في الكود)
- محتوى مجاني يجذب (المستخدمين الـ Free هم قمع التسويق)
- Referral program (هضيفه لاحقاً)

---

## 🛠️ اللي هضيفه دلوقتي

### 1. Daily Credit Limits
- جدول `usage_logs` يتتبع رسائل اليوم لكل user
- middleware في `/api/chat` يرفض لو تجاوز الحد
- UI banner يوضح المتبقي

### 2. Subscriptions System (جاهز للدفع لاحقاً)
- جدول `subscriptions` (tier: free/starter/pro/business)
- helper `getUserTier(userId)` يحدد الحدود
- صفحة `/pricing` بالخطط

### 3. Voice Mode (ElevenLabs)
- زر مايك في الـ composer
- `/api/tts` → ElevenLabs streaming
- `/api/stt` → transcription
- Voice ON/OFF toggle

### 4. Live Calls (LiveKit)
- صفحة `/_authenticated/live`
- `/api/livekit-token` يولد JWT
- AI Agent بيتكلم real-time

### 5. Conversation History Sidebar
- panel جانبي يفتح/يقفل
- list من جدول `conversations`
- نقر يفتح المحادثة كاملة

### 6. Export (PDF/Word)
- زر Export في كل محادثة
- استخدام `jspdf` للـ PDF، `docx` للـ Word
- client-side generation

### 7. Share Link
- جدول `shared_conversations` (public read)
- صفحة `/share/$token` تعرض المحادثة read-only
- زر Copy Link

---

## 📋 الاقتراحات الإضافية للخطوات الجاية

### Phase 2 (بعد ما نخلص اللي فوق):
1. **Stripe/Paddle Integration** للاشتراكات الفعلية
2. **Referral Program** - ادعي صاحبك واخد 50 رسالة مجاناً
3. **Team Workspaces** للـ Business plan
4. **Custom AI Personas** - المستخدم يعمل assistant بشخصيته
5. **File Upload & Analysis** (PDF/Image للـ AI يحللها)
6. **API Access** للمشتركين Business
7. **Analytics Dashboard** للمستخدم (إحصائيات استخدامه)
8. **Mobile App** (React Native لاحقاً)

### للنشر:
1. **Custom Domain** (nexmind.com أو nexmind.ai)
2. **Google OAuth** بدل/بجانب Email
3. **Email notifications** (لما الـ quota يخلص أو يتجدد)
4. **Landing page** احترافية للزوار غير المسجلين

---

## 🔧 التفاصيل التقنية

### Database Migrations:
```sql
-- subscriptions
CREATE TABLE public.subscriptions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  tier text NOT NULL DEFAULT 'free',
  active_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- usage tracking
CREATE TABLE public.usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day date NOT NULL DEFAULT current_date,
  messages_count int DEFAULT 0,
  voice_seconds int DEFAULT 0,
  UNIQUE(user_id, day)
);

-- shared conversations
CREATE TABLE public.shared_conversations (
  token text PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  created_at timestamptz DEFAULT now()
);
```

### Tier Limits:
```ts
{ free: 20, starter: 500/30, pro: 9999, business: 9999 }
```

### Files جديدة:
- `src/lib/tiers.ts` - tier definitions
- `src/lib/usage.server.ts` - quota tracking
- `src/routes/api/tts.ts`, `src/routes/api/stt.ts`, `src/routes/api/livekit-token.ts`
- `src/routes/pricing.tsx`
- `src/routes/_authenticated/live.tsx`
- `src/routes/share.$token.tsx`
- `src/components/nexmind/HistoryPanel.tsx`
- `src/components/nexmind/VoiceButton.tsx`
- `src/components/nexmind/ExportButton.tsx`

### حجم العمل: ~15 ملف جديد + 5 تعديلات + 2 migrations

---

## ⚠️ ملاحظة مهمة
الدفع الفعلي (Stripe/Paddle) محتاج خطوة منفصلة بعد ما نخلص الـ infrastructure. دلوقتي هخلي الـ "Upgrade" button يعرض "Coming Soon" لحد ما تأكدلي تفعّل الدفع.

**هل أبدأ التنفيذ؟** أو تحب تعدل في الخطة (مثلاً تغير الأسعار، تأجل Live Calls، إلخ)؟
