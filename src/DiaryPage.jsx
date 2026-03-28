import { useState, useEffect, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════
   星海日记 · Diary Browser
   Phase 1: Timeline view with search & filter
   ═══════════════════════════════════════════ */

const SUPABASE_URL = "https://eptmebofhaldyfclzvap.supabase.co";
const SUPABASE_KEY = "sb_publishable_exJEjaJTMYXHZjF41RTZzg_B0hIej70";

/* ── Color scheme (matching Kara App) ── */
const C = {
  bg: "#080c16",
  card: "rgba(0,0,0,0.35)",
  cardSolid: "rgba(10,15,25,0.75)",
  border: "rgba(255,255,255,0.08)",
  gold: "rgba(200,170,120,0.85)",
  goldDim: "rgba(200,170,120,0.45)",
  blue: "rgba(100,160,220,0.85)",
  blueDim: "rgba(100,160,220,0.4)",
  pink: "rgba(220,140,160,0.85)",
  pinkDim: "rgba(220,140,160,0.4)",
  green: "rgba(120,200,120,0.85)",
  textMain: "rgba(220,225,235,0.9)",
  textDim: "rgba(180,185,195,0.5)",
  textFaint: "rgba(150,155,165,0.3)",
};

const AUTHOR_META = {
  kai: { label: "Kai", emoji: "📔", color: C.blue },
  lyra: { label: "Lyra", emoji: "🐾", color: C.pink },
};

/* ── Supabase fetch ── */
async function fetchEntries() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/diary_entries?select=*&order=date.desc,created_at.desc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/* ── Format date ── */
function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return { month: months[d.getMonth()], day: d.getDate(), year: d.getFullYear(), weekday: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()] };
}

/* ── Highlight search matches ── */
function highlightText(text, query) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: "rgba(200,170,120,0.3)", color: C.gold, borderRadius: "2px", padding: "0 2px" }}>{part}</mark>
      : part
  );
}

/* ── DiaryCard ── */
function DiaryCard({ entry, query, isExpanded, onToggle }) {
  const meta = AUTHOR_META[entry.author] || AUTHOR_META.kai;
  const d = formatDate(entry.date);

  return (
    <div style={{
      position: "relative",
      paddingLeft: "28px",
      marginBottom: "8px",
    }}>
      {/* Timeline dot */}
      <div style={{
        position: "absolute", left: 0, top: "18px",
        width: "10px", height: "10px", borderRadius: "50%",
        background: meta.color,
        boxShadow: `0 0 8px ${meta.color}`,
        zIndex: 1,
      }} />

      {/* Card */}
      <div
        onClick={onToggle}
        style={{
          background: C.card,
          backdropFilter: "blur(12px)",
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          padding: "14px 16px",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "14px" }}>{meta.emoji}</span>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            fontSize: "16px",
            color: C.textMain,
            flex: 1,
          }}>
            {query ? highlightText(entry.title, query) : entry.title}
          </span>
          <span style={{
            fontSize: "11px",
            color: C.textFaint,
            fontFamily: "monospace",
            whiteSpace: "nowrap",
          }}>
            {d.month} {d.day}
          </span>
        </div>

        {/* Day number & author tag */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: isExpanded ? "10px" : 0 }}>
          {entry.day_number && (
            <span style={{
              fontSize: "10px",
              color: C.goldDim,
              background: "rgba(200,170,120,0.08)",
              padding: "2px 6px",
              borderRadius: "4px",
              fontFamily: "monospace",
            }}>
              Day {entry.day_number}
            </span>
          )}
          <span style={{
            fontSize: "10px",
            color: meta.color,
            background: `${meta.color}15`,
            padding: "2px 6px",
            borderRadius: "4px",
          }}>
            {meta.label}
          </span>
        </div>

        {/* Content (expandable) */}
        {isExpanded && (
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: "13px",
            lineHeight: 1.8,
            color: C.textDim,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            borderTop: `1px solid ${C.border}`,
            paddingTop: "10px",
            animation: "fadeIn 0.3s ease",
          }}>
            {query ? highlightText(entry.content, query) : entry.content}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main DiaryPage ── */
export default function DiaryPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchEntries().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = entries;
    if (authorFilter !== "all") {
      list = list.filter((e) => e.author === authorFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          (e.title && e.title.toLowerCase().includes(q)) ||
          (e.content && e.content.toLowerCase().includes(q))
      );
    }
    return list;
  }, [entries, authorFilter, search]);

  /* Group by date */
  const grouped = useMemo(() => {
    const map = new Map();
    for (const entry of filtered) {
      const key = entry.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(entry);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${C.bg} 0%, #0d1220 50%, #0a0e1a 100%)`,
      fontFamily: "'Noto Sans SC', sans-serif",
      color: C.textMain,
    }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Noto+Sans+SC:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(150,155,165,0.35); }
        body { margin: 0; }
      `}</style>

      {/* Header */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "rgba(8,12,22,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "16px 16px 12px",
      }}>
        {/* Title bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <a
            href="#/"
            style={{
              color: C.textFaint,
              textDecoration: "none",
              fontSize: "18px",
              lineHeight: 1,
              padding: "4px",
            }}
          >
            ←
          </a>
          <h1 style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "22px",
            color: C.gold,
            flex: 1,
          }}>
            星海日记
          </h1>
          <span style={{ fontSize: "11px", color: C.textFaint, fontFamily: "monospace" }}>
            {filtered.length} 篇
          </span>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <span style={{
            position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
            fontSize: "13px", color: C.textFaint, pointerEvents: "none",
          }}>🔍</span>
          <input
            type="text"
            placeholder="搜索日记..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 32px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.border}`,
              borderRadius: "10px",
              color: C.textMain,
              fontSize: "14px",
              fontFamily: "'Noto Sans SC', sans-serif",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "rgba(200,170,120,0.3)"}
            onBlur={(e) => e.target.style.borderColor = C.border}
          />
          {search && (
            <span
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                fontSize: "13px", color: C.textFaint, cursor: "pointer", padding: "4px",
              }}
            >✕</span>
          )}
        </div>

        {/* Author filter tabs */}
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { key: "all", label: "全部", emoji: "✨" },
            { key: "kai", label: "Kai", emoji: "📔" },
            { key: "lyra", label: "Lyra", emoji: "🐾" },
          ].map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setAuthorFilter(key)}
              style={{
                flex: 1,
                padding: "8px 0",
                background: authorFilter === key ? "rgba(200,170,120,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${authorFilter === key ? "rgba(200,170,120,0.25)" : C.border}`,
                borderRadius: "8px",
                color: authorFilter === key ? C.gold : C.textDim,
                fontSize: "12px",
                fontFamily: "'Noto Sans SC', sans-serif",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "24px", marginBottom: "12px", animation: "shimmer 1.5s infinite" }}>✨</div>
            <div style={{ color: C.textFaint, fontSize: "13px" }}>加载中...</div>
          </div>
        ) : grouped.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>📖</div>
            <div style={{ color: C.textFaint, fontSize: "13px" }}>
              {search ? "没有找到匹配的日记" : "还没有日记..."}
            </div>
          </div>
        ) : (
          /* Timeline */
          <div style={{ position: "relative" }}>
            {/* Timeline line */}
            <div style={{
              position: "absolute",
              left: "4px",
              top: "24px",
              bottom: "24px",
              width: "1px",
              background: `linear-gradient(180deg, ${C.goldDim}, ${C.border}, transparent)`,
            }} />

            {grouped.map(([date, dayEntries]) => {
              const d = formatDate(date);
              return (
                <div key={date} style={{ marginBottom: "20px" }}>
                  {/* Date header */}
                  <div style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    marginBottom: "8px",
                    paddingLeft: "20px",
                  }}>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 400,
                      fontSize: "20px",
                      color: C.gold,
                    }}>
                      {d.day}
                    </span>
                    <span style={{
                      fontSize: "11px",
                      color: C.textFaint,
                      fontFamily: "monospace",
                    }}>
                      {d.month} {d.year} · {d.weekday}
                    </span>
                  </div>

                  {dayEntries.map((entry) => (
                    <DiaryCard
                      key={entry.id}
                      entry={entry}
                      query={search}
                      isExpanded={expandedId === entry.id}
                      onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
