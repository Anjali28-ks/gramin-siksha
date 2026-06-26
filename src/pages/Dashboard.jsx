import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance();
  }, []);

  async function fetchAttendance() {
    const today = new Date().toISOString().split("T")[0]; // ← fix is here
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("date", today);  // ← only today's records
    if (!error) setStudents(data);
    setLoading(false);
  }

  const total   = students.length;
  const present = students.filter(s => s.status === "present").length;
  const absent  = students.filter(s => s.status === "absent").length;

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Gramin Shiksha</h1>
          <p style={styles.sub}>Attendance Dashboard</p>
        </div>
        <div style={styles.headerButtons}>
          <button style={styles.navBtn} onClick={() => navigate("/qr-scanner")}>
            QR Scanner
          </button>
          <button style={styles.navBtn} onClick={() => navigate("/face-recognition")}>
            Face Recognition
          </button>
          <button style={styles.logoutBtn} onClick={() => navigate("/")}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Students</p>
          <p style={{...styles.statValue, color:"#1D9E75"}}>{total}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Present Today</p>
          <p style={{...styles.statValue, color:"#4A90E2"}}>{present}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Absent Today</p>
          <p style={{...styles.statValue, color:"#E24B4A"}}>{absent}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Attendance %</p>
          <p style={{...styles.statValue, color:"#FAC775"}}>
            {total > 0 ? Math.round((present / total) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Attendance Records</h2>
          <button style={styles.refreshBtn} onClick={fetchAttendance}>
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div style={styles.loading}>
            <p style={{color:"#7a8fa8"}}>Loading...</p>
          </div>
        ) : students.length === 0 ? (
          <div style={styles.loading}>
            <p style={{color:"#7a8fa8"}}>No attendance records for today</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Student ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Class</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} style={styles.tr}>
                  <td style={styles.td}>{s.student_id}</td>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>{s.class}</td>
                  <td style={styles.td}>{s.date}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: s.status === "present" ? "#0F6E56" : "#6E1A1A",
                      color: s.status === "present" ? "#5DCAA5" : "#F09595",
                    }}>
                      {s.status === "present" ? "✅ Present" : "❌ Absent"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

const styles = {
  container: {
    background: "#0D1B2A",
    minHeight: "100vh",
    padding: "32px 40px",
    color: "#fff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#fff",
    margin: 0,
  },
  sub: {
    fontSize: "14px",
    color: "#7a8fa8",
    margin: "4px 0 0",
  },
  headerButtons: {
    display: "flex",
    gap: "12px",
  },
  navBtn: {
    padding: "10px 20px",
    background: "#1D9E75",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  logoutBtn: {
    padding: "10px 20px",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    border: "0.5px solid rgba(255,255,255,0.18)",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    background: "rgba(255,255,255,0.06)",
    border: "0.5px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    padding: "24px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#7a8fa8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: 0,
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "700",
    margin: "8px 0 0",
  },
  tableContainer: {
    background: "rgba(255,255,255,0.03)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "0.5px solid rgba(255,255,255,0.08)",
  },
  tableTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff",
    margin: 0,
  },
  refreshBtn: {
    padding: "8px 16px",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    border: "0.5px solid rgba(255,255,255,0.18)",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
  },
  loading: {
    padding: "60px",
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px 24px",
    fontSize: "12px",
    color: "#7a8fa8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "0.5px solid rgba(255,255,255,0.08)",
  },
  tr: {
    borderBottom: "0.5px solid rgba(255,255,255,0.05)",
  },
  td: {
    padding: "16px 24px",
    fontSize: "14px",
    color: "#cdd5e0",
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
};

export default Dashboard;