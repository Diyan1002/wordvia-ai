"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  CreditCard,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

import Sidebar from "@/app/components/dashboard/Sidebar";

type Plan = "free" | "pro" | "business";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();

  const [wordsUsed, setWordsUsed] = useState(0);
  const [monthlyLimit, setMonthlyLimit] =
    useState<number | null>(1000);
  const [remainingWords, setRemainingWords] =
    useState<number | null>(1000);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState("active");
  const [usageLoading, setUsageLoading] = useState(true);

  const rawPlan =
    (
      user?.publicMetadata?.plan as
        | string
        | undefined
    )?.toLowerCase() || "free";

  const plan: Plan =
    rawPlan === "business"
      ? "business"
      : rawPlan === "pro"
      ? "pro"
      : "free";

  const planName =
    plan === "business"
      ? "Business"
      : plan === "pro"
      ? "Pro"
      : "Free";

  const planLimits: Record<
    Plan,
    number | null
  > = {
    free: 1000,
    pro: 50000,
    business: null,
  };

  const currentLimit = planLimits[plan];

  useEffect(() => {
    async function loadUsage() {
      try {
        setUsageLoading(true);

        const response = await fetch(
          "/api/usage",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "Usage API error:",
            data
          );
          return;
        }

        setWordsUsed(
          typeof data.wordsUsed === "number"
            ? data.wordsUsed
            : 0
        );

        setMonthlyLimit(
          data.monthlyLimit ?? null
        );

        setRemainingWords(
          data.remainingWords ?? null
        );

        if (user?.publicMetadata?.subscriptionStatus) {
          setSubscriptionStatus(
            String(
              user.publicMetadata
                .subscriptionStatus
            )
          );
        }
      } catch (error) {
        console.error(
          "Settings usage error:",
          error
        );
      } finally {
        setUsageLoading(false);
      }
    }

    if (isLoaded && user) {
      loadUsage();
    }
  }, [isLoaded, user]);

  const usagePercentage =
    monthlyLimit === null
      ? 0
      : Math.min(
          100,
          (wordsUsed / monthlyLimit) * 100
        );

  const formattedStatus =
    subscriptionStatus.charAt(0).toUpperCase() +
    subscriptionStatus.slice(1);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Sidebar />

      <main className="min-h-screen lg:ml-72">
        {/* TOPBAR */}
        <header
          className="
            sticky
            top-0
            z-30
            flex
            h-20
            items-center
            justify-between
            border-b
            border-gray-200
            bg-white/90
            px-5
            backdrop-blur-md
            sm:px-8
          "
        >
          <div>
            <p className="text-xs text-gray-400">
              Workspace
            </p>

            <h1 className="text-lg font-semibold text-gray-900">
              Settings
            </h1>
          </div>
        </header>

        {/* CONTENT */}
        <div
          className="
            mx-auto
            max-w-5xl
            px-5
            py-8
            sm:px-8
            lg:px-10
          "
        >
          {/* HEADER */}
          <section>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-600">
              <Sparkles size={14} />
              Account Settings
            </div>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Account & Billing
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Manage your Wordvia.ai account, plan,
              and monthly usage.
            </p>
          </section>

          {/* ACCOUNT */}
          <section className="mt-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <User size={19} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Account Information
                  </h3>

                  <p className="text-sm text-gray-500">
                    Your current Wordvia.ai account
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {/* NAME */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                    <User size={14} />
                    Name
                  </div>

                  <p className="mt-2 font-medium text-gray-900">
                    {isLoaded
                      ? user?.fullName ||
                        user?.firstName ||
                        "Not provided"
                      : "Loading..."}
                  </p>
                </div>

                {/* EMAIL */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                    <Mail size={14} />
                    Email
                  </div>

                  <p className="mt-2 break-all font-medium text-gray-900">
                    {isLoaded
                      ? user
                          ?.primaryEmailAddress
                          ?.emailAddress ||
                        "Not available"
                      : "Loading..."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* PLAN */}
          <section className="mt-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <CreditCard size={19} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Current Plan
                    </h3>

                    <p className="text-sm text-gray-500">
                      Your active Wordvia.ai plan
                    </p>
                  </div>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700">
                  <Sparkles size={15} />
                  {isLoaded
                    ? planName
                    : "Loading..."}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {/* LIMIT */}
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-medium text-gray-400">
                    Monthly Limit
                  </p>

                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {currentLimit === null
                      ? "Unlimited"
                      : currentLimit.toLocaleString()}
                  </p>
                </div>

                {/* USED */}
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-medium text-gray-400">
                    Words Used
                  </p>

                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {usageLoading
                      ? "..."
                      : wordsUsed.toLocaleString()}
                  </p>
                </div>

                {/* REMAINING */}
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-medium text-gray-400">
                    Remaining
                  </p>

                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {usageLoading
                      ? "..."
                      : remainingWords === null
                      ? "Unlimited"
                      : remainingWords.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* PROGRESS */}
              {currentLimit !== null &&
                !usageLoading && (
                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-gray-400">
                        Monthly usage
                      </span>

                      <span className="font-medium text-gray-600">
                        {Math.round(
                          usagePercentage
                        )}
                        %
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-purple-600 transition-all"
                        style={{
                          width: `${usagePercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
            </div>
          </section>

          {/* SUBSCRIPTION */}
          <section className="mt-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Subscription
                  </h3>

                  <p className="text-sm text-gray-500">
                    Current subscription status
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-green-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formattedStatus}
                    </p>

                    <p className="text-xs text-gray-500">
                      {plan === "free"
                        ? "You are currently using the Free plan."
                        : "Your paid subscription is active."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <section className="mt-6">
            <div className="grid gap-5 md:grid-cols-2">
              {/* HUMANIZER */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Zap size={19} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      AI Humanizer
                    </h3>

                    <p className="text-sm text-gray-500">
                      Start rewriting your content.
                    </p>
                  </div>
                </div>

                <Link
                  href="/humanizer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                  Open Humanizer
                  <ArrowRight size={15} />
                </Link>
              </div>

              {/* UPGRADE */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <CreditCard size={19} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {plan === "business"
                        ? "Business Plan"
                        : "Upgrade Your Plan"}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {plan === "business"
                        ? "You have unlimited words."
                        : "Get more words and features."}
                    </p>
                  </div>
                </div>

                {plan !== "business" && (
                  <Link
                    href="/pricing"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                  >
                    View Plans
                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="py-10 text-center text-xs text-gray-400">
            © 2026 Wordvia.ai. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  );
}