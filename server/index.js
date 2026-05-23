import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("audio"), (req, res) => {

  console.log("Audio received");

  res.json({
    message: "File uploaded successfully",
  });
});

app.listen(8000, () => {
  console.log("Server running on port 8000");
});