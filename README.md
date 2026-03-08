# 🎬 Studio Portal — دليل النشر خطوة خطوة

---

## الخطوة 1 — إعداد Supabase ✅

### 1.1 شغّل الـ SQL
- روح على Supabase → **SQL Editor**
- افتح ملف `SUPABASE_SETUP.sql` من المجلد
- انسخ كل المحتوى والصقه في SQL Editor
- اضغط **Run**

### 1.2 إنشاء Storage Bucket
- روح على **Storage** من القائمة الجانبية
- اضغط **New Bucket**
- الاسم: `videos`
- فعّل **Public bucket** ✓
- اضغط **Save**

---

## الخطوة 2 — رفع الكود على GitHub

### 2.1 إنشاء Repository
- روح على **github.com** → **New repository**
- الاسم: `studio-portal`
- اضغط **Create repository**

### 2.2 رفع الملفات
افتح Terminal أو Command Prompt في مجلد المشروع:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/USERNAME/studio-portal.git
git push -u origin main
```

> ⚠️ **مهم:** ملف `.env` مش هيتحمل على GitHub (موجود في .gitignore) — ده عشان الأمان

---

## الخطوة 3 — النشر على Vercel

### 3.1 ربط GitHub بـ Vercel
- روح على **vercel.com** → **New Project**
- اختار **Import Git Repository**
- اختار `studio-portal`
- اضغط **Import**

### 3.2 إضافة الـ Environment Variables
قبل ما تضغط Deploy، اضغط على **Environment Variables** وأضف:

| Key | Value |
|-----|-------|
| `REACT_APP_SUPABASE_URL` | `https://agtaeohaectbqounzghb.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | (الـ anon key بتاعتك) |

### 3.3 Deploy!
- اضغط **Deploy**
- انتظر دقيقتين
- ✅ الويب سايت جاهز على لينك زي: `studio-portal.vercel.app`

---

## الخطوة 4 — إضافة عميل جديد

روح على Supabase → **Table Editor** → جدول `clients` → **Insert row**:

| الحقل | القيمة |
|-------|--------|
| username | اسم مستخدم بالإنجليزي |
| password | كلمة سر |
| name | الاسم بالعربي |
| company | اسم الشركة |
| avatar | حرف أو إيموجي |
| is_admin | false |

---

## بيانات الدخول التجريبية

| المستخدم | كلمة السر | الصلاحية |
|----------|-----------|---------|
| admin | admin123 | مدير — يشوف كل حاجة |
| ahmed | 1234 | عميل |
| sara | 5678 | عميلة |

---

## ✅ قائمة التحقق النهائية

- [ ] شغّلت الـ SQL في Supabase
- [ ] عملت Storage Bucket اسمه "videos" وعملته Public
- [ ] رفعت الكود على GitHub
- [ ] ربطت Vercel بـ GitHub
- [ ] أضفت الـ Environment Variables في Vercel
- [ ] الويب سايت شغال ✓

---

> 💡 **نصيحة:** غيّر كلمة سر الـ admin بعد أول دخول من Supabase → Table Editor مباشرة
