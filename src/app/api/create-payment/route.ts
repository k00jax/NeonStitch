import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Square payment API route
// In production, you would use the Square SDK here:
// import { Client, Environment } from "square";
//
// const client = new Client({
//   accessToken: process.env.SQUARE_ACCESS_TOKEN!,
//   environment: Environment.Sandbox, // Change to Environment.Production for live
// });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, paymentMethod, customerInfo, items } = body;

    // Validate required fields
    if (!amount || !currency || !paymentMethod || !customerInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const orderId = uuidv4();

    if (paymentMethod === "square") {
      // In production, create a payment using Square:
      //
      // const { result } = await client.paymentsApi.createPayment({
      //   sourceId: body.sourceId, // From Square Web Payments SDK on frontend
      //   idempotencyKey: uuidv4(),
      //   amountMoney: {
      //     amount: BigInt(amount),
      //     currency: currency,
      //   },
      //   note: `NeonStitch Order ${orderId}`,
      //   buyerEmailAddress: customerInfo.email,
      // });

      return NextResponse.json({
        success: true,
        orderId,
        message: "Payment processed via Square",
        paymentMethod: "square",
        // In production: paymentId: result.payment?.id
      });
    }

    if (paymentMethod === "cashapp") {
      // Cash App Pay is available through Square's Web Payments SDK
      // In production:
      //
      // const { result } = await client.paymentsApi.createPayment({
      //   sourceId: body.sourceId, // From Cash App Pay button
      //   idempotencyKey: uuidv4(),
      //   amountMoney: {
      //     amount: BigInt(amount),
      //     currency: currency,
      //   },
      //   note: `NeonStitch Order ${orderId}`,
      //   buyerEmailAddress: customerInfo.email,
      // });

      return NextResponse.json({
        success: true,
        orderId,
        message:
          "Order placed. Cash App payment request will be sent to customer.",
        paymentMethod: "cashapp",
      });
    }

    return NextResponse.json(
      { error: "Invalid payment method" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}
