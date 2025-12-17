import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { createClient } from "../utils/supabase";
import { UserContext } from "../context/UserContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/login");
  };

  return (
    <nav
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "1rem 0",
        backgroundColor: "white",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--primary)",
            letterSpacing: "-0.5px",
          }}
        >
          Fintech KYC
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <Link to="/" style={{ color: "var(--text-muted)", fontWeight: 500 }}>
            Home
          </Link>
          {user ? (
            <>
              <Link
                to="/kyc"
                style={{ color: "var(--text-muted)", fontWeight: 500 }}
              >
                Your KYC
              </Link>
              <button
                className="btn btn-outline"
                onClick={handleLogout}
                style={{ cursor: "pointer" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{ color: "var(--text-muted)", fontWeight: 500 }}
              >
                Login
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
