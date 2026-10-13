"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { Sparkles, Check, Loader2, ArrowLeft } from "lucide-react";
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
};

type PlanKey = keyof typeof PLANS;

export default function UpgradePage() {
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  const requestedPlan =
    searchParams.get("plan")?.toLowerCase() as PlanKey | null;

  const plan =
    requestedPlan && PLANS[requestedPlan]
      ? PLANS[requestedPlan]
      : null;

  useEffect(() => {
    async function initPaddle() {
      try {
        const token =
          process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

        if (!token) {
          setError(
            "Paddle client token is missing. Please check your environment variables."
          );
          setLoading(false);
          return;
        }

        const instance = await initializePaddle({
          token,

          environment: "sandbox",
        });

        if (!instance) {
          setError("Unable to initialize Paddle.");
          setLoading(false);
          return;
        }

        setPaddle(instance);
      } catch (err) {
        console.error("Paddle initialization error:", err);

        setError(
          "Unable to initialize payment system."
        );
      } finally {
        setLoading(false);
      }
    }

    initPaddle();
  }, []);

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

    if (!plan) {
      setError("Invalid plan selected.");
      return;
    }

    if (!paddle) {
      setError("Payment system is still loading.");
      return;
    }

    try {
      setCheckoutLoading(true);

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

        customer: {
          email: user.primaryEmailAddress?.emailAddress,
        },

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

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              Invalid Plan
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Please return to the pricing page and
              select a valid plan.
            </p>

            <Link
              href="/pricing"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700"
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
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Pricing
        </Link>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-600">
            <Sparkles size={16} />
            Upgrade Wordvia.ai
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Upgrade to{" "}
            <span className="text-purple-600">
              {plan.name}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Get more writing capacity and unlock
            additional Wordvia.ai features.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-purple-200 bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {plan.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {plan.words}
              </p>
            </div>

            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">
                {plan.price}
              </div>

              <div className="text-sm text-gray-500">
                per month
              </div>
            </div>
          </div>

          <div className="my-8 h-px bg-gray-100" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              What's included
            </p>

            <ul className="mt-5 space-y-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                    <Check size={13} />
                  </span>

                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={openCheckout}
            disabled={
              loading ||
              checkoutLoading ||
              !isLoaded ||
              !user
            }
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-4 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
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

          <p className="mt-4 text-center text-xs text-gray-400">
            Secure payment powered by Paddle.
          </p>
        </div>
      </div>
    </div>
  );
}