import express from 'express';
import { clerkwebhooks,paymentRazorpay, verifyRazorpay } from '../controllers/userControllers.js';
import authUser from '../middlewares/auth.js';
import { userCredits } from '../controllers/userControllers.js';


const userRouter = express.Router();

userRouter.get('/webhooks',clerkwebhooks);
userRouter.post('/webhooks',clerkwebhooks);
userRouter.get('/credits',authUser,userCredits);
userRouter.post('/pay-razor',authUser,paymentRazorpay);
userRouter.post('/verify-razor',verifyRazorpay);
export default userRouter;
