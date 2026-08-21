"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Mail, Linkedin, Github, Check, Copy, MapPin, 
  Clock, Send, ExternalLink, Loader2, AlertCircle 
} from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { StaggerContainer, StaggerItem } from "@/components/ui/StaggerContainer";

export default function ContactClient() {
  const [copied, setCopied] = useState(false);
  const email = "niloynaha2003@gmail.com";

  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const customFontStyle = (font?: string) =>
    font && font !== "Inter"
      ? { fontFamily: `'${font}', sans-serif` }
      : {};

  const headingFontStyle = (font?: string) =>
    font && font !== "Inter"
      ? { fontFamily: `'${font}', sans-serif`, fontWeight: "normal" as const }
      : {};

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitStatus("idle"), 5000);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen flex flex-col justify-center relative max-w-7xl">

      {/* EMAIL COPY TOAST */}
      <div
        style={customFontStyle(settings?.contactToastFont)}
        className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 ${
          copied ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-green-500 rounded-full p-1">
          <Check className="w-3 h-3 text-white" />
        </div>
        <span className="font-bold text-sm">Email Copied to Clipboard!</span>
      </div>

      <AnimatedSection direction="up">
        <div className="mb-16 text-center md:text-left">
          <h1
            style={headingFontStyle(settings?.contactHeaderFont)}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-gray-900 dark:text-white"
          >
            {settings?.contactHeader || "Let's Build Something."}
          </h1>
          <p
            style={customFontStyle(settings?.contactSubheaderFont)}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed"
          >
            {settings?.contactSubheader || "I'm currently open to new opportunities, freelance projects, and creative collaborations. Reach out and let's chat!"}
          </p>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        
        {/* LEFT COLUMN: Info & Cards */}
        <div className="space-y-8">
          
          {/* Status Badges */}
          <AnimatedSection direction="up" delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div style={customFontStyle(settings?.contactLocationFont)} className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-100 dark:bg-gray-900 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <MapPin className="w-4 h-4 text-primary" />
                Siliguri, India • IST (UTC+5:30)
              </div>
              <div style={customFontStyle(settings?.contactAvailabilityFont)} className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-100 dark:bg-gray-900 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <Clock className="w-4 h-4 text-primary" />
                Replies within 24 hours
              </div>
            </div>
          </AnimatedSection>

          {/* Contact Cards */}
          <StaggerContainer className="space-y-4" staggerDelay={0.1}>
            
            {/* Email Card */}
            <StaggerItem>
              <button
                onClick={handleCopy}
                style={customFontStyle(settings?.contactCardsFont)}
                className="w-full group flex items-center justify-between p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Email</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
                  </div>
                </div>
                <div className="p-2 text-gray-400 group-hover:text-primary transition-colors">
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </div>
              </button>
            </StaggerItem>

            {/* LinkedIn Card */}
            <StaggerItem>
              <Link
                href="https://www.linkedin.com/in/nilay-naha/"
                target="_blank"
                style={customFontStyle(settings?.contactCardsFont)}
                className="w-full group flex items-center justify-between p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-[#0A66C2]/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0A66C2]/10 text-[#0A66C2] rounded-xl group-hover:bg-[#0A66C2] group-hover:text-white transition-colors">
                    <Linkedin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">LinkedIn</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">/in/nilay-naha</p>
                  </div>
                </div>
                <div className="p-2 text-gray-400 group-hover:text-[#0A66C2] transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </div>
              </Link>
            </StaggerItem>

            {/* GitHub Card */}
            <StaggerItem>
              <Link
                href="https://github.com/AmiNilay"
                target="_blank"
                style={customFontStyle(settings?.contactCardsFont)}
                className="w-full group flex items-center justify-between p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-gray-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-gray-900 transition-colors">
                    <Github className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">GitHub</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@AmiNilay</p>
                  </div>
                </div>
                <div className="p-2 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </div>
              </Link>
            </StaggerItem>

          </StaggerContainer>
        </div>

        {/* RIGHT COLUMN: Contact Form */}
        <AnimatedSection direction="up" delay={0.2}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
            
            {/* Success Overlay */}
            <div style={customFontStyle(settings?.contactFormStatusFont)} className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center transition-all duration-500 ${submitStatus === "success" ? "opacity-100 visible" : "opacity-0 invisible"}`}>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
              <p className="text-gray-500 text-center max-w-xs">Thank you for reaching out. I'll get back to you as soon as possible.</p>
            </div>

            <h2 style={headingFontStyle(settings?.contactFormHeadingFont)} className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send a Message</h2>
            
            {submitStatus === "error" && (
              <div style={customFontStyle(settings?.contactFormStatusFont)} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">Failed to send message. Please try again or use the email link directly.</p>
              </div>
             )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <label style={customFontStyle(settings?.contactFormLabelFont)} htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Your Name</label>
                <input 
                  id="name"
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={customFontStyle(settings?.contactFormFieldFont)}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label style={customFontStyle(settings?.contactFormLabelFont)} htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <input 
                  id="email"
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={customFontStyle(settings?.contactFormFieldFont)}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label style={customFontStyle(settings?.contactFormLabelFont)} htmlFor="message" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea 
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  style={customFontStyle(settings?.contactFormFieldFont)}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                  placeholder="How can I help you?"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={customFontStyle(settings?.contactFormButtonFont)}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-5 h-5" /> Send Message</>
                )}
              </button>
            </form>
          </div>
        </AnimatedSection>

      </div>
    </div>
  );
}
