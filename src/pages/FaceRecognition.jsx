import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js/dist/face-api.min.js";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

function FaceRecognition() {
  const webcamRef             = useRef(null);
  const [status, setStatus]   = useState("⏳ Loading face detection models...");
  const [loaded, setLoaded]   = useState(false);
  const [marking, setMarking] = useState(false);
  const [student, setStudent] = useState(null);
  const navigate              = useNavigate();

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      setLoaded(true);
      setStatus("✅ Camera ready! Show your face and click the button");
    } catch (err) {
      setStatus("❌ Failed to load models: " + err.message);
    }
  }

  async function detectAndMark() {
    if (!loaded || marking) return;
    if (!webcamRef.current) return;

    setMarking(true);
    setStudent(null);
    setStatus("⏳ Detecting your face...");

    const video = webcamRef.current.video;

    // Detect face from webcam
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setStatus("❌ No face detected! Please look directly at the camera");
      setMarking(false);
      return;
    }

    setStatus("⏳ Matching face with student records...");

    // Fetch all students from Supabase
    const { data: students, error } = await supabase
      .from("students")
      .select("*");

    if (error || !students) {
      setStatus("❌ Failed to fetch student records!");
      setMarking(false);
      return;
    }

    // Compare face with each student photo
    let matchedStudent = null;
    let minDistance    = 0.5; // lower = stricter match

    for (const s of students) {
      if (!s.photo_url) continue;

      try {
        const img = await faceapi.fetchImage(s.photo_url);

        const refDetection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!refDetection) continue;

        const distance = faceapi.euclideanDistance(
          detection.descriptor,
          refDetection.descriptor
        );

        console.log(`Distance for ${s.name}:`, distance);

        if (distance < minDistance) {
          minDistance    = distance;
          matchedStudent = s;
        }
      } catch (e) {
        console.log("Error comparing face for:", s.name, e);
        continue;
      }
    }

    if (!matchedStudent) {
      setStatus("❌ Face not recognized! Please register your photo first");
      setMarking(false);
      return;
    }

    // Check if already marked today
    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_id", matchedStudent.student_id)
      .eq("date", today)
      .single();

    if (existing) {
      setStudent(matchedStudent);
      setStatus(`⚠️ Attendance already marked for ${matchedStudent.name} today!`);
      setMarking(false);
      return;
    }

    // Mark attendance
    await supabase.from("attendance").insert([{
      student_id: matchedStudent.student_id,
      name:       matchedStudent.name,
      class:      matchedStudent.class,
      date:       today,
      status:     "present",
    }]);

    setStudent(matchedStudent);
    setStatus(`🎉 Attendance marked for ${matchedStudent.name}!`);
    setMarking(false);
  }

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>🤳 Face Recognition Attendance</h2>
        <button
          style={styles.backBtn}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Camera */}
      <div style={styles.cameraBox}>
        <Webcam
          ref={webcamRef}
          style={styles.webcam}
          mirrored={true}
          screenshotFormat="image/jpeg"
        />
      </div>

      {/* Student Card — shows after recognition */}
      {student && (
        <div style={{
          ...styles.studentCard,
          background: status.includes("already")
            ? "rgba(255,193,7,0.12)"
            : "rgba(29,158,117,0.12)",
          border: status.includes("already")
            ? "0.5px solid #FFC107"
            : "0.5px solid #1D9E75",
        }}>
          <div style={{
            ...styles.avatar,
            background: status.includes("already") ? "#856404" : "#1D9E75",
          }}>
            {student.name.charAt(0)}
          </div>
          <div>
            <p style={styles.studentName}>{student.name}</p>
            <p style={styles.studentClass}>Class: {student.class}</p>
            <p style={styles.studentId}>Student ID: {student.student_id}</p>
          </div>
          <span style={{
            ...styles.badge,
            background: status.includes("already") ? "#856404" : "#0F6E56",
            color: status.includes("already") ? "#FFE083" : "#5DCAA5",
          }}>
            {status.includes("already") ? "⚠️ Already Marked" : "✅ Present"}
          </span>
        </div>
      )}

      {/* Status Box */}
      <div style={{
        ...styles.statusBox,
        border: status.includes("already")
          ? "0.5px solid #FFC107"
          : status.includes("❌")
          ? "0.5px solid #E24B4A"
          : "0.5px solid rgba(255,255,255,0.12)",
      }}>
        <p style={{
          ...styles.status,
          color: status.includes("already")
            ? "#FFE083"
            : status.includes("❌")
            ? "#F09595"
            : status.includes("🎉")
            ? "#5DCAA5"
            : "#fff",
        }}>
          {status}
        </p>
      </div>

      {/* Detect Button */}
      {loaded && (
        <button
          style={{
            ...styles.button,
            opacity: marking ? 0.5 : 1,
            cursor: marking ? "not-allowed" : "pointer",
          }}
          onClick={detectAndMark}
          disabled={marking}
        >
          {marking
            ? "⏳ Processing..."
            : "🤳 Detect Face & Mark Attendance"}
        </button>
      )}

    </div>
  );
}

const styles = {
  container: {
    background: "#0D1B2A",
    minHeight: "100vh",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: "560px",
    marginBottom: "32px",
  },
  title: {
    color: "#1D9E75",
    fontSize: "22px",
    margin: 0,
  },
  backBtn: {
    padding: "8px 16px",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    border: "0.5px solid rgba(255,255,255,0.18)",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
  },
  cameraBox: {
    borderRadius: "12px",
    overflow: "hidden",
    border: "2px solid #1D9E75",
    marginBottom: "8px",
  },
  webcam: {
    width: "520px",
    height: "390px",
    display: "block",
  },
  studentCard: {
    marginTop: "20px",
    borderRadius: "12px",
    padding: "20px 24px",
    width: "100%",
    maxWidth: "520px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "700",
    flexShrink: 0,
  },
  studentName: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    margin: 0,
  },
  studentClass: {
    color: "#9FE1CB",
    fontSize: "13px",
    margin: "4px 0 0",
  },
  studentId: {
    color: "#7a8fa8",
    fontSize: "12px",
    margin: "2px 0 0",
  },
  badge: {
    marginLeft: "auto",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  statusBox: {
    marginTop: "16px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "16px 20px",
    width: "100%",
    maxWidth: "520px",
    textAlign: "center",
  },
  status: {
    fontSize: "15px",
    margin: 0,
  },
  button: {
    marginTop: "20px",
    padding: "14px 40px",
    background: "#1D9E75",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
  },
};

export default FaceRecognition;