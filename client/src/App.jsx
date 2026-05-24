import { useEffect, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

function App() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [allTranscriptions, setAllTranscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTranscriptions();
    }
  }, [user]);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  };

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Signup successful");
    }
  };

  const handleLogin = async () => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
    } else {
      setUser(data.user);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const fetchTranscriptions = async () => {
    const { data, error } = await supabase
      .from("transcriptions")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (!error) {
      setAllTranscriptions(data);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Choose audio file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("audio", file);

      const response = await fetch(
        "http://localhost:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        setTranscript(data.transcript);

        fetchTranscriptions();
      }
    } catch (error) {
      console.log(error);

      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current =
        mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable =
        (event) => {
          audioChunksRef.current.push(
            event.data
          );
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

        uploadRecordedAudio(audioFile);
      };

      mediaRecorder.start();

      setRecording(true);
    } catch (error) {
      console.log(error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();

    setRecording(false);
  };

  const uploadRecordedAudio = async (
    audioFile
  ) => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("audio", audioFile);

      const response = await fetch(
        "http://localhost:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        setTranscript(data.transcript);

        fetchTranscriptions();
      }
    } catch (error) {
      console.log(error);

      alert("Recording upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <h1>Speech To Text App</h1>

        <div className="auth-box">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          <div className="button-group">
            <button onClick={handleSignUp}>
              Sign Up
            </button>

            <button onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Speech To Text App</h1>

      <button onClick={handleLogout}>
        Logout
      </button>

      <br />
      <br />

      <input
        type="file"
        accept="audio/*"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      <br />
      <br />

      <button
        onClick={handleUpload}
        disabled={loading}
      >
        {loading
          ? "Uploading..."
          : "Upload & Transcribe"}
      </button>

      <br />
      <br />

      {!recording ? (
        <button
          onClick={startRecording}
        >
          Start Recording
        </button>
      ) : (
        <button onClick={stopRecording}>
          Stop Recording
        </button>
      )}

      <br />
      <br />

      <h2>Current Transcription</h2>

      <p>{transcript}</p>

      <br />

      <h2>Previous Transcriptions</h2>

      {allTranscriptions.map((item) => (
        <div
          key={item.id}
          className="history-item"
        >
          <h4>{item.file_name}</h4>

          <p>{item.transcription}</p>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;