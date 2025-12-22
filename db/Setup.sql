-- 1. Create Profiles Table (Keep for user management in Flasher)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  settings jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_ip text,
  user_agent text
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Create RLS Policies for Profiles
create policy "Users can view own profile" 
on public.profiles for select 
using (auth.uid() = id);

create policy "Users can update own profile" 
on public.profiles for update 
using (auth.uid() = id);

-- 4. Create Flasher Bins Table (New)
create table if not exists public.bins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  address text default '0x10000',
  size int not null,
  storage_path text not null,
  hash text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable RLS for Flasher Bins
alter table public.bins enable row level security;

-- 6. RLS Policies for Flasher Bins
create policy "Users can view own bins"
on public.bins for select
using (auth.uid() = user_id);

create policy "Users can insert own bins"
on public.bins for insert
with check (auth.uid() = user_id);

create policy "Users can delete own bins"
on public.bins for delete
using (auth.uid() = user_id);

-- 7. Storage Policies (Using existing 'personalized' bucket)
-- Ensure 'personalized' bucket exists in your dashboard

create policy "Users can upload bins to personalized"
on storage.objects for insert
with check (
  bucket_id = 'personalized' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can view own bins in personalized"
on storage.objects for select
using (
  bucket_id = 'personalized' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own bins in personalized"
on storage.objects for delete
using (
  bucket_id = 'personalized' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 8. Cleanup Logic (Profiles)
-- Deletes profiles that haven't been updated in 3 months (optional cleanup)
delete from public.profiles where updated_at < now() - interval '90 days';
