import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiPlus, FiRefreshCw, FiEdit2, FiTrash2, FiX, FiChevronDown } from "react-icons/fi";

const emptyForm = {
  institution_id: "",
  type_id: "",
  name: "",
  description: "",
  fee: "",
  requires_attachment: false,
  status: "ACTIVE",
};

function normalizeError(e, fallback = "Greška.") {
  const data = e?.response?.data;
  const message = data?.message || fallback;
  const fieldErrors = data?.errors || {};
  return { message, fieldErrors };
}

function isMoneyLike(v) {
  if (v === "" || v === null || v === undefined) return true;
  return /^\d+(\.\d{1,2})?$/.test(String(v).trim());
}

export default function AdminServices() {
  const [items, setItems] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [types, setTypes] = useState([]);

  // filters/sort
  const [q, setQ] = useState("");
  const [instFilter, setInstFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("id"); // id | name | fee
  const [sortDir, setSortDir] = useState("desc"); // asc | desc

  // async states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // notifications
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  // delete confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // -------- INLINE "CLICK FIX" STYLES (z-index + pointer-events) --------
  const z = {
    page: { position: "relative", zIndex: 1 },
    wrap: { position: "relative", zIndex: 50, pointerEvents: "auto" },
    head: { position: "relative", zIndex: 80, pointerEvents: "auto" },
    filters: { position: "relative", zIndex: 70, pointerEvents: "auto" },
    table: { position: "relative", zIndex: 60, pointerEvents: "auto" },
    btn: { position: "relative", zIndex: 9999, pointerEvents: "auto" },
    rowActions: { position: "relative", zIndex: 9999, pointerEvents: "auto" },
    modalOverlay: {
      position: "fixed",
      inset: 0,
      zIndex: 20000,
      pointerEvents: "auto",
      background: "rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    modal: {
      width: "min(920px, 96vw)",
      maxHeight: "92vh",
      overflow: "auto",
      borderRadius: 16,
      background: "#fff",
      boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
      pointerEvents: "auto",
      position: "relative",
      zIndex: 20001,
    },
  };

  const load = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const instOptions = useMemo(() => {
    return [...(institutions || [])].sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
  }, [institutions]);

  const typeOptions = useMemo(() => {
    return [...(types || [])].sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
  }, [types]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let arr = [...(items || [])];

    if (instFilter !== "ALL") {
      arr = arr.filter((x) => String(x?.institution_id || x?.institution?.id || "") === String(instFilter));
    }
    if (typeFilter !== "ALL") {
      arr = arr.filter((x) => String(x?.type_id || x?.type?.id || "") === String(typeFilter));
    }
    if (statusFilter !== "ALL") {
      arr = arr.filter((x) => String(x?.status || "").toUpperCase() === String(statusFilter).toUpperCase());
    }

    if (s) {
      arr = arr.filter((x) => {
        const name = String(x?.name || "");
        const inst = String(x?.institution?.name || "");
        const type = String(x?.type?.name || "");
        const status = String(x?.status || "");
        return [name, inst, type, status].some((v) => v.toLowerCase().includes(s));
      });
    }

    arr.sort((a, b) => {
      if (sortBy === "name") {
        const cmp = String(a?.name || "").localeCompare(String(b?.name || ""));
        return sortDir === "asc" ? cmp : -cmp;
      }
      if (sortBy === "fee") {
        const fa = Number(a?.fee ?? 0);
        const fb = Number(b?.fee ?? 0);
        const cmp = fa - fb;
        return sortDir === "asc" ? cmp : -cmp;
      }
      // id
      const ia = Number(a?.id || 0);
      const ib = Number(b?.id || 0);
      const cmp = ia - ib;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return arr;
  }, [items, q, instFilter, typeFilter, statusFilter, sortBy, sortDir]);

  const openCreate = () => {
    setError("");
    setOk("");
    setFormErrors({});
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (x) => {
    setError("");
    setOk("");
    setFormErrors({});
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
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
  };

  const validateForm = () => {
    const errs = {};
    if (!String(form.institution_id || "").trim()) errs.institution_id = "Institucija je obavezna.";
    if (!String(form.type_id || "").trim()) errs.type_id = "Tip je obavezan.";
    if (!String(form.name || "").trim()) errs.name = "Naziv je obavezan.";
    if (!isMoneyLike(form.fee)) errs.fee = "Fee mora biti broj (npr. 500 ili 500.00).";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = async () => {
    setError("");
    setOk("");
    setFormErrors({});

    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        institution_id: form.institution_id ? Number(form.institution_id) : null,
        type_id: form.type_id ? Number(form.type_id) : null,
        name: String(form.name || "").trim() || null,
        description: String(form.description || "").trim() || null,
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
      const { message, fieldErrors } = normalizeError(e, "Greška pri čuvanju servisa.");

      const mapped = {};
      Object.keys(fieldErrors || {}).forEach((k) => {
        const first = Array.isArray(fieldErrors[k]) ? fieldErrors[k][0] : String(fieldErrors[k]);
        mapped[k] = first;
      });

      setError(message);
      setFormErrors(mapped);
    } finally {
      setSaving(false);
    }
  };

  const askRemove = (x) => {
    setError("");
    setOk("");
    setToDelete(x);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (deletingId) return;
    setConfirmOpen(false);
    setToDelete(null);
  };

  const remove = async () => {
    if (!toDelete?.id) return;

    setDeletingId(toDelete.id);
    setError("");
    setOk("");

    try {
      await api.delete(`/api/services/${toDelete.id}`);
      setOk("Servis je obrisan.");
      closeConfirm();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri brisanju servisa.");
    } finally {
      setDeletingId(null);
    }
  };

  const instNameById = useMemo(() => {
    const map = new Map();
    (institutions || []).forEach((i) => map.set(String(i.id), i.name));
    return map;
  }, [institutions]);

  const typeNameById = useMemo(() => {
    const map = new Map();
    (types || []).forEach((t) => map.set(String(t.id), t.name));
    return map;
  }, [types]);

  return (
    <div className="home-page" style={z.page}>
      <NavBar roleLabel="Administrator" />

      <div className="home-wrap" style={z.wrap}>
        <div className="page-head" style={z.head}>
          <div>
            <div className="page-title">Servisi</div>
            <div className="page-subtitle">Kreiranje, izmena, brisanje i filtriranje servisa.</div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="eu-btn eu-btn--ghost"
              style={z.btn}
              onClick={(e) => {
                e.preventDefault();
                load();
              }}
              disabled={loading || saving || deletingId !== null}
            >
              <FiRefreshCw />
              Osveži
            </button>

            <button
              type="button"
              className="eu-btn eu-btn--primary"
              style={z.btn}
              onClick={(e) => {
                e.preventDefault();
                openCreate();
              }}
              disabled={loading || saving || deletingId !== null}
            >
              <FiPlus />
              Novi servis
            </button>
          </div>
        </div>

        {error ? <div className="eu-alert eu-alert--err" style={{ position: "relative", zIndex: 90 }}>{error}</div> : null}
        {ok ? <div className="eu-alert eu-alert--info" style={{ position: "relative", zIndex: 90 }}>{ok}</div> : null}

        <div className="eu-filters" style={z.filters}>
          <div className="eu-inputWrap">
            <input
              className="eu-input"
              placeholder="Pretraga (naziv, institucija, tip, status)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              disabled={loading}
              style={{ pointerEvents: "auto" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <div className="eu-inputWrap" style={{ minWidth: 240 }}>
              <div style={{ position: "relative" }}>
                <select
                  className="eu-input"
                  value={instFilter}
                  onChange={(e) => setInstFilter(e.target.value)}
                  disabled={loading}
                  style={{ appearance: "none", paddingRight: 34, pointerEvents: "auto" }}
                >
                  <option value="ALL">Sve institucije</option>
                  {instOptions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
                <FiChevronDown style={{ position: "absolute", right: 10, top: 10, pointerEvents: "none" }} />
              </div>
            </div>

            <div className="eu-inputWrap" style={{ minWidth: 220 }}>
              <div style={{ position: "relative" }}>
                <select
                  className="eu-input"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  disabled={loading}
                  style={{ appearance: "none", paddingRight: 34, pointerEvents: "auto" }}
                >
                  <option value="ALL">Svi tipovi</option>
                  {typeOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <FiChevronDown style={{ position: "absolute", right: 10, top: 10, pointerEvents: "none" }} />
              </div>
            </div>

            <div className="eu-inputWrap" style={{ minWidth: 190 }}>
              <div style={{ position: "relative" }}>
                <select
                  className="eu-input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  disabled={loading}
                  style={{ appearance: "none", paddingRight: 34, pointerEvents: "auto" }}
                >
                  <option value="ALL">Svi statusi</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
                <FiChevronDown style={{ position: "absolute", right: 10, top: 10, pointerEvents: "none" }} />
              </div>
            </div>

            <div className="eu-inputWrap" style={{ minWidth: 220 }}>
              <div style={{ position: "relative" }}>
                <select
                  className="eu-input"
                  value={`${sortBy}:${sortDir}`}
                  onChange={(e) => {
                    const [sb, sd] = e.target.value.split(":");
                    setSortBy(sb);
                    setSortDir(sd);
                  }}
                  disabled={loading}
                  style={{ appearance: "none", paddingRight: 34, pointerEvents: "auto" }}
                >
                  <option value="id:desc">Sort: ID (↓)</option>
                  <option value="id:asc">Sort: ID (↑)</option>
                  <option value="name:asc">Sort: Naziv (A–Z)</option>
                  <option value="name:desc">Sort: Naziv (Z–A)</option>
                  <option value="fee:asc">Sort: Fee (↑)</option>
                  <option value="fee:desc">Sort: Fee (↓)</option>
                </select>
                <FiChevronDown style={{ position: "absolute", right: 10, top: 10, pointerEvents: "none" }} />
              </div>
            </div>
          </div>
        </div>

        {loading ? <div className="eu-empty" style={{ position: "relative", zIndex: 60 }}>Učitavanje…</div> : null}
        {!loading && filtered.length === 0 ? <div className="eu-empty" style={{ position: "relative", zIndex: 60 }}>Nema servisa.</div> : null}

        <div className="eu-table" style={z.table}>
          <div className="eu-tableHead">
            <div>ID</div>
            <div>Naziv</div>
            <div>Institucija</div>
            <div>Tip</div>
            <div>Fee</div>
            <div>Prilog</div>
            <div>Status</div>
            <div>Akcije</div>
          </div>

          {!loading &&
            filtered.map((x) => (
              <div className="eu-tableRow" key={x.id}>
                <div className="eu-mono">#{x.id}</div>
                <div className="eu-strong">{x.name || "—"}</div>
                <div>{x?.institution?.name || instNameById.get(String(x?.institution_id || "")) || "—"}</div>
                <div>{x?.type?.name || typeNameById.get(String(x?.type_id || "")) || "—"}</div>
                <div className="eu-mono">{x?.fee ?? "—"}</div>
                <div>
                  <span className="eu-badge eu-badge--ghost">{x?.requires_attachment ? "DA" : "NE"}</span>
                </div>
                <div>
                  <span className="eu-badge eu-badge--ghost">{x.status || "—"}</span>
                </div>

                <div className="eu-rowActions" style={z.rowActions}>
                  <button
                    type="button"
                    className="eu-btn eu-btn--ghost"
                    style={z.btn}
                    onClick={(e) => {
                      e.preventDefault();
                      openEdit(x);
                    }}
                    disabled={saving || deletingId !== null}
                  >
                    <FiEdit2 />
                    Izmeni
                  </button>

                  <button
                    type="button"
                    className="eu-btn eu-btn--danger"
                    style={z.btn}
                    onClick={(e) => {
                      e.preventDefault();
                      askRemove(x);
                    }}
                    disabled={saving || deletingId !== null}
                  >
                    <FiTrash2 />
                    Obriši
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* CREATE/EDIT MODAL */}
        {modalOpen ? (
          <div style={z.modalOverlay} role="dialog" aria-modal="true">
            <div className="eu-modal" style={z.modal}>
              <div
                className="eu-modalHead"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16 }}
              >
                <div className="eu-strong">{editing?.id ? "Izmeni servis" : "Novi servis"}</div>
                <button
                  type="button"
                  className="eu-btn eu-btn--ghost"
                  style={z.btn}
                  onClick={(e) => {
                    e.preventDefault();
                    closeModal();
                  }}
                  disabled={saving}
                >
                  <FiX />
                  Zatvori
                </button>
              </div>

              <div className="eu-formGrid" style={{ padding: 16, display: "grid", gap: 12 }}>
                <div className="eu-field">
                  <label>Institucija *</label>
                  <div style={{ position: "relative" }}>
                    <select
                      className="eu-input"
                      value={form.institution_id}
                      onChange={(e) => setForm((p) => ({ ...p, institution_id: e.target.value }))}
                      disabled={saving}
                      style={{ appearance: "none", paddingRight: 34, pointerEvents: "auto", width: "100%" }}
                    >
                      <option value="">Izaberi instituciju…</option>
                      {instOptions.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown style={{ position: "absolute", right: 10, top: 10, pointerEvents: "none" }} />
                  </div>
                  {formErrors.institution_id ? (
                    <div style={{ marginTop: 6, color: "#b00020" }}>{formErrors.institution_id}</div>
                  ) : null}
                </div>

                <div className="eu-field">
                  <label>Tip *</label>
                  <div style={{ position: "relative" }}>
                    <select
                      className="eu-input"
                      value={form.type_id}
                      onChange={(e) => setForm((p) => ({ ...p, type_id: e.target.value }))}
                      disabled={saving}
                      style={{ appearance: "none", paddingRight: 34, pointerEvents: "auto", width: "100%" }}
                    >
                      <option value="">Izaberi tip…</option>
                      {typeOptions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown style={{ position: "absolute", right: 10, top: 10, pointerEvents: "none" }} />
                  </div>
                  {formErrors.type_id ? <div style={{ marginTop: 6, color: "#b00020" }}>{formErrors.type_id}</div> : null}
                </div>

                <div className="eu-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Naziv *</label>
                  <input
                    className="eu-inputLine"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    disabled={saving}
                    style={{ width: "100%" }}
                  />
                  {formErrors.name ? <div style={{ marginTop: 6, color: "#b00020" }}>{formErrors.name}</div> : null}
                </div>

                <div className="eu-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Opis</label>
                  <textarea
                    className="eu-textarea"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    disabled={saving}
                    style={{ width: "100%" }}
                  />
                </div>

                <div className="eu-field">
                  <label>Naknada (fee)</label>
                  <input
                    className="eu-inputLine"
                    value={form.fee}
                    onChange={(e) => setForm((p) => ({ ...p, fee: e.target.value }))}
                    placeholder="npr. 500.00"
                    disabled={saving}
                    style={{ width: "100%" }}
                  />
                  {formErrors.fee ? <div style={{ marginTop: 6, color: "#b00020" }}>{formErrors.fee}</div> : null}
                </div>

                <div className="eu-field">
                  <label>Status</label>
                  <div style={{ position: "relative" }}>
                    <select
                      className="eu-input"
                      value={form.status}
                      onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                      disabled={saving}
                      style={{ appearance: "none", paddingRight: 34, pointerEvents: "auto", width: "100%" }}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                    <FiChevronDown style={{ position: "absolute", right: 10, top: 10, pointerEvents: "none" }} />
                  </div>
                </div>

                <div className="eu-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Prilog obavezan</label>
                  <div className="eu-checkRow" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(form.requires_attachment)}
                      onChange={(e) => setForm((p) => ({ ...p, requires_attachment: e.target.checked }))}
                      disabled={saving}
                      style={{ pointerEvents: "auto" }}
                    />
                    <span className="eu-muted">Ako je uključeno, građanin mora dodati prilog.</span>
                  </div>
                </div>
              </div>

              <div className="eu-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: 16 }}>
                <button type="button" className="eu-btn eu-btn--ghost" style={z.btn} onClick={closeModal} disabled={saving}>
                  Otkaži
                </button>

                <button type="button" className="eu-btn eu-btn--primary" style={z.btn} onClick={save} disabled={saving}>
                  {saving ? "Čuvanje…" : "Sačuvaj"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* DELETE CONFIRM MODAL */}
        {confirmOpen ? (
          <div style={z.modalOverlay} role="dialog" aria-modal="true">
            <div className="eu-modal" style={z.modal}>
              <div
                className="eu-modalHead"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16 }}
              >
                <div className="eu-strong">Potvrda brisanja</div>
                <button
                  type="button"
                  className="eu-btn eu-btn--ghost"
                  style={z.btn}
                  onClick={(e) => {
                    e.preventDefault();
                    closeConfirm();
                  }}
                  disabled={deletingId !== null}
                >
                  <FiX />
                  Zatvori
                </button>
              </div>

              <div style={{ padding: 16 }}>
                Da li si sigurna da želiš da obrišeš servis <b>{toDelete?.name || "—"}</b> (#{toDelete?.id})?
                <div style={{ marginTop: 6, opacity: 0.8 }}>Ova akcija je nepovratna.</div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: 16 }}>
                <button
                  type="button"
                  className="eu-btn eu-btn--ghost"
                  style={z.btn}
                  onClick={closeConfirm}
                  disabled={deletingId !== null}
                >
                  Otkaži
                </button>

                <button
                  type="button"
                  className="eu-btn eu-btn--danger"
                  style={z.btn}
                  onClick={remove}
                  disabled={deletingId !== null}
                >
                  {deletingId ? "Brisanje…" : "Obriši"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
