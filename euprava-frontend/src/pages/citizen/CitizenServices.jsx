import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiSearch, FiRefreshCw, FiArrowRight } from "react-icons/fi";

export default function CitizenServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [types, setTypes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [typeId, setTypeId] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [q, setQ] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      if (typeId) qs.set("type_id", typeId);
      if (institutionId) qs.set("institution_id", institutionId);

      const [svcRes, typeRes] = await Promise.all([
        api.get(`/api/services${qs.toString() ? `?${qs.toString()}` : ""}`),
        api.get("/api/types"),
      ]);

      setServices(svcRes?.data?.data || []);
      setTypes(typeRes?.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju usluga.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeId, institutionId]);

  const institutionOptions = useMemo(() => {
    const map = new Map();
    services.forEach((s) => {
      const inst = s?.institution;
      if (inst?.id) map.set(inst.id, inst.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [services]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return services;
    return services.filter((x) => {
      const name = String(x?.name || "");
      const desc = String(x?.description || "");
      const inst = String(x?.institution?.name || "");
      const type = String(x?.type?.name || "");
      return [name, desc, inst, type].some((v) => v.toLowerCase().includes(s));
    });
  }, [services, q]);

  return (
    <div className="home-page">
      <NavBar roleLabel="Građanin" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Usluge</div>
            <div className="page-subtitle">Izaberi uslugu i podnesi zahtev.</div>
          </div>

          <button className="eu-btn eu-btn--primary" onClick={load} disabled={busy}>
            <FiRefreshCw />
            Osveži
          </button>
        </div>

        {error ? <div className="eu-alert eu-alert--err">{error}</div> : null}

        <div className="eu-filters">
          <div className="eu-inputWrap">
            <FiSearch />
            <input className="eu-input" placeholder="Pretraga usluga…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <select className="eu-select" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
            <option value="">Svi tipovi</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select className="eu-select" value={institutionId} onChange={(e) => setInstitutionId(e.target.value)}>
            <option value="">Sve institucije</option>
            {institutionOptions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>

        {busy ? <div className="eu-empty">Učitavanje…</div> : null}
        {!busy && filtered.length === 0 ? <div className="eu-empty">Nema usluga po izabranim filterima.</div> : null}

        <div className="eu-cardsGrid">
          {!busy &&
            filtered.map((s) => (
              <div className="eu-card" key={s.id}>
                <div className="eu-card__inner" style={{ gridTemplateColumns: "1fr" }}>
                  <div>
                    <div className="eu-card__title">{s.name}</div>
                    <div className="eu-card__desc">{s.description || "—"}</div>

                    <div className="eu-tags">
                      {s?.type?.name ? <span className="eu-tag">{s.type.name}</span> : null}
                      {s?.institution?.name ? <span className="eu-tag">{s.institution.name}</span> : null}
                      {typeof s?.price === "number" ? <span className="eu-tag">Cena: {s.price}</span> : null}
                    </div>
                  </div>

                  <div className="eu-card__actions">
                    <button
                      className="eu-btn eu-btn--primary"
                      onClick={() => navigate(`/citizen/requests/new?service_id=${s.id}`)}
                    >
                      <FiArrowRight />
                      Podnesi zahtev
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
