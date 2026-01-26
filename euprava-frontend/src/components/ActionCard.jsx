import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

export default function ActionCard({ title, desc, Icon, route, buttonText = "Otvori" }) {
  const navigate = useNavigate();

  return (
    <div className="eu-card">
      <div className="eu-card__inner">
        <div className="eu-card__iconWrap">{Icon ? <Icon /> : null}</div>

        <div className="eu-card__body">
          <div className="eu-card__title">{title}</div>
          <div className="eu-card__desc">{desc}</div>

          <div className="eu-card__actions">
            <button
              className="eu-btn eu-btn--primary"
              onClick={() => navigate(route)}
              type="button"
            >
              <span>{buttonText}</span>
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
