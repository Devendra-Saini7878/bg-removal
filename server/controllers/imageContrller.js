import axios from "axios";
import fs from "fs";
import formData from "form-data";
import userModel from "../models/userModel.js";

const removeBgImage = async (req, res) => {
  try {
    const { clerkId } = req.user;
    const user = await userModel.findOne({ clerkId });

    if (!user || user.creditBalance <= 0) {
      return res.status(400).json({ success: false, message: "No credits left or user not found", credits: user?.creditBalance || 0 });
    }

    const imagePath = req.file.path;
    const imageFile = fs.createReadStream(imagePath);
    const formdata = new formData();
    formdata.append("image_file", imageFile);

    const headers = {
      ...formdata.getHeaders(),
      "X-Api-Key": process.env.CLIPDROP_API,
    };

    const { data } = await axios.post(
      "https://clipdrop-api.co/remove-background/v1",
      formdata,
      { headers, responseType: "arraybuffer" }
    );

    fs.unlink(imagePath, err => { if (err) console.error("Cleanup error:", err); });

    const base64Image = Buffer.from(data, "binary").toString("base64");
    const resultImage = `data:${req.file.mimetype};base64,${base64Image}`;
    await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1 });

    res.json({ success: true, message: "Background removed successfully", resultImage, credits: user.creditBalance - 1 });
  } catch (error) {
    console.error("Error in removeBgImage:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { removeBgImage };
