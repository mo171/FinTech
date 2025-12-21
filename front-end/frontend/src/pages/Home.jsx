import { Shield, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const Home = () => {
  const navigate = useNavigate();
  const { user, setUser, loading } = useContext(UserContext);

  return (
    <div style={{ padding: "4rem 0" }}>
      {/* Hero Section */}
      <div
        className="container"
        style={{ textAlign: "center", marginBottom: "5rem" }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: 800,
            marginBottom: "1rem",
            color: "var(--primary)",
            lineHeight: 1.2,
          }}
        >
          Welcome to Fintech Solutions
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "var(--text-muted)",
            marginBottom: "2.5rem",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Secure and streamlined Know Your Customer verification platform
        </p>
        {loading ? (
            <span className="text-xs text-text-muted">Loading...</span>
          ) : user ? (
            <>
             <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/register")}
          >
            Chat with AI Compliance
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/login")}
          >
            Your KYC
          </button>
        </div>
            
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        </div>
            </>
          )}
        
      </div>

      {/* Features Section */}
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        <FeatureCard
          icon={<Shield size={32} />}
          title="Secure Verification"
          description="Bank-grade security for your personal information"
        />
        <FeatureCard
          icon={<Clock size={32} />}
          title="Fast Processing"
          description="Get verified in minutes, not days"
        />
        <FeatureCard
          icon={<CheckCircle size={32} />}
          title="Easy Compliance"
          description="Simple process that meets regulatory requirements"
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div
    style={{
      padding: "2.5rem",
      borderRadius: "12px",
      border: "1px solid var(--border)",
      textAlign: "center",
      transition: "transform 0.2s",
      cursor: "default",
    }}
  >
    <div
      style={{
        marginBottom: "1.5rem",
        color: "var(--primary)",
        display: "inline-flex",
        padding: "1rem",
        borderRadius: "50%",
        // backgroundColor: 'var(--secondary)' // Optional: add subtle bg to icon
      }}
    >
      {icon}
    </div>
    <h3
      style={{
        fontSize: "1.25rem",
        fontWeight: 600,
        marginBottom: "1rem",
        color: "var(--text-main)",
      }}
    >
      {title}
    </h3>
    <p
      style={{
        color: "var(--text-muted)",
        lineHeight: 1.6,
      }}
    >
      {description}
    </p>
  </div>
);

export default Home;