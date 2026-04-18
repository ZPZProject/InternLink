import { Button } from "@v1/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuSkeleton,
} from "@v1/ui/sidebar";
import { Suspense } from "react";
import { Logo } from "../shared/logo";
import SidebarItems from "./sidebar-items";

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Suspense fallback={<SidebarMenuSkeleton />}>
            <SidebarItems />
          </Suspense>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 justify-center">
          <Button variant="link" size="xs">
            Terms of service
          </Button>
          <Button variant="link" size="xs">
            Privacy policy
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
