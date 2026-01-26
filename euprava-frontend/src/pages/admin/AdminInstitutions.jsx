import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiPlus, FiRefreshCw, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

const emptyForm = { name: "", city: "", address: "", email: "" };

export default function AdminInstitutions() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      const res = await api.get("/api/institutions");
      setItems(res?.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju institucija.");
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
    return items.filter((x) => {
      const name = String(x?.name || "");
      const city = String(x?.city || "");
      const address = String(x?.address || "");
      const email = String(x?.email || "");
      return [name, city, address, email].some((v) => v.toLowerCase().includes(s));
    });
  }, [items, q]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (x) => {
    setEditing(x);
    setForm({
      name: x?.name || "",
      city: x?.city || "",
      address: x?.address || "",
      email: x?.email || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const save = async () => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      if (editing?.id) {
        await api.put(`/api/institutions/${editing.id}`, form);
        setOk("Institucija je izmenjena.");
      } else {
        await api.post("/api/institutions", form);
        setOk("Institucija je kreirana.");
      }
      closeModal();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri čuvanju institucije.");
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      await api.delete(`/api/institutions/${id}`);
      setOk("Institucija je obrisana.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri brisanju institucije.");
      setBusy(false);
    }
  };

  return (
    <div className="home-page">
      <NavBar roleLabel="Administrator" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Institucije</div>
            <div className="page-subtitle">Kreiranje, izmena i brisanje institucija.</div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="eu-btn eu-btn--ghost" onClick={load} disabled={busy}>
              <FiRefreshCw />
              Osveži
            </button>
            <button className="eu-btn eu-btn--primary" onClick={openCreate} disabled={busy}>
              <FiPlus />
              Nova institucija
            </button>
          </div>
        </div>

        {error ? <div className="eu-alert eu-alert--err">{error}</div> : null}
        {ok ? <div className="eu-alert eu-alert--info">{ok}</div> : null}

        <div className="eu-filters">
          <div className="eu-inputWrap">
            <input className="eu-input" placeholder="Pretraga (naziv, grad, adresa, email)…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        {busy ? <div className="eu-empty">Učitavanje…</div> : null}
        {!busy && filtered.length === 0 ? <div className="eu-empty">Nema institucija.</div> : null}

        <div className="eu-table">
          <div className="eu-tableHead">
            <div>ID</div>
            <div>Naziv</div>
            <div>Grad</div>
            <div>Email</div>
            <div>Akcije</div>
          </div>

          {!busy &&
            filtered.map((x) => (
              <div className="eu-tableRow" key={x.id}>
                <div className="eu-mono">#{x.id}</div>
                <div className="eu-strong">{x.name || "—"}</div>
                <div>{x.city || "—"}</div>
                <div className="eu-mono">{x.email || "—"}</div>
                <div className="eu-rowActions">
                  <button className="eu-btn eu-btn--ghost" onClick={() => openEdit(x)} disabled={busy}>
                    <FiEdit2 />
                    Izmeni
                  </button>
                  <button className="eu-btn eu-btn--danger" onClick={() => remove(x.id)} disabled={busy}>
                    <FiTrash2 />
                    Obriši
                  </button>
                </div>
              </div>
            ))}
        </div>

        {modalOpen ? (
          <div className="eu-modalOverlay" role="dialog" aria-modal="true">
            <div className="eu-modal">
              <div className="eu-modalHead">
                <div className="eu-strong">{editing?.id ? "Izmeni instituciju" : "Nova institucija"}</div>
                <button className="eu-btn eu-btn--ghost" onClick={closeModal} disabled={busy}>
                  <FiX />
                  Zatvori
                </button>
              </div>

              <div className="eu-formGrid">
                <div className="eu-field">
                  <label>Naziv</label>
                  <input className="eu-inputLine" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>

                <div className="eu-field">
                  <label>Grad</label>
                  <input className="eu-inputLine" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
                </div>

                <div className="eu-field">
                  <label>Adresa</label>
                  <input className="eu-inputLine" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                </div>

                <div className="eu-field">
                  <label>Email</label>
                  <input className="eu-inputLine" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
              </div>

              <div className="eu-actions" style={{ justifyContent: "flex-end" }}>
                <button className="eu-btn eu-btn--primary" onClick={save} disabled={busy || !form.name}>
                  Sačuvaj
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
