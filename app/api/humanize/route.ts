import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { groq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    // -----------------------------
    // 1. Check logged-in user
    // -----------------------------

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized. Please sign in first.",
        },
        {
          status: 401,
        }
      );
    }

    // -----------------------------
    // 2. Read request body
    // -----------------------------

    const body = await req.json();

    const {
      text,
      tone = "Professional",
      level = "Medium",
      language = "English",
    } = body;

    // -----------------------------
    // 3. Validate text
    // -----------------------------

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        {
          error: "Text is required.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // 4. Word limit protection
    // -----------------------------

    const wordCount = text.trim().split(/\s+/).length;

    if (wordCount > 5000) {
      return NextResponse.json(
        {
          error: "Maximum 5000 words are allowed per request.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // 5. Create humanization prompt
    // -----------------------------

    const systemPrompt = `
You are Wordvia.ai, a professional AI writing humanizer.

Your job is to rewrite AI-generated text so it sounds natural, clear,
authentic, and human-written.

IMPORTANT RULES:

1. Preserve the original meaning.
2. Do NOT summarize the text.
3. Do NOT remove important information.
4. Do NOT add facts or information that are not present.
5. Do NOT change names, numbers, dates, facts, or references.
6. Remove repetitive and robotic AI-style wording.
7. Use natural sentence structures.
8. Vary sentence length naturally.
9. Avoid unnecessary transitions.
10. Avoid excessive formal language.
11. Make the writing sound like a real person wrote it.
12. Preserve the approximate length of the original text.
13. Keep paragraphs logically organized.
14. Do not mention that the text was rewritten.
15. Return ONLY the rewritten text.

Tone:
${tone}

Humanization level:
${level}

Language:
${language}
`;

    // -----------------------------
    // 6. Send request to Groq
    // -----------------------------

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: systemPrompt,
        },

        {
          role: "user",
          content: text,
        },
      ],

      temperature: 0.8,
    });

    // -----------------------------
    // 7. Get AI response
    // -----------------------------

    const output =
      completion.choices?.[0]?.message?.content?.trim() || "";

    // -----------------------------
    // 8. Check empty response
    // -----------------------------

    if (!output) {
      return NextResponse.json(
        {
          error: "No humanized text was generated.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------
    // 9. Return result
    // -----------------------------

    return NextResponse.json({
      success: true,
      result: output,
      originalWordCount: wordCount,
      resultWordCount: output.split(/\s+/).length,
    });
  } catch (error: any) {
    console.error("WORDVIA HUMANIZER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Something went wrong while humanizing the text.",
      },
      {
        status: 500,
      }
    );
  }
}