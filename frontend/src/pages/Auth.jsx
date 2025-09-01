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
      console.log("Login response:", res.data);

      // Save token in localStorage
      localStorage.setItem("token", res.data.token);

      alert("Login successful!");
      navigate("/dashboard"); // Redirect to dashboard
    } else {
      if (form.password !== form.confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      const res = await signupUser({ name: form.name, email: form.email, password: form.password });
      console.log("Signup response:", res.data);
      alert("Signup successful!");
      setIsLogin(true);
    }
  } catch (err) {
    console.error("Full error:", err);
    console.error("Response:", err.response);
    alert(err.response?.data?.message || err.message || "Error occurred");
  }
};


  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?technology')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative bg-white bg-opacity-90 p-8 rounded shadow-md w-96 z-10">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full p-2 border rounded"
              value={form.name}
              onChange={handleChange}
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={form.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            value={form.password}
            onChange={handleChange}
          />
          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full p-2 border rounded"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded mt-2 hover:bg-blue-600 transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-gray-700 mt-4 text-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
