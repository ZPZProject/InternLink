-- Week 5 (F8): Supervisor document review permissions

create policy documents_supervisor_update on public.documents
for update to authenticated
using (
  (auth.jwt() ->> 'user_role') in ('supervisor', 'admin')
)
with check (
  (auth.jwt() ->> 'user_role') in ('supervisor', 'admin')
);

create policy documents_supervisor_select on public.documents
for select to authenticated
using (
  (auth.jwt() ->> 'user_role') in ('supervisor', 'admin')
);
