import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  listBackups, triggerBackup,
  downloadBackupSql, downloadBackupH2,
  restoreFromFile, restoreByIdSql,
  deleteBackup
} from "../api.itc";
import { useAuth } from "../AuthContext.jsx";
import "./itc.css";

/**
 * Format bytes to human readable string (B, KB, MB, GB, TB)
 * @param {number} n - Bytes to format
 * @returns {string} Formatted size string
 */
function fmtBytes(n) {
  if (n == null) return "";
  const u = ["B","KB","MB","GB","TB"]; let i=0, v=n;
  while (v>=1024 && i<u.length-1) { v/=1024; i++; }
  return `${v.toFixed(i?1:0)} ${u[i]}`;
}

/* Inline SVG Icons */
const Icon = {
  /**
   * Cloud Backup Icon - Represents cloud storage and backup functionality
   * Modern, clean design that conveys data protection and cloud storage
   */
  Database: () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
    </svg>
  ),
  /**
   * Arrow Left Icon - Used for logout button navigation
   */
  ArrowLeft: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  )
};

/**
 * Backup Item Row Component
 * Displays individual backup items with actions (download, restore, delete)
 * @param {Object} props - Component props
 * @param {Object} props.item - Backup item data
 * @param {boolean} props.busy - Global busy flag to prevent double actions
 * @param {Function} props.onDownloadSql - SQL download handler
 * @param {Function} props.onDownloadH2 - H2 download handler
 * @param {Function} props.onUseSql - SQL restore handler
 * @param {Function} props.onDelete - Delete backup handler
 */
function Row({ item, busy, onDownloadSql, onDownloadH2, onUseSql, onDelete }) {
  const createdLabel = new Date(item.createdAt || item.createdAtISO || Date.now()).toLocaleString();
  const hasH2 = item.sizeH2 != null;

  return (
    <div className="itc-row">
      {/* Backup Info Section */}
      <div>
        <div className="itc-row__name">
          {item.filename || item.id}
          {/* Badge indicating this backup has been used for restoration */}
          {item.restoredAt && (
            <span
              className="badge-used"
              title={`Restored via ${item.restoredKind || "SQL"} at ${new Date(item.restoredAt).toLocaleString()}`}
            >
              Used
            </span>
          )}
        </div>
        <div className="itc-row__sub">
          {createdLabel}
          {" · "}SQL {fmtBytes(item.sizeBytes)}
          {hasH2 ? ` · H2 ${fmtBytes(item.sizeH2)}` : ""}
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="itc-row__actions">
        <button className="ghost" disabled={busy} onClick={() => onDownloadSql(item)}>Download SQL</button>
        <button
          className="ghost"
          disabled={busy || !hasH2}
          title={hasH2 ? "Download H2 .zip" : "No H2 snapshot for this backup"}
          onClick={() => onDownloadH2(item)}
        >
          Download H2
        </button>
        <span className="sep" />
        <button className="ghost" disabled={busy} onClick={() => onUseSql(item)}>Restore SQL</button>
        <button className="danger" disabled={busy} onClick={() => onDelete(item)}>Delete</button>
      </div>
    </div>
  );
}

/**
 * Main ITC (IT Coordinator) Component
 * Backup and restore management interface for the voting platform
 */
export default function ITC() {
  // Authentication and navigation hooks
  const { auth } = useAuth();
  const nav = useNavigate();

  /**
   * Handle user logout - clears all auth tokens and redirects to login
   */
  const handleLogout = useCallback(() => {
    ["admin_auth","token","accessToken","refreshToken","role","user"].forEach(k=>{
      try{ localStorage.removeItem(k); sessionStorage.removeItem(k);}catch{}
    });
    nav("/login",{replace:true});
  },[nav]);

  // State management
  const [busy, setBusy] = useState(false); // Loading/processing state
  const [items, setItems] = useState([]); // Backup items list
  const [msg, setMsg] = useState(""); // Status messages
  const [file, setFile] = useState(null); // Selected file for restore

  /**
   * Refresh backup list from server
   */
  async function refresh() {
    setBusy(true);
    try {
      const data = await listBackups();
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || e.message || "Load failed");
    } finally {
      setBusy(false);
    }
  }

  // Load backups on component mount
  useEffect(() => { refresh(); }, []);

  /**
   * Create a new system backup
   */
  async function doBackup() {
    setBusy(true); setMsg("");
    try {
      await triggerBackup();
      setMsg("✓ Backup created successfully (SQL + H2).");
      await refresh();
    }
    catch (e) { setMsg(e?.response?.data?.message || "✗ Backup failed"); }
    finally { setBusy(false); }
  }

  /**
   * Restore database from SQL backup by ID
   * @param {Object} x - Backup item to restore from
   */
  async function doUseSql(x) {
    if (!confirm(`Restore database from SQL: "${x.filename || `backup_${x.id}.sql`}"?\n\nThis will overwrite current data.`)) return;
    setBusy(true); setMsg("");
    try {
      await restoreByIdSql(x.id);
      setMsg("✓ Restore (SQL) completed successfully.");
      await refresh();
    }
    catch (e) { setMsg(e?.response?.data?.message || "✗ Restore (SQL) failed"); }
    finally { setBusy(false); }
  }

  /**
   * Restore database from uploaded SQL file
   */
  async function doRestoreUpload() {
    if (!file) return;
    if (!confirm(`Restore from file "${file.name}"?\n\nThis will overwrite current data.`)) return;
    setBusy(true); setMsg("");
    try {
      await restoreFromFile(file);
      setMsg("✓ Restore (file) completed successfully.");
      setFile(null);
      await refresh();
    }
    catch (e) { setMsg(e?.response?.data?.message || "✗ Restore failed"); }
    finally { setBusy(false); }
  }

  /**
   * Delete a backup item
   * @param {Object} x - Backup item to delete
   */
  async function doDelete(x) {
    if (!confirm(`Delete backup "${x.filename || `backup_${x.id}.sql`}"?\n\nThis will remove its SQL and any H2 snapshot.`)) return;
    setBusy(true); setMsg("");
    try {
      await deleteBackup(x.id);
      setMsg("✓ Backup deleted successfully.");
      await refresh();
    }
    catch (e) { setMsg(e?.response?.data?.message || "✗ Delete failed"); }
    finally { setBusy(false); }
  }

  /**
   * Safely download H2 backup with error handling
   * @param {Object} x - Backup item to download H2 from
   */
  async function onDownloadH2Safe(x) {
    try {
      // Prefer the server-provided H2 filename when available
      await downloadBackupH2(x.id, x.filenameH2 || `backup_${x.id}_h2.zip`);
      setMsg("✓ H2 zip downloaded.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "⚠ No H2 snapshot found for this backup");
    }
  }

  return (
    <div className="itc-page">
      {/* Glassy Top Bar with Logo and User Info */}
      <div className="itc-topbar">
        <div className="itc-topbar__inner">
          <div className="itc-brand">
            <div className="itc-brand__logo">
              <Icon.Database />
            </div>
            <span className="itc-brand__title">IT Coordinator</span>
          </div>
          <div className="itc-actions">
            <div className="itc-user">Signed in as <b>{auth?.username || auth?.name || "itc"}</b></div>
            <button className="logout" onClick={handleLogout}>
              <Icon.ArrowLeft /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="itc-wrap">
        {/* Hero Section with Title and Description */}
        <section className="itc-hero">
          <h1 className="itc-hero__title">
            <span className="itc-hero__icon">💾</span>
            Backup & Restore
          </h1>
          <p className="itc-hero__subtitle">
            Manage system backups and restore points for the voting platform
          </p>
        </section>

        {/* Quick Actions Section with Cards */}
        <section className="itc-section">
          <div className="itc-section__header">
            <h2 className="itc-section__title">
              <span className="itc-section__icon">⚡</span>
              Quick Actions
            </h2>
            <p className="itc-section__subtitle">
              Create backups or restore from existing files
            </p>
          </div>

          <div className="itc-cards">
            {/* Create Backup Card */}
            <article className="card">
              <div className="card__icon">🔄</div>
              <h2>Create Backup</h2>
              <p>Generate a full system backup. It will appear in the list below.</p>
              <button className="primary" disabled={busy} onClick={doBackup}>
                {busy ? "Working…" : "Create Backup"}
              </button>
            </article>

            {/* Restore From File Card */}
            <article className="card">
              <div className="card__icon">📤</div>
              <h2>Restore From File</h2>
              <p>Upload a <b>.sql</b> backup and restore (overwrites current DB).</p>
              <div className="restore-box">
                <input
                  type="file"
                  accept=".sql"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="restore-actions">
                  <button className="primary" disabled={!file || busy} onClick={doRestoreUpload}>
                    Restore
                  </button>
                  <button className="ghost" disabled={!file || busy} onClick={() => setFile(null)}>
                    Clear
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Status Message Banner */}
        {msg && <div className="banner">{msg}</div>}

        {/* Existing Backups List Section */}
        <section className="itc-section">
          <div className="itc-section__header">
            <h2 className="itc-section__title">
              <span className="itc-section__icon">📚</span>
              Existing Backups
            </h2>
            <p className="itc-section__subtitle">
              View, download, restore, or delete your backup files
            </p>
          </div>

          <div className="listcard">
            <div className="head">
              <h2>All Backups</h2>
              <button className="ghost" disabled={busy} onClick={refresh}>
                Refresh
              </button>
            </div>
            <div className="blist">
              {/* Empty state when no backups exist */}
              {items.length === 0 && <div className="empty">No backups yet.</div>}

              {/* Render backup items */}
              {items.map(x => (
                <Row
                  key={x.id}
                  item={x}
                  busy={busy}
                  onDownloadSql={(i) => downloadBackupSql(i.id, i.filename || `backup_${i.id}.sql`)}
                  onDownloadH2={onDownloadH2Safe}
                  onUseSql={doUseSql}
                  onDelete={doDelete}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
