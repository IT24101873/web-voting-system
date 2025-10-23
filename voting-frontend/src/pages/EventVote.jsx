import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getEventBundle, castVote, getMyVotes } from "../api";
// import VoteHeader from "../components/VoteHeader.jsx"; // removed per request
import "./EventVote.css";

/* --- Inline SVG icons --- */
const IconArrowLeft = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
    <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);
const IconCalendar = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
    <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14v11z"/>
  </svg>
);
const IconTrophy = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
    <path fill="currentColor" d="M6 3h12v6a6 6 0 0 1-12 0V3zm-3 3h2v3a8 8 0 0 0 2 5.3V17H5v2h14v-2h-2v-2.7A8 8 0 0 0 19 9V6h2V4h-2V3h-2v1H7V3H5v1H3v2z"/>
  </svg>
);
const IconUser = (props) => (
  <svg viewBox="0 0 24 24" width="28" height="28" {...props}>
    <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);
const IconStar = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
    <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const IconTarget = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
  </svg>
);

/* --- photo resolver (non-breaking) --- */
function resolveNomineePhoto(n) {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
  const fromString = (s) => {
    if (!s) return "";
    if (/^https?:\/\//.test(s) || s.startsWith("data:")) return s;
    if (s.startsWith("/")) return `${API_BASE}${s}`;
    return `${API_BASE}/uploads/${s}`;
  };
  const pick = (v) => (typeof v === "string" ? v : "");

  const raw =
    n.photoUrl ??
    n.photo ??
    n.imageUrl ??
    n.image ??
    n.avatar ??
    n.pic ??
    (n.media && (n.media.url || n.media[0]?.url)) ??
    n.fileName ??
    null;

  if (typeof raw === "string") return fromString(raw);

  if (raw && typeof raw === "object") {
    const cand =
      pick(raw.url) || pick(raw.path) || pick(raw.fileName) || pick(raw.filename) || pick(raw.location);
    if (cand) return fromString(cand);
  }

  const pid = n.photoId ?? n.id;
  return pid ? `${API_BASE}/api/nominees/${pid}/photo` : "";
}

export default function EventVote() {
  const params = useParams();
  const eventId = params.eventId || params.id;
  const loc = useLocation();
  const navigate = useNavigate();

  // Feature toggles (unchanged)
  const REVIEW_MODE = import.meta.env.VITE_REVIEW_BEFORE_SUBMIT === "1";
  const ALLOW_EDIT = new URLSearchParams(loc.search).get("edit") === "1";

  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [voted, setVoted] = useState({});
  const [busy, setBusy] = useState({});
  const [draft, setDraft] = useState({});
  const [showReview, setShowReview] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // tiny toast (unchanged except 3s default + auto-dismiss effect)
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

  // ---- updated logout: clear storage and redirect to PUBLIC_HOME with ?toast=logout
  const logoutHere = useCallback(() => {
    ["auth","student_auth","admin_auth","token","accessToken","refreshToken","nominee_auth","user","role"]
      .forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); });

    const PUBLIC_HOME =
      import.meta.env.VITE_PUBLIC_HOME ||
      (import.meta.env.DEV ? "http://localhost:5174/" : "/");

    let dest;
    try { dest = new URL(PUBLIC_HOME); }
    catch { dest = new URL(PUBLIC_HOME, window.location.origin); }
    dest.searchParams.set("toast", "logout");

    window.location.replace(dest.toString());
  }, []);

  // Load event bundle (unchanged)
  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const res = await getEventBundle(eventId);
        if (ok) setBundle(res);
      } catch (e) {
        if (ok) setErr(e?.response?.data?.message || "Failed to load event.");
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [eventId]);

  // Load my votes for this event (unchanged)
  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const data = await getMyVotes();
        const arr =
          Array.isArray(data) ? data :
          Array.isArray(data?.data) ? data.data :
          Array.isArray(data?.items) ? data.items :
          Array.isArray(data?.content) ? data.content :
          Array.isArray(data?.results) ? data.results : [];
        const map = {};
        for (const v of arr) {
          const evId = Number(v.eventId ?? v.event?.id);
          if (String(evId) !== String(eventId)) continue;
          const catId = v.categoryId ?? v.category?.id;
          const nomId = v.nomineeId ?? v.nominee?.id;
          if (catId && nomId) map[catId] = nomId;
        }
        if (ok) {
          setVoted(map);
          if (REVIEW_MODE && Object.keys(map).length > 0) setSubmittedOnce(true);
        }
      } catch {}
    })();
    return () => { ok = false; };
  }, [eventId, REVIEW_MODE]);

  const event = bundle?.event || null;
  const categories = bundle?.categories || [];
  const nomineesFlat = bundle?.nominees || [];
  const nomineesByCategoryFromMap = bundle?.nomineesByCategory || null;

  // tolerate nominees[] or nomineesByCategory{}
  const nomsByCat = useMemo(() => {
    const m = new Map();
    if (nomineesByCategoryFromMap && typeof nomineesByCategoryFromMap === "object") {
      for (const [k, list] of Object.entries(nomineesByCategoryFromMap)) {
        m.set(Number(k), list || []);
      }
    } else {
      for (const n of nomineesFlat) {
        const k = n.categoryId ?? n.category?.id;
        if (!k) continue;
        (m.get(k) || m.set(k, []).get(k)).push(n);
      }
    }
    return m;
  }, [nomineesFlat, nomineesByCategoryFromMap]);

  const status = useMemo(() => {
    if (!event) return { active: false, label: "—", color: "#6b7280" };
    const now = new Date();
    const s = event.startAt || event.startDate ? new Date(event.startAt || event.startDate) : null;
    const e = event.endAt   || event.endDate   ? new Date(event.endAt   || event.endDate)   : null;
    if (s && now < s) return { active: false, label: "UPCOMING",  color: "#3b82f6" };
    if (e && now > e) return { active: false, label: "COMPLETED", color: "#6b7280" };
    return { active: true, label: "ACTIVE", color: "#10b981" };
  }, [event]);

  // status pill style
  const getStatusInfo = (label) => {
    const L = String(label || "").toLowerCase();
    if (L.includes("active")) return { background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", text: "Active - Voting Open" };
    if (L.includes("upcoming")) return { background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", text: "Coming Soon" };
    if (L.includes("complete")) return { background: "linear-gradient(135deg,#6b7280,#4b5563)", color: "#fff", text: "Completed" };
    return { background: "linear-gradient(135deg,#6b7280,#4b5563)", color: "#fff", text: label || "—" };
  };
  const statusInfo = getStatusInfo(status.label);

  // actions (unchanged)
  const handleVote = async (categoryId, nominee) => {
    if (REVIEW_MODE) {
      setDraft(d => ({ ...d, [categoryId]: nominee.id }));
      return;
    }
    if (!status.active || (voted[categoryId] && !ALLOW_EDIT)) return;
    setBusy(b => ({ ...b, [nominee.id]: true }));
    try {
      await castVote({ eventId: Number(eventId), categoryId, nomineeId: nominee.id });
      setVoted(v => ({ ...v, [categoryId]: nominee.id }));
      setSubmittedOnce(true);
      localStorage.setItem("votes_dirty", String(Date.now()));
      showToast("Vote recorded.", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || e.message || "Failed to cast vote", "error", 3600);
    } finally {
      setBusy(b => ({ ...b, [nominee.id]: false }));
    }
  };

  const submitAll = async () => {
    const entries = Object.entries(draft);
    if (!entries.length) { showToast("You haven't selected any nominees.", "info"); return; }
    setShowReview(false);
    try {
      await Promise.all(
        entries.map(([categoryId, nomineeId]) =>
          castVote({ eventId: Number(eventId), categoryId: Number(categoryId), nomineeId })
        )
      );
      setVoted(prev => ({ ...prev, ...draft }));
      setDraft({});
      setSubmittedOnce(true);
      localStorage.setItem("votes_dirty", String(Date.now()));
      showToast("Your selections have been submitted.", "success");
      navigate("/my-vote");
    } catch (e) {
      showToast(e?.response?.data?.message || e.message || "Failed to submit votes", "error", 3600);
    }
  };

  const submittedCount = useMemo(
    () => Object.keys(voted).filter(cid => !!voted[cid]).length,
    [voted]
  );
  const postSubmitLocked = submittedOnce && !ALLOW_EDIT;

  // helpers
  const totalNominees = useMemo(() => countAllNominees(nomsByCat), [nomsByCat]);
  const periodText = useMemo(
    () => dateRange(event?.startAt || event?.startDate, event?.endAt || event?.endDate),
    [event?.startAt, event?.startDate, event?.endAt, event?.endDate]
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #2aa3f4 0%, #a0d5ff 35%, #b2e0c4 100%)"
    }}>
      {/* === VotingHome-like Top Bar (classed) === */}
      <header className="vh__topbar">
        <div className="vh__glow" />
        <div className="vh__topbar-inner">
          <Link to="/" className="vh__brand">
            <div className="vh__logo">🗳️</div>
            <span className="vh__brand-text">University Voting</span>
            <span className="vh__badge">Voting Portal</span>
          </Link>

          <div className="vh__actions">
            <Link to="/my-vote" className="vh__btn vh__btn-green">
              <span className="vh__btn-ico">📊</span> My Vote
            </Link>
            {/* updated: button triggers logout with toast */}
            <button type="button" onClick={logoutHere} className="vh__btn vh__btn-red">
              <span className="vh__btn-ico">🚪</span> Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 20px", display: "grid", gap: 24 }}>
        {/* Review toolbar */}
        {REVIEW_MODE && (
          <div className="review-toolbar">
            <div className="review-toolbar__left">
              <span className="review-toolbar__dot">•</span>
              {!postSubmitLocked ? (
                <span>Selected {Object.keys(draft).length}/{categories.length}</span>
              ) : (
                <span>Submitted {submittedCount}/{categories.length}</span>
              )}
            </div>
            <div>
              {!postSubmitLocked ? (
                <button
                  className="review-toolbar__btn"
                  onClick={() => setShowReview(true)}
                  disabled={!Object.keys(draft).length}
                >
                  Review &amp; Submit
                </button>
              ) : (
                <button className="review-toolbar__btn" disabled>
                  Submitted
                </button>
              )}
            </div>
          </div>
        )}

        {/* Back */}
        <Link
          to="/voting"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "rgba(255, 255, 255, 0.9)",
            color: "#0f172a",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,.1)",
            transition: "all .2s ease",
            width: "fit-content",
            border: "1px solid rgba(255,255,255,.5)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateX(-4px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.1)";
          }}
        >
          <IconArrowLeft />
          Back to Events
        </Link>

        {/* Loading / error / not found */}
        {loading && (
          <div style={{
            background: "#fff", padding: 32, borderRadius: 16,
            boxShadow: "0 12px 28px rgba(0,0,0,.12)", textAlign: "center"
          }}>
            <p style={{ margin: 0, color: "#0f172a" }}>Loading event details…</p>
          </div>
        )}
        {!loading && err && (
          <div style={{
            background: "#fff", padding: 32, borderRadius: 16,
            boxShadow: "0 12px 28px rgba(0,0,0,.12)", textAlign: "center"
          }}>
            <p style={{ color: "#ef4444", fontSize: 16 }}>{err}</p>
          </div>
        )}
        {!loading && !err && !event && (
          <div style={{
            background: "#fff", padding: 32, borderRadius: 16,
            boxShadow: "0 12px 28px rgba(0,0,0,.12)", textAlign: "center"
          }}>
            <p style={{ color: "#0f172a" }}>Event not found.</p>
          </div>
        )}

        {/* Header card + stats */}
        {event && (
          <header style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 12px 28px rgba(0,0,0,.12)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 16
            }}>
              <div>
                <h1 style={{
                  margin: "0 0 8px 0",
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.2
                }}>
                  {event.name}
                </h1>
                {event.description && (
                  <p style={{ margin: 0, color: "#64748b", fontSize: 16, lineHeight: 1.5 }}>
                    {event.description}
                  </p>
                )}
              </div>
              <div style={{
                ...statusInfo,
                padding: "8px 16px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: "nowrap"
              }}>
                {statusInfo.text}
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginTop: 24,
              paddingTop: 24,
              borderTop: "1px solid #e2e8f0"
            }}>
              <StatTile gradient="linear-gradient(135deg, #3b82f6, #2563eb)" icon={<IconCalendar />} label="Duration" value={periodText} />
              <StatTile gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)" icon={<IconTrophy />} label="Categories" value={`${categories.length} Award Categories`} />
              <StatTile gradient="linear-gradient(135deg, #10b981, #059669)" icon={<IconUser />} label="Nominees" value={`${totalNominees} Total Nominees`} />
              <StatTile gradient="linear-gradient(135deg, #f59e0b, #d97706)" icon={<IconStar />} label={REVIEW_MODE ? "Submitted" : "Status"} value={REVIEW_MODE ? `${submittedCount}/${categories.length}` : status.label} />
            </div>
          </header>
        )}

        {/* Categories + nominees */}
        {event && (
          <section style={{ display: "grid", gap: 24 }}>
            {categories.length === 0 ? (
              <div className="public-event__empty">
                <h3>No Categories Yet</h3>
                <p>Categories will be added soon. Please check back later.</p>
              </div>
            ) : (
              categories.map((cat) => {
                const list = nomsByCat.get(cat.id) || [];
                return (
                  <article
                    key={cat.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: 16,
                      padding: 28,
                      boxShadow: "0 12px 28px rgba(0,0,0,.12)"
                    }}
                  >
                    {/* category header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: 32 }}>🎯</span>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ margin: "0 0 4px 0", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>{cat.name}</h2>
                        {cat.description && (
                          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{cat.description}</p>
                        )}
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 12px", background: "#f1f5f9",
                        borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#475569"
                      }}>
                        <IconTarget />
                        {list.length} Nominee{list.length !== 1 ? "s" : ""}
                      </div>
                    </div>

                    {/* nominees grid */}
                    {list.length === 0 ? (
                      <div style={{ paddingTop: 8, color: "#64748b" }}>No nominees yet.</div>
                    ) : (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 16,
                        marginTop: 20
                      }}>
                        {list.map((n) => {
                          const selected = postSubmitLocked
                            ? voted[cat.id] === n.id
                            : (REVIEW_MODE ? draft[cat.id] === n.id : voted[cat.id] === n.id);

                          const categoryLockedOther =
                            !postSubmitLocked && REVIEW_MODE && draft[cat.id] && draft[cat.id] !== n.id;

                          const isBusy = !!busy[n.id];

                          const baseTile = {
                            padding: 20,
                            background: selected ? "#ffffff" : "#f8fafc",
                            borderRadius: 12,
                            border: `2px solid ${selected ? "#3b82f6" : "#e2e8f0"}`,
                            transition: "all .2s ease",
                            cursor: (!status.active || postSubmitLocked || categoryLockedOther || isBusy) ? "not-allowed" : "pointer",
                            boxShadow: selected ? "0 8px 16px rgba(0,0,0,.1)" : "none"
                          };

                          const photoSrc = resolveNomineePhoto(n);

                          return (
                            <div
                              key={n.id}
                              style={baseTile}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "#3b82f6";
                                e.currentTarget.style.background = "#ffffff";
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = selected ? "#3b82f6" : "#e2e8f0";
                                e.currentTarget.style.background = selected ? "#ffffff" : "#f8fafc";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = selected ? "0 8px 16px rgba(0,0,0,.1)" : "none";
                              }}
                            >
                              {/* BIG rounded image ABOVE name */}
                              <div style={{ marginBottom: 12 }}>
                                <div
                                  style={{
                                    position: "relative",
                                    width: "100%",
                                    height: 170,
                                    borderRadius: 14,
                                    overflow: "hidden",
                                    border: "2px solid #3b82f6",
                                    background: "linear-gradient(180deg,#eaf3ff,#f8fbff)",
                                    boxShadow: "0 6px 20px rgba(59,130,246,.15)"
                                  }}
                                >
                                  {photoSrc ? (
                                    <img
                                      src={photoSrc}
                                      alt={n.name}
                                      style={{
                                        position: "absolute",
                                        inset: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block"
                                      }}
                                      onError={(e) => (e.currentTarget.style.display = "none")}
                                    />
                                  ) : (
                                    <div style={{
                                      position: "absolute", inset: 0,
                                      display: "grid", placeItems: "center",
                                      color: "#64748b"
                                    }}>
                                      <IconUser />
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{n.name}</h3>
                                {selected && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", fontSize: 14, fontWeight: 700 }}>
                                    ✓ Selected
                                  </div>
                                )}
                              </div>

                              {(n.description || n.bio || n.additionalInfo) && (
                                <p style={{ margin: "0 0 16px 0", color: "#64748b", fontSize: 14, lineHeight: 1.5 }}>
                                  {n.description || n.bio || n.additionalInfo}
                                </p>
                              )}

                              <button
                                style={{
                                  width: "100%",
                                  padding: 10,
                                  border: "none",
                                  borderRadius: 8,
                                  background: selected
                                    ? "linear-gradient(180deg,#059669,#10b981)"
                                    : "linear-gradient(180deg,#3aa0ea,#2f89d9)",
                                  color: "#fff",
                                  fontWeight: 700,
                                  fontSize: 14,
                                  cursor: (!status.active || postSubmitLocked || (!!voted[cat.id] && !ALLOW_EDIT && !REVIEW_MODE) || categoryLockedOther || isBusy) ? "not-allowed" : "pointer",
                                  opacity: (!status.active || postSubmitLocked || categoryLockedOther || isBusy) ? 0.7 : 1,
                                  transition: "all .2s ease",
                                  boxShadow: selected ? "0 4px 12px rgba(5,150,105,.35)" : "none"
                                }}
                                disabled={
                                  !status.active ||
                                  postSubmitLocked ||
                                  (!REVIEW_MODE && !!voted[cat.id] && !ALLOW_EDIT) ||
                                  (REVIEW_MODE && !!voted[cat.id] && !ALLOW_EDIT) ||
                                  categoryLockedOther ||
                                  isBusy
                                }
                                onMouseEnter={(e) => {
                                  if (e.currentTarget.disabled) return;
                                  e.currentTarget.style.transform = "scale(1.02)";
                                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(59,130,246,.3)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "scale(1)";
                                  e.currentTarget.style.boxShadow = selected ? "0 4px 12px rgba(5,150,105,.35)" : "none";
                                }}
                                onClick={() => handleVote(cat.id, n)}
                                title={categoryLockedOther ? "You already selected someone in this category. Clear to change." : undefined}
                              >
                                {postSubmitLocked
                                  ? (selected ? "Voted ✓" : "Select")
                                  : (REVIEW_MODE
                                    ? (selected ? "Selected ✓" : "Select")
                                    : (isBusy ? "Voting…" : selected ? "Voted ✓" : `Vote for ${n.name.split(' ')[0] || 'Nominee'}`))}
                              </button>

                              {!postSubmitLocked && REVIEW_MODE && selected && (
                                <button
                                  className="nominee-card__clear"
                                  onClick={() =>
                                    setDraft(d => {
                                      const copy = { ...d }; delete copy[cat.id]; return copy;
                                    })
                                  }
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </section>
        )}

        {/* Review modal */}
        {REVIEW_MODE && showReview && (
          <ReviewModal
            onClose={() => setShowReview(false)}
            onSubmit={submitAll}
            event={event}
            categories={categories}
            nomsByCat={nomsByCat}
            draft={draft}
          />
        )}
      </main>

      <Toast message={toast?.message} kind={toast?.kind} onClose={() => setToast(null)} />
    </div>
  );
}

/* --- Small stat card --- */
function StatTile({ gradient, icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "#f8fafc", borderRadius: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: gradient, display: "grid", placeItems: "center", color: "#fff" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{value}</div>
      </div>
    </div>
  );
}

/* --- helpers --- */
function countAllNominees(nomsByCat) {
  let total = 0;
  for (const [, list] of nomsByCat.entries()) total += list.length;
  return total;
}
function dateRange(sAt, eAt) {
  const s = sAt ? new Date(sAt) : null;
  const e = eAt ? new Date(eAt) : null;
  const fmt = (d) =>
    d ? d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "TBD";
  if (!s && !e) return "Anytime";
  if (s && !e) return `Starts ${fmt(s)}`;
  if (!s && e) return `Ends ${fmt(e)}`;
  return `${fmt(s)} – ${fmt(e)}`;
}

/* --- Review modal & Toast --- */
function ReviewModal({ onClose, onSubmit, event, categories, nomsByCat, draft }) {
  const byId = new Map();
  for (const [, list] of nomsByCat.entries()) {
    for (const n of list) byId.set(n.id, n);
  }
  const selected = Object.entries(draft).map(([catId, nomId]) => ({
    category: categories.find(c => c.id === Number(catId)),
    nominee: byId.get(nomId)
  }));
  const skipped = categories.filter(c => !draft[c.id]);

  return (
    <div className="review-modal__backdrop" onClick={onClose}>
      <div className="review-modal" onClick={e => e.stopPropagation()}>
        <div className="review-modal__header">
          <h3>Review your selections</h3>
          <button className="review-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="review-modal__body">
          <div className="review-modal__section">
            <h4>Selected ({selected.length})</h4>
            {selected.length === 0 ? <p className="muted">No selections yet.</p> : (
              <ul className="review-modal__list">
                {selected.map((row, i) => (
                  <li key={i}>
                    <strong>{row.category?.name || `Category ${i + 1}`}</strong>
                    <span className="review-modal__sep">—</span>
                    <span>{row.nominee?.name || row.nominee?.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="review-modal__section">
            <h4>Skipped ({skipped.length})</h4>
            {skipped.length === 0 ? <p className="muted">No skipped categories.</p> : (
              <ul className="review-modal__list muted">
                {skipped.map(c => <li key={c.id}>{c.name}</li>)}
              </ul>
            )}
          </div>
        </div>
        <div className="review-modal__footer">
          <button className="review-modal__cancel" onClick={onClose}>Back</button>
          <button className="review-modal__submit" onClick={onSubmit} disabled={!selected.length}>
            Submit {selected.length} vote{selected.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
function Toast({ message, kind = "info", onClose }) {
  if (!message) return null;
  const cls =
    kind === "success" ? "ui-toast ui-toast--success" :
    kind === "error"   ? "ui-toast ui-toast--error"   :
                         "ui-toast ui-toast--info";
  return (
    <div className={cls} role="status" aria-live="polite" onClick={onClose} title="Close">
      <span className="ui-toast__dot">•</span>
      <span className="ui-toast__text">{message}</span>
    </div>
  );
}
