import { useAuth, useClerk, useUser } from '@clerk/clerk-react';
import { createContext } from 'react';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';



export const AppContext = createContext();

const AppContextProvider = (props) => {

  const [credit, setCredit] = useState(false);
  const [image, setImage] = useState(false);
  const [resultImage, setResultImage] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const loadCreditsData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/user/credits', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }); console.log("Credit data loaded:", data);
      if (data.success) { //if data is success then set the credit
        setCredit(data.credits);
        console.log(data.credits);
        toast.success("Credits loaded successfully");
      }

    }
    catch (error) {
      console.error("Error loading credit data:");
      toast.error(error.message || "Failed to load credit data");
    }
  }
  const removeBg = async (image) => {
    try {
      if (!isSignedIn) {
        return openSignIn();
      }


      setImage(image);
      setResultImage(false);
      navigate('/result');

      const token = await getToken();
      const formData = new FormData();
      image && formData.append("image", image);
      const { data } = await axios.post(backendUrl + '/api/image/remove-bg', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (data.success) {
        setResultImage(data.resultImage);
        data.credits && setCredit(data.credits);
        toast.success("Background removed successfully!");
      }
      else {
        toast.error(data.message);
        data.credits && setCredit(data.credits);
        if (data.credits === 0) {
          navigate('/buyCredit');
        }
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to remove background");

    }
  }

  const value = {
    credit, setCredit,
    loadCreditsData,
    backendUrl,
    image, setImage,
    removeBg,
    resultImage, setResultImage
  }
  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}

export { AppContextProvider };