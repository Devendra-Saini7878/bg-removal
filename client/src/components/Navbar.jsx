import React from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useContext } from "react";
import { useEffect } from "react";
import { AppContext } from "../context/AppContext.jsx";

const Navbar = () => {
  const { openSignIn } = useClerk();
  const { isSignedIn, user } = useUser();
  const { credit, loadCreditsData } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      loadCreditsData();
    }
  }, [isSignedIn]);

  return (
    <div className="flex items-center justify-between mx-4 py-3 lg:mx-44 ">
      <Link to="/">
        <img className="w-32 sm:w-44" src={assets.logo} alt="" />
      </Link>
      {isSignedIn ? (
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => navigate('/buy')} className="flex items-center gap-2 bg-blue-100  px-2 py-1.5 rounded-full sm:px-7 sm:py-2.5 hover:scale-105 transition-all duration-300 ">
            <img className="w-4 sm:w-5" src={assets.credit_icon} alt="" />
            <p className="text-sm sm:text-base text-gray-700">Credits :{credit}</p>
          </button> 
          <p className="text-sm max-sm:hidden text-gray-700">Hi,{user.fullName}</p>
          <UserButton />
        </div>
      ) : (
        <button
          onClick={() => openSignIn({})}
          className="bg-zinc-800 text-white flex items-center gap-4 px-4 py-2 rounded-full"
        >
          Get Started{" "}
          <img className="w-3 sm:w-4" src={assets.arrow_icon} alt="" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
