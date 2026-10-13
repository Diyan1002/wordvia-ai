"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  Sparkles,
  ShieldCheck,
  Zap,
  Languages,
  Copy,
  Check,
  Loader2,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { useUser } from "@clerk/nextjs";

type Plan = "free" | "pro" | "business";

export default function HumanizerClient() {
  const { user, isLoaded } = useUser();

  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [tone, setTone] = useState("Professional");
  const [level, setLevel] = useState("Medium");
  const [language, setLanguage] = useState("English");

  const [wordsUsed, setWordsUsed] = useState(0);
  const [monthlyLimit, setMonthlyLimit] =
    useState<number | null>(1000);

  const [remainingWords, setRemainingWords] =
    useState<number | null>(1000);

  const [usageLoading, setUsageLoading] =
    useState(true);

  // --------------------------------
  // GET PLAN FROM CLERK
  // --------------------------------

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
  // LOAD REAL USAGE
  // --------------------------------

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

      console.log(
        "HUMANIZER USAGE:",
        data
      );

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
    } catch (error) {
      console.error(
        "Failed to load usage:",
        error
      );
    } finally {
      setUsageLoading(false);
    }
  }

  // --------------------------------
  // LOAD USAGE AFTER CLERK LOADS
  // --------------------------------

  useEffect(() => {
    if (isLoaded) {
      loadUsage();
    }
  }, [isLoaded]);

  // --------------------------------
  // INPUT WORD COUNT
  // --------------------------------

  const inputWordCount = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  // --------------------------------
  // CHECK WHETHER LIMIT IS EXCEEDED
  // --------------------------------

  const limitExceeded =
    monthlyLimit !== null &&
    inputWordCount >
      (remainingWords ?? 0);

  // --------------------------------
  // HUMANIZE
  // --------------------------------

  async function humanize() {
    setResult("");

    if (!text.trim()) {
      setResult(
        "Please enter some text first."
      );

      return;
    }

    if (usageLoading) {
      setResult(
        "Please wait while your plan is loading."
      );

      return;
    }

    // Business = unlimited
    if (limitExceeded) {
      setResult(
        `You have ${
          remainingWords?.toLocaleString() || "0"
        } words remaining on your ${planName} plan. Your text contains ${inputWordCount.toLocaleString()} words.`
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/humanize",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text,
            tone,
            level,
            language,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "API RESPONSE:",
        data
      );

      if (!response.ok || data.error) {
        setResult(
          data.error ||
            "Unable to generate result."
        );

        // Refresh usage in case API
        // rejected because of limit
        await loadUsage();

        return;
      }

      if (!data.result) {
        setResult(
          "No result was generated."
        );

        return;
      }

      // --------------------------------
      // SHOW RESULT
      // --------------------------------

      setResult(data.result);

      // --------------------------------
      // USE SERVER USAGE
      // --------------------------------

      if (
        typeof data.wordsUsed ===
        "number"
      ) {
        setWordsUsed(
          data.wordsUsed
        );
      }

      if (
        typeof data.monthlyLimit ===
        "number" ||
        data.monthlyLimit === null
      ) {
        setMonthlyLimit(
          data.monthlyLimit
        );
      }

      if (
        typeof data.remainingWords ===
        "number" ||
        data.remainingWords === null
      ) {
        setRemainingWords(
          data.remainingWords
        );
      }

      // --------------------------------
      // SAVE DOCUMENT
      // --------------------------------

      try {
        const oldHistory =
          JSON.parse(
            localStorage.getItem(
              "wordvia_history"
            ) || "[]"
          );

        const newDocument = {
          id: Date.now().toString(),

          title:
            text
              .trim()
              .split(/\s+/)
              .slice(0, 6)
              .join(" ") + "...",

          originalText: text,

          humanizedText:
            data.result,

          tone,

          level,

          language,

          createdAt:
            new Date().toISOString(),
        };

        const updatedHistory = [
          newDocument,
          ...oldHistory,
        ];

        localStorage.setItem(
          "wordvia_history",
          JSON.stringify(
            updatedHistory
          )
        );

        localStorage.setItem(
          "wordvia_documents",
          String(
            updatedHistory.length
          )
        );
      } catch (historyError) {
        console.error(
          "History save error:",
          historyError
        );
      }
    } catch (error) {
      console.error(
        "Humanizer error:",
        error
      );

      setResult(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------
  // COPY
  // --------------------------------

  async function copyResult() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        result
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy error:",
        error
      );
    }
  }

  // --------------------------------
  // CLEAR
  // --------------------------------

  function clearText() {
    setText("");
    setResult("");
  }

  // --------------------------------
  // USAGE DISPLAY
  // --------------------------------

  const usageText =
    monthlyLimit === null
      ? "Unlimited words"
      : `${wordsUsed.toLocaleString()} / ${monthlyLimit.toLocaleString()} words used`;

  const remainingText =
    monthlyLimit === null
      ? "Unlimited words remaining"
      : `${(
          remainingWords ?? 0
        ).toLocaleString()} words left`;

  return (
    <div className="min-h-screen bg-[#fafafa]">

      <Navbar />

      {/* HERO */}

      <section
        className="
          px-6
          py-20
          text-center
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-purple-100
            px-5
            py-2
            text-purple-700
          "
        >
          <Sparkles size={18} />

          AI Writing Assistant
        </motion.div>

        <motion.h1
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          className="
            mt-8
            text-5xl
            font-bold
            md:text-7xl
          "
        >
          Make AI Text{" "}

          <span className="text-purple-600">
            Sound Human
          </span>
        </motion.h1>

        <p
          className="
            mx-auto
            mt-6
            max-w-2xl
            text-lg
            text-gray-500
          "
        >
          Wordvia.ai transforms robotic
          AI-generated content into natural
          human writing.
        </p>

        <div
          className="
            mt-8
            flex
            justify-center
            gap-8
            text-sm
            text-gray-600
          "
        >
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="text-purple-600"
            />
            Meaning Preserved
          </div>

          <div className="flex items-center gap-2">
            <Zap
              className="text-purple-600"
            />
            Instant Result
          </div>
        </div>
      </section>

      {/* TOOL */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-6
        "
      >
        <div
          className="
            rounded-3xl
            border
            bg-white
            p-8
            shadow-sm
          "
        >

          {/* USAGE */}

          <div
            className="
              mb-8
              rounded-2xl
              border
              border-purple-100
              bg-purple-50
              p-5
            "
          >
            <div
              className="
                flex
                flex-col
                justify-between
                gap-3
                sm:flex-row
                sm:items-center
              "
            >
              <div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-purple-900
                  "
                >
                  {usageLoading
                    ? "Loading Plan..."
                    : `${planName} Plan Usage`}
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    text-purple-600
                  "
                >
                  {usageLoading
                    ? "Checking your usage..."
                    : usageText}
                </p>

              </div>

              <div
                className="
                  text-sm
                  font-semibold
                  text-purple-700
                "
              >
                {usageLoading
                  ? "..."
                  : remainingText}
              </div>
            </div>

            {/* PROGRESS */}

            {!usageLoading &&
              monthlyLimit !== null && (
                <div
                  className="
                    mt-4
                    h-2
                    overflow-hidden
                    rounded-full
                    bg-purple-100
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
              )}

            {/* BUSINESS MESSAGE */}

            {!usageLoading &&
              monthlyLimit === null && (
                <div
                  className="
                    mt-4
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-medium
                    text-purple-700
                  "
                >
                  <Sparkles size={14} />

                  Unlimited Business access
                </div>
              )}
          </div>

          {/* EDITORS */}

          <div
            className="
              grid
              gap-8
              md:grid-cols-2
            "
          >

            {/* INPUT */}

            <div>

              <div
                className="
                  mb-3
                  flex
                  justify-between
                "
              >
                <h3 className="font-semibold">
                  Original AI Text
                </h3>

                <span
                  className="
                    text-sm
                    text-gray-400
                  "
                >
                  {inputWordCount} words
                </span>
              </div>

              <textarea
                value={text}
                onChange={(e) =>
                  setText(
                    e.target.value
                  )
                }
                placeholder="Paste AI generated text here..."
                className="
                  h-96
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  p-5
                  outline-none
                  focus:ring-2
                  focus:ring-purple-500
                "
              />

              <button
                type="button"
                onClick={clearText}
                disabled={
                  !text && !result
                }
                className="
                  mt-3
                  text-sm
                  font-medium
                  text-gray-400
                  hover:text-gray-600
                  disabled:opacity-40
                "
              >
                Clear
              </button>

            </div>

            {/* RESULT */}

            <div>

              <div
                className="
                  mb-3
                  flex
                  items-center
                  justify-between
                "
              >
                <h3 className="font-semibold">
                  Humanized Result
                </h3>

                <button
                  type="button"
                  onClick={copyResult}
                  disabled={!result}
                  className="
                    rounded-lg
                    p-2
                    hover:bg-gray-100
                    disabled:opacity-40
                  "
                  title="Copy result"
                >
                  {copied ? (
                    <Check
                      size={18}
                      className="text-green-600"
                    />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>

              <div
                className="
                  h-96
                  overflow-auto
                  whitespace-pre-wrap
                  rounded-2xl
                  border
                  bg-gray-50
                  p-5
                  text-sm
                  leading-7
                "
              >
                {loading ? (
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      text-purple-600
                    "
                  >
                    <Loader2
                      className="animate-spin"
                    />

                    Humanizing...
                  </div>
                ) : result ? (
                  result
                ) : (
                  <span className="text-gray-400">
                    Your humanized text
                    will appear here...
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* OPTIONS */}

          <div
            className="
              mt-8
              grid
              gap-5
              md:grid-cols-3
            "
          >
            <select
              value={tone}
              onChange={(e) =>
                setTone(
                  e.target.value
                )
              }
              className="
                rounded-xl
                border
                p-3
                outline-none
                focus:ring-2
                focus:ring-purple-500
              "
            >
              <option>
                Professional
              </option>

              <option>
                Casual
              </option>

              <option>
                Creative
              </option>
            </select>

            <select
              value={level}
              onChange={(e) =>
                setLevel(
                  e.target.value
                )
              }
              className="
                rounded-xl
                border
                p-3
                outline-none
                focus:ring-2
                focus:ring-purple-500
              "
            >
              <option>
                Light
              </option>

              <option>
                Medium
              </option>

              <option>
                Strong
              </option>
            </select>

            <select
              value={language}
              onChange={(e) =>
                setLanguage(
                  e.target.value
                )
              }
              className="
                rounded-xl
                border
                p-3
                outline-none
                focus:ring-2
                focus:ring-purple-500
              "
            >
              <option>
                English
              </option>

              <option>
                Spanish
              </option>

              <option>
                French
              </option>

              <option>
                Urdu
              </option>
            </select>
          </div>

          {/* WARNING */}

          {limitExceeded && (
            <div
              className="
                mt-5
                flex
                items-start
                gap-3
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-4
                text-sm
                text-red-700
              "
            >
              <AlertCircle
                size={18}
                className="
                  mt-0.5
                  shrink-0
                "
              />

              <p>
                Your text has{" "}
                <strong>
                  {inputWordCount.toLocaleString()}
                </strong>{" "}
                words, but you only have{" "}
                <strong>
                  {(
                    remainingWords ?? 0
                  ).toLocaleString()}
                </strong>{" "}
                words remaining on your{" "}
                <strong>
                  {planName}
                </strong>{" "}
                plan.
              </p>
            </div>
          )}

          {/* BUTTON */}

          <button
            type="button"
            onClick={humanize}
            disabled={
              loading ||
              usageLoading ||
              inputWordCount === 0 ||
              limitExceeded
            }
            className="
              mt-8
              flex
              w-full
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-purple-600
              py-4
              font-semibold
              text-white
              transition
              hover:bg-purple-700
              disabled:cursor-not-allowed
              disabled:bg-purple-300
            "
          >
            {loading ? (
              <>
                <Loader2
                  className="animate-spin"
                />

                Processing...
              </>
            ) : (
              <>
                <RefreshCcw />

                Humanize Text
              </>
            )}
          </button>

        </div>
      </section>

      {/* FEATURES */}

      <section
        className="
          mx-auto
          max-w-6xl
          px-6
          py-20
        "
      >
        <h2
          className="
            text-center
            text-3xl
            font-bold
          "
        >
          Why Wordvia.ai?
        </h2>

        <div
          className="
            mt-10
            grid
            gap-6
            md:grid-cols-3
          "
        >
          <Card
            icon={<Sparkles />}
            title="Natural Writing"
            text="Human-style rewriting that feels natural."
          />

          <Card
            icon={<ShieldCheck />}
            title="Meaning Safe"
            text="Keeps the original message and meaning."
          />

          <Card
            icon={<Languages />}
            title="Multiple Languages"
            text="Rewrite content in multiple languages."
          />
        </div>
      </section>

    </div>
  );
}

// --------------------------------
// FEATURE CARD
// --------------------------------

function Card({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        bg-white
        p-6
      "
    >
      <div className="text-purple-600">
        {icon}
      </div>

      <h3
        className="
          mt-4
          font-bold
          text-gray-900
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-gray-500
        "
      >
        {text}
      </p>
    </div>
  );
}