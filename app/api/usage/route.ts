import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

const PLAN_LIMITS: Record<string, number | null> = {
  free: 1000,
  pro: 50000,
  business: null,
};

export async function GET() {
  try {
    // --------------------------------
    // 1. Check logged-in user
    // --------------------------------

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------
    // 2. Get Clerk user
    // --------------------------------

    const client = await clerkClient();

    const user = await client.users.getUser(userId);

    // --------------------------------
    // 3. Get user's plan
    // --------------------------------

    const rawPlan =
      typeof user.publicMetadata?.plan === "string"
        ? user.publicMetadata.plan.toLowerCase()
        : "free";

    const plan =
      rawPlan === "business"
        ? "business"
        : rawPlan === "pro"
          ? "pro"
          : "free";

    // --------------------------------
    // 4. Get plan limit
    // --------------------------------

    const monthlyLimit = PLAN_LIMITS[plan];

    // --------------------------------
    // 5. Current month
    // --------------------------------

    const currentMonth = new Date()
      .toISOString()
      .slice(0, 7);

    // --------------------------------
    // 6. Get private metadata
    // --------------------------------

    const privateMetadata = user.privateMetadata || {};

    const storedMonth =
      typeof privateMetadata.wordUsageMonth === "string"
        ? privateMetadata.wordUsageMonth
        : "";

    let wordsUsed =
      typeof privateMetadata.wordsUsed === "number"
        ? privateMetadata.wordsUsed
        : 0;

    // --------------------------------
    // 7. Reset usage for new month
    // --------------------------------

    if (storedMonth !== currentMonth) {
      wordsUsed = 0;

      await client.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...privateMetadata,
          wordsUsed: 0,
          wordUsageMonth: currentMonth,
        },
      });
    }

    // --------------------------------
    // 8. Calculate remaining words
    // --------------------------------

    const remainingWords =
      monthlyLimit === null
        ? null
        : Math.max(
            0,
            monthlyLimit - wordsUsed
          );

    // --------------------------------
    // 9. Return usage
    // --------------------------------

    return NextResponse.json({
      success: true,
      plan,
      monthlyLimit,
      wordsUsed,
      remainingWords,
      month: currentMonth,
    });
  } catch (error: any) {
    console.error(
      "USAGE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to load usage.",
      },
      {
        status: 500,
      }
    );
  }
}