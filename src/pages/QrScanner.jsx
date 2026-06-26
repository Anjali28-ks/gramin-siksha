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

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("student_id", decodedText.trim())
        .single();

      if (error || !data) {
        setStatus("❌ Student not found! Please try again. ID: " + decodedText);
        return;
      }

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

  const isAlready = status.includes("already");
  const isError   = status.includes("❌");
  const isSuccess = status.includes("✅");

  const statusColor = isAlready ? "#FFE083"
    : isError   ? "#F09595"
    : isSuccess ? "#5DCAA5"
    : "#a0bfd6";

  const statusBorder = isAlready ? "1px solid rgba(255,193,7,0.4)"
    : isError   ? "1px solid rgba(226,75,74,0.4)"
    : isSuccess ? "1px solid rgba(29,158,117,0.4)"
    : "1px solid rgba(255,255,255,0.1)";

  const statusBg = isAlready ? "rgba(255,193,7,0.07)"
    : isError   ? "rgba(226,75,74,0.07)"
    : isSuccess ? "rgba(29,158,117,0.07)"
    : "rgba(255,255,255,0.04)";

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <div style={styles.titleIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
            </svg>
          </div>
          <h2 style={styles.title}>QR Code Scanner</h2>
        </div>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </div>

      {/* Hint */}
      <p style={styles.hint}>Align the QR code inside the frame to mark your attendance</p>

      {/* Scanner Box */}
      <div style={styles.scannerWrap}>
        <div id="qr-reader" style={styles.scanner}></div>
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
            background: isAlready ? "rgba(255,193,7,0.18)" : "rgba(29,158,117,0.18)",
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
    maxWidth: "520px",
    marginBottom: "10px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  titleIcon: {
    width: "34px",
    height: "34px",
    background: "linear-gradient(135deg, #1e4ed8, #3b82f6)",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    color: "#dbeafe",
    fontSize: "19px",
    fontWeight: "500",
    margin: 0,
  },
  backBtn: {
    padding: "8px 16px",
    background: "rgba(59,130,246,0.1)",
    color: "#93c5fd",
    border: "1px solid rgba(59,130,246,0.3)",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
  hint: {
    color: "#4a6fa5",
    fontSize: "13px",
    margin: "0 0 20px",
    textAlign: "center",
    maxWidth: "320px",
    lineHeight: 1.6,
  },
  scannerWrap: {
    width: "100%",
    maxWidth: "520px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(59,130,246,0.2)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
  },
  scanner: {
    width: "100%",
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
};

export default QRScanner;