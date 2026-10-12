import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

const PLAN_LIMITS: Record<
  string,
  number | null
> = {
  free: 1000,
  pro: 50000,
  business: null,
};

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const client = await clerkClient();

    const user =
      await client.users.getUser(userId);

    const plan =
      (
        user.publicMetadata?.plan as
          | string
          | undefined
      )?.toLowerCase() || "free";

    const monthlyLimit =
      PLAN_LIMITS[plan] ??
      PLAN_LIMITS.free;

    const currentMonth =
      new Date()
        .toISOString()
        .slice(0, 7);

    const privateMetadata =
      user.privateMetadata || {};

    const storedMonth =
      typeof privateMetadata.wordUsageMonth ===
      "string"
        ? privateMetadata.wordUsageMonth
        : "";

    let wordsUsed =
      typeof privateMetadata.wordsUsed ===
      "number"
        ? privateMetadata.wordsUsed
        : 0;

    // New month = reset usage
    if (storedMonth !== currentMonth) {
      wordsUsed = 0;
    }

    const remainingWords =
      monthlyLimit === null
        ? null
        : Math.max(
            0,
            monthlyLimit - wordsUsed
          );

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