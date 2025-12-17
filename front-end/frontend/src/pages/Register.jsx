import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createClient } from "../utils/supabase";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { setUser } = useContext(UserContext);

  const handleSignUp = async (e) => {
    const supabase = createClient();
    e.preventDefault();
    setError(null);
    setUser({ name, email });

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    setTimeout(() => {
      navigate("/");
    }, 2000);

    return (
      <div className="container flex min-h-[calc(100vh-80px)] items-center justify-center py-8">
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            padding: "2.5rem",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            width: "100%",
            maxWidth: "500px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "var(--primary)",
            }}
          >
            Success!
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Registration successful. Redirecting you to home...
          </p>
          <Link
            to="/"
            className="btn btn-primary"
            style={{ display: "inline-block" }}
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

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
            Register
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Create your Fintech KYC account
          </p>
        </div>

        <form
          onSubmit={handleSignUp}
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="........"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="........"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
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
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "var(--primary)", fontWeight: 600 }}
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
