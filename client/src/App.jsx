import { useState } from "react";

function App() {

  const [file, setFile] = useState(null);

  const [transcript, setTranscript] = useState(
    "Your transcription will appear here..."
  );

  const handleUpload = async () => {

    if (!file) {

      setTranscript("Please select an audio file");

      return;
    }

    const formData = new FormData();

    formData.append("audio", file);

    try {

      const response = await fetch("http://localhost:8000/upload", {

        method: "POST",

        body: formData,
      });

      const data = await response.json();

      console.log(data);

      setTranscript(data.message);

    } catch (error) {

      console.log(error);

      setTranscript("Upload failed");
    }
  };

  return (

    <div style={{ padding: "20px" }}>

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

      <p>
        Selected File: {file ? file.name : "No file selected"}
      </p>

      <h2>Transcription</h2>

      <p>{transcript}</p>

    </div>
  );
}

export default App;