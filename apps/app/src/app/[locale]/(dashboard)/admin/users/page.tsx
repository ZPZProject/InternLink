import { UserAdminTable } from "@/components/admin/user-admin-table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function AdminUsersPage() {
  await prefetch(
    trpc.admin.users.list.queryOptions({
      query: "",
      role: "all",
      status: "all",
      limit: 20,
      offset: 0,
    }),
  );

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review accounts and control whether users can access the platform.
          </p>
        </div>

        <UserAdminTable />
      </div>
    </HydrateClient>
  );
}
