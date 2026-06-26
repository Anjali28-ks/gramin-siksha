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

    const { data: students, error } = await supabase
      .from("students")
      .select("*");

    if (error || !students) {
      setStatus("❌ Failed to fetch student records!");
      setMarking(false);
      return;
    }

    let matchedStudent = null;
    let minDistance    = 0.5;

    for (const s of students) {
      if (!s.photo_url) continue;
      try {
        const img = await faceapi.fetchImage(s.photo_url);
        const refDetection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (!refDetection) continue;
        const distance = faceapi.euclideanDistance(detection.descriptor, refDetection.descriptor);
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

  const isAlready = status.includes("already");
  const isError   = status.includes("❌");
  const isSuccess = status.includes("🎉");

  const statusColor = isAlready ? "#FFE083"
    : isError   ? "#F09595"
    : isSuccess ? "#5DCAA5"
    : "#c8dff0";

  const statusBorder = isAlready ? "1px solid rgba(255,193,7,0.45)"
    : isError   ? "1px solid rgba(226,75,74,0.45)"
    : isSuccess ? "1px solid rgba(29,158,117,0.45)"
    : "1px solid rgba(255,255,255,0.1)";

  const statusBg = isAlready ? "rgba(255,193,7,0.08)"
    : isError   ? "rgba(226,75,74,0.08)"
    : isSuccess ? "rgba(29,158,117,0.08)"
    : "rgba(255,255,255,0.05)";

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <div style={styles.titleIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <h2 style={styles.title}>Face Recognition Attendance</h2>
        </div>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </div>

      {/* Camera */}
      <div style={styles.cameraWrap}>
        <div style={{...styles.corner, top: 10, left: 10, borderTop: "2px solid #00d4aa", borderLeft: "2px solid #00d4aa", borderRadius: "5px 0 0 0"}} />
        <div style={{...styles.corner, top: 10, right: 10, borderTop: "2px solid #00d4aa", borderRight: "2px solid #00d4aa", borderRadius: "0 5px 0 0"}} />
        <div style={{...styles.corner, bottom: 10, left: 10, borderBottom: "2px solid #00d4aa", borderLeft: "2px solid #00d4aa", borderRadius: "0 0 0 5px"}} />
        <div style={{...styles.corner, bottom: 10, right: 10, borderBottom: "2px solid #00d4aa", borderRight: "2px solid #00d4aa", borderRadius: "0 0 5px 0"}} />

        <div style={styles.liveBadge}>
          <span style={styles.liveDot} />
          LIVE
        </div>

        <Webcam
          ref={webcamRef}
          style={styles.webcam}
          mirrored={true}
          screenshotFormat="image/jpeg"
        />
      </div>

      {/* Student Card */}
      {student && (
        <div style={{
          ...styles.studentCard,
          background: isAlready ? "rgba(255,193,7,0.08)" : "rgba(29,158,117,0.08)",
          border: isAlready ? "1px solid rgba(255,193,7,0.35)" : "1px solid rgba(29,158,117,0.35)",
        }}>
          <div style={{
            ...styles.avatar,
            background: isAlready ? "rgba(255,193,7,0.2)" : "rgba(29,158,117,0.2)",
            color: isAlready ? "#FFD96A" : "#5DCAA5",
          }}>
            {student.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <p style={styles.studentName}>{student.name}</p>
            <p style={styles.studentClass}>Class: {student.class}</p>
            <p style={styles.studentId}>ID: {student.student_id}</p>
          </div>
          <span style={{
            ...styles.badge,
            background: isAlready ? "rgba(255,193,7,0.15)" : "rgba(29,158,117,0.15)",
            color: isAlready ? "#FFE083" : "#5DCAA5",
            border: isAlready ? "1px solid rgba(255,193,7,0.3)" : "1px solid rgba(29,158,117,0.3)",
          }}>
            {isAlready ? "⚠️ Already Marked" : "✅ Present"}
          </span>
        </div>
      )}

      {/* Status Box */}
      <div style={{ ...styles.statusBox, background: statusBg, border: statusBorder }}>
        <p style={{ ...styles.status, color: statusColor }}>{status}</p>
      </div>

      {/* Detect Button */}
      {loaded && (
        <button
          style={{
            ...styles.button,
            opacity: marking ? 0.55 : 1,
            cursor: marking ? "not-allowed" : "pointer",
            background: marking ? "#0f6e56" : "linear-gradient(135deg, #0f9b74, #1D9E75)",
          }}
          onClick={detectAndMark}
          disabled={marking}
        >
          {marking ? "⏳ Processing..." : "🤳 Detect Face & Mark Attendance"}
        </button>
      )}

    </div>
  );
}

const styles = {
  container: {
    background: "#0D1B2A",
    minHeight: "100vh",
    padding: "32px 40px",
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
    marginBottom: "28px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  titleIcon: {
    width: "34px",
    height: "34px",
    background: "linear-gradient(135deg, #00c9a7, #1D9E75)",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    color: "#e0f7f4",
    fontSize: "19px",
    fontWeight: "500",
    margin: 0,
  },
  backBtn: {
    padding: "8px 16px",
    background: "rgba(29,158,117,0.1)",
    color: "#5DCAA5",
    border: "1px solid rgba(29,158,117,0.3)",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  cameraWrap: {
    position: "relative",
    borderRadius: "16px",
    overflow: "hidden",
    border: "2px solid rgba(29,158,117,0.6)",
    marginBottom: "20px",
    boxShadow: "0 0 0 1px rgba(29,158,117,0.15), 0 8px 32px rgba(0,0,0,0.4)",
  },
  corner: {
    position: "absolute",
    width: "22px",
    height: "22px",
    zIndex: 10,
  },
  liveBadge: {
    position: "absolute",
    top: "14px",
    right: "14px",
    zIndex: 10,
    background: "rgba(29,158,117,0.15)",
    border: "1px solid rgba(29,158,117,0.4)",
    borderRadius: "20px",
    padding: "3px 10px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#5DCAA5",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    letterSpacing: "0.5px",
  },
  liveDot: {
    width: "6px",
    height: "6px",
    background: "#1D9E75",
    borderRadius: "50%",
    display: "inline-block",
  },
  webcam: {
    width: "520px",
    height: "390px",
    display: "block",
  },
  studentCard: {
    borderRadius: "14px",
    padding: "18px 22px",
    width: "100%",
    maxWidth: "520px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "12px",
  },
  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "700",
    flexShrink: 0,
  },
  studentName: {
    color: "#e8f4f1",
    fontSize: "15px",
    fontWeight: "600",
    margin: 0,
  },
  studentClass: {
    color: "#9FE1CB",
    fontSize: "13px",
    margin: "3px 0 0",
  },
  studentId: {
    color: "#5a7fa0",
    fontSize: "12px",
    margin: "2px 0 0",
  },
  badge: {
    marginLeft: "auto",
    padding: "5px 13px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  statusBox: {
    borderRadius: "12px",
    padding: "14px 20px",
    width: "100%",
    maxWidth: "520px",
    textAlign: "center",
  },
  status: {
    fontSize: "14px",
    margin: 0,
    lineHeight: 1.5,
  },
  button: {
    marginTop: "18px",
    padding: "14px 36px",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    letterSpacing: "0.2px",
    transition: "opacity 0.2s",
  },
};

export default FaceRecognition;