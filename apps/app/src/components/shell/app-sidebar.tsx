import { getI18n } from "@/locales/server";
import { Button } from "@v1/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@v1/ui/sidebar";
import { Logo } from "../shared/logo";
import SidebarItems from "./sidebar-items";

const AppSidebar = async () => {
  const t = await getI18n();
  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarItems />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 justify-center">
          <Button variant="link" size="xs">
            {t("sidebar.termsOfService")}
          </Button>
          <Button variant="link" size="xs">
            {t("sidebar.privacyPolicy")}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
