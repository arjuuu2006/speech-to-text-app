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

const supabaseUrl =
  "https://baumzxhvmqlkooqqfclu.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdW16eGh2bXFsa29vcXFmY2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDA1MzYsImV4cCI6MjA5NTAxNjUzNn0.3g3XR9GnjtIIiwcCwacJ_VBfr5EDsha_oO6pVTOSC5o";
const supabase = createSupabaseClient(
  supabaseUrl,
  supabaseKey
);

app.post(
  "/upload",
  upload.single("audio"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
        });
      }

      const audioFile = fs.readFileSync(
        req.file.path
      );

      const { result, error } =
        await deepgram.listen.prerecorded.transcribeFile(
          audioFile,
          {
            mimetype: "audio/mp3",
            model: "nova-2",
            smart_format: true,
          }
        );

      if (error) {
        console.log(error);

        return res.status(500).json({
          error: "Deepgram failed",
        });
      }

      const transcript =
        result.results.channels[0]
          .alternatives[0].transcript;

      console.log(
        "TRANSCRIPT:",
        transcript
      );

      // SAVE TO SUPABASE
      const {
        error: supabaseError,
      } = await supabase
        .from("transcriptions")
        .insert([
          {
            file_name:
              req.file.originalname,

            transcription:
              transcript,

            user_id:
              req.body.user_id,
          },
        ]);

      if (supabaseError) {
        console.log(
          "SUPABASE ERROR:"
        );

        console.log(supabaseError);
      }

      fs.unlinkSync(req.file.path);

      res.json({
        transcript,
      });
    } catch (error) {
      console.log("FULL ERROR:");

      console.log(error);

      res.status(500).json({
        error: "Upload failed",
      });
    }
  }
);

// GET ONLY CURRENT USER HISTORY
app.get(
  "/transcriptions/:user_id",
  async (req, res) => {
    try {
      const { user_id } = req.params;

      const { data, error } =
        await supabase
          .from("transcriptions")
          .select("*")
          .eq("user_id", user_id)
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        throw error;
      }

      res.json(data);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error:
          "Failed to fetch transcriptions",
      });
    }
  }
);

// CLEAR HISTORY
app.delete(
  "/transcriptions/:user_id",
  async (req, res) => {
    try {
      const { user_id } = req.params;

      const { error } = await supabase
        .from("transcriptions")
        .delete()
        .eq("user_id", user_id);

      if (error) {
        throw error;
      }

      res.json({
        message:
          "History cleared successfully",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error: "Failed to clear history",
      });
    }
  }
);

app.listen(8000, () => {
  console.log(
    "Server running on port 8000"
  );
});