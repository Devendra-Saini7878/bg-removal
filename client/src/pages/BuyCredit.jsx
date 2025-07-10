import React, { useContext } from 'react'
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const plans = [
  {
    name: "Basic",
    description: "Best for personal use.",
    price: "$10",
    credits: "100 credits",
    button: "Get started",
  },
  {
    name: "Advanced",
    description: "Best for business use.",
    price: "$50",
    credits: "500 credits",
    button: "Get started",
  },
  {
    name: "Business",
    description: "Best for enterprise use.",
    price: "$250",
    credits: "5000 credits",
    button: "Purchase",
  },
];


const BuyCredit = () => {

    const {backendUrl , loadCreditsData} = useContext(AppContext);
  const navigate = useNavigate();
  const {getToken} = useAuth();
  const initPay = async (order)=>{
     const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Credits Payment",
      description: "Credits Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async(response)=>{
        console.log(response)
        const token = await getToken();
        try {
          const {data}= await axios.post(backendUrl+'/api/user/verify-razor',response,{
            headers:{
              Authorization: `Bearer ${token}`
            }
          })
          if(data.success){
            loadCreditsData();
            navigate('/');
            toast.success("credit purchased successfully");
          }
        } catch (error) {
          console.error("Error in verifyRazorpay:", error);
          toast.error("Error in verifyRazorpay");
        }
      }
     }
     const rzp = new window.Razorpay(options)
     rzp.open()
  }

   const paymentRazorpay = async (planId) => {
    try {
       const token = await getToken();
       const {data} = await axios.post(backendUrl+'/api/user/pay-razor',{planId},{
        headers:{
          Authorization: `Bearer ${token}`
        }
       })
       console.log("Payment data:", data);
       if(data.success){
       initPay(data.order);
       }
    } catch (error) {
      console.error("Error in paymentRazorpay:", error);
      toast.error("Error in paymentRazorpay");
    }
   }

  return (
     <div className="bg-[#f7fbff] min-h-screen flex flex-col items-center py-16 px-4">
      <button className="mb-4 px-4 py-1 rounded-full border border-gray-300 text-sm text-gray-700">
        OUR PLANS
      </button>
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-10 text-center">
        Choose the plan that’s right for you
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 w-72 flex flex-col items-start hover:scale-105 transition-all duration-300"
          >
            <img className="w-8 h-8  rounded-md mb-4" src={assets.logo_icon} alt='' />
            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
            <p className="text-2xl font-bold text-gray-900">
              {plan.price}
              <span className="text-base font-medium text-gray-500">
                {" "}
                / {plan.credits}
              </span>
            </p>
            <button onClick={()=>paymentRazorpay(plan.name)} className="mt-6 bg-black text-white px-6 py-2 rounded-md text-sm hover:bg-gray-800">
              {plan.button}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BuyCredit
