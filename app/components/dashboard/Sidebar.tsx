"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  History,
  CreditCard,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const menu = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "AI Humanizer",
      href: "/humanizer",
      icon: Sparkles,
    },
    {
      name: "History",
      href: "/history",
      icon: History,
    },
    {
      name: "Pricing",
      href: "/pricing",
      icon: CreditCard,
    },
  ];

  const bottomMenu = [
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      name: "Help Center",
      href: "/help",
      icon: HelpCircle,
    },
  ];

  // --------------------------------
  // Get current plan
  // --------------------------------

  const plan =
    (
      user?.publicMetadata?.plan as string | undefined
    )?.toLowerCase() || "free";

  const planInfo = {
    free: {
      name: "Free Plan",
      badge: "Free",
      limit: "1,000",
    },

    pro: {
      name: "Pro Plan",
      badge: "Pro",
      limit: "50,000",
    },

    business: {
      name: "Business Plan",
      badge: "Business",
      limit: "Unlimited",
    },
  };

  const currentPlan =
    planInfo[plan as keyof typeof planInfo] ||
    planInfo.free;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-72
          flex-col
          border-r
          border-gray-200
          bg-white
          transition-transform
          duration-300
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}
        <div className="mt-2 flex h-20 items-center justify-between border-b border-gray-100 px-6">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white">
              <Sparkles size={19} />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Wordvia
              <span className="text-purple-600">
                .ai
              </span>
            </span>
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main navigation */}
        <div className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition
                    ${
                      active
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon size={19} />

                  {item.name}
                </Link>
              );
            })}
          </nav>

          <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Support
          </p>

          <nav className="space-y-1">
            {bottomMenu.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  <Icon size={19} />

                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Dynamic plan card */}
        <div className="border-t border-gray-100 p-4">
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                {isLoaded
                  ? currentPlan.name
                  : "Loading..."}
              </span>

              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-purple-600 shadow-sm">
                {isLoaded
                  ? currentPlan.badge
                  : "..."}
              </span>
            </div>

            <p className="text-xs leading-5 text-gray-500">
              {isLoaded
                ? currentPlan.limit ===
                  "Unlimited"
                  ? "You have unlimited words available."
                  : `You have ${currentPlan.limit} words available this month.`
                : "Checking your plan..."}
            </p>

            {plan === "free" && (
              <Link
                href="/pricing"
                className="mt-4 block rounded-xl bg-purple-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Upgrade Plan
              </Link>
            )}

            {plan === "pro" && (
              <Link
                href="/pricing"
                className="mt-4 block rounded-xl border border-purple-200 bg-white py-2.5 text-center text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
              >
                Manage Plan
              </Link>
            )}

            {plan === "business" && (
              <div className="mt-4 rounded-xl bg-white/70 py-2.5 text-center text-sm font-semibold text-purple-700">
                Unlimited Access
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}