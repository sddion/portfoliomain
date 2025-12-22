-- Supabase Storage & Database Cleanup Script
-- Deletes binaries and metadata older than 30 days from the 'personalized' bucket and 'bins' table.

-- 1. Create a function to perform the cleanup
create or replace function public.cleanup_old_bins()
returns void
language plpgsql
security definer
as $$
declare
    old_file record;
begin
    -- Iterate through files older than 30 days
    for old_file in 
        select storage_path, id 
        from public.bins 
        where created_at < now() - interval '30 days'
    loop
        -- Delete from storage using the storage.objects API
        -- Note: This requires the delete policy on storage.objects to be correctly set for the service role or this function's owner
        delete from storage.objects 
        where bucket_id = 'personalized' 
        and name = old_file.storage_path;

        -- Delete metadata record
        delete from public.bins where id = old_file.id;
    end loop;
end;
$$;

-- 2. Schedule using pg_cron (if available)
select cron.schedule('cleanup-esp-bins', '0 0 * * *', 'select public.cleanup_old_bins()');

-- 3. Policy for the cleanup function to work
-- Ensure the 'personalized' bucket allows the system to delete files.
