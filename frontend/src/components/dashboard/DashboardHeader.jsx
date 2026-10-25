import AdminSearch from "./AdminSearch";
import NotificationBell from "./NotificationBell";
import ProfileDropdown from "../ProfileDropdown";

function DashboardHeader({
  role,
  onLogout,
  onSelectProduct,
  onNavigate,
}) {
  return (
    <header className="border-b border-slate-200 bg-white">

      <div className="flex min-h-[82px] items-center justify-between gap-6 px-6 lg:px-8">

        {/* Left side */}
        <div className="min-w-0">

          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Dashboard
          </p>

          <h1 className="mt-1 text-xl font-semibold text-slate-900">
            {role} Workspace
          </h1>

        </div>


        {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Search */}
            <AdminSearch onSelectProduct={onSelectProduct} />

            {/* Notification */}
            <NotificationBell onNavigate={onNavigate} />

            {/* Divider */}
            <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

            {/* Profile */}
            <ProfileDropdown onLogout={onLogout} />

          </div>
        </div>

    </header>
  );
}

export default DashboardHeader;