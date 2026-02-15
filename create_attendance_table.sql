-- Create attendance_records table
create table if not exists public.attendance_records (
    id uuid not null default gen_random_uuid(),
    student_id uuid not null references public.profiles(id) on delete cascade,
    teacher_id uuid not null references public.profiles(id),
    course_id uuid references public.courses(id),
    date date not null,
    status text not null check (status in ('present', 'absent', 'replaced', 'to_be_replaced')),
    notes text,
    created_at timestamptz not null default now(),
    
    constraint attendance_records_pkey primary key (id)
);

-- Enable RLS
alter table public.attendance_records enable row level security;

-- Policies

-- Teachers can view records they created
create policy "Teachers can view their own attendance records"
    on public.attendance_records
    for select
    using (auth.uid() = teacher_id);

-- Teachers can insert records for themselves
create policy "Teachers can insert their own attendance records"
    on public.attendance_records
    for insert
    with check (auth.uid() = teacher_id);

-- Teachers can update records they created
create policy "Teachers can update their own attendance records"
    on public.attendance_records
    for update
    using (auth.uid() = teacher_id);

-- Admins can view all records (assuming 'admin' role logic exists in public.profiles or similar)
-- For now, we'll keep it simple. If you have a specific admin check function, wrap it here.
-- Example: using ( auth.uid() in (select id from public.profiles where role = 'admin') )

-- Allow users to read their own attendance (optional, for Student Dashboard)
create policy "Students can view their own attendance"
    on public.attendance_records
    for select
    using (auth.uid() = student_id);

-- Migration for existing table (if applicable)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'attendance_records' and column_name = 'course_id') then
        alter table public.attendance_records add column course_id uuid references public.courses(id);
    end if;
end $$;
