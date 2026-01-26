import { useMemo } from "react";
import { FiUsers, FiHome, FiTag, FiTool, FiFileText, FiBarChart2 } from "react-icons/fi";

import NavBar from "../components/NavBar";
import ActionCard from "../components/ActionCard";

export default function AdminHome() {
  const cards = useMemo(
    () => [
      { title: "Korisnici", desc: "Upravljanje korisnicima i ulogama.", Icon: FiUsers, route: "/admin/users", buttonText: "Otvori korisnike" },
      { title: "Institucije", desc: "Kreiranje i izmena institucija.", Icon: FiHome, route: "/admin/institutions", buttonText: "Institucije" },
      { title: "Tipovi (Type)", desc: "Konfiguracija tipova koji se vezuju za servise.", Icon: FiTag, route: "/admin/types", buttonText: "Upravljaj tipovima" },
      { title: "Servisi", desc: "Kreiranje i izmena servisa.", Icon: FiTool, route: "/admin/services", buttonText: "Upravljaj servisima" },
      { title: "Dokumenta", desc: "Pregled i rad sa dokumentima.", Icon: FiFileText, route: "/admin/documents", buttonText: "Dokumenta" },
      { title: "Statistika", desc: "Pregled metrika i performansi.", Icon: FiBarChart2, route: "/admin/stats", buttonText: "Statistika" },
    ],
    []
  );

  return (
    <div className="home-page">
      <NavBar roleLabel="Administrator" />

      <div className="home-wrap">
        <div className="home-hero">
          <div className="home-hero__title">Administracija</div>
          <div className="home-subtitle">Konfiguracija sistema i pregled ključnih oblasti.</div>
        </div>

        <div className="home-grid">
          {cards.map((c) => (
            <ActionCard key={c.title} title={c.title} desc={c.desc} Icon={c.Icon} route={c.route} buttonText={c.buttonText} />
          ))}
        </div>
      </div>
    </div>
  );
}
