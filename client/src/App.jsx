import { useEffect, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [allTranscriptions, setAllTranscriptions] =
    useState([]);
  const [loading, setLoading] =
    useState(false);
  const [recording, setRecording] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

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
    const { error } =
      await supabase.auth.signUp({
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

    setTranscript("");

    setAllTranscriptions([]);
  };

  const fetchTranscriptions =
    async () => {
      if (!user) return;

      try {
        const response =
          await fetch(
            `https://speech-to-text-app-n670.onrender.com/transcriptions/${user.id}`
          );

        const data =
          await response.json();

        setAllTranscriptions(data);
      } catch (error) {
        console.log(error);
      }
    };

  const clearHistory = async () => {
    const confirmDelete =
      window.confirm(
        "Clear all history?"
      );

    if (!confirmDelete) return;

    try {
      await fetch(
        `https://speech-to-text-app-n670.onrender.com/transcriptions/${user.id}`,
        {
          method: "DELETE",
        }
      );

      setAllTranscriptions([]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Choose audio file");
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "audio",
        file
      );

      formData.append(
        "user_id",
        user.id
      );

      const response =
        await fetch(
          "https://speech-to-text-app-n670.onrender.com/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        setTranscript(
          data.transcript
        );

        fetchTranscriptions();
      }
    } catch (error) {
      console.log(error);

      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const startRecording =
    async () => {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );

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

      mediaRecorder.onstop =
        async () => {
          const audioBlob =
            new Blob(
              audioChunksRef.current,
              {
                type: "audio/mp3",
              }
            );

          const audioFile =
            new File(
              [audioBlob],
              "recording.mp3",
              {
                type: "audio/mp3",
              }
            );

          uploadRecordedAudio(
            audioFile
          );
        };

      mediaRecorder.start();

      setRecording(true);
    };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();

    setRecording(false);
  };

  const uploadRecordedAudio =
    async (audioFile) => {
      try {
        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "audio",
          audioFile
        );

        formData.append(
          "user_id",
          user.id
        );

        const response =
          await fetch(
            "https://speech-to-text-app-n670.onrender.com/upload",
            {
              method: "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        setTranscript(
          data.transcript
        );

        fetchTranscriptions();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  if (!user) {
    return (
      <div className="auth-page">
        <div className="left-section">
          <h1 className="logo">
            Transcripto
          </h1>

          <p className="tagline">
            Speak Naturally.
            Transcribe Instantly.
          </p>

          <div className="feature-card">
            <h3>
              🎤 AI Voice
              Transcription
            </h3>

            <p>
              Convert speech into
              accurate text using
              Deepgram AI.
            </p>
          </div>

          <div className="feature-card">
            <h3>
              🔒 Secure User
              Access
            </h3>

            <p>
              Keep transcription
              history private and
              secure.
            </p>
          </div>
        </div>

        <div className="auth-card">
          <div className="toggle-buttons">
            <button
              className={
                isLogin
                  ? "active"
                  : ""
              }
              onClick={() =>
                setIsLogin(true)
              }
            >
              Login
            </button>

            <button
              className={
                !isLogin
                  ? "active"
                  : ""
              }
              onClick={() =>
                setIsLogin(false)
              }
            >
              Sign Up
            </button>
          </div>

          <h2>
            {isLogin
              ? "Welcome Back"
              : "Create Account"}
          </h2>

          <p>
            {isLogin
              ? "Login to continue using Transcripto."
              : "Create your account."}
          </p>

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          <button
            className="main-btn"
            onClick={
              isLogin
                ? handleLogin
                : handleSignUp
            }
          >
            {isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-top">
        <div>
          <h1 className="logo">
            Transcripto
          </h1>

          <p className="tagline">
            Speak Naturally.
            Transcribe Instantly.
          </p>
        </div>

        <button
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Audio Input</h2>

          <input
            type="file"
            accept="audio/*"
            onChange={(e) =>
              setFile(
                e.target.files[0]
              )
            }
          />

          <div className="button-row">
            <button
              onClick={
                handleUpload
              }
            >
              Upload Audio
            </button>

            {!recording ? (
              <button
                onClick={
                  startRecording
                }
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={
                  stopRecording
                }
              >
                Stop Recording
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <h2>
            Latest Transcription
          </h2>

          <div className="transcript-box">
            {transcript ||
              "Your transcription will appear here."}
          </div>
        </div>
      </div>

      <div className="history-card">
        <div className="history-top">
          <div>
            <h2>
              Transcription
              History
            </h2>

            <p>
              Your private
              transcription
              records
            </p>
          </div>

          <button
            onClick={
              clearHistory
            }
          >
            Clear History
          </button>
        </div>

        <div className="history-list">
          {allTranscriptions.length ===
          0 ? (
            <p>
              No transcriptions
              yet.
            </p>
          ) : (
            allTranscriptions.map(
              (item) => (
                <div
                  key={item.id}
                  className="history-item"
                >
                  <h4>
                    {
                      item.file_name
                    }
                  </h4>

                  <p>
                    {
                      item.transcription
                    }
                  </p>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;