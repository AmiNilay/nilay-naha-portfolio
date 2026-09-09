"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Mail,
  KeyRound,
  Copy,
  Check,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
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
  const emailInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (step === "email") {
      setTimeout(() => emailInputRef.current?.focus(), 200);
    } else {
      setTimeout(() => codeInputRef.current?.focus(), 200);
    }
  }, [step]);

  const submitEmail = useCallback(
    async (forceReset = false) => {
      if (submittingRef.current || loading) return;
      if (!email || !email.includes("@")) return;

      submittingRef.current = true;
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
        } else {
          setError(data.error || "Email or code is entered wrong.");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
        submittingRef.current = false;
      }
    },
    [email, loading]
  );

  const submitCode = useCallback(async () => {
    if (submittingRef.current || loading) return;
    if (code.length !== 6) return;

    submittingRef.current = true;
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

      setError(data.error || "Invalid code. Try again.");
      setCode("");
      setTimeout(() => codeInputRef.current?.focus(), 50);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  }, [email, code, loading]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (step === "verify" && code.length === 6 && !loading) {
      const timer = setTimeout(() => submitCode(), 300);
      return () => clearTimeout(timer);
    }
  }, [code, step, loading, submitCode]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitEmail(false);
  };

  const handleForceReset = () => {
    submitEmail(true);
  };

  const goBackToEmail = () => {
    setStep("email");
    setCode("");
    setError("");
    setNeedsSetup(false);
    setQrCode("");
    setSecret("");
    submittingRef.current = false;
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-100/40 via-transparent to-purple-100/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-amber-100/30 via-transparent to-transparent rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500" />

          <div className="p-8 sm:p-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-blue-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl font-extrabold text-center text-gray-900 mb-1">
              {step === "email" ? "Welcome Back" : "Verification"}
            </h1>
            <p className="text-center text-gray-400 text-sm mb-8">
              {step === "email"
                ? "Enter your email to access the dashboard."
                : needsSetup
                  ? "Scan the QR code, then enter the 6-digit code."
                  : "Enter the 6-digit code from your authenticator app."}
            </p>

            {/* Step 1: Email */}
            <AnimatePresence mode="wait">
              {step === "email" && (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleEmailSubmit} className="space-y-5">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300" />
                        <input
                          ref={emailInputRef}
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                          }}
                          placeholder="admin@example.com"
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                          required
                          autoFocus
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2.5 text-red-500 text-sm bg-red-50 border border-red-100 px-4 py-3 rounded-xl"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow-md"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Continue"
                      )}
                    </button>

                    <div className="pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleForceReset}
                        disabled={loading || !email}
                        className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors py-2 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Lost access to authenticator?
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 2: TOTP Code */}
              {step === "verify" && (
                <motion.div
                  key="verify-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-5">
                    {/* QR Code */}
                    {needsSetup && qrCode && (
                      <div className="bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-2xl p-6">
                        <div className="flex justify-center mb-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                            <img
                              src={qrCode}
                              alt="Authenticator QR Code"
                              className="rounded-lg"
                              width={180}
                              height={180}
                            />
                          </div>
                        </div>

                        <div className="text-center mb-3">
                          <p className="text-xs text-gray-400 mb-2">
                            Cannot scan? Enter this key:
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <code className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono text-gray-700 tracking-wider select-all">
                              {secret}
                            </code>
                            <button
                              type="button"
                              onClick={copySecret}
                              className="p-2 text-gray-300 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
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

                        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                          Save this key. You will need it if you lose access to
                          your authenticator.
                        </p>
                      </div>
                    )}

                    {/* Code Input */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Authentication Code
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300" />
                        <input
                          ref={codeInputRef}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          value={code}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);
                            setCode(val);
                            setError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && code.length === 6) {
                              submitCode();
                            }
                          }}
                          placeholder="0 0 0 0 0 0"
                          maxLength={6}
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-200 placeholder:tracking-[0.5em]"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Loading indicator */}
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-2 text-blue-600 text-sm font-medium bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </motion.div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2.5 text-red-500 text-sm bg-red-50 border border-red-100 px-4 py-3 rounded-xl"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={submitCode}
                      disabled={loading || code.length !== 6}
                      className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : needsSetup ? (
                        "Verify & Activate"
                      ) : (
                        "Sign In"
                      )}
                    </button>

                    {/* Back button */}
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={goBackToEmail}
                        className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-2"
                      >
                        Use a different email
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-300 mt-6 font-medium">
          Nilay Naha Portfolio
        </p>
      </motion.div>
    </div>
  );
}