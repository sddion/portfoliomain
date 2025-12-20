-- 1. Create Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  settings jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
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

create policy "Users can insert own profile" 
on public.profiles for insert 
with check (auth.uid() = id);


-- Policy: Allow users to upload to their own folder
create policy "Users can upload assets to their own folder"
on storage.objects for insert
with check (
  bucket_id = 'personalized' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to view their own assets
create policy "Users can view their own assets"
on storage.objects for select
using (
  bucket_id = 'personalized' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own assets
create policy "Users can delete their own assets"
on storage.objects for delete
using (
  bucket_id = 'personalized' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add columns for tracking IP and User Agent if they don't exist
alter table public.profiles
add column if not exists last_ip text,
add column if not exists user_agent text;

-- Function to sync anonymous profiles based on IP and User Agent
create or replace function public.sync_anonymous_profile(
  user_ip text,
  user_ua text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  current_user_id uuid;
  found_profile public.profiles%rowtype;
  current_settings jsonb;
begin
  -- Get the ID of the executing user
  current_user_id := auth.uid();
  
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Update current user's metadata
  update public.profiles
  set 
    last_ip = user_ip,
    user_agent = user_ua,
    updated_at = now()
  where id = current_user_id
  returning settings into current_settings;

  -- If current settings are not empty (i.e. user has already done something),
  -- we don't want to overwrite them with old profile data.
  if current_settings <> '{}'::jsonb then
    return json_build_object('status', 'skipped', 'reason', 'current_profile_not_empty');
  end if;

  -- Find the most recent distinct profile with same IP and UA
  -- that is NOT the current user
  select * into found_profile
  from public.profiles
  where last_ip = user_ip
    and user_agent = user_ua
    and id <> current_user_id
    and settings <> '{}'::jsonb -- only sync if the old profile actually had settings
  order by updated_at desc
  limit 1;

  -- If a matching previous profile is found, copy its settings
  if FOUND then
    update public.profiles
    set settings = found_profile.settings
    where id = current_user_id;
    
    return json_build_object(
      'status', 'synced',
      'source_profile_id', found_profile.id,
      'settings', found_profile.settings
    );
  end if;

  return json_build_object('status', 'no_match_found');
end;
$$;


-- Create a table for app reviews
create table if not exists app_reviews (
  id uuid default gen_random_uuid() primary key,
  app_id text not null,
  user_name text default 'Guest',
  rating int check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table app_reviews enable row level security;

-- Create policies to allow public access (since this is a portfolio demo)
-- Policy for reading reviews (anyone can read)
create policy "Public reviews are viewable by everyone"
  on app_reviews for select
  using ( true );

-- Policy for inserting reviews (anyone can insert, for demo purposes)
create policy "Anyone can submit a review"
  on app_reviews for insert
  with check ( true );

-- Optional: Create an index on app_id for faster lookups
create index if not exists app_reviews_app_id_idx on app_reviews (app_id);
