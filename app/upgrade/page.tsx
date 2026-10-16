"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  initializePaddle,
  type Paddle,
} from "@paddle/paddle-js";
import {
  Sparkles,
  Check,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const PLANS = {
  pro: {
    name: "Pro",
    priceId: "pri_01m4k5vb9c63968g14fx474ht9",
    price: "$19",
    words: "50,000 words/month",
    features: [
      "50,000 words per month",
      "AI text humanization",
      "All writing styles",
      "Multiple languages",
      "Document history",
      "Priority processing",
    ],
  },

  business: {
    name: "Business",
    priceId: "pri_01m4k5xhq3t3aad5pegak3d2ry",
    price: "$49",
    words: "Unlimited words",
    features: [
      "Unlimited words",
      "AI text humanization",
      "All writing styles",
      "Multiple languages",
      "Unlimited history",
      "Priority processing",
      "Business usage",
    ],
  },
} as const;

type PlanKey = keyof typeof PLANS;

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <UpgradeContent />
    </Suspense>
  );
}

function UpgradeContent() {
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  // Validate plan query parameter
  const rawPlan = searchParams.get("plan")?.toLowerCase();

  const requestedPlan: PlanKey | null =
    rawPlan && Object.prototype.hasOwnProperty.call(PLANS, rawPlan)
      ? (rawPlan as PlanKey)
      : null;

  const plan = requestedPlan ? PLANS[requestedPlan] : null;

  // Initialize Paddle
  useEffect(() => {
    let cancelled = false;

    async function initPaddle() {
      try {
        const token =
          process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

        if (!token) {
          throw new Error(
            "Paddle client token is missing. Check your environment variables."
          );
        }

        const instance = await initializePaddle({
          token,
          environment: "sandbox",
        });

        if (!instance) {
          throw new Error("Unable to initialize Paddle.");
        }

        if (!cancelled) {
          setPaddle(instance);
          setError("");
        }
      } catch (err) {
        console.error("Paddle initialization error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to initialize payment system."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initPaddle();

    return () => {
      cancelled = true;
    };
  }, []);

  // Open Paddle checkout
  async function openCheckout() {
    setError("");

    if (!isLoaded) {
      setError("Please wait while your account loads.");
      return;
    }

    if (!user) {
      setError("Please sign in before upgrading.");
      return;
    }

    if (!plan || !requestedPlan) {
      setError("Invalid plan selected.");
      return;
    }

    if (!paddle) {
      setError("Payment system is not ready. Please try again.");
      return;
    }

    try {
      setCheckoutLoading(true);

      // Clerk email may be undefined, so validate it first.
      const email = user.primaryEmailAddress?.emailAddress;

      paddle.Checkout.open({
        items: [
          {
            priceId: plan.priceId,
            quantity: 1,
          },
        ],

        customData: {
          clerkUserId: user.id,
          plan: requestedPlan,
        },

        // Only pass customer when email is available.
        ...(email
          ? {
              customer: {
                email: email,
              },
            }
          : {}),

        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
        },
      });
    } catch (err) {
      console.error("Paddle checkout error:", err);

      setError(
        "Unable to open checkout. Please try again."
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  // Invalid plan screen
  if (!plan) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Invalid Plan
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Please return to the pricing page and select
              a valid plan.
            </p>

            <Link
              href="/pricing"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              <ArrowLeft size={16} />
              Back to Pricing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        {/* Back link */}
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Pricing
        </Link>

        {/* Header */}
        <div className="mt-8 text-center sm:mt-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-600">
            <Sparkles size={16} />
            Upgrade Wordvia.ai
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 sm:mt-6 sm:text-4xl lg:text-5xl">
            Upgrade to{" "}
            <span className="text-purple-600">
              {plan.name}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Get more writing capacity and unlock additional
            Wordvia.ai features.
          </p>
        </div>

        {/* Plan Card */}
        <div className="mx-auto mt-8 max-w-lg rounded-3xl border border-purple-200 bg-white p-5 shadow-lg sm:mt-10 sm:p-8">
          {/* Plan name and price */}
          <div className="flex flex-col gap-4 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {plan.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {plan.words}
              </p>
            </div>

            <div className="min-[400px]:text-right">
              <div className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {plan.price}
              </div>

              <div className="text-sm text-gray-500">
                per month
              </div>
            </div>
          </div>

          <div className="my-7 h-px bg-gray-100 sm:my-8" />

          {/* Features */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              What's included
            </p>

            <ul className="mt-5 space-y-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm leading-6 text-gray-600"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                    <Check size={13} />
                  </span>

                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mt-6 break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          {/* Checkout button */}
          <button
            type="button"
            onClick={openCheckout}
            disabled={
              loading ||
              checkoutLoading ||
              !isLoaded
            }
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-4 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
          >
            {loading || checkoutLoading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Loading...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Continue to Payment
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-gray-400">
            Secure payment powered by Paddle.
          </p>
        </div>
      </div>
    </div>
  );
}