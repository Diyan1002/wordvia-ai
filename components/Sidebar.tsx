"use client";

import {
  LayoutDashboard,
  FileText,
  Settings,
  Sparkles,
  CreditCard,
} from "lucide-react";

import { useUser } from "@clerk/nextjs";

export default function Sidebar() {
  const { user, isLoaded } = useUser();

  // Get plan from Clerk
  const rawPlan =
    (
      user?.publicMetadata?.plan as
        | string
        | undefined
    )?.toLowerCase() || "free";

  const plan =
    rawPlan === "business"
      ? "business"
      : rawPlan === "pro"
      ? "pro"
      : "free";

  // Plan information
  const planInfo = {
    free: {
      name: "Free",
      words: "1,000 words/month",
    },

    pro: {
      name: "Pro",
      words: "50,000 words/month",
    },

    business: {
      name: "Business",
      words: "Unlimited words",
    },
  };

  const currentPlan = planInfo[plan];

  return (
    <aside
      className="
        w-64
        min-h-screen
        border-r
        bg-white
        p-6
        hidden
        md:block
      "
    >

      {/* LOGO */}

      <h2
        className="
          mb-10
          text-xl
          font-bold
          text-gray-900
        "
      >
        Wordvia
        <span className="text-purple-600">
          .ai
        </span>
      </h2>

      {/* NAVIGATION */}

      <div className="space-y-3">

        <div
          className="
            flex
            cursor-pointer
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-gray-700
            hover:bg-purple-50
            hover:text-purple-600
          "
        >
          <LayoutDashboard size={20} />

          Dashboard
        </div>

        <div
          className="
            flex
            cursor-pointer
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-gray-700
            hover:bg-purple-50
            hover:text-purple-600
          "
        >
          <FileText size={20} />

          Documents
        </div>

        <div
          className="
            flex
            cursor-pointer
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-gray-700
            hover:bg-purple-50
            hover:text-purple-600
          "
        >
          <Settings size={20} />

          Settings
        </div>

      </div>

      {/* PLAN CARD */}

      <div
        className="
          mt-10
          rounded-2xl
          bg-purple-50
          p-4
        "
      >

        <div className="flex items-center gap-2">

          <Sparkles
            size={18}
            className="text-purple-600"
          />

          <span
            className="
              text-sm
              font-semibold
              text-gray-900
            "
          >
            {!isLoaded
              ? "Loading..."
              : `${currentPlan.name} Plan`}
          </span>

        </div>

        <p
          className="
            mt-2
            text-xs
            leading-5
            text-gray-500
          "
        >
          {!isLoaded
            ? "Checking your plan..."
            : currentPlan.words}
        </p>

        {/* FREE */}

        {isLoaded && plan === "free" && (
          <a
            href="/pricing"
            className="
              mt-4
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-purple-600
              px-3
              py-2.5
              text-xs
              font-semibold
              text-white
              hover:bg-purple-700
            "
          >
            <CreditCard size={14} />

            Upgrade Plan
          </a>
        )}

        {/* PRO */}

        {isLoaded && plan === "pro" && (
          <div
            className="
              mt-4
              rounded-xl
              bg-white
              px-3
              py-2.5
              text-center
              text-xs
              font-semibold
              text-purple-600
            "
          >
            Pro Active
          </div>
        )}

        {/* BUSINESS */}

        {isLoaded && plan === "business" && (
          <div
            className="
              mt-4
              rounded-xl
              bg-white
              px-3
              py-2.5
              text-center
              text-xs
              font-semibold
              text-purple-600
            "
          >
            Business Active
          </div>
        )}

      </div>

    </aside>
  );
}