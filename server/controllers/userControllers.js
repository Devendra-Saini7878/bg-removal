import { Webhook } from "svix";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import transactionModel from "../models/transactionModel.js";
//api controller function to manage clerk user with database
//http://localhost:4000/api/user/webhooks

const clerkwebhooks = async (req, res) => {
  try {
    // res.send("Webhook received successfully");
    // return;
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;
    console.log(data);

    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };

        await userModel.create(userData);
        res.json({});

        break;
      }
      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };

        await userModel.findOneAndUpdate(
          {
            clerkId: data.id,
          },
          userData
        );

        res.json({});
        // Handle user updated logic here
        break;
      }
      case "user.deleted": {
        await userModel.findOneAndDelete({
          clerkId: data.id,
        });
        // Handle user deleted logic here
        break;
      }
      default: {
        break;
      }
    }
  } catch (error) {
    console.error("Error in clerkwebhooks:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//API controller function to get user available credits

const userCredits = async (req, res) => {
  try {
    const { clerkId } = req.user;
    const userData = await userModel.findOne({ clerkId });

    res.json({
      success: true,
      credits: userData.creditBalance,
    });
  } catch (error) {
    console.error("Error in userCredits:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//API controller function to buy credits
const paymentRazorpay = async (req, res) => {
  try {
    const { clerkId } = req.user;
    const { planId } = req.body;
    const userData = await userModel.findOne({ clerkId });
    if (!userData || !planId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    let credits, plan, amount, date
    switch (planId) {
      case 'Basic':
        plan = "Basic";
        credits=100
        amount=10
        break;
        case 'Advanced':
        plan = "Advanced";
        credits=500 
        amount=50
        break;
        case 'Business':
        plan = "Basic";
        credits=5000
        amount=250
        break;
      default:
        break;
    }
        date = Date.now();

        const transactionData = {
            clerkId,
            plan,
            credits,
            amount,
            date,
        }
        const newTransaction = await transactionModel.create(transactionData);

      const options = {
        amount: amount * 100,
        currency: process.env.CURRENCY || "INR",
        receipt: newTransaction._id,
      }

      try {
        const order = await razorpayInstance.orders.create(options);
        res.json({ success: true, order });
      } catch (err) {
        console.error("Error in creating Razorpay order:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
      }


  } catch (error) {
    console.error("Error in paymentRazorpay:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//API controller function to verify payment
const verifyRazorpay = async (req,res)=>{
    try {
           const {razorpay_order_id} = req.body;
           const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
           if(orderInfo.status === "paid"){
            const transactionData =  await transactionModel.findById(orderInfo.receipt);
            if(transactionData.payment){
                return res.status(400).json({success:false,message:"Transaction not found"});
            }
            const userData = await userModel.findOne({clerkId:transactionData.clerkId});
            const creditBalance= userData.creditBalance + transactionData.credits;
            await userModel.findOneAndUpdate(userData._id,{creditBalance});


            //making transaction as paid
            await transactionModel.findByIdAndUpdate(transactionData._id,{payment:true});
            res.json({success:true,message:"Payment verified successfully"});
           }


    } catch (error) {
        console.error("Error in verifyRazorpay:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        
    }
}


export { clerkwebhooks, userCredits ,paymentRazorpay , verifyRazorpay};
