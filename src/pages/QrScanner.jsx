import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

function QRScanner() {
  const [status, setStatus]   = useState("Please scan your QR Code");
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(async (decodedText) => {
      scanner.clear();
      setStatus("⏳ Finding student...");

      // Step 1 — Find student
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("student_id", decodedText.trim())
        .single();

      if (error || !data) {
        setStatus("❌ Student not found! Please try again. ID: " + decodedText);
        return;
      }

      // Step 2 — Check if already marked today
      const today = new Date().toISOString().split("T")[0];

      const { data: existing } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", data.student_id)
        .eq("date", today)
        .single();

      if (existing) {
        setStudent(data);
        setStatus(`⚠️ Attendance already marked for ${data.name} today!`);
        return;
      }

      // Step 3 — Mark attendance
      setStudent(data);
      setStatus(`✅ Attendance marked for ${data.name}!`);

      await supabase.from("attendance").insert([{
        student_id: data.student_id,
        name:       data.name,
        class:      data.class,
        date:       today,
        status:     "present",
      }]);
    });

    return () => scanner.clear().catch(() => {});
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📷 QR Code Scanner</h2>
        <button
          style={styles.backBtn}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Scanner Box */}
      <div id="qr-reader" style={styles.scanner}></div>

      {/* Student Card */}
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
            : "#fff",
        }}>
          {status}
        </p>
      </div>
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
    maxWidth: "500px",
    marginBottom: "32px",
  },
  title: {
    color: "#1D9E75",
    fontSize: "24px",
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
  scanner: {
    width: "100%",
    maxWidth: "500px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "20px",
  },
  studentCard: {
    marginTop: "24px",
    borderRadius: "12px",
    padding: "20px 24px",
    width: "100%",
    maxWidth: "500px",
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
  },
  statusBox: {
    marginTop: "16px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "16px 20px",
    width: "100%",
    maxWidth: "500px",
    textAlign: "center",
  },
  status: {
    fontSize: "15px",
    margin: 0,
  },
};

export default QRScanner;