import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const API = "http://localhost:8080/api/notifications";

// helpers shared with App.jsx (duplicated here for isolation)
function toIsoUtc(local) {
  return new Date(local).toISOString();
}
function toLocalInputValue(iso) {
  const d = new Date(iso);
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function EditNotification() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fields
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // Scheduling (only relevant if PENDING)
  const [status, setStatus] = useState("");
  const [scheduledFor, setScheduledFor] = useState(""); // ISO from server
  const [sendAtLocal, setSendAtLocal] = useState("");  // local input value
  const isPending = useMemo(() => (status || "").toUpperCase() === "PENDING", [status]);

  // Load data (prefer router state, else fetch by id)
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (state?.notification) {
          const n = state.notification;
          hydrate(n);
        } else {
          // Optional: require backend GET /:id
          const res = await fetch(`${API}/${id}`);
          if (!res.ok) throw new Error(`Failed to load notification #${id}`);
          const n = await res.json();
          hydrate(n);
        }
      } catch (e) {
        setError(e.message);
        toast.error("Failed to load notification: " + e.message);
      } finally {
        setLoading(false);
      }
    }
    function hydrate(n) {
      setRecipient(n.recipient ?? "");
      setSubject(n.subject ?? "");
      setBody(n.body ?? "");
      setStatus(n.status ?? "");
      setScheduledFor(n.scheduledFor ?? "");
      setSendAtLocal(n.scheduledFor ? toLocalInputValue(n.scheduledFor) : "");
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function saveChanges(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // 1) Update text fields
      const res1 = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient, subject, body }),
      });
      if (!res1.ok) {
        const msg = await res1.text();
        throw new Error(msg || "Update failed");
      }

      // 2) If still pending and scheduled time changed, reschedule as well
      if (isPending && sendAtLocal && scheduledFor) {
        const nextIso = toIsoUtc(sendAtLocal);
        const changed = new Date(nextIso).getTime() !== new Date(scheduledFor).getTime();
        if (changed) {
          const res2 = await fetch(`${API}/${id}/reschedule`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sendAtUtc: nextIso }),
          });
          if (!res2.ok) {
            const msg = await res2.text();
            throw new Error(msg || "Reschedule failed");
          }
        }
      } else if (isPending && sendAtLocal && !scheduledFor) {
        // (Edge) if previously unscheduled but pending (unlikely), allow scheduling
        const res3 = await fetch(`${API}/${id}/reschedule`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sendAtUtc: toIsoUtc(sendAtLocal) }),
        });
        if (!res3.ok) {
          const msg = await res3.text();
          throw new Error(msg || "Scheduling failed");
        }
      }

      // Show success toast
      toast.success("Notification updated successfully!");
      
      // Go back to history after a brief delay to show the toast
      setTimeout(() => {
        navigate("/?tab=history");
      }, 1000);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to update notification: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-container">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Keep your animated background & styles from App.css */}
      <div className="bg-animation">
        <div className="bg-grid"></div>
        <div className="bg-particle bg-particle-1"></div>
        <div className="bg-particle bg-particle-2"></div>
        <div className="bg-particle bg-particle-3"></div>
        <div className="bg-particle bg-particle-4"></div>
      </div>

      <div className="centered-container">
        <header className="app-header holographic-edge">
          <h1><span className="header-emoji">✏️</span> Edit Notification #{id}</h1>
          <p>Update recipient, subject, message{isPending ? " and (if you want) the schedule time" : ""}.</p>
        </header>

        <div className="main-card holographic-edge">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              Loading...
            </div>
          ) : (
            <form onSubmit={saveChanges} className="notification-form">
              {error && (
                <div className="success-message" style={{ backgroundColor: "rgba(185,28,28,.3)", borderColor: "rgba(239,68,68,.3)", color: "#fecaca" }}>
                  <span className="success-icon">!</span>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="recipient">Recipient Email</label>
                <input
                  id="recipient"
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="body">Message</label>
                <textarea
                  id="body"
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>

              {isPending && (
                <div className="form-group">
                  <label htmlFor="sendAt">Scheduled time (local)</label>
                  <input
                    id="sendAt"
                    type="datetime-local"
                    value={sendAtLocal}
                    onChange={(e) => setSendAtLocal(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <small className="muted">We'll convert this to UTC on save.</small>
                </div>
              )}

              <div className="row-actions" style={{ justifyContent: "center" }}>
                <button className="btn" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => navigate("/?tab=history")} disabled={saving}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}