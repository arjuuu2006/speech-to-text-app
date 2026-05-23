import { useEffect, useRef, useState } from "react";
import "./App.css";

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
    <div className="app">
      <div className="card">
        <h1>Speech To Text App</h1>

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={() => handleUpload()}>
          Upload Audio
        </button>

        {!recording ? (
          <button onClick={startRecording}>
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording}>
            Stop Recording
          </button>
        )}

        <div className="transcription-box">
          <h2>Latest Transcription</h2>

          <p>
            {transcript || "Your transcription will appear here..."}
          </p>
        </div>

        <div className="history-box">
          <h2>Previous Transcriptions</h2>

          {allTranscriptions.map((item) => (
            <div className="history-item" key={item.id}>
              <h4>{item.file_name}</h4>

              <p>{item.transcription}</p>

              <hr />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;