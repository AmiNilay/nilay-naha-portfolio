"use client";

import { useState, useRef } from "react";
import {
  Shield,
  Loader2,
  Mail,
  KeyRound,
  Copy,
  Check,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

type Step = "email" | "verify";

export default function AdminLogin() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const handleEmailSubmit = async (e: React.FormEvent, forceReset = false) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reset: forceReset }),
      });

      const data = await res.json();

      if (res.ok) {
        setNeedsSetup(data.needsSetup);
        if (data.qrCode) setQrCode(data.qrCode);
        if (data.secret) setSecret(data.secret);
        setStep("verify");
        setTimeout(() => codeInputRef.current?.focus(), 100);
      } else {
        setError(data.error || "Email or code is entered wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = "/admin/dashboard";
        return;
      }

      setError(data.error || "Email or code is entered wrong.");
      setCode("");
      codeInputRef.current?.focus();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBackToEmail = () => {
    setStep("email");
    setCode("");
    setError("");
    setNeedsSetup(false);
    setQrCode("");
    setSecret("");
  };

  const handleForceReset = (e: React.MouseEvent) => {
    e.preventDefault();
    handleEmailSubmit(
      { preventDefault: () => {} } as React.FormEvent,
      true
    );
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 absolute inset-0 z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            {step === "email" ? (
              <Shield className="w-8 h-8" />
            ) : (
              <KeyRound className="w-8 h-8" />
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-center text-gray-900 mb-2">
          {step === "email" ? "Admin Access" : "Verification"}
        </h1>
        <p className="text-center text-gray-500 mb-8 text-sm">
          {step === "email"
            ? "Enter your admin email to continue."
            : needsSetup
              ? "Scan the QR code with your authenticator app, then enter the code below."
              : "Enter the 6-digit code from your authenticator app."}
        </p>

        {/* Step 1: Email */}
        {step === "email" && (
          <form
            onSubmit={(e) => handleEmailSubmit(e, false)}
            className="space-y-4"
          >
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin Email"
                className="w-full pl-12 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm font-medium justify-center pt-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Continue"
              )}
            </button>

            {/* Reset Authenticator Link */}
            <button
              type="button"
              onClick={handleForceReset}
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors py-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Lost access to authenticator? Reset it
            </button>
          </form>
        )}

        {/* Step 2: TOTP Code */}
        {step === "verify" && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            {/* QR Code + Secret (setup only) */}
            {needsSetup && qrCode && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-2">
                <div className="flex justify-center mb-4">
                  <img
                    src={qrCode}
                    alt="Authenticator QR Code"
                    className="rounded-lg"
                    width={200}
                    height={200}
                  />
                </div>

                <div className="text-center mb-3">
                  <p className="text-xs text-gray-500 mb-2">
                    Cannot scan? Enter this key manually:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono text-gray-800 tracking-wider select-all">
                      {secret}
                    </code>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Copy secret key"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
                  Save this key securely. You will need it if you lose access to
                  your authenticator app.
                </p>
              </div>
            )}

            {/* Code Input */}
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(val);
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full pl-12 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm font-medium justify-center pt-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : needsSetup ? (
                "Verify & Activate"
              ) : (
                "Sign In"
              )}
            </button>

            <button
              type="button"
              onClick={goBackToEmail}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}