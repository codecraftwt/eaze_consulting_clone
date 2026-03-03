import { useState } from "react";
import eazeLogo from "../assets/eaze-logo.png";

const ACCESS_CODE = "56789";
const SESSION_KEY = "eaze_access_granted";

export default function AccessGate({ children }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [granted, setGranted] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true"
  );

  if (granted) return children;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim() === ACCESS_CODE) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setGranted(true);
      setError("");
    } else {
      setError("Invalid access code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex flex-col items-center mb-8">
            <img
              src={eazeLogo}
              alt="EAZE Consulting"
              className="h-10 mb-4 object-contain"
            />
            <p className="text-sm text-slate-500 text-center">
              Enter the access code to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Access Code"
                autoFocus
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-center text-lg tracking-widest placeholder:tracking-normal placeholder:text-sm"
              />
              {error && (
                <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Continue
            </button>
          </form>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          Restricted access — authorized personnel only
        </p>
      </div>
    </div>
  );
}
