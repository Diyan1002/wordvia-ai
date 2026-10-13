"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Menu,
  Sparkles,
  FileText,
  Type,
  Zap,
  ArrowRight,
  User,
  Loader2,
} from "lucide-react";

import { UserButton } from "@clerk/nextjs";

import Sidebar from "@/app/components/dashboard/Sidebar";
import DashboardCard from "@/app/components/dashboard/DashboardCard";
import RecentActivity from "@/app/components/dashboard/RecentActivity";

type Plan = "free" | "pro" | "business";

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [wordsUsed, setWordsUsed] = useState(0);
  const [documents, setDocuments] = useState(0);

  const [plan, setPlan] = useState<Plan>("free");

  const [monthlyLimit, setMonthlyLimit] =
    useState<number | null>(1000);

  const [remainingWords, setRemainingWords] =
    useState<number | null>(1000);

  const [loading, setLoading] = useState(true);

  // --------------------------------
  // LOAD REAL PLAN + USAGE
  // --------------------------------

  async function loadUsage() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/usage",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      console.log(
        "DASHBOARD USAGE:",
        data
      );

      if (!response.ok) {
        console.error(
          "Usage API error:",
          data
        );

        return;
      }

      const detectedPlan =
        data.plan === "business"
          ? "business"
          : data.plan === "pro"
          ? "pro"
          : "free";

      setPlan(detectedPlan);

      setMonthlyLimit(
        data.monthlyLimit ?? null
      );

      setWordsUsed(
        typeof data.wordsUsed === "number"
          ? data.wordsUsed
          : 0
      );

      setRemainingWords(
        data.remainingWords ?? null
      );
    } catch (error) {
      console.error(
        "Failed to load dashboard usage:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsage();
  }, []);

  // --------------------------------
  // LOAD DOCUMENT COUNT
  // --------------------------------

  useEffect(() => {
    try {
      const docs = Number(
        localStorage.getItem(
          "wordvia_documents"
        ) || "0"
      );

      setDocuments(docs);
    } catch (error) {
      console.error(
        "Document count error:",
        error
      );
    }
  }, []);

  // --------------------------------
  // PLAN NAME
  // --------------------------------

  const planName =
    plan === "business"
      ? "Business"
      : plan === "pro"
      ? "Pro"
      : "Free";

  // --------------------------------
  // REMAINING TEXT
  // --------------------------------

  const remainingText =
    monthlyLimit === null
      ? "Unlimited words remaining"
      : `${(
          remainingWords ?? 0
        ).toLocaleString()} words remaining`;

  // --------------------------------
  // MONTHLY LIMIT TEXT
  // --------------------------------

  const planDescription =
    monthlyLimit === null
      ? "Unlimited words available."
      : `${monthlyLimit.toLocaleString()} words available every month.`;

  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* SIDEBAR */}

      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />

      {/* MAIN */}

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

          {/* LEFT */}

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() =>
                setMobileOpen(true)
              }
              className="
                rounded-xl
                border
                border-gray-200
                p-2.5
                text-gray-600
                hover:bg-gray-50
                lg:hidden
              "
            >
              <Menu size={21} />
            </button>

            <div>

              <p className="text-xs text-gray-400">
                Workspace
              </p>

              <h1 className="text-lg font-semibold text-gray-900">
                Dashboard
              </h1>

            </div>

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-3">

            <div
              className="
                hidden
                items-center
                gap-2
                rounded-full
                bg-gray-50
                px-3
                py-2
                text-sm
                text-gray-500
                sm:flex
              "
            >
              <User size={16} />

              Account
            </div>

            <UserButton />

          </div>

        </header>

        {/* CONTENT */}

        <div
          className="
            mx-auto
            max-w-7xl
            px-5
            py-8
            sm:px-8
            lg:px-10
          "
        >

          {/* WELCOME */}

          <section>

            <div
              className="
                flex
                flex-col
                justify-between
                gap-6
                md:flex-row
                md:items-center
              "
            >

              <div>

                <div
                  className="
                    mb-3
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-purple-50
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-purple-600
                  "
                >
                  <Sparkles size={14} />

                  AI Writing Workspace
                </div>

                <h2
                  className="
                    text-3xl
                    font-bold
                    tracking-tight
                    text-gray-900
                    sm:text-4xl
                  "
                >
                  Welcome to Wordvia.ai
                </h2>

                <p
                  className="
                    mt-2
                    max-w-xl
                    text-sm
                    leading-6
                    text-gray-500
                    sm:text-base
                  "
                >
                  Transform your AI-generated
                  content into natural,
                  authentic writing.
                </p>

              </div>

              <Link
                href="/humanizer"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-purple-600
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-purple-200
                  transition
                  hover:bg-purple-700
                "
              >
                <Sparkles size={18} />

                Humanize Text
              </Link>

            </div>

          </section>

          {/* STATS */}

          <section
            className="
              mt-8
              grid
              gap-5
              sm:grid-cols-2
              xl:grid-cols-3
            "
          >

            {/* WORDS USED */}

            <DashboardCard
              title="Words Used"
              value={
                loading
                  ? "..."
                  : wordsUsed.toLocaleString()
              }
              description="Words used this month"
              icon={Type}
            />

            {/* DOCUMENTS */}

            <DashboardCard
              title="Documents"
              value={documents.toString()}
              description="Humanized documents"
              icon={FileText}
            />

            {/* CURRENT PLAN */}

            <DashboardCard
              title="Current Plan"
              value={
                loading
                  ? "..."
                  : planName
              }
              description={
                loading
                  ? "Loading plan..."
                  : remainingText
              }
              icon={Zap}
            />

          </section>

          {/* PLAN STATUS */}

          <section className="mt-8">

            <div
              className="
                rounded-2xl
                border
                border-purple-100
                bg-purple-50
                p-6
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >

                <div>

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        text-purple-600
                        shadow-sm
                      "
                    >
                      {loading ? (
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />
                      ) : (
                        <Zap size={19} />
                      )}
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-gray-900">
                        {loading
                          ? "Loading..."
                          : `${planName} Plan`}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {loading
                          ? "Checking your plan..."
                          : planDescription}
                      </p>

                    </div>

                  </div>

                </div>

                {plan === "free" && !loading && (
                  <Link
                    href="/pricing"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-purple-600
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      hover:bg-purple-700
                    "
                  >
                    Upgrade Plan

                    <ArrowRight
                      size={16}
                    />
                  </Link>
                )}

                {plan === "pro" && !loading && (
                  <span
                    className="
                      rounded-full
                      bg-white
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-purple-600
                      shadow-sm
                    "
                  >
                    Pro Active
                  </span>
                )}

                {plan === "business" &&
                  !loading && (
                    <span
                      className="
                        rounded-full
                        bg-white
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-purple-600
                        shadow-sm
                      "
                    >
                      Business Active
                    </span>
                  )}

              </div>

              {/* PROGRESS */}

              {!loading &&
                monthlyLimit !== null && (
                  <div className="mt-5">

                    <div
                      className="
                        mb-2
                        flex
                        justify-between
                        text-xs
                        text-gray-500
                      "
                    >
                      <span>
                        Monthly usage
                      </span>

                      <span>
                        {wordsUsed.toLocaleString()} /{" "}
                        {monthlyLimit.toLocaleString()}
                      </span>
                    </div>

                    <div
                      className="
                        h-2
                        overflow-hidden
                        rounded-full
                        bg-white
                      "
                    >

                      <div
                        className="
                          h-full
                          rounded-full
                          bg-purple-600
                          transition-all
                        "
                        style={{
                          width: `${Math.min(
                            100,
                            (wordsUsed /
                              monthlyLimit) *
                              100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>
                )}

            </div>

          </section>

          {/* QUICK START */}

          <section className="mt-8">

            <div
              className="
                relative
                overflow-hidden
                rounded-3xl
                bg-gradient-to-br
                from-purple-600
                via-purple-600
                to-indigo-700
                p-8
                text-white
                shadow-xl
                sm:p-10
              "
            >

              <div
                className="
                  absolute
                  -right-20
                  -top-20
                  h-56
                  w-56
                  rounded-full
                  bg-white/10
                "
              />

              <div
                className="
                  absolute
                  -bottom-28
                  right-20
                  h-64
                  w-64
                  rounded-full
                  bg-white/5
                "
              />

              <div className="relative z-10 max-w-2xl">

                <div
                  className="
                    mb-4
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/15
                  "
                >
                  <Sparkles size={22} />
                </div>

                <h2 className="text-2xl font-bold sm:text-3xl">
                  Ready to make your writing sound human?
                </h2>

                <p
                  className="
                    mt-3
                    max-w-xl
                    text-sm
                    leading-6
                    text-purple-100
                    sm:text-base
                  "
                >
                  Paste your AI-generated
                  content and let Wordvia.ai
                  transform it into natural,
                  readable writing.
                </p>

                <Link
                  href="/humanizer"
                  className="
                    mt-7
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-purple-700
                    hover:bg-purple-50
                  "
                >
                  Start Humanizing

                  <ArrowRight size={17} />
                </Link>

              </div>

            </div>

          </section>

          {/* RECENT ACTIVITY */}

          <section className="mt-8">

            <RecentActivity />

          </section>

          {/* BOTTOM CARDS */}

          <section
            className="
              mt-8
              grid
              gap-5
              md:grid-cols-2
            "
          >

            {/* HUMANIZER */}

            <div
              className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-6
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-purple-50
                    text-purple-600
                  "
                >
                  <Sparkles size={19} />
                </div>

                <div>

                  <h3 className="font-semibold text-gray-900">
                    AI Humanizer
                  </h3>

                  <p className="text-sm text-gray-500">
                    Rewrite your content naturally.
                  </p>

                </div>

              </div>

              <Link
                href="/humanizer"
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-1
                  text-sm
                  font-semibold
                  text-purple-600
                  hover:text-purple-700
                "
              >
                Open Humanizer

                <ArrowRight size={15} />
              </Link>

            </div>

            {/* CURRENT PLAN */}

            <div
              className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-6
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-green-50
                    text-green-600
                  "
                >
                  <Zap size={19} />
                </div>

                <div>

                  <h3 className="font-semibold text-gray-900">
                    {loading
                      ? "Loading..."
                      : `${planName} Plan`}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {loading
                      ? "Checking your plan..."
                      : planDescription}
                  </p>

                </div>

              </div>

              <Link
                href="/pricing"
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-1
                  text-sm
                  font-semibold
                  text-purple-600
                  hover:text-purple-700
                "
              >
                View plans

                <ArrowRight size={15} />
              </Link>

            </div>

          </section>

          {/* FOOTER */}

          <footer
            className="
              py-10
              text-center
              text-xs
              text-gray-400
            "
          >
            © 2026 Wordvia.ai. All rights reserved.
          </footer>

        </div>

      </main>

    </div>
  );
}