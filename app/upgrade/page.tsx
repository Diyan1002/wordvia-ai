"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import {
  Check,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Zap,
  CreditCard,
  Loader2,
} from "lucide-react";

import {
  initializePaddle,
  type Paddle,
} from "@paddle/paddle-js";

import { useSearchParams } from "next/navigation";


const PRO_PRICE_ID =
  "pri_01m4k5vb9c63968g14fx474ht9";

const BUSINESS_PRICE_ID =
  "pri_01m4k5xhq3t3aad5pegak3d2ry";


const plans = {

  pro: {
    name: "Pro",
    price: "$19",
    period: "per month",
    words: "50,000 words/month",

    priceId: PRO_PRICE_ID,

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
    price: "$49",
    period: "per month",
    words: "Unlimited words",

    priceId: BUSINESS_PRICE_ID,

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


export default function UpgradePage() {

  const searchParams = useSearchParams();

  const { userId } = useAuth();

  const planParam =
    searchParams
      .get("plan")
      ?.toLowerCase() || "pro";


  const selectedPlan =
    plans[
      planParam as keyof typeof plans
    ] || plans.pro;


  const [paddle, setPaddle] =
    useState<Paddle | undefined>();


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");



  /*
   * INITIALIZE PADDLE
   */

  useEffect(() => {

    async function initialize() {

      try {

        const token =
          process.env
            .NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;


        if (!token) {

          setError(
            "Paddle client token is missing. Check your .env.local file."
          );

          setLoading(false);

          return;

        }


        const paddleInstance =
          await initializePaddle({

            environment: "sandbox",

            token,

          });


        if (!paddleInstance) {

          setError(
            "Unable to initialize Paddle."
          );

          setLoading(false);

          return;

        }


        setPaddle(
          paddleInstance
        );

        setLoading(false);

      } catch (err) {

        console.error(
          "Paddle initialization error:",
          err
        );


        setError(
          "Unable to connect to Paddle. Please try again."
        );


        setLoading(false);

      }

    }


    initialize();

  }, []);



  /*
   * OPEN CHECKOUT
   */

  function openCheckout() {

    setError("");


    if (!paddle) {

      setError(
        "Payment system is still loading. Please try again."
      );

      return;

    }


    try {

      paddle.Checkout.open({

  items: [

    {
      priceId: selectedPlan.priceId,
      quantity: 1,
    },

  ],

  customData: {

    clerkUserId: userId,

    plan: planParam,

  },

  settings: {

    displayMode: "overlay",

    theme: "light",

    locale: "en",

  },

});

    } catch (err) {

      console.error(
        "Checkout error:",
        err
      );


      setError(
        "Unable to open checkout. Please try again."
      );

    }

  }



  return (

    <div
      className="
        min-h-screen
        bg-[#fafafa]
      "
    >


      {/* HEADER */}

      <header
        className="
          border-b
          border-gray-200
          bg-white
        "
      >

        <div
          className="
            mx-auto
            flex
            h-20
            max-w-6xl
            items-center
            justify-between
            px-5
            sm:px-8
          "
        >

          <Link
            href="/pricing"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-gray-600
              hover:text-purple-600
            "
          >

            <ArrowLeft size={18} />

            Back to Pricing

          </Link>


          <div
            className="
              flex
              items-center
              gap-2
              font-semibold
              text-gray-900
            "
          >

            <Sparkles
              size={20}
              className="text-purple-600"
            />

            Wordvia.ai

          </div>

        </div>

      </header>



      {/* MAIN */}

      <main
        className="
          mx-auto
          max-w-5xl
          px-5
          py-12
          sm:px-8
          sm:py-16
        "
      >


        {/* TITLE */}

        <div className="text-center">

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-purple-50
              px-4
              py-2
              text-sm
              font-semibold
              text-purple-600
            "
          >

            <Sparkles size={16} />

            Upgrade Wordvia.ai

          </div>


          <h1
            className="
              mt-5
              text-3xl
              font-bold
              text-gray-900
              sm:text-4xl
            "
          >

            Upgrade to{" "}

            <span className="text-purple-600">
              {selectedPlan.name}
            </span>

          </h1>


          <p
            className="
              mx-auto
              mt-3
              max-w-xl
              text-sm
              leading-6
              text-gray-500
            "
          >

            Get more writing capacity
            and unlock more features
            with Wordvia.ai.

          </p>

        </div>



        {/* ERROR */}

        {error && (

          <div
            className="
              mx-auto
              mt-8
              max-w-3xl
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-5
              py-4
              text-center
              text-sm
              text-red-700
            "
          >

            {error}

          </div>

        )}



        {/* CONTENT */}

        <div
          className="
            mx-auto
            mt-10
            grid
            max-w-4xl
            gap-7
            md:grid-cols-2
          "
        >


          {/* PLAN CARD */}

          <div
            className="
              rounded-3xl
              border
              border-purple-200
              bg-white
              p-8
              shadow-sm
            "
          >

            <p
              className="
                text-sm
                font-semibold
                text-purple-600
              "
            >
              Selected Plan
            </p>


            <h2
              className="
                mt-2
                text-3xl
                font-bold
                text-gray-900
              "
            >

              {selectedPlan.name}

            </h2>


            <div className="mt-7">

              <span
                className="
                  text-5xl
                  font-bold
                  text-gray-900
                "
              >

                {selectedPlan.price}

              </span>


              <span
                className="
                  ml-2
                  text-sm
                  text-gray-500
                "
              >

                {selectedPlan.period}

              </span>

            </div>


            <div
              className="
                mt-5
                rounded-xl
                bg-purple-50
                px-4
                py-3
                text-sm
                font-semibold
                text-purple-700
              "
            >

              {selectedPlan.words}

            </div>


            <div className="mt-8">

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-gray-400
                "
              >

                Included

              </p>


              <ul className="mt-4 space-y-3">

                {selectedPlan.features.map(
                  (feature) => (

                    <li
                      key={feature}
                      className="
                        flex
                        items-center
                        gap-3
                        text-sm
                        text-gray-600
                      "
                    >

                      <span
                        className="
                          flex
                          h-5
                          w-5
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-purple-50
                          text-purple-600
                        "
                      >

                        <Check size={13} />

                      </span>

                      {feature}

                    </li>

                  )
                )}

              </ul>

            </div>

          </div>



          {/* CHECKOUT CARD */}

          <div
            className="
              rounded-3xl
              border
              border-gray-200
              bg-white
              p-8
              shadow-sm
            "
          >

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
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-green-50
                  text-green-600
                "
              >

                <CreditCard size={20} />

              </div>


              <div>

                <h2
                  className="
                    font-bold
                    text-gray-900
                  "
                >

                  Secure Checkout

                </h2>


                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >

                  Powered by Paddle

                </p>

              </div>

            </div>



            {/* CHECKOUT INFO */}

            <div
              className="
                mt-8
                rounded-2xl
                bg-gray-50
                p-6
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-sm
                  text-gray-600
                "
              >

                <ShieldCheck
                  size={18}
                  className="text-green-600"
                />

                Secure payment processing

              </div>


              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-3
                  text-sm
                  text-gray-600
                "
              >

                <Check
                  size={18}
                  className="text-green-600"
                />

                Monthly subscription

              </div>


              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-3
                  text-sm
                  text-gray-600
                "
              >

                <Zap
                  size={18}
                  className="text-purple-600"
                />

                Instant checkout

              </div>

            </div>



            {/* BUTTON */}

            <button
              type="button"
              onClick={openCheckout}
              disabled={
                loading || !paddle
              }
              className="
                mt-7
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-purple-600
                py-4
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-purple-100
                transition
                hover:bg-purple-700
                disabled:cursor-not-allowed
                disabled:bg-purple-300
              "
            >

              {loading ? (

                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Loading payment...

                </>

              ) : (

                <>
                  <CreditCard size={18} />

                  Continue to Payment

                </>

              )}

            </button>


            <p
              className="
                mt-4
                text-center
                text-xs
                leading-5
                text-gray-400
              "
            >

              You will be charged{" "}
              {selectedPlan.price}{" "}
              {selectedPlan.period}.

            </p>

          </div>

        </div>



        {/* BACK */}

        <div className="mt-8 text-center">

          <Link
            href="/pricing"
            className="
              text-sm
              font-medium
              text-gray-500
              hover:text-purple-600
            "
          >

            ← Change plan

          </Link>

        </div>

      </main>



      {/* FOOTER */}

      <footer
        className="
          border-t
          border-gray-200
          bg-white
          py-8
          text-center
          text-xs
          text-gray-400
        "
      >

        © 2026 Wordvia.ai.
        All rights reserved.

      </footer>

    </div>

  );
}