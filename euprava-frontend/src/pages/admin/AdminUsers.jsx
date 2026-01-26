import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiRefreshCw, FiTrash2 } from "react-icons/fi";

const ROLES = ["CITIZEN", "OFFICER", "ADMIN"];

export default function AdminUsers() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      const res = await api.get("/api/users");
      setItems(res?.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju korisnika.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((u) => {
      const name = String(u?.name || "");
      const email = String(u?.email || "");
      const role = String(u?.role || "");
      const jmbg = String(u?.jmbg || "");
      return [name, email, role, jmbg].some((v) => v.toLowerCase().includes(s));
    });
  }, [items, q]);

  const changeRole = async (userId, role) => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      await api.patch(`/api/users/${userId}/role`, { role });
      setOk("Uloga je uspešno promenjena.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri promeni uloge.");
      setBusy(false);
    }
  };

  const remove = async (userId) => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      await api.delete(`/api/users/${userId}`);
      setOk("Korisnik je obrisan.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri brisanju korisnika.");
      setBusy(false);
    }
  };

  return (
    <div className="home-page">
      <NavBar roleLabel="Administrator" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Korisnici</div>
            <div className="page-subtitle">Pregled korisnika i upravljanje ulogama.</div>
          </div>

          <button className="eu-btn eu-btn--primary" onClick={load} disabled={busy}>
            <FiRefreshCw />
            Osveži
          </button>
        </div>

        {error ? <div className="eu-alert eu-alert--err">{error}</div> : null}
        {ok ? <div className="eu-alert eu-alert--info">{ok}</div> : null}

        <div className="eu-filters">
          <div className="eu-inputWrap">
            <input className="eu-input" placeholder="Pretraga (ime, email, role, jmbg)…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        {busy ? <div className="eu-empty">Učitavanje…</div> : null}
        {!busy && filtered.length === 0 ? <div className="eu-empty">Nema korisnika.</div> : null}

        <div className="eu-table">
          <div className="eu-tableHead">
            <div>ID</div>
            <div>Ime</div>
            <div>Email</div>
            <div>Uloga</div>
            <div>Akcije</div>
          </div>

          {!busy &&
            filtered.map((u) => (
              <div className="eu-tableRow" key={u.id}>
                <div className="eu-mono">#{u.id}</div>
                <div className="eu-strong">{u.name || "—"}</div>
                <div className="eu-mono">{u.email || "—"}</div>

                <div>
                  <select
                    className="eu-select"
                    value={String(u.role || "").toUpperCase()}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    disabled={busy}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="eu-rowActions">
                  <button className="eu-btn eu-btn--danger" onClick={() => remove(u.id)} disabled={busy}>
                    <FiTrash2 />
                    Obriši
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
