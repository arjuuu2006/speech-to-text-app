import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);

  const [transcript, setTranscript] = useState("");

  const [allTranscriptions, setAllTranscriptions] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef(null);

  const audioChunksRef = useRef([]);

  const handleUpload = async (audioFile = file) => {
    if (!audioFile) {
      setError("Please choose an audio file");
      return;
    }

    if (!audioFile.type.startsWith("audio/")) {
      setError("Only audio files are allowed");
      return;
    }

    setError("");

    setLoading(true);

    const formData = new FormData();

    formData.append("audio", audioFile);

    try {
      const response = await fetch(
        "http://localhost:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      setTranscript(data.transcript);

      fetchTranscriptions();
    } catch (err) {
      setError("Upload failed");
    }

    setLoading(false);
  };

  const fetchTranscriptions = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/transcriptions"
      );

      const data = await response.json();

      setAllTranscriptions(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: "audio/mp3",
          }
        );

        const audioFile = new File(
          [audioBlob],
          "recording.mp3",
          {
            type: "audio/mp3",
          }
        );

        handleUpload(audioFile);
      };

      mediaRecorder.start();

      setRecording(true);
    } catch (err) {
      setError("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();

    setRecording(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex justify-center items-center p-6">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">

        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Speech To Text App
        </h1>

        <input
          type="file"
          accept="audio/*"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
          className="w-full text-white mb-4"
        />

        {error && (
          <p className="text-red-400 text-sm mb-3">
            {error}
          </p>
        )}

        <button
          onClick={() => handleUpload()}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-white py-3 rounded-xl font-semibold mb-4"
        >
          {loading ? "Uploading..." : "Upload Audio"}
        </button>

        {!recording ? (
          <button
            onClick={startRecording}
            className="w-full bg-green-500 hover:bg-green-600 transition-all duration-300 text-white py-3 rounded-xl font-semibold mb-6"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-full bg-red-500 hover:bg-red-600 transition-all duration-300 text-white py-3 rounded-xl font-semibold mb-6"
          >
            Stop Recording
          </button>
        )}

        <div className="bg-white/10 p-4 rounded-2xl mb-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-2">
            Latest Transcription
          </h2>

          <p className="text-gray-200 text-sm">
            {transcript ||
              "Your transcription will appear here..."}
          </p>
        </div>

        <div className="bg-white/10 p-4 rounded-2xl border border-white/10 max-h-72 overflow-y-auto">
          <h2 className="text-xl font-semibold text-white mb-4">
            Previous Transcriptions
          </h2>

          {allTranscriptions.map((item) => (
            <div
              key={item.id}
              className="mb-4 pb-4 border-b border-white/10"
            >
              <h4 className="text-blue-300 font-semibold">
                {item.file_name}
              </h4>

              <p className="text-gray-200 text-sm mt-1">
                {item.transcription}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;