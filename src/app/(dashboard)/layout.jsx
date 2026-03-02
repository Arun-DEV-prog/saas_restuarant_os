import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import DashboardShell from "@/components/Dashboard/layout-shell";
import { ThemeProvider } from "@/components/Dashboard/theme-provider";
import SessionWrapper from "@/components/SessionWrapper";

export default function DashboardLayout({ children, restaurant, user }) {
  return (
    <ThemeProvider>
      <SessionWrapper>
        <DashboardShell restaurant={restaurant}>
          {restaurant && (
            <DashboardHeader restaurant={restaurant} user={user} />
          )}
          {children}
        </DashboardShell>
      </SessionWrapper>
    </ThemeProvider>
  );
}
