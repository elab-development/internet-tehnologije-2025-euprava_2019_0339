import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiLogOut, FiUser } from "react-icons/fi";
import api from "../api/axios";

function readUser() {
  const raw = sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getHomePathByRole(role) {
  const r = String(role || "").toUpperCase();
  if (r === "OFFICER") return "/officer/home";
  if (r === "CITIZEN") return "/citizen/home";
  if (r === "ADMIN") return "/admin/home";
  return "/auth";
}

export default function NavBar({ roleLabel = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => readUser());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sync = () => setUser(readUser());
    window.addEventListener("storage", sync);
    window.addEventListener("eu:session", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("eu:session", sync);
    };
  }, []);

  useEffect(() => {
    setUser(readUser());
  }, [location.pathname]);

  const userName = user?.name || "Korisnik";
  const userEmail = user?.email || "";
  const userRole = String(user?.role || "guest").toUpperCase();

  const onLogoClick = () => {
    const home = getHomePathByRole(user?.role);
    navigate(home);
  };

  const onLogout = async () => {
    setBusy(true);
    try {
      await api.post("/api/auth/logout");
    } catch {
      // čak i ako backend ne uspe, čistimo lokalnu sesiju.
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.dispatchEvent(new Event("eu:session"));
      navigate("/auth", { replace: true });
      setBusy(false);
    }
  };

  return (
    <header className="eu-navbar">
      <div className="eu-navbar__inner">
        <div className="eu-navbar__left">
          <img
            className="eu-navbar__logo"
            src="/assets/logo.png"
            alt="Euprava"
            onClick={onLogoClick}
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onLogoClick();
            }}
          />
          <div className="eu-navbar__titleBlock">
            <div className="eu-navbar__role">{roleLabel}</div>
          </div>
        </div>

        <div className="eu-navbar__right">
          <div className="eu-navbar__user">
            <div className="eu-navbar__userIcon">
              <FiUser />
            </div>
            <div className="eu-navbar__userText">
              <div className="eu-navbar__userName">{userName}</div>
              <div className="eu-navbar__userMeta">
                {userEmail ? userEmail : "—"} · {userRole}
              </div>
            </div>
          </div>

          <button className="eu-btn eu-btn--danger" onClick={onLogout} type="button" disabled={busy}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
