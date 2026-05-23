import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData
      );

      setTranscript(response.data.transcript);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Speech To Text App</h1>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <button onClick={handleUpload}>
        Upload Audio
      </button>

      <br />
      <br />

      {file && <p>Selected File: {file.name}</p>}

      <h2>Transcription</h2>

      <p>{transcript}</p>
    </div>
  );
}

export default App;