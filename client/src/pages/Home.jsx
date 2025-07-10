import React from "react";
import Header from "../components/Header";
import Steps from "../components/Steps";
import Testimonials from "../components/Testimonials";
import Upload from "../components/Upload";
import BgSlider from "../components/BgSlider";

const Home = () => {
  return (
    <div>
      <Header />
      <Steps />
     <BgSlider /> 
      <Testimonials />
      <Upload />
      
    </div>
  );
};

export default Home;
