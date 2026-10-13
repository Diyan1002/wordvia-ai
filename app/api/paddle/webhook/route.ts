import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { clerkClient } from "@clerk/nextjs/server";

// --------------------------------
// PLAN PRICE IDS
// --------------------------------

const PRO_PRICE_ID = "pri_01m4k5vb9c63968g14fx474ht9";

const BUSINESS_PRICE_ID =
  "pri_01m4k5xhq3t3aad5pegak3d2ry";

// --------------------------------
// PLAN TYPE
// --------------------------------

type UserPlan = "free" | "pro" | "business";

// --------------------------------
// GET PLAN FROM PRICE ID
// --------------------------------

function getPlanFromPriceId(
  priceId?: string
): UserPlan {
  if (priceId === PRO_PRICE_ID) {
    return "pro";
  }

  if (priceId === BUSINESS_PRICE_ID) {
    return "business";
  }

  return "free";
}

// --------------------------------
// GET PRICE ID FROM PADDLE DATA
// --------------------------------

function getPriceId(data: any): string | undefined {
  return (
    data?.items?.[0]?.price?.id ||
    data?.items?.[0]?.price_id ||
    undefined
  );
}

// --------------------------------
// GET CLERK USER ID
// --------------------------------

function getClerkUserId(data: any): string | undefined {
  return (
    data?.custom_data?.clerkUserId ||
    undefined
  );
}

// --------------------------------
// UPDATE CLERK USER
// --------------------------------

async function updateClerkUser(
  clerkUserId: string,
  plan: UserPlan,
  status: string,
  extraMetadata: Record<string, any> = {}
) {
  const client = await clerkClient();

  await client.users.updateUserMetadata(
    clerkUserId,
    {
      publicMetadata: {
        plan,
        subscriptionStatus: status,
        ...extraMetadata,
        updatedAt: new Date().toISOString(),
      },
    }
  );

  console.log(
    `[PADDLE] User ${clerkUserId} => ${plan} (${status})`
  );
}

// --------------------------------
// WEBHOOK
// --------------------------------

export async function POST(
  request: Request
) {
  try {
    // --------------------------------
    // 1. GET SIGNATURE
    // --------------------------------

    const paddleSignature =
      request.headers.get(
        "paddle-signature"
      );

    const webhookSecret =
      process.env.PADDLE_WEBHOOK_SECRET_KEY;

    if (!paddleSignature) {
      console.error(
        "[PADDLE] Missing Paddle-Signature header"
      );

      return NextResponse.json(
        {
          error: "Missing Paddle signature",
        },
        {
          status: 400,
        }
      );
    }

    if (!webhookSecret) {
      console.error(
        "[PADDLE] PADDLE_WEBHOOK_SECRET_KEY is missing"
      );

      return NextResponse.json(
        {
          error:
            "Webhook secret not configured",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------
    // 2. READ RAW BODY
    // --------------------------------

    const rawBody =
      await request.text();

    // --------------------------------
    // 3. PARSE SIGNATURE
    // --------------------------------

    const signatureParts =
      paddleSignature.split(";");

    let timestamp = "";
    let signature = "";

    for (const part of signatureParts) {
      const separatorIndex =
        part.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key =
        part.slice(0, separatorIndex);

      const value =
        part.slice(separatorIndex + 1);

      if (key === "ts") {
        timestamp = value;
      }

      if (key === "h1") {
        signature = value;
      }
    }

    if (!timestamp || !signature) {
      console.error(
        "[PADDLE] Invalid signature format"
      );

      return NextResponse.json(
        {
          error: "Invalid signature",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------
    // 4. VERIFY TIMESTAMP
    // --------------------------------

    const timestampNumber =
      Number(timestamp);

    if (
      !Number.isFinite(timestampNumber)
    ) {
      console.error(
        "[PADDLE] Invalid timestamp"
      );

      return NextResponse.json(
        {
          error: "Invalid signature timestamp",
        },
        {
          status: 401,
        }
      );
    }

    // Allow a reasonable amount of clock
    // difference for webhook delivery.
    const currentTimestamp =
      Math.floor(Date.now() / 1000);

    const timestampDifference =
      Math.abs(
        currentTimestamp -
          timestampNumber
      );

    if (timestampDifference > 300) {
      console.error(
        "[PADDLE] Webhook timestamp too old"
      );

      return NextResponse.json(
        {
          error:
            "Webhook timestamp expired",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------
    // 5. CREATE SIGNED PAYLOAD
    // --------------------------------

    const signedPayload =
      `${timestamp}:${rawBody}`;

    // --------------------------------
    // 6. CREATE HMAC
    // --------------------------------

    const expectedSignature =
      createHmac(
        "sha256",
        webhookSecret
      )
        .update(
          signedPayload,
          "utf8"
        )
        .digest("hex");

    // --------------------------------
    // 7. SAFE SIGNATURE COMPARISON
    // --------------------------------

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        signature,
        "utf8"
      );

    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
      console.error(
        "[PADDLE] Signature length mismatch"
      );

      return NextResponse.json(
        {
          error: "Invalid signature",
        },
        {
          status: 401,
        }
      );
    }

    if (
      !timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      )
    ) {
      console.error(
        "[PADDLE] Signature verification failed"
      );

      return NextResponse.json(
        {
          error: "Invalid signature",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------
    // 8. PARSE EVENT
    // --------------------------------

    let event: any;

    try {
      event = JSON.parse(rawBody);
    } catch {
      console.error(
        "[PADDLE] Invalid JSON body"
      );

      return NextResponse.json(
        {
          error: "Invalid JSON",
        },
        {
          status: 400,
        }
      );
    }

    const eventType =
      event?.event_type;

    const data =
      event?.data;

    console.log(
      `[PADDLE WEBHOOK] ${eventType}`
    );

    // --------------------------------
    // 9. TRANSACTION COMPLETED
    // --------------------------------
    //
    // Initial successful checkout.
    //
    // Paddle recommends transaction.completed
    // for confirming the transaction has completed.
    // --------------------------------

    if (
      eventType ===
      "transaction.completed"
    ) {
      const clerkUserId =
        getClerkUserId(data);

      if (!clerkUserId) {
        console.error(
          "[PADDLE] Missing clerkUserId in transaction custom_data"
        );

        return NextResponse.json({
          received: true,
          warning:
            "Missing clerkUserId",
        });
      }

      // First try the custom plan.
      const customPlan =
        data?.custom_data?.plan
          ?.toString()
          ?.toLowerCase();

      let userPlan: UserPlan =
        customPlan === "business"
          ? "business"
          : customPlan === "pro"
          ? "pro"
          : getPlanFromPriceId(
              getPriceId(data)
            );

      await updateClerkUser(
        clerkUserId,
        userPlan,
        "active",
        {
          paddleTransactionId:
            data?.id || null,

          paddleCustomerId:
            data?.customer_id || null,
        }
      );
    }

    // --------------------------------
    // 10. SUBSCRIPTION CREATED
    // --------------------------------
    //
    // Save subscription information.
    // --------------------------------

    if (
      eventType ===
      "subscription.created"
    ) {
      const clerkUserId =
        getClerkUserId(data);

      if (!clerkUserId) {
        console.error(
          "[PADDLE] Missing clerkUserId in subscription.created"
        );

        return NextResponse.json({
          received: true,
        });
      }

      const userPlan =
        getPlanFromPriceId(
          getPriceId(data)
        );

      const status =
        data?.status || "active";

      await updateClerkUser(
        clerkUserId,
        userPlan,
        status,
        {
          paddleSubscriptionId:
            data?.id || null,

          paddleCustomerId:
            data?.customer_id || null,
        }
      );
    }

    // --------------------------------
    // 11. SUBSCRIPTION ACTIVATED
    // --------------------------------

    if (
      eventType ===
      "subscription.activated"
    ) {
      const clerkUserId =
        getClerkUserId(data);

      if (clerkUserId) {
        const userPlan =
          getPlanFromPriceId(
            getPriceId(data)
          );

        await updateClerkUser(
          clerkUserId,
          userPlan,
          "active",
          {
            paddleSubscriptionId:
              data?.id || null,

            paddleCustomerId:
              data?.customer_id || null,
          }
        );
      }
    }

    // --------------------------------
    // 12. SUBSCRIPTION UPDATED
    // --------------------------------
    //
    // Handles:
    // - upgrades
    // - downgrades
    // - renewals
    // - cancellations
    // - pauses
    // - resumes
    // - status changes
    // --------------------------------

    if (
      eventType ===
      "subscription.updated"
    ) {
      const clerkUserId =
        getClerkUserId(data);

      if (!clerkUserId) {
        console.error(
          "[PADDLE] Missing clerkUserId in subscription.updated"
        );

        return NextResponse.json({
          received: true,
        });
      }

      const status =
        data?.status || "unknown";

      // --------------------------------
      // ACTIVE / TRIALING
      // --------------------------------

      if (
        status === "active" ||
        status === "trialing"
      ) {
        const userPlan =
          getPlanFromPriceId(
            getPriceId(data)
          );

        await updateClerkUser(
          clerkUserId,
          userPlan,
          status,
          {
            paddleSubscriptionId:
              data?.id || null,

            paddleCustomerId:
              data?.customer_id || null,
          }
        );
      }

      // --------------------------------
      // CANCELED / PAUSED / PAST DUE
      // --------------------------------
      //
      // Remove paid access.
      // If the subscription later becomes
      // active again, the active branch above
      // will restore the correct plan.
      // --------------------------------

      if (
        status === "canceled" ||
        status === "paused" ||
        status === "past_due"
      ) {
        await updateClerkUser(
          clerkUserId,
          "free",
          status,
          {
            paddleSubscriptionId:
              data?.id || null,

            paddleCustomerId:
              data?.customer_id || null,
          }
        );
      }
    }

    // --------------------------------
    // 13. SUBSCRIPTION CANCELED
    // --------------------------------

    if (
      eventType ===
      "subscription.canceled"
    ) {
      const clerkUserId =
        getClerkUserId(data);

      if (clerkUserId) {
        await updateClerkUser(
          clerkUserId,
          "free",
          "canceled",
          {
            paddleSubscriptionId:
              data?.id || null,

            paddleCustomerId:
              data?.customer_id || null,

            canceledAt:
              data?.canceled_at ||
              new Date().toISOString(),
          }
        );

        console.log(
          `[PADDLE] User ${clerkUserId} downgraded to FREE`
        );
      }
    }

    // --------------------------------
    // 14. SUBSCRIPTION PAUSED
    // --------------------------------

    if (
      eventType ===
      "subscription.paused"
    ) {
      const clerkUserId =
        getClerkUserId(data);

      if (clerkUserId) {
        await updateClerkUser(
          clerkUserId,
          "free",
          "paused",
          {
            paddleSubscriptionId:
              data?.id || null,

            paddleCustomerId:
              data?.customer_id || null,
          }
        );
      }
    }

    // --------------------------------
    // 15. SUBSCRIPTION PAST DUE
    // --------------------------------

    if (
      eventType ===
      "subscription.past_due"
    ) {
      const clerkUserId =
        getClerkUserId(data);

      if (clerkUserId) {
        await updateClerkUser(
          clerkUserId,
          "free",
          "past_due",
          {
            paddleSubscriptionId:
              data?.id || null,

            paddleCustomerId:
              data?.customer_id || null,
          }
        );
      }
    }

    // --------------------------------
    // 16. SUBSCRIPTION RESUMED
    // --------------------------------

    if (
      eventType ===
      "subscription.resumed"
    ) {
      const clerkUserId =
        getClerkUserId(data);

      if (clerkUserId) {
        const userPlan =
          getPlanFromPriceId(
            getPriceId(data)
          );

        await updateClerkUser(
          clerkUserId,
          userPlan,
          "active",
          {
            paddleSubscriptionId:
              data?.id || null,

            paddleCustomerId:
              data?.customer_id || null,
          }
        );
      }
    }

    // --------------------------------
    // 17. ALWAYS ACKNOWLEDGE
    // --------------------------------

    return NextResponse.json(
      {
        received: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "[PADDLE WEBHOOK ERROR]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Webhook processing failed",
      },
      {
        status: 500,
      }
    );
  }
}