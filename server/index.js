import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";

import { createClient } from "@deepgram/sdk";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const supabaseUrl = "https://baumzxhvmqlkooqqfclu.supabase.co";

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdW16eGh2bXFsa29vcXFmY2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDA1MzYsImV4cCI6MjA5NTAxNjUzNn0.3g3XR9GnjtIIiwcCwacJ_VBfr5EDsha_oO6pVTOSC5o";

const supabase = createSupabaseClient(
  supabaseUrl,
  supabaseKey
);

app.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    const audioFile = fs.readFileSync(req.file.path);

    const response =
      await deepgram.listen.prerecorded.transcribeFile(
        audioFile,
        {
          model: "nova-2",
          smart_format: true,
        }
      );

    const transcript =
      response.result.results.channels[0].alternatives[0].transcript;

    await supabase
      .from("transcriptions")
      .insert([
        {
          file_name: req.file.originalname,
          transcription: transcript,
        },
      ]);

    res.json({
      transcript: transcript,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Transcription failed",
    });
  }
});
app.get("/transcriptions", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("transcriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to fetch transcriptions",
    });
  }
});

app.listen(8000, () => {
  console.log("Server running on port 8000");
});