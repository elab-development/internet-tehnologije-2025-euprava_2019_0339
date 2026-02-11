import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiPlus, FiRefreshCw, FiEdit2, FiTrash2, FiX, FiChevronDown } from "react-icons/fi";

const emptyForm = { name: "", city: "", address: "", email: "" };

function normalizeError(e, fallback = "Greška.") {
  const data = e?.response?.data;
  const message = data?.message || fallback;
  const fieldErrors = data?.errors || {};
  return { message, fieldErrors };
}

function isValidEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AdminInstitutions() {
  const [items, setItems] = useState([]);

  const [q, setQ] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("id"); // id | name
  const [sortDir, setSortDir] = useState("desc"); // asc | desc

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // -------- INLINE "CLICK FIX" STYLES (z-index + pointer-events) --------
  // Ako neki overlay slučajno hvata klikove, ovo forsira da su dugmad i UI klikabilni.
  const z = {
    page: { position: "relative", zIndex: 1 },
    wrap: { position: "relative", zIndex: 50, pointerEvents: "auto" },
    head: { position: "relative", zIndex: 80, pointerEvents: "auto" },
    filters: { position: "relative", zIndex: 70, pointerEvents: "auto" },
    table: { position: "relative", zIndex: 60, pointerEvents: "auto" },
    btn: { position: "relative", zIndex: 9999, pointerEvents: "auto" },
    rowActions: { position: "relative", zIndex: 9999, pointerEvents: "auto" },
    // modals moraju biti iznad svega
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
      width: "min(720px, 96vw)",
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
      const res = await api.get("/api/institutions");
      setItems(res?.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju institucija.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cities = useMemo(() => {
    const set = new Set();
    (items || []).forEach((x) => {
      const c = String(x?.city || "").trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let arr = [...(items || [])];

    if (cityFilter !== "ALL") {
      arr = arr.filter((x) => String(x?.city || "").trim() === cityFilter);
    }

    if (s) {
      arr = arr.filter((x) => {
        const name = String(x?.name || "");
        const city = String(x?.city || "");
        const address = String(x?.address || "");
        const email = String(x?.email || "");
        return [name, city, address, email].some((v) => v.toLowerCase().includes(s));
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
  }, [items, q, cityFilter, sortBy, sortDir]);

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
      name: x?.name || "",
      city: x?.city || "",
      address: x?.address || "",
      email: x?.email || "",
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
    if (!String(form.name || "").trim()) errs.name = "Naziv je obavezan.";
    if (!String(form.city || "").trim()) errs.city = "Grad je obavezan.";
    if (!String(form.address || "").trim()) errs.address = "Adresa je obavezna.";
    if (!isValidEmail(String(form.email || "").trim())) errs.email = "Email format nije ispravan.";
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
        city: String(form.city || "").trim(),
        address: String(form.address || "").trim(),
        email: String(form.email || "").trim() || null,
      };

      if (editing?.id) {
        await api.put(`/api/institutions/${editing.id}`, payload);
        setOk("Institucija je izmenjena.");
      } else {
        await api.post("/api/institutions", payload);
        setOk("Institucija je kreirana.");
      }

      closeModal();
      await load();
    } catch (e) {
      const { message, fieldErrors } = normalizeError(e, "Greška pri čuvanju institucije.");

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
      await api.delete(`/api/institutions/${toDelete.id}`);
      setOk("Institucija je obrisana.");
      closeConfirm();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri brisanju institucije.");
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
            <div className="page-title">Institucije</div>
            <div className="page-subtitle">Kreiranje, izmena, brisanje i pretraga institucija.</div>
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
              Nova institucija
            </button>
          </div>
        </div>

        {error ? <div className="eu-alert eu-alert--err" style={{ position: "relative", zIndex: 90 }}>{error}</div> : null}
        {ok ? <div className="eu-alert eu-alert--info" style={{ position: "relative", zIndex: 90 }}>{ok}</div> : null}

        <div className="eu-filters" style={z.filters}>
          <div className="eu-inputWrap">
            <input
              className="eu-input"
              placeholder="Pretraga (naziv, grad, adresa, email)…"
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
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  disabled={loading}
                  style={{ appearance: "none", paddingRight: 34, pointerEvents: "auto" }}
                >
                  <option value="ALL">Svi gradovi</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
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
        {!loading && filtered.length === 0 ? <div className="eu-empty" style={{ position: "relative", zIndex: 60 }}>Nema institucija.</div> : null}

        <div className="eu-table" style={z.table}>
          <div className="eu-tableHead">
            <div>ID</div>
            <div>Naziv</div>
            <div>Grad</div>
            <div>Adresa</div>
            <div>Email</div>
            <div>Akcije</div>
          </div>

          {!loading &&
            filtered.map((x) => (
              <div className="eu-tableRow" key={x.id}>
                <div className="eu-mono">#{x.id}</div>
                <div className="eu-strong">{x.name || "—"}</div>
                <div>{x.city || "—"}</div>
                <div>{x.address || "—"}</div>
                <div className="eu-mono">{x.email || "—"}</div>
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
              <div className="eu-modalHead" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16 }}>
                <div className="eu-strong">{editing?.id ? "Izmeni instituciju" : "Nova institucija"}</div>
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

                <div className="eu-field">
                  <label>Grad *</label>
                  <input
                    className="eu-inputLine"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    disabled={saving}
                    style={{ width: "100%" }}
                  />
                  {formErrors.city ? <div style={{ marginTop: 6, color: "#b00020" }}>{formErrors.city}</div> : null}
                </div>

                <div className="eu-field">
                  <label>Adresa *</label>
                  <input
                    className="eu-inputLine"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    disabled={saving}
                    style={{ width: "100%" }}
                  />
                  {formErrors.address ? <div style={{ marginTop: 6, color: "#b00020" }}>{formErrors.address}</div> : null}
                </div>

                <div className="eu-field">
                  <label>Email</label>
                  <input
                    className="eu-inputLine"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    disabled={saving}
                    placeholder="npr. pisarnica@institucija.rs"
                    style={{ width: "100%" }}
                  />
                  {formErrors.email ? <div style={{ marginTop: 6, color: "#b00020" }}>{formErrors.email}</div> : null}
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
              <div className="eu-modalHead" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16 }}>
                <div className="eu-strong">Potvrda brisanja</div>
                <button type="button" className="eu-btn eu-btn--ghost" style={z.btn} onClick={closeConfirm} disabled={deletingId !== null}>
                  <FiX />
                  Zatvori
                </button>
              </div>

              <div style={{ padding: 16 }}>
                Da li si sigurna da želiš da obrišeš instituciju <b>{toDelete?.name || "—"}</b> (#{toDelete?.id})?
                <div style={{ marginTop: 6, opacity: 0.8 }}>Ova akcija je nepovratna.</div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: 16 }}>
                <button type="button" className="eu-btn eu-btn--ghost" style={z.btn} onClick={closeConfirm} disabled={deletingId !== null}>
                  Otkaži
                </button>
                <button type="button" className="eu-btn eu-btn--danger" style={z.btn} onClick={remove} disabled={deletingId !== null}>
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
