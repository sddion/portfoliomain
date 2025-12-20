-- Function to handle new user entries
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, settings)
  values (new.id, '{}'::jsonb);
  return new;
end;
$$;

-- Trigger to call the function on new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Optional: Backfill for any users that already exist but don't have a profile
-- insert into public.profiles (id, settings)
-- select id, '{}'::jsonb from auth.users
-- where id not in (select id from public.profiles);
