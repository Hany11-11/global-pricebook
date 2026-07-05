import { NavLink } from "react-router-dom";
import "../../styles/sidebar.css";

const NAV_ITEMS = [
  { to: "/", label: "Calculator", icon: "◇" },
  { to: "/regions", label: "Regions", icon: "◈" },
  { to: "/countries", label: "Countries", icon: "◉" },
  { to: "/pricebooks", label: "Pricebooks", icon: "▤" },
  { to: "/terms", label: "Terms & Conditions", icon: "☰" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>
          Teceze Global
          <br />
          Pricebook
        </h2>
        <span>Price Management System</span>
      </div>
      <ul className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
