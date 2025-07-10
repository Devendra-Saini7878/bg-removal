import { Webhook } from "svix";
import Razorpay from "razorpay";
import userModel from "../models/userModel.js";
import transactionModel from "../models/transactionModel.js";
import crypto from "crypto";

const clerkwebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created":
        await userModel.create({
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        });
        break;
      case "user.updated":
        await userModel.findOneAndUpdate({ clerkId: data.id }, {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        });
        break;
      case "user.deleted":
        await userModel.findOneAndDelete({ clerkId: data.id });
        break;
      default:
        break;
    }

    res.json({});
  } catch (error) {
    console.error("Error in clerkwebhooks:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const userCredits = async (req, res) => {
  try {
    const { clerkId } = req.user;
    const user = await userModel.findOne({ clerkId });
    res.json({ success: true, credits: user.creditBalance });
  } catch (error) {
    console.error("Error in userCredits:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async (req, res) => {
  try {
    const { clerkId } = req.user;
    const { planId } = req.body;
    const user = await userModel.findOne({ clerkId });

    let credits, plan, amount;
    switch (planId) {
      case 'Basic': credits = 100; amount = 10; plan = 'Basic'; break;
      case 'Advanced': credits = 500; amount = 50; plan = 'Advanced'; break;
      case 'Business': credits = 5000; amount = 250; plan = 'Business'; break;
      default:
        return res.status(400).json({ success: false, message: "Invalid plan ID." });
    }

    const transaction = await transactionModel.create({ clerkId, credits, plan, amount, date: Date.now() });
    const order = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: process.env.CURRENCY || "INR",
      receipt: transaction._id.toString(),
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error in paymentRazorpay:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature." });
    }

    const transaction = await transactionModel.findById(razorpay_order_id);
    if (!transaction || transaction.payment) {
      return res.status(400).json({ success: false, message: "Invalid or already verified transaction." });
    }

    const user = await userModel.findOne({ clerkId: transaction.clerkId });
    await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance + transaction.credits });
    await transactionModel.findByIdAndUpdate(transaction._id, { payment: true });

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error in verifyRazorpay:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { clerkwebhooks, userCredits, paymentRazorpay, verifyRazorpay };

