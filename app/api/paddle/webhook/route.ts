import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { clerkClient } from "@clerk/nextjs/server";


export async function POST(request: Request) {
  try {

    // --------------------------------
    // 1. Get Paddle signature
    // --------------------------------

    const paddleSignature =
      request.headers.get("paddle-signature");

    const webhookSecret =
      process.env.PADDLE_WEBHOOK_SECRET_KEY;


    if (!paddleSignature) {

      console.error(
        "Paddle-Signature header missing"
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
        "PADDLE_WEBHOOK_SECRET_KEY is missing"
      );

      return NextResponse.json(
        {
          error: "Webhook secret not configured",
        },
        {
          status: 500,
        }
      );

    }


    // --------------------------------
    // 2. Read RAW request body
    // --------------------------------

    const rawBody =
      await request.text();


    // --------------------------------
    // 3. Extract ts and h1
    // --------------------------------

    const signatureParts =
      paddleSignature.split(";");


    let timestamp = "";
    let signature = "";


    for (const part of signatureParts) {

      const [key, value] =
        part.split("=");


      if (key === "ts") {
        timestamp = value;
      }


      if (key === "h1") {
        signature = value;
      }

    }


    if (!timestamp || !signature) {

      console.error(
        "Invalid Paddle signature format"
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
    // 4. Create signed payload
    // --------------------------------

    const signedPayload =
      `${timestamp}:${rawBody}`;


    // --------------------------------
    // 5. Generate HMAC
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
    // 6. Compare signatures
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
        "Invalid Paddle signature"
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
        "Paddle signature verification failed"
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
    // 7. Parse webhook
    // --------------------------------

    const event =
      JSON.parse(rawBody);


    console.log(
      "PADDLE WEBHOOK:",
      event.event_type
    );


    // --------------------------------
    // 8. Transaction completed
    // --------------------------------

    if (
      event.event_type ===
      "transaction.completed"
    ) {

      const data =
        event.data;


      const customData =
        data?.custom_data;


      const clerkUserId =
        customData?.clerkUserId;


      const plan =
        customData?.plan;


      if (
        !clerkUserId ||
        !plan
      ) {

        console.error(
          "Missing Clerk user ID or plan",
          customData
        );


        return NextResponse.json(
          {
            received: true,
            warning:
              "Missing custom data",
          },
          {
            status: 200,
          }
        );

      }


      let userPlan =
        "free";


      if (plan === "pro") {

        userPlan = "pro";

      }


      if (plan === "business") {

        userPlan = "business";

      }


      // --------------------------------
      // 9. Update Clerk metadata
      // --------------------------------

      const client =
        await clerkClient();


      await client.users.updateUserMetadata(
        clerkUserId,
        {
          publicMetadata: {

            plan: userPlan,

            subscriptionStatus:
              "active",

            paddleTransactionId:
              event.data?.id || null,

            updatedAt:
              new Date().toISOString(),

          },
        }
      );


      console.log(
        `User ${clerkUserId} upgraded to ${userPlan}`
      );

    }


    // --------------------------------
    // 10. Subscription updated
    // --------------------------------

    if (
      event.event_type ===
      "subscription.updated"
    ) {

      const data =
        event.data;


      const customData =
        data?.custom_data;


      const clerkUserId =
        customData?.clerkUserId;


      if (clerkUserId) {

        const status =
          data?.status;


        const client =
          await clerkClient();


        await client.users.updateUserMetadata(
          clerkUserId,
          {
            publicMetadata: {

              subscriptionStatus:
                status || "unknown",

              paddleSubscriptionId:
                data?.id || null,

              updatedAt:
                new Date().toISOString(),

            },
          }
        );


        console.log(
          `Subscription updated for ${clerkUserId}: ${status}`
        );

      }

    }


    // --------------------------------
    // 11. Always return 200
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
      "PADDLE WEBHOOK ERROR:",
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