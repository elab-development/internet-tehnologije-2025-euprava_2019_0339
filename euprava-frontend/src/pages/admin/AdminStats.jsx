import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiRefreshCw } from "react-icons/fi";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

// ✅ Paleta boja (ponavlja se ako ima više segmenata nego boja).
const PIE_COLORS = [
  "#7C3AED", // ljubičasta
  "#06B6D4", // cyan
  "#10B981", // mint/green
  "#F59E0B", // amber
  "#EF4444", // crvena
  "#3B82F6", // plava
  "#EC4899", // pink
  "#A3E635", // lime
  "#F97316", // orange
  "#14B8A6", // teal
];

export default function AdminStats() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // --- inline "click fix" stilovi (ako ti se opet dešava da ništa ne reaguje) ---
  const z = {
    page: { position: "relative", zIndex: 1 },
    wrap: { position: "relative", zIndex: 50, pointerEvents: "auto" },
    head: { position: "relative", zIndex: 80, pointerEvents: "auto" },
    btn: { position: "relative", zIndex: 9999, pointerEvents: "auto" },
    card: {
      background: "#fff",
      borderRadius: 16,
      padding: 16,
      boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
      border: "1px solid rgba(0,0,0,0.06)",
    },
    grid: {
      display: "grid",
      gap: 16,
      gridTemplateColumns: "repeat(12, 1fr)",
      marginTop: 14,
    },
  };

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api.get("/api/stats");
      // backend obično vraća { data: ... } ali da budemo fleksibilni:
      setData(res?.data?.data ?? res?.data ?? null);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju statistike.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // PIE 1: by_status => [{ name, value }]
  const byStatusPie = useMemo(() => {
    const byStatus = safeArray(data?.by_status);
    const mapped = byStatus
      .map((x) => ({
        name: String(x?.status ?? "UNKNOWN"),
        value: Number(x?.total ?? 0),
      }))
      .filter((x) => x.value > 0);

    if (mapped.length > 0) return mapped;

    if (data && typeof data === "object") {
      const maybe = Object.entries(data)
        .filter(([k, v]) => typeof v === "number" && /status|approved|rejected|draft|submitted|review/i.test(k))
        .map(([k, v]) => ({ name: k.toUpperCase(), value: Number(v) }))
        .filter((x) => x.value > 0);

      if (maybe.length > 0) return maybe;
    }

    return [];
  }, [data]);

  // PIE 2 (opciono): top_services => top 6 po total
  const topServicesPie = useMemo(() => {
    return safeArray(data?.top_services)
      .map((x) => ({
        name: String(x?.service_name ?? x?.name ?? `Service #${x?.service_id ?? "—"}`),
        value: Number(x?.total ?? 0),
      }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [data]);

  const totalRequests = useMemo(() => {
    const v = data?.total_requests;
    return Number.isFinite(Number(v)) ? Number(v) : null;
  }, [data]);

  return (
    <div className="home-page" style={z.page}>
      <NavBar roleLabel="Administrator" />

      <div className="home-wrap" style={z.wrap}>
        <div className="page-head" style={z.head}>
          <div>
            <div className="page-title">Statistika</div>
            <div className="page-subtitle">Pregled statusa zahteva i top servisa (Pie chart).</div>
          </div>

          <button
            type="button"
            className="eu-btn eu-btn--primary"
            style={z.btn}
            onClick={(e) => {
              e.preventDefault();
              load();
            }}
            disabled={busy}
          >
            <FiRefreshCw />
            Osveži
          </button>
        </div>

        {error ? <div className="eu-alert eu-alert--err">{error}</div> : null}

        {busy && !data ? <div className="eu-empty">Učitavanje…</div> : null}

        {data ? (
          <>
            {/* Summary cards */}
            <div style={z.grid}>
              <div style={{ ...z.card, gridColumn: "span 4" }}>
                <div className="eu-muted">Uloga</div>
                <div className="eu-strong" style={{ fontSize: 18, marginTop: 6 }}>
                  {data?.role || "ADMIN"}
                </div>
              </div>

              <div style={{ ...z.card, gridColumn: "span 4" }}>
                <div className="eu-muted">Ukupno zahteva</div>
                <div className="eu-strong" style={{ fontSize: 18, marginTop: 6 }}>
                  {totalRequests !== null ? totalRequests : "—"}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div style={z.grid}>
              <div style={{ ...z.card, gridColumn: "span 6" }}>
                <div className="eu-strong" style={{ marginBottom: 10 }}>
                  Zahtevi po statusu
                </div>

                {byStatusPie.length === 0 ? (
                  <div className="eu-empty" style={{ padding: 12 }}>
                    Nema podataka za Pie chart (by_status).
                  </div>
                ) : (
                  <div style={{ width: "100%", height: 360 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={byStatusPie}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          label
                        >
                          {byStatusPie.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div style={{ ...z.card, gridColumn: "span 6" }}>
                <div className="eu-strong" style={{ marginBottom: 10 }}>
                  Top servisi (po broju zahteva)
                </div>

                {topServicesPie.length === 0 ? (
                  <div className="eu-empty" style={{ padding: 12 }}>
                    Nema podataka za Pie chart (top_services).
                  </div>
                ) : (
                  <div style={{ width: "100%", height: 360 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={topServicesPie}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          label
                        >
                          {topServicesPie.map((_, idx) => (
                            <Cell key={`cell2-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
