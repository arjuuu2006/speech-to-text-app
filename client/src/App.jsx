import { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleUpload = async (audioFile) => {
    const formData = new FormData();
    formData.append("audio", audioFile);

    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData
      );

      setTranscript(response.data.transcript);
    } catch (error) {
      console.log(error);
      alert("Upload failed");
    }
  };

  const uploadSelectedFile = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    handleUpload(file);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/mp3",
      });

      const recordedFile = new File(
        [audioBlob],
        "recording.mp3",
        {
          type: "audio/mp3",
        }
      );

      handleUpload(recordedFile);
    };

    mediaRecorder.start();

    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-xl">

        <h1 className="text-4xl font-bold text-center mb-6">
          Speech To Text App
        </h1>

        <div className="flex flex-col gap-4">

          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="bg-gray-700 p-3 rounded-lg"
          />

          <button
            onClick={uploadSelectedFile}
            className="bg-blue-500 hover:bg-blue-600 p-3 rounded-lg font-semibold"
          >
            Upload Audio
          </button>

          {!recording ? (
            <button
              onClick={startRecording}
              className="bg-green-500 hover:bg-green-600 p-3 rounded-lg font-semibold"
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-500 hover:bg-red-600 p-3 rounded-lg font-semibold"
            >
              Stop Recording
            </button>
          )}

          {file && (
            <p className="text-sm text-gray-300">
              Selected File: {file.name}
            </p>
          )}

          <div className="bg-gray-700 p-4 rounded-lg mt-4">

            <h2 className="text-2xl font-semibold mb-2">
              Transcription
            </h2>

            <p className="text-gray-200">
              {transcript || "Your transcription will appear here..."}
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}

export default App;