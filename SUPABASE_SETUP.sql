-- ====================================
-- Studio Portal — Supabase SQL Setup
-- الصق الكود ده في SQL Editor في Supabase
-- ====================================

-- 1. جدول العملاء
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  password text not null,
  name text not null,
  company text,
  avatar text default '👤',
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- 2. جدول الفيديوهات
create table if not exists videos (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  type text default 'video',
  status text default 'editing',
  duration text,
  file_url text,
  file_size text,
  views integer default 0,
  downloads integer default 0,
  created_at timestamptz default now()
);

-- 3. جدول الطلبات
create table if not exists requests (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 4. بيانات تجريبية — غيرها زي ما تحب
insert into clients (username, password, name, company, avatar, is_admin) values
  ('admin',  'admin123', 'Admin',        'Studio',         'A',  true),
  ('ahmed',  '1234',     'أحمد السيد',   'Ahmed Media',    'أ',  false),
  ('sara',   '5678',     'سارة محمود',   'Sara Creative',  'س',  false)
on conflict (username) do nothing;

-- 5. تفعيل RLS (Row Level Security) — مهم للأمان
alter table clients enable row level security;
alter table videos  enable row level security;
alter table requests enable row level security;

-- 6. Policies — السماح للـ anon key بالقراءة والكتابة
create policy "allow all clients" on clients for all using (true) with check (true);
create policy "allow all videos"  on videos  for all using (true) with check (true);
create policy "allow all requests" on requests for all using (true) with check (true);

-- ====================================
-- بعد ما تشغل الـ SQL:
-- روح على Storage وعمل Bucket اسمه "videos"
-- واضبطه على Public
-- ====================================
