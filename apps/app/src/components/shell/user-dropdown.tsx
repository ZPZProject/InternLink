"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@v1/ui/avatar";
import { Button } from "@v1/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@v1/ui/dropdown-menu";
import { Icons } from "@v1/ui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/react";
import { RoleBadge } from "../role-badge";

const UserDropdown = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const { data: profile } = useQuery(trpc.profile.me.queryOptions());
  const { mutate: signOut } = useMutation(
    trpc.auth.signOut.mutationOptions({
      onSuccess: () => {
        router.refresh();
        router.push("/login");
      },
    }),
  );

  if (!profile) {
    return <div className="w-[140px]" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="lg" className="h-12">
          <Avatar>
            <AvatarImage src={undefined} />
            <AvatarFallback>
              {profile.first_name?.charAt(0)}
              {profile.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span>
              {profile.first_name} {profile.last_name}
            </span>

            <RoleBadge role={profile.role} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <Icons.User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <Icons.Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
          <Icons.LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default UserDropdown;
