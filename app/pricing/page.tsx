"use client";

import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

import Navbar from "@/components/Navbar";


const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    words: "1,000 words/month",
    description: "Perfect for trying Wordvia.ai.",
    popular: false,

    features: [
      "1,000 words per month",
      "AI text humanization",
      "Basic writing styles",
      "Multiple languages",
      "Document history",
    ],
  },

  {
    name: "Pro",
    price: "$19",
    period: "per month",
    words: "50,000 words/month",
    description: "For regular writers and creators.",
    popular: true,

    features: [
      "50,000 words per month",
      "AI text humanization",
      "All writing styles",
      "Multiple languages",
      "Document history",
      "Priority processing",
    ],
  },

  {
    name: "Business",
    price: "$49",
    period: "per month",
    words: "Unlimited",
    description: "For teams and heavy users.",
    popular: false,

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
];


export default function Pricing() {

  function choosePlan(planName: string) {

    if (planName === "Free") {

      window.location.href = "/dashboard";

      return;

    }


    /*
      Payment integration will be connected later.
      For now send Pro/Business users
      to the upgrade page.
    */

    window.location.href =
      `/upgrade?plan=${planName.toLowerCase()}`;

  }


  return (

    <div className="min-h-screen bg-[#fafafa]">

      <Navbar />


      {/* HERO */}

      <section
        className="
          px-6
          pb-10
          pt-20
          text-center
        "
      >

        <div
          className="
            mx-auto
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

          Simple & Transparent Pricing

        </div>


        <h1
          className="
            mt-6
            text-4xl
            font-bold
            tracking-tight
            text-gray-900
            sm:text-5xl
          "
        >

          Choose the plan that
          {" "}

          <span className="text-purple-600">
            works for you
          </span>

        </h1>


        <p
          className="
            mx-auto
            mt-5
            max-w-2xl
            text-base
            leading-7
            text-gray-500
          "
        >

          Start free and upgrade when
          you need more words and
          advanced writing features.

        </p>

      </section>



      {/* PRICING */}

      <section
        className="
          mx-auto
          max-w-6xl
          px-6
          mt-2
          pb-20
        "
      >

        <div
          className="
            grid
            gap-7
            md:grid-cols-3
          "
        >

          {plans.map((plan) => (

            <div
              key={plan.name}
              className={`
                relative
                flex
                flex-col
                rounded-3xl
                border
                bg-white
                p-8
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-xl
                ${
                  plan.popular
                    ? "border-purple-500 ring-2 ring-purple-100"
                    : "border-gray-200"
                }
              `}
            >


              {/* POPULAR */}

              {plan.popular && (

                <div
                  className="
                    absolute
                    left-1/2
                    top-0
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-purple-600
                    px-4
                    py-1.5
                    text-xs
                    font-bold
                    text-white
                    shadow-md
                  "
                >

                  MOST POPULAR

                </div>

              )}



              {/* PLAN NAME */}

              <h2
                className="
                  text-2xl
                  font-bold
                  text-gray-900
                "
              >

                {plan.name}

              </h2>


              <p
                className="
                  mt-2
                  min-h-[48px]
                  text-sm
                  leading-6
                  text-gray-500
                "
              >

                {plan.description}

              </p>



              {/* PRICE */}

              <div className="mt-7">

                <span
                  className="
                    text-5xl
                    font-bold
                    tracking-tight
                    text-gray-900
                  "
                >

                  {plan.price}

                </span>


                <span
                  className="
                    ml-2
                    text-sm
                    text-gray-500
                  "
                >

                  {plan.period}

                </span>

              </div>



              {/* WORDS */}

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

                {plan.words}

              </div>



              {/* BUTTON */}

              <button
                type="button"
                onClick={() =>
                  choosePlan(plan.name)
                }
                className={`
                  mt-6
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-5
                  py-3.5
                  text-sm
                  font-semibold
                  transition
                  ${
                    plan.popular
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                  }
                `}
              >

                {plan.name === "Free"
                  ? "Get Started"
                  : `Choose ${plan.name}`}

                <ArrowRight size={16} />

              </button>



              {/* FEATURES */}

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

                  What's included

                </p>


                <ul className="mt-4 space-y-3">

                  {plan.features.map(
                    (feature) => (

                      <li
                        key={feature}
                        className="
                          flex
                          items-start
                          gap-3
                          text-sm
                          text-gray-600
                        "
                      >

                        <span
                          className="
                            mt-0.5
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

          ))}

        </div>

      </section>



      {/* FAQ / TRUST */}

      <section
        className="
          border-t
          border-gray-200
          bg-white
          px-6
          py-16
        "
      >

        <div className="mx-auto max-w-4xl text-center">

          <h2
            className="
              text-2xl
              font-bold
              text-gray-900
            "
          >

            Start with Free

          </h2>


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

            No payment is required to start.
            Upgrade whenever you need more
            writing capacity.

          </p>


          <Link
            href="/humanizer"
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-purple-600
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              hover:bg-purple-700
            "
          >

            Try Humanizer

            <ArrowRight size={16} />

          </Link>

        </div>

      </section>



      {/* FOOTER */}

      <footer
        className="
          bg-white
          py-8
          text-center
          text-xs
          text-gray-400
        "
      >

        © 2026 Wordvia.ai. All rights reserved.

      </footer>

    </div>

  );
}