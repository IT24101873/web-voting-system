import { useState, useEffect } from "react";
import { Link } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const API = "http://localhost:8080/api/notifications";

function App() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendMode, setSendMode] = useState("now");
  const [sendAtLocal, setSendAtLocal] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [archivedNotifications, setArchivedNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("compose");

  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleLocal, setRescheduleLocal] = useState("");
  const [rowBusyId, setRowBusyId] = useState(null);
  
  const [dots, setDots] = useState([]);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState("");

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

  async function loadNotifications() {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}`);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadArchivedNotifications() {
    try {
      const res = await fetch(`${API}/archived`);
      const data = await res.json();
      setArchivedNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }

  // Filter notifications based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = notifications.filter(
        (n) =>
          n.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.batchId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.id?.toString().includes(searchTerm)
      );
      setFilteredNotifications(filtered);
    } else {
      setFilteredNotifications(notifications);
    }
  }, [notifications, searchTerm]);

  // --- bulk helpers (minimal change) ---
  function splitEmails(input) {
    return input
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }
  function buildPayloadForSend(recipients, subject, body) {
    return recipients.length === 1
      ? { recipient: recipients[0], recipients, subject, body }
      : { recipients, subject, body };
  }
  function buildPayloadForSchedule(recipients, subject, body, sendAtUtc) {
    return recipients.length === 1
      ? { recipient: recipients[0], recipients, subject, body, sendAtUtc }
      : { recipients, subject, body, sendAtUtc };
  }

  async function sendNow() {
    const recipients = splitEmails(recipient);
    const payload = buildPayloadForSend(recipients, subject, body);
    const res = await fetch(`${API}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
  }

  async function scheduleLater() {
    if (!sendAtLocal) throw new Error("Please pick a future date & time.");
    const isoUtc = toIsoUtc(sendAtLocal);
    const recipients = splitEmails(recipient);
    const payload = buildPayloadForSchedule(recipients, subject, body, isoUtc);
    const res = await fetch(`${API}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (sendMode === "now") {
        await sendNow();
        setSuccessMessage("Notification sent successfully!");
        toast.success("Notification sent successfully!");
      } else {
        await scheduleLater();
        setSuccessMessage("Notification scheduled successfully!");
        toast.success("Notification scheduled successfully!");
      }
      setRecipient("");
      setSubject("");
      setBody("");
      setSendAtLocal("");
      setActiveTab("history");
      await loadNotifications();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  function openRescheduleModal(n) {
    setRescheduleId(n.id);
    if (n.scheduledFor) {
      setRescheduleLocal(toLocalInputValue(n.scheduledFor));
    } else {
      const t = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      setRescheduleLocal(toLocalInputValue(t));
    }
  }
  
  function closeRescheduleModal() {
    setRescheduleId(null);
    setRescheduleLocal("");
  }

  async function submitReschedule() {
    if (!rescheduleId || !rescheduleLocal) return;
    setRowBusyId(rescheduleId);
    try {
      const isoUtc = toIsoUtc(rescheduleLocal);
      const res = await fetch(`${API}/${rescheduleId}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendAtUtc: isoUtc }),
      });
      if (!res.ok) throw new Error(await res.text());
      closeRescheduleModal();
      await loadNotifications();
      toast.success("Notification rescheduled successfully!");
    } catch (e) {
      toast.error("Reschedule failed: " + e.message);
    } finally {
      setRowBusyId(null);
    }
  }

  async function cancelNotification(id) {
    if (!confirm("Cancel this scheduled notification?")) return;
    setRowBusyId(id);
    try {
      const res = await fetch(`${API}/${id}/cancel`, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      await loadNotifications();
      toast.success("Notification cancelled successfully!");
    } catch (e) {
      toast.error("Cancel failed: " + e.message);
    } finally {
      setRowBusyId(null);
    }
  }

  async function archiveNotification(id) {
    if (!confirm("Archive this notification? It will be hidden but not deleted.")) return;
    setRowBusyId(id);
    try {
      const res = await fetch(`${API}/${id}/archive`, { method: "PATCH" });
      if (!res.ok) throw new Error(await res.text());
      await loadNotifications();
      toast.success("Notification archived successfully!");
    } catch (e) {
      toast.error("Archive failed: " + e.message);
    } finally {
      setRowBusyId(null);
    }
  }

  async function deleteNotification(id) {
    if (!confirm("Are you sure you want to delete this notification? This action cannot be undone.")) return;
    setRowBusyId(id);
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      await loadNotifications();
      await loadArchivedNotifications();
      toast.success("Notification deleted successfully!");
    } catch (e) {
      toast.error("Delete failed: " + e.message);
    } finally {
      setRowBusyId(null);
    }
  }

  async function restoreNotification(id) {
    if (!confirm("Restore this archived notification?")) return;
    setRowBusyId(id);
    try {
      const res = await fetch(`${API}/${id}/restore`, { method: "PATCH" });
      if (!res.ok) throw new Error(await res.text());
      await loadArchivedNotifications();
      await loadNotifications();
      toast.success("Notification restored successfully!");
    } catch (e) {
      toast.error("Restore failed: " + e.message);
    } finally {
      setRowBusyId(null);
    }
  }

  async function restoreAllArchived() {
    if (!confirm("Restore ALL archived notifications?")) return;
    try {
      const res = await fetch(`${API}/archived/restoreAll`, { method: "PATCH" });
      if (!res.ok) throw new Error(await res.text());
      await loadArchivedNotifications();
      await loadNotifications();
      toast.success("All archived notifications restored!");
    } catch (e) {
      toast.error("Restore all failed: " + e.message);
    }
  }

  async function deleteAllArchived() {
    if (!confirm("Permanently delete ALL archived notifications?")) return;
    try {
      const res = await fetch(`${API}/archived/deleteAll`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      await loadArchivedNotifications();
      toast.success("All archived notifications deleted!");
    } catch (e) {
      toast.error("Delete all failed: " + e.message);
    }
  }

  useEffect(() => { 
    loadNotifications(); 
  }, []);

  useEffect(() => {
    const initialDots = Array.from({ length: 15 }, () => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      opacity: 0.3
    }));
    setDots(initialDots);

    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      setDots(prev => prev.map(dot => {
        const distance = Math.sqrt(
          Math.pow(e.clientX - (window.innerWidth * dot.x / 100), 2) +
          Math.pow(e.clientY - (window.innerHeight * dot.y / 100), 2)
        );
        
        if (distance < 150) {
          return {
            ...dot,
            size: Math.min(dot.size + 15 / distance, 6),
            opacity: Math.min(0.6, dot.opacity + 0.3 / distance)
          };
        }
        return { 
          ...dot, 
          size: Math.max(2, dot.size - 0.05), 
          opacity: Math.max(0.3, dot.opacity - 0.005) 
        };
      }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="app-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="bg-animation">
        <div className="bg-grid"></div>
        <div className="bg-particle bg-particle-1"></div>
        <div className="bg-particle bg-particle-2"></div>
        <div className="bg-particle bg-particle-3"></div>
        <div className="bg-particle bg-particle-4"></div>
      </div>
      
      <div className="reactive-dots">
        {dots.map(dot => (
          <div 
            key={dot.id}
            className="reactive-dot"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              opacity: dot.opacity,
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
      
      <div 
        className="cursor-follower"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          opacity: cursorPos.x > 0 ? 0.5 : 0
        }}
      />
      
      <div className="centered-container">
        <header className="app-header holographic-edge">
          <div className="header-content">
            <h1><span className="header-emoji">📧</span> Notification Center</h1>
            <p>Send now, schedule, reschedule, and cancel notifications</p>
          </div>
        </header>

        <div className="main-card holographic-edge">
          <div className="tab-navigation">
            <button
              className={activeTab === "compose" ? "tab-active" : ""}
              onClick={() => setActiveTab("compose")}
            >
              <span className="tab-icon">✏️</span>
              Compose
            </button>
            <button
              className={activeTab === "history" ? "tab-active" : ""}
              onClick={() => setActiveTab("history")}
            >
              <span className="tab-icon">📋</span>
              History ({notifications.length})
            </button>
            <button
              className={activeTab === "archived" ? "tab-active" : ""}
              onClick={() => {
                setActiveTab("archived");
                loadArchivedNotifications();
              }}
            >
              <span className="tab-icon">🗄️</span>
              Archived ({archivedNotifications.length})
            </button>
          </div>

          <main className="main-content">
            {activeTab === "compose" && (
              <div className="compose-section">
                <h2>Compose New Notification</h2>
                <form onSubmit={handleSubmit} className="notification-form">
                  <div className="form-group">
                    <label htmlFor="recipient">Recipient Email</label>
                    <input
                      id="recipient"
                      type="text"
                      placeholder="user1@example.com, user2@example.com"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      required
                    />
                    <small className="muted">Enter multiple emails separated by commas</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      id="subject"
                      type="text"
                      placeholder="Notification subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="body">Message</label>
                    <textarea
                      id="body"
                      placeholder="Write your message here..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows="5"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Send Mode</label>
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="sendMode"
                          value="now"
                          checked={sendMode === "now"}
                          onChange={() => setSendMode("now")}
                        />
                        <span className="radio-custom"></span>
                        Send Now
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="sendMode"
                          value="later"
                          checked={sendMode === "later"}
                          onChange={() => setSendMode("later")}
                        />
                        <span className="radio-custom"></span>
                        Schedule Send
                      </label>
                    </div>
                  </div>

                  {sendMode === "later" && (
                    <div className="form-group">
                      <label htmlFor="sendAt">Send At (your local time)</label>
                      <input
                        id="sendAt"
                        type="datetime-local"
                        value={sendAtLocal}
                        onChange={(e) => setSendAtLocal(e.target.value)}
                        required
                        min={new Date().toISOString().slice(0, 16)}
                      />
                      <small className="muted">This will be converted to UTC.</small>
                    </div>
                  )}

                  <button type="submit" className="send-button" disabled={isLoading}>
                    {isLoading
                      ? sendMode === "now"
                        ? "Sending..."
                        : "Scheduling..."
                      : sendMode === "now"
                      ? "Send Notification"
                      : "Schedule Notification"}
                    {isLoading && <span className="spinner"></span>}
                  </button>
                </form>

                {successMessage && (
                  <div className="success-message">
                    <span className="success-icon">✓</span>
                    {successMessage}
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="history-section">
                <div className="section-header">
                  <h2>Notifications</h2>
                  <div className="history-controls">
                    <div className="search-container">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button onClick={loadNotifications} className="refresh-button" disabled={isLoading}>
                      ↻ Refresh
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="loading">
                    <div className="loading-spinner"></div>
                    Loading notifications...
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>
                      {searchTerm 
                        ? `No notifications found for "${searchTerm}"` 
                        : "No notifications yet."}
                    </p>
                    <button onClick={() => setActiveTab("compose")} className="cta-button">
                      Send Your First Notification
                    </button>
                  </div>
                ) : (
                  <div className="notifications-table-container">
                    <table className="notifications-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Batch</th>
                          <th>Recipient</th>
                          <th>Subject</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Scheduled For</th>
                          <th>Sent At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredNotifications.map((n) => {
                          const pending = (n.status || "").toUpperCase() === "PENDING";
                          const sent = (n.status || "").toUpperCase() === "SENT";
                          const failed = (n.status || "").toUpperCase() === "FAILED";
                          
                          return (
                            <tr key={n.id} className="notification-row">
                              <td className="id-cell">{n.id}</td>
                              <td className="batch-cell">
                                {n.batchId ? (
                                  <span className="badge">{n.batchId}</span>
                                ) : "—"}
                              </td>
                              <td className="recipient-cell">{n.recipient}</td>
                              <td className="subject-cell">{n.subject}</td>
                              <td className="status-cell">
                                <span className={`status-badge status-${n.status?.toLowerCase()}`}>
                                  {n.status}
                                </span>
                              </td>
                              <td className="date-cell">
                                {n.createdAt ? new Date(n.createdAt).toLocaleString() : "—"}
                              </td>
                              <td className="date-cell">
                                {n.scheduledFor ? new Date(n.scheduledFor).toLocaleString() : "—"}
                              </td>
                              <td className="date-cell">
                                {n.sentAt ? new Date(n.sentAt).toLocaleString() : "—"}
                              </td>
                              <td className="actions-cell">
                                <div className="row-actions">
                                  {pending ? (
                                    <Link
                                      to={`/edit/${n.id}`}
                                      state={{ notification: n }}
                                      className="btn"
                                    >
                                      Edit
                                    </Link>
                                  ) : null}
                                  
                                  {pending ? (
                                    <>
                                      <button
                                        className="btn btn-outline"
                                        disabled={rowBusyId === n.id}
                                        onClick={() => openRescheduleModal(n)}
                                      >
                                        Reschedule
                                      </button>
                                      <button
                                        className="btn btn-danger"
                                        disabled={rowBusyId === n.id}
                                        onClick={() => cancelNotification(n.id)}
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : null}
                                  
                                  {(sent || failed) && (
                                    <button
                                      className="btn"
                                      disabled={rowBusyId === n.id}
                                      onClick={() => archiveNotification(n.id)}
                                      title="Archive notification"
                                    >
                                      Archive
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "archived" && (
              <div className="archived-section">
                <div className="section-header">
                  <h2>Archived Notifications</h2>
                  {archivedNotifications.length > 0 && (
                    <div className="bulk-actions">
                      <button className="bulk-action-btn" onClick={restoreAllArchived}>
                        <span className="restore-icon">↻</span>
                        Restore All
                      </button>
                      <button className="bulk-action-btn delete-all" onClick={deleteAllArchived}>
                        <span className="delete-icon">🗑️</span>
                        Delete All
                      </button>
                    </div>
                  )}
                </div>
                {archivedNotifications.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🗄️</div>
                    <p>No archived notifications.</p>
                  </div>
                ) : (
                  <div className="notifications-table-container">
                    <table className="notifications-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Batch</th>
                          <th>Recipient</th>
                          <th>Subject</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Scheduled For</th>
                          <th>Sent At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {archivedNotifications.map((n) => (
                          <tr key={n.id}>
                            <td>{n.id}</td>
                            <td>
                              {n.batchId ? (
                                <span className="badge">{n.batchId}</span>
                              ) : "—"}
                            </td>
                            <td>{n.recipient}</td>
                            <td>{n.subject}</td>
                            <td>
                              <span className={`status-badge status-${n.status?.toLowerCase()}`}>
                                {n.status}
                              </span>
                            </td>
                            <td>{n.createdAt ? new Date(n.createdAt).toLocaleString() : "—"}</td>
                            <td>{n.scheduledFor ? new Date(n.scheduledFor).toLocaleString() : "—"}</td>
                            <td>{n.sentAt ? new Date(n.sentAt).toLocaleString() : "—"}</td>
                            <td>
                              <div className="row-actions">
                                <button
                                  className="btn"
                                  disabled={rowBusyId === n.id}
                                  onClick={() => restoreNotification(n.id)}
                                >
                                  Restore
                                </button>
                                <button
                                  className="btn btn-danger"
                                  disabled={rowBusyId === n.id}
                                  onClick={() => deleteNotification(n.id)}
                                >
                                  Delete Permanently
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        {rescheduleId && (
          <div className="modal-backdrop" onClick={closeRescheduleModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Reschedule Notification</h3>
              <p className="muted">Pick a new date & time (your local time)</p>
              <input
                type="datetime-local"
                value={rescheduleLocal}
                onChange={(e) => setRescheduleLocal(e.target.value)}
              />
              <div className="modal-actions">
                <button className="btn" onClick={submitReschedule} disabled={rowBusyId === rescheduleId}>
                  Save
                </button>
                <button className="btn btn-outline" onClick={closeRescheduleModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
