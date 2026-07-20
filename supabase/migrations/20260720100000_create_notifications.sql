create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null default 'general' check (type in ('deadline', 'status', 'general')),
  read boolean not null default false,
  link text,
  created_at timestamp with time zone default now() not null
);

alter table notifications enable row level security;

create policy "Users can view own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on notifications for delete
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on notifications for insert
  with check (auth.uid() = user_id);

create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_read on notifications(user_id, read);
create index idx_notifications_created_at on notifications(user_id, created_at desc);
