import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiPlus, FiRefreshCw, FiEdit2, FiTrash2, FiX, FiChevronDown } from "react-icons/fi";

const emptyForm = { name: "", description: "" };

function normalizeError(e, fallback = "Greška.") {
  const data = e?.response?.data;
  const message = data?.message || fallback;
  const fieldErrors = data?.errors || {};
  return { message, fieldErrors };
}

export default function AdminTypes() {
  const [items, setItems] = useState([]);

  // filters / ui
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("id"); // id | name
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
      width: "min(780px, 96vw)",
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
      const res = await api.get("/api/types");
      setItems(res?.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju tipova.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let arr = [...(items || [])];

    if (s) {
      arr = arr.filter((x) => {
        const name = String(x?.name || "");
        const desc = String(x?.description || "");
        return [name, desc].some((v) => v.toLowerCase().includes(s));
      });
    }

    arr.sort((a, b) => {
      let va = sortBy === "name" ? String(a?.name || "") : Number(a?.id || 0);
      let vb = sortBy === "name" ? String(b?.name || "") : Number(b?.id || 0);

      if (sortBy === "name") {
        const cmp = String(va).localeCompare(String(vb));
        return sortDir === "asc" ? cmp : -cmp;
      }

      const cmp = Number(va) - Number(vb);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return arr;
  }, [items, q, sortBy, sortDir]);

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
    setForm({ name: x?.name || "", description: x?.description || "" });
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
    if (!String(form.name || "").trim()) errs.name = "Naziv je obavezan.";
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
        name: String(form.name || "").trim(),
        description: String(form.description || "").trim() || null,
      };

      if (editing?.id) {
        await api.put(`/api/types/${editing.id}`, payload);
        setOk("Tip je izmenjen.");
      } else {
        await api.post("/api/types", payload);
        setOk("Tip je kreiran.");
      }

      closeModal();
      await load();
    } catch (e) {
      const { message, fieldErrors } = normalizeError(e, "Greška pri čuvanju tipa.");

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
      await api.delete(`/api/types/${toDelete.id}`);
      setOk("Tip je obrisan.");
      closeConfirm();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri brisanju tipa.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="home-page" style={z.page}>
      <NavBar roleLabel="Administrator" />

      <div className="home-wrap" style={z.wrap}>
        <div className="page-head" style={z.head}>
          <div>
            <div className="page-title">Tipovi</div>
            <div className="page-subtitle">Konfiguracija tipova koji se vezuju za servise.</div>
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
              Novi tip
            </button>
          </div>
        </div>

        {error ? <div className="eu-alert eu-alert--err" style={{ position: "relative", zIndex: 90 }}>{error}</div> : null}
        {ok ? <div className="eu-alert eu-alert--info" style={{ position: "relative", zIndex: 90 }}>{ok}</div> : null}

        <div className="eu-filters" style={z.filters}>
          <div className="eu-inputWrap">
            <input
              className="eu-input"
              placeholder="Pretraga (naziv, opis)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              disabled={loading}
              style={{ pointerEvents: "auto" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
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
                </select>
                <FiChevronDown style={{ position: "absolute", right: 10, top: 10, pointerEvents: "none" }} />
              </div>
            </div>
          </div>
        </div>

        {loading ? <div className="eu-empty" style={{ position: "relative", zIndex: 60 }}>Učitavanje…</div> : null}
        {!loading && filtered.length === 0 ? <div className="eu-empty" style={{ position: "relative", zIndex: 60 }}>Nema tipova.</div> : null}

        <div className="eu-table" style={z.table}>
          <div className="eu-tableHead">
            <div>ID</div>
            <div>Naziv</div>
            <div>Opis</div>
            <div>Akcije</div>
          </div>

          {!loading &&
            filtered.map((x) => (
              <div className="eu-tableRow" key={x.id}>
                <div className="eu-mono">#{x.id}</div>
                <div className="eu-strong">{x.name || "—"}</div>
                <div>{x.description || "—"}</div>
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
                <div className="eu-strong">{editing?.id ? "Izmeni tip" : "Novi tip"}</div>
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
                Da li si sigurna da želiš da obrišeš tip <b>{toDelete?.name || "—"}</b> (#{toDelete?.id})?
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
