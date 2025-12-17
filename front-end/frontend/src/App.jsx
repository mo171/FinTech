import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserContextProvider from "./context/UserContext";

function App() {
  return (
    <UserContextProvider>
      <BrowserRouter>
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-main)" }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserContextProvider>
  );
}

export default App;
