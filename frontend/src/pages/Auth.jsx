import { useState } from "react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?technology')" }}
    >
      {/* Optional overlay for better contrast */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Form container */}
      <div className="relative bg-white bg-opacity-90 p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <form className="flex flex-col gap-3">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-2 border rounded"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-2 border rounded"
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
