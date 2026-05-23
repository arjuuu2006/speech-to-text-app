import { useEffect, useRef, useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [allTranscriptions, setAllTranscriptions] = useState([]);
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleUpload = async (audioFile) => {
    const selectedFile = audioFile || file;

    if (!selectedFile) {
      alert("Please choose a file");
      return;
    }

    const formData = new FormData();
    formData.append("audio", selectedFile);

    const response = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    setTranscript(data.transcript);

    fetchTranscriptions();
  };

  const fetchTranscriptions = async () => {
    const response = await fetch(
      "http://localhost:8000/transcriptions"
    );

    const data = await response.json();

    setAllTranscriptions(data);
  };

  useEffect(() => {
    fetchTranscriptions();
  }, []);

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

      await handleUpload(recordedFile);
    };

    mediaRecorder.start();

    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();

    setRecording(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center p-5">
      <div className="w-full max-w-xl bg-slate-800 p-6 rounded-2xl shadow-2xl">

        <h1 className="text-4xl font-bold text-center text-white mb-6">
          Speech To Text App
        </h1>

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full mb-4 text-white"
        />

        <button
          onClick={() => handleUpload()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition duration-300 mb-4"
        >
          Upload Audio
        </button>

        {!recording ? (
          <button
            onClick={startRecording}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition duration-300 mb-4"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition duration-300 mb-4"
          >
            Stop Recording
          </button>
        )}

        <div className="bg-slate-700 p-4 rounded-xl mb-5">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Latest Transcription
          </h2>

          <p className="text-gray-200">
            {transcript || "Your transcription will appear here..."}
          </p>
        </div>

        <div className="bg-slate-700 p-4 rounded-xl max-h-96 overflow-y-auto">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Previous Transcriptions
          </h2>

          {allTranscriptions.map((item) => (
            <div
              key={item.id}
              className="bg-slate-600 p-3 rounded-lg mb-3 hover:scale-[1.02] transition duration-300"
            >
              <h4 className="text-blue-300 font-bold mb-1">
                {item.file_name}
              </h4>

              <p className="text-gray-200 text-sm">
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