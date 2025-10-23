import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getMyVotes, getEventBundle, deleteMyVote } from "../api";
// removed: import VoteHeader from "../components/VoteHeader.jsx";
import "./EventVote.css";
import "./MyVote.css";

/* ===== auth helpers (same as VotingHome) ===== */
const readAuth = () => { try { return JSON.parse(localStorage.getItem("auth") || "null"); } catch { return null; } };
const hasToken = (a) => !!(a?.token || a?.accessToken);
const getRole  = (a) =>
  (a?.role || a?.user?.role || (Array.isArray(a?.roles) ? a.roles[0] : null) || "")
    .toString()
    .toUpperCase() || null;

const isAuthed = () => hasToken(readAuth());
const currentRole = () => getRole(readAuth());

export default function MyVote() {
  const navigate = useNavigate();
  const location = useLocation();

  /* header/auth state (like VotingHome) */
  const [authed, setAuthed] = useState(isAuthed());
  const [role, setRole] = useState(currentRole());
  useEffect(() => {
    const onStorage = () => { setAuthed(isAuthed()); setRole(currentRole()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const goToMyVote = useCallback(() => navigate("/my-vote"), [navigate]);

  // ---- updated logout: add ?toast=logout so Landing shows the toast
  const logoutHere = useCallback(() => {
    ["auth","student_auth","admin_auth","token","accessToken","refreshToken","nominee_auth","user","role"]
      .forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
    setAuthed(false); setRole(null);
    const PUBLIC_HOME =
      import.meta.env.VITE_PUBLIC_HOME ||
      (import.meta.env.DEV ? "http://localhost:5174/" : "/");
    let dest;
    try { dest = new URL(PUBLIC_HOME); }
    catch { dest = new URL(PUBLIC_HOME, window.location.origin); }
    dest.searchParams.set("toast", "logout");
    window.location.replace(dest.toString());
  }, []);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
  const eventFilter = new URLSearchParams(location.search).get("event");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);
  const [bundles, setBundles] = useState(new Map());
  const [fetchingBundles, setFetchingBundles] = useState(false);
  const [resettingEvent, setResettingEvent] = useState(null);

  // toast
  const [toast, setToast] = useState(null);
  const showToast = (message, kind = "info", timeout = 3000) => {
    setToast({ message, kind });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), timeout);
  };
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // normalize /myVotes payload
  const normalizeVotes = (data) => {
    const arr =
      Array.isArray(data) ? data :
      Array.isArray(data?.data) ? data.data :
      Array.isArray(data?.items) ? data.items :
      Array.isArray(data?.content) ? data.content :
      Array.isArray(data?.results) ? data.results : [];
    return arr
      .map((v) => {
        const evId = Number(v.eventId ?? v.event?.id);
        const catId = Number(v.categoryId ?? v.category?.id);
        const nomId = v.nomineeId ?? v.nominee?.id ?? null;
        return { eventId: evId, categoryId: catId, nomineeId: nomId };
      })
      .filter((r) => r.eventId && r.categoryId);
  };

  const refetchMyVotes = async () => {
    try {
      const data = await getMyVotes();
      setRows(normalizeVotes(data));
      setErr("");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load your votes.");
    }
  };

  // initial load
  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const data = await getMyVotes();
        if (ok) setRows(normalizeVotes(data));
      } catch (e) {
        if (ok) setErr(e?.response?.data?.message || "Failed to load your votes.");
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, []);

  // refresh when votes change or tab is focused
  useEffect(() => {
    const onStorage = (e) => { if (e.key === "votes_dirty") refetchMyVotes(); };
    const onFocus = () => {
      if (document.visibilityState === "visible" && localStorage.getItem("votes_dirty")) {
        refetchMyVotes();
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // fetch bundles for each event we have a row for
  useEffect(() => {
    const idsAll = Array.from(new Set(rows.map((r) => r.eventId)));
    const ids = eventFilter ? idsAll.filter((id) => String(id) === String(eventFilter)) : idsAll;
    if (!ids.length) return;
    setFetchingBundles(true);
    let ok = true;
    (async () => {
      try {
        const list = await Promise.all(ids.map((id) => getEventBundle(id).then((b) => [id, b])));
        if (ok) setBundles(new Map(list));
      } catch { /* ignore */ }
      finally { if (ok) setFetchingBundles(false); }
    })();
    return () => { ok = false; };
  }, [rows, eventFilter]);

  // group votes by event (apply optional filter)
  const grouped = useMemo(() => {
    const m = new Map();
    for (const r of rows) {
      if (eventFilter && String(r.eventId) !== String(eventFilter)) continue;
      (m.get(r.eventId) || m.set(r.eventId, []).get(r.eventId)).push(r);
    }
    return m;
  }, [rows, eventFilter]);

  const eventStatus = (event) => {
    if (!event) return { active: false, label: "—", color: "#6b7280" };
    const now = new Date();
    const s = event.startAt || event.startDate ? new Date(event.startAt || event.startDate) : null;
    const e = event.endAt || event.endDate ? new Date(event.endAt || event.endDate) : null;
    if (s && now < s) return { active: false, label: "UPCOMING", color: "#f59e0b" };
    if (e && now > e) return { active: false, label: "COMPLETED", color: "#6b7280" };
    return { active: true, label: "ACTIVE", color: "#10b981" };
  };

  // actions
  const handleEditEvent = (eventId) => {
    // toast here
    showToast("Opening editor…", "info", 1400);
    // toast on Event page (survives route change)
    try {
      sessionStorage.setItem(
        "nav_toast",
        JSON.stringify({ ts: Date.now(), kind: "info", message: "Editing your selections…" })
      );
    } catch {}
    navigate(`/voting/events/${eventId}?edit=1`);
  };

  // event-level "Reset all" using the existing per-category endpoint
  const handleResetEvent = async (eventId, rowsForUi) => {
    const votedCategoryIds = rowsForUi.filter((r) => !!r.nomineeId).map((r) => r.categoryId);
    if (!votedCategoryIds.length) {
      showToast("No selections to reset in this event.", "info");
      return;
    }
    if (!confirm(`Reset all your selections for this event (${votedCategoryIds.length} category${votedCategoryIds.length > 1 ? "ies" : "y"})?`)) return;
    try {
      setResettingEvent(eventId);
      await Promise.all(votedCategoryIds.map((cid) => deleteMyVote(cid)));
      localStorage.setItem("votes_dirty", String(Date.now()));
      await refetchMyVotes();
      showToast("Selections reset. You can edit again.", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to reset your selections.", "error", 3600);
    } finally {
      setResettingEvent(null);
    }
  };

  // nominee photo resolver
  const resolveNomineePhoto = (n) => {
    if (!n) return "";
    const raw = n.photo ?? n.photoUrl ?? n.image ?? n.imageUrl ?? n.fileName ?? n.photoFile ?? null;
    const fromString = (str) => {
      if (!str) return "";
      if (/^https?:\/\//.test(str) || str.startsWith("data:")) return str;
      if (str.startsWith("/")) return `${API_BASE}${str}`;
      return `${API_BASE}/uploads/${str}`;
    };
    if (typeof raw === "string") return fromString(raw);
    if (raw && typeof raw === "object") {
      const cand = raw.url || raw.path || raw.fileName || raw.filename || raw.location || "";
      if (cand) return fromString(cand);
    }
    const pid = n.photoId ?? n.id;
    return pid ? `${API_BASE}/api/nominees/${pid}/photo` : "";
  };

  return (
    <div className="myvote">
      {/* ===== TOP BAR (identical to VotingHome) ===== */}
      <div className="vh__topbar">
        <div className="vh__glow" />
        <div className="vh__topbar-inner">
          <Link to="/" className="vh__brand">
            <div className="vh__logo">🗳️</div>
            <span className="vh__brand-text">University Voting</span>
            <span className="vh__badge">Voting Portal</span>
          </Link>

          <div className="vh__actions">
            {!authed ? (
              <Link to="/bridge" className="vh__btn vh__btn-blue">
                <span className="vh__btn-ico">🔐</span> Admin Login
              </Link>
            ) : (
              <>
                {role === "STUDENT" && (
                  <button type="button" onClick={goToMyVote} className="vh__btn vh__btn-green">
                    <span className="vh__btn-ico">📊</span> My Vote
                  </button>
                )}
                <button type="button" onClick={logoutHere} className="vh__btn vh__btn-red">
                  <span className="vh__btn-ico">🚪</span> Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="public-event__main">
        <h1 className="public-event__title">My Votes</h1>

        {(loading || fetchingBundles) && (
          <div className="public-event__loading">
            <div className="public-event__spinner"></div>
            <p>Loading your votes…</p>
          </div>
        )}

        {!loading && err && <div className="public-event__error"><p>{err}</p></div>}

        {!loading && grouped.size === 0 && (
          <div className="public-event__empty">
            <h3>No votes yet</h3>
            <p>Head over to the Events page to start voting.</p>
            <Link to="/voting" className="public-event__back-link" style={{ marginTop: 16 }}>
              <span className="public-event__back-arrow">→</span> Go to Events
            </Link>
          </div>
        )}

        {[...grouped.entries()].map(([eventId, list]) => {
          const bundle = bundles.get(Number(eventId));
          const event = bundle?.event;

          const categories = bundle?.categories || [];

          const nomineeMap = new Map();
          if (Array.isArray(bundle?.nominees)) {
            for (const n of bundle.nominees) nomineeMap.set(n.id, n);
          }
          if (bundle?.nomineesByCategory) {
            for (const arr of Object.values(bundle.nomineesByCategory)) {
              for (const n of arr) nomineeMap.set(n.id, n);
            }
          }

          const byCat = new Map(list.map((r) => [r.categoryId, r]));
          const st = eventStatus(event);

          // All categories for the event, attaching voted nominee details (if any)
          const rowsForUi = categories.map((c) => {
            const row = byCat.get(c.id);
            const nomineeId = row?.nomineeId || null;
            const nominee = nomineeId ? nomineeMap.get(nomineeId) : null;
            return {
              categoryId: c.id,
              categoryName: c.name,
              nomineeId,
              nomineeName: nominee?.name || (nomineeId ? `#${nomineeId}` : ""),
              nomineePhoto: resolveNomineePhoto(nominee),
            };
          });

          const submittedCount = rowsForUi.filter((r) => !!r.nomineeId).length;

          return (
            <section key={eventId} className="category-card" style={{ marginTop: 16 }}>
              <div className="category-card__header">
                <div className="category-card__title-wrapper">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="public-event__status-badge" style={{ backgroundColor: st.color }}>{st.label}</div>
                    <h3 className="category-card__title">{event?.name || `Event #${eventId}`}</h3>
                  </div>
                  <div className="category-card__nominee-count">
                    <span className="category-card__count-badge">{rowsForUi.length}</span>
                    <span className="category-card__count-text">categories</span>
                  </div>
                </div>
              </div>

              {/* Header row with summary + one Edit and one Reset all */}
              <div className="category-card__nominees">
                <div className="category-card__nominees-header" style={{ alignItems: "center", justifyContent: "space-between" }}>
                  <h4 className="category-card__nominees-title">Your selections</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <p className="category-card__nominees-subtitle">
                      {st.active
                        ? `Active — Submitted ${submittedCount}/${rowsForUi.length}. You can change or clear on the event page.`
                        : `Edits disabled — final ${submittedCount}/${rowsForUi.length} submitted.`}
                    </p>
                    <button
                      className="nominee-card__vote-button"
                      disabled={!st.active}
                      onClick={() => handleEditEvent(eventId)}
                      title={st.active ? "Edit selections on the event page" : "Event ended"}
                    >
                      Edit
                    </button>
                    {st.active && submittedCount > 0 && (
                      <button
                        className="nominee-card__clear"
                        disabled={resettingEvent === eventId}
                        onClick={() => handleResetEvent(eventId, rowsForUi)}
                        title="Remove all your votes in this event"
                      >
                        {resettingEvent === eventId ? "Resetting…" : "Reset"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Category cards show selection only (no per-card buttons) */}
                <div className="nominees-grid">
                  {rowsForUi.map((row) => (
                    <div key={row.categoryId} className="nominee-card">
                      <div className="nominee-card__content">
                        <div className="nominee-card__header">
                          <h4 className="nominee-card__name">{row.categoryName}</h4>
                        </div>

                        <div className="nominee-card__bio" style={{ marginTop: 8 }}>
                          <div className="nominee-card__bio-header" style={{ alignItems: "center" }}>
                            <span className="nominee-card__bio-icon">🗳️</span>
                            <span className="nominee-card__bio-label">
                              {row.nomineeId ? "You voted:" : "Selected"}
                            </span>
                          </div>

                          {row.nomineeId ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                              {row.nomineePhoto ? (
                                <img
                                  src={row.nomineePhoto}
                                  alt={row.nomineeName}
                                  style={{
                                    width: 52,
                                    height: 52,
                                    objectFit: "cover",
                                    borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,.07)",
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : null}
                              <span className="nominee-card__bio-text">{row.nomineeName}</span>
                            </div>
                          ) : (
                            <p className="nominee-card__bio-text">
                              <span className="muted">Not selected yet</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </main>

      {/* toast */}
      <Toast message={toast?.message} kind={toast?.kind} onClose={() => setToast(null)} />
    </div>
  );
}

/* ---- Toast component (top-right) ---- */
function Toast({ message, kind = "info", onClose }) {
  if (!message) return null;
  const cls =
    kind === "success" ? "ui-toast ui-toast--success" :
    kind === "error" ? "ui-toast ui-toast--error" :
    "ui-toast ui-toast--info";
  return (
    <div className={cls} role="status" aria-live="polite" onClick={onClose} title="Close">
      <span className="ui-toast__dot">•</span>
      <span className="ui-toast__text">{message}</span>
    </div>
  );
}
