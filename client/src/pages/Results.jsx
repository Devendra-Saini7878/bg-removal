import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Results = () => {
  const {resultImage,image} = useContext(AppContext);

  const downloadImage = () => {
    if (!resultImage) return;
    
    // Extract the base64 data from the data URL
    const base64Data = resultImage.split(',')[1];
    const mimeType = resultImage.split(';')[0].split(':')[1];
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bg-removed-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-4 my-3 lg:mx-44 mt-14 min-h-[75vh]">
      <div className="bg-white rounded-lg px-8 py-6 drop-shadow-sm">
        {/* img container */}
        <div className="flex flex-col sm:grid grid-cols-2 gap-8">
          {/* left side */}
                      <div>
              <p className="font-semibold text-gray-600 mb-2">Original</p>
              <img className="rounded-md border" src={image ? URL.createObjectURL(image) : null} alt="" />
            </div>

          {/* right side */}
          <div className=" flex flex-col">
            <p className="font-semibold text-gray-600 mb-2">
              Background Removed
            </p>
                          <div className="rounded-md border border-gray-300 h-full relative bg-layer overflow-hidden">
                <img src={resultImage ? resultImage : null} alt=''/>
              
              {!resultImage && image &&
                <div className="absolute right-1/2 bottom-1/2 transform translate-x-1/2 translate-y-1/2">
                  <div className="border-4 border-violet-600 rounded-full h-12 w-12 border-t-transparent animate-spin"></div>
                </div>
              }
            </div>
          </div>
        </div>
        {/* buttons */}
        { resultImage &&   <div className="flex justify-center sm:justify-end items-center flex-wrap gap-4 mt-6 ">
          <button className="px-8 py-2.5 cursor-pointer text-violet-600 rounded-full hover:scale-105 transition-all duration-700"> Try another image</button>
            <button onClick={downloadImage} className="px-8 py-2.5 text-white text-sm bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full hover:scale-105 transition-all duration-700">Download image</button>
        </div>}
      </div>
    </div>
  );
};

export default Results;
