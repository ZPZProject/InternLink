"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@v1/ui/select";
import { toast } from "@v1/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@v1/ui/table";
import { useDeferredValue, useState } from "react";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

const PAGE_SIZE = 20;

type RoleFilter = "all" | "student" | "employer" | "supervisor" | "admin";
type StatusFilter = "all" | "active" | "inactive";

export function UserAdminTable() {
  const t = useI18n();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const deferredQuery = useDeferredValue(query.trim());

  const listQuery = trpc.admin.users.list.queryOptions({
    query: deferredQuery,
    role,
    status,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const { data } = useQuery(listQuery);

  const toggleMutation = useMutation(
    trpc.admin.users.setActive.mutationOptions({
      onSuccess: async (_, variables) => {
        toast.success(
          variables.is_active
            ? t("userAdminTable.toast.activated")
            : t("userAdminTable.toast.deactivated"),
        );
        await queryClient.invalidateQueries(listQuery);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : t("userAdminTable.toast.error"),
        );
      },
    }),
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const currentPage = page + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          placeholder={t("userAdminTable.searchPlaceholder")}
          className="md:max-w-sm"
        />
        <Select
          value={role}
          onValueChange={(value) => {
            setRole(value as RoleFilter);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-full md:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">
                {t("userAdminTable.roleFilter.all")}
              </SelectItem>
              <SelectItem value="student">
                {t("userAdminTable.roleFilter.student")}
              </SelectItem>
              <SelectItem value="employer">
                {t("userAdminTable.roleFilter.employer")}
              </SelectItem>
              <SelectItem value="supervisor">
                {t("userAdminTable.roleFilter.supervisor")}
              </SelectItem>
              <SelectItem value="admin">
                {t("userAdminTable.roleFilter.admin")}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as StatusFilter);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-full md:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">
                {t("userAdminTable.statusFilter.all")}
              </SelectItem>
              <SelectItem value="active">
                {t("userAdminTable.statusFilter.active")}
              </SelectItem>
              <SelectItem value="inactive">
                {t("userAdminTable.statusFilter.inactive")}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("userAdminTable.col.user")}</TableHead>
            <TableHead>{t("userAdminTable.col.role")}</TableHead>
            <TableHead>{t("userAdminTable.col.status")}</TableHead>
            <TableHead>{t("userAdminTable.col.created")}</TableHead>
            <TableHead className="text-right">
              {t("userAdminTable.col.action")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-12 text-center text-muted-foreground"
              >
                {t("userAdminTable.empty")}
              </TableCell>
            </TableRow>
          ) : (
            items.map((user) => {
              const fullName =
                `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {fullName || user.email || t("userAdminTable.col.user")}
                    <span className="block text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "blue" : "destructive"}>
                      {user.is_active
                        ? t("userAdminTable.badge.active")
                        : t("userAdminTable.badge.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={user.is_active ? "destructive" : "outline"}
                      disabled={toggleMutation.isPending}
                      onClick={() =>
                        toggleMutation.mutate({
                          user_id: user.id,
                          is_active: !user.is_active,
                        })
                      }
                    >
                      {user.is_active
                        ? t("userAdminTable.deactivateBtn")
                        : t("userAdminTable.activateBtn")}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("userAdminTable.pagination", {
            current: currentPage,
            total: totalPages,
          })}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            {t("userAdminTable.prevBtn")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            {t("userAdminTable.nextBtn")}
          </Button>
        </div>
      </div>
    </div>
  );
}
