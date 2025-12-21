import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { Input } from "../components/ui/input";
import { createClient } from "../utils/supabase";
import { UserContext } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser({
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email,
        });
      }

      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="container flex-center"
      style={{ minHeight: "calc(100vh - 80px)", padding: "2rem 0" }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          padding: "2.5rem",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Welcome Back
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Sign in to your Fintech KYC account
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div className="grid gap-2">
            <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>Email</span>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
              Password
            </span>
            <Input
              type="password"
              placeholder="........"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            color: "var(--text-muted)",
            fontSize: "0.9rem",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "var(--primary)", fontWeight: 600 }}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;