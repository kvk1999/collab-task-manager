import { useState } from "react";
import { loginUser, signupUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await loginUser({ email: form.email, password: form.password });
        localStorage.setItem("token", res.data.token);
        alert("Login successful!");
        navigate("/dashboard");
      } else {
        if (form.password !== form.confirmPassword) {
          alert("Passwords do not match");
          return;
        }
        await signupUser({ name: form.name, email: form.email, password: form.password });
        alert("Signup successful!");
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Error occurred");
    }
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center relative bg-gray-900"
      style={{
        backgroundImage: "url('https://source.unsplash.com/1600x900/?technology,abstract')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Form container */}
      <div className="relative bg-white/90 p-8 rounded-xl shadow-xl w-full max-w-md z-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.password}
            onChange={handleChange}
            required
          />
          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-gray-700 mt-4 text-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline font-medium"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
