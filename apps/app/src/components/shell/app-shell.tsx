import { SidebarInset, SidebarProvider } from "@v1/ui/sidebar";
import AppSidebar from "./app-sidebar";
import { ShellPageTitle } from "./shell-page-title";
import UserDropdown from "./user-dropdown";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="w-full border-b px-2 h-16">
          <div className="flex justify-between w-full items-center h-full">
            <div className="w-[140px]" />
            <div>
              <ShellPageTitle />
            </div>
            <UserDropdown />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
