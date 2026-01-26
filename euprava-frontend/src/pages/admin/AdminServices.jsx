import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiPlus, FiRefreshCw, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

const emptyForm = {
  institution_id: "",
  type_id: "",
  name: "",
  description: "",
  fee: "",
  requires_attachment: false,
  status: "ACTIVE",
};

export default function AdminServices() {
  const [items, setItems] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [types, setTypes] = useState([]);

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
      const [svcRes, instRes, typeRes] = await Promise.all([
        api.get("/api/services"),
        api.get("/api/institutions"),
        api.get("/api/types"),
      ]);

      setItems(svcRes?.data?.data || []);
      setInstitutions(instRes?.data?.data || []);
      setTypes(typeRes?.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju servisa.");
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
      const inst = String(x?.institution?.name || "");
      const type = String(x?.type?.name || "");
      const status = String(x?.status || "");
      return [name, inst, type, status].some((v) => v.toLowerCase().includes(s));
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
      institution_id: x?.institution_id ? String(x.institution_id) : String(x?.institution?.id || ""),
      type_id: x?.type_id ? String(x.type_id) : String(x?.type?.id || ""),
      name: x?.name || "",
      description: x?.description || "",
      fee: x?.fee ?? "",
      requires_attachment: Boolean(x?.requires_attachment),
      status: x?.status || "ACTIVE",
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
      const payload = {
        institution_id: form.institution_id ? Number(form.institution_id) : null,
        type_id: form.type_id ? Number(form.type_id) : null,
        name: form.name || null,
        description: form.description || null,
        fee: form.fee === "" ? null : Number(form.fee),
        requires_attachment: Boolean(form.requires_attachment),
        status: form.status || "ACTIVE",
      };

      if (editing?.id) {
        await api.put(`/api/services/${editing.id}`, payload);
        setOk("Servis je izmenjen.");
      } else {
        await api.post("/api/services", payload);
        setOk("Servis je kreiran.");
      }

      closeModal();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri čuvanju servisa.");
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      await api.delete(`/api/services/${id}`);
      setOk("Servis je obrisan.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri brisanju servisa.");
      setBusy(false);
    }
  };

  return (
    <div className="home-page">
      <NavBar roleLabel="Administrator" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Servisi</div>
            <div className="page-subtitle">Kreiranje i izmena servisa u sistemu.</div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="eu-btn eu-btn--ghost" onClick={load} disabled={busy}>
              <FiRefreshCw />
              Osveži
            </button>
            <button className="eu-btn eu-btn--primary" onClick={openCreate} disabled={busy}>
              <FiPlus />
              Novi servis
            </button>
          </div>
        </div>

        {error ? <div className="eu-alert eu-alert--err">{error}</div> : null}
        {ok ? <div className="eu-alert eu-alert--info">{ok}</div> : null}

        <div className="eu-filters">
          <div className="eu-inputWrap">
            <input className="eu-input" placeholder="Pretraga (naziv, institucija, tip, status)…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        {busy ? <div className="eu-empty">Učitavanje…</div> : null}
        {!busy && filtered.length === 0 ? <div className="eu-empty">Nema servisa.</div> : null}

        <div className="eu-table">
          <div className="eu-tableHead">
            <div>ID</div>
            <div>Naziv</div>
            <div>Institucija</div>
            <div>Tip</div>
            <div>Status</div>
            <div>Akcije</div>
          </div>

          {!busy &&
            filtered.map((x) => (
              <div className="eu-tableRow" key={x.id}>
                <div className="eu-mono">#{x.id}</div>
                <div className="eu-strong">{x.name || "—"}</div>
                <div>{x?.institution?.name || "—"}</div>
                <div>{x?.type?.name || "—"}</div>
                <div>
                  <span className="eu-badge eu-badge--ghost">{x.status || "—"}</span>
                </div>
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
                <div className="eu-strong">{editing?.id ? "Izmeni servis" : "Novi servis"}</div>
                <button className="eu-btn eu-btn--ghost" onClick={closeModal} disabled={busy}>
                  <FiX />
                  Zatvori
                </button>
              </div>

              <div className="eu-formGrid">
                <div className="eu-field">
                  <label>Institucija</label>
                  <select
                    className="eu-select eu-select--full"
                    value={form.institution_id}
                    onChange={(e) => setForm((p) => ({ ...p, institution_id: e.target.value }))}
                  >
                    <option value="">Izaberi instituciju…</option>
                    {institutions.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="eu-field">
                  <label>Tip</label>
                  <select
                    className="eu-select eu-select--full"
                    value={form.type_id}
                    onChange={(e) => setForm((p) => ({ ...p, type_id: e.target.value }))}
                  >
                    <option value="">Izaberi tip…</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="eu-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Naziv</label>
                  <input className="eu-inputLine" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>

                <div className="eu-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Opis</label>
                  <textarea
                    className="eu-textarea"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <div className="eu-field">
                  <label>Naknada (fee)</label>
                  <input
                    className="eu-inputLine"
                    value={form.fee}
                    onChange={(e) => setForm((p) => ({ ...p, fee: e.target.value }))}
                    placeholder="npr. 500.00"
                  />
                </div>

                <div className="eu-field">
                  <label>Status</label>
                  <select className="eu-select eu-select--full" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="eu-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Prilog obavezan</label>
                  <div className="eu-checkRow">
                    <input
                      type="checkbox"
                      checked={Boolean(form.requires_attachment)}
                      onChange={(e) => setForm((p) => ({ ...p, requires_attachment: e.target.checked }))}
                    />
                    <span className="eu-muted">Ako je uključeno, građanin mora dodati prilog.</span>
                  </div>
                </div>
              </div>

              <div className="eu-actions" style={{ justifyContent: "flex-end" }}>
                <button
                  className="eu-btn eu-btn--primary"
                  onClick={save}
                  disabled={busy || !form.name || !form.institution_id || !form.type_id}
                >
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
