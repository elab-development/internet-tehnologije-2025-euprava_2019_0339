import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogIn, FiUserPlus, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

import api from "../api/axios";
import Slider from "../components/Slider";
import "../App.css";

function normalizeRole(role) {
  return String(role || "").toUpperCase().replace("ROLE_", "").trim();
}

function getHomeByRole(role) {
  const r = normalizeRole(role);
  if (r === "ADMIN") return "/admin/home";
  if (r === "OFFICER") return "/officer/home";
  return "/citizen/home";
}

export default function Auth() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regJmbg, setRegJmbg] = useState("");

  const images = useMemo(
    () => [
      "/assets/carousel1.jpg",
      "/assets/carousel2.jpg",
      "/assets/carousel3.jpg",
      "/assets/carousel4.jpg",
      "/assets/carousel5.jpg",
      "/assets/carousel6.jpg",
    ],
    []
  );

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    setBusy(true);

    try {
      const payload = {
        name: regName,
        email: regEmail,
        password: regPassword,
        date_of_birth: regDob,
        jmbg: regJmbg,
      };

      const res = await api.post("/api/auth/register", payload);

      if (!res?.data?.user) {
        setError(res?.data?.message || "Registracija nije uspela.");
        return;
      }

      // prebaci na login i popuni email
      setLoginEmail(regEmail);
      setLoginPassword("");
      setActiveTab("login");
      setSuccess(res?.data?.message || "Nalog je uspešno kreiran. Prijavite se.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.errors?.password?.[0] ||
        err?.response?.data?.errors?.date_of_birth?.[0] ||
        err?.response?.data?.errors?.jmbg?.[0] ||
        "Greška pri registraciji.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    setSuccess("");
    setBusy(true);

    try {
      const payload = { email: loginEmail, password: loginPassword };
      const res = await api.post("/api/auth/login", payload);

      const token = res?.data?.token;
      const user = res?.data?.user;

      if (!token || !user) {
        setError(res?.data?.message || "Prijava nije uspela.");
        return;
      }

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      // da App rerenderuje odmah (bez refresh)
      window.dispatchEvent(new Event("eu:session"));

      navigate(getHomeByRole(user?.role), { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.auth?.[0] ||
        "Greška pri prijavi.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Slider images={images} logoSrc="/assets/logo.png" height={640} />
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card__header">
            <div className="auth-titleRow">
              <img className="auth-logo" src="/assets/logo.png" alt="Euprava" />
              <div>
                <div className="auth-subtitle">Prijavi se ili napravi nalog.</div>
              </div>
            </div>
          </div>

          {success ? (
            <div className="auth-banner auth-banner--ok">
              <FiCheckCircle />
              <span>{success}</span>
            </div>
          ) : null}

          {error ? (
            <div className="auth-banner auth-banner--err">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="auth-tabsRow">
            <button
              className={`auth-tab ${activeTab === "login" ? "is-active" : ""}`}
              onClick={() => {
                setError("");
                setSuccess("");
                setActiveTab("login");
              }}
              type="button"
            >
              <FiLogIn /> Login
            </button>

            <button
              className={`auth-tab ${activeTab === "register" ? "is-active" : ""}`}
              onClick={() => {
                setError("");
                setSuccess("");
                setActiveTab("register");
              }}
              type="button"
            >
              <FiUserPlus /> Register
            </button>
          </div>

          {activeTab === "login" ? (
            <div className="auth-form">
              <div className="field">
                <label htmlFor="loginEmail">Email</label>
                <input
                  id="loginEmail"
                  type="email"
                  value={loginEmail}
                  placeholder="npr. ana@gmail.com"
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="loginPass">Lozinka</label>
                <input
                  id="loginPass"
                  type="password"
                  value={loginPassword}
                  placeholder="Unesi lozinku"
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <div className="actions">
                <button className="eu-btn eu-btn--primary" onClick={handleLogin} disabled={busy} type="button">
                  {busy ? "Prijavljivanje..." : "Login"}
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-form">
              <div className="field">
                <label htmlFor="regName">Ime i prezime</label>
                <input
                  id="regName"
                  value={regName}
                  placeholder="Unesi ime i prezime"
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="regEmail">Email</label>
                <input
                  id="regEmail"
                  type="email"
                  value={regEmail}
                  placeholder="npr. ana@gmail.com"
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="regDob">Datum rođenja</label>
                <input
                  id="regDob"
                  type="date"
                  value={regDob}
                  onChange={(e) => setRegDob(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="regJmbg">JMBG</label>
                <input
                  id="regJmbg"
                  value={regJmbg}
                  placeholder="13 cifara"
                  onChange={(e) => setRegJmbg(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="regPass">Lozinka</label>
                <input
                  id="regPass"
                  type="password"
                  value={regPassword}
                  placeholder="Unesi lozinku"
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <div className="actions">
                <button className="eu-btn eu-btn--primary" onClick={handleRegister} disabled={busy} type="button">
                  {busy ? "Kreiranje naloga..." : "Register"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
