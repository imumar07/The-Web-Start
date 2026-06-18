"use client";
import { useState } from "react";
import { m } from "framer-motion";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { GradientText } from "@/components/ui/GradientText";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";

type Tab = "contact" | "inquiry";

const serviceOptions = [
  { value: "", label: "Select a service..." },
  { value: "full-stack-development", label: "Full-Stack Development" },
  { value: "wordpress-development", label: "WordPress Development" },
  { value: "ui-ux-design", label: "UI/UX Design" },
  { value: "seo", label: "SEO" },
  { value: "social-media-marketing", label: "Social Media Marketing" },
  { value: "branding", label: "Branding" },
  { value: "multiple", label: "Multiple Services" },
];

const budgetOptions = [
  { value: "", label: "Budget range..." },
  { value: "<1k", label: "Under ₹1,000" },
  { value: "1k-5k", label: "₹1,000 – ₹5,000" },
  { value: "5k-15k", label: "₹5,000 – ₹15,000" },
  { value: "15k-50k", label: "₹15,000 – ₹50,000" },
  { value: "50k+", label: "₹50,000+" },
];

export function ContactContent() {
  const [tab, setTab] = useState<Tab>("contact");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+919000000000";
  const waUrl = `https://wa.me/${wa.replace(/\D/g, "")}?text=Hi%2C%20I%27d%20like%20to%20discuss%20a%20project.`;

  const handleContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  const handleInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="container-custom relative">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-purple-500" />
            <span className="text-purple-400 text-sm font-semibold tracking-widest uppercase">Get In Touch</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-purple-500" />
          </div>
          <h1 className="font-display font-black text-5xl sm:text-6xl text-white mb-4">
            Let&apos;s <GradientText>Work Together</GradientText>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Ready to start? Have a question? We respond within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left — Info */}
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: Mail, label: "Email", value: "info@thewebstart.in", href: "mailto:info@thewebstart.in" },
              { icon: MapPin, label: "Location", value: "India (Remote Worldwide)", href: null },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">{label}</div>
                  {href ? (
                    <a href={href} className="text-white text-sm font-medium hover:text-purple-300 transition-colors">{value}</a>
                  ) : (
                    <div className="text-white text-sm font-medium">{value}</div>
                  )}
                </div>
              </div>
            ))}

            <div className="space-y-3 pt-2">
              <Button href={waUrl} external variant="secondary" className="w-full justify-center"
                icon={<MessageCircle className="w-4 h-4" />}>
                Chat on WhatsApp
              </Button>
            </div>

            <div className="glass rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-sm font-medium">Currently accepting projects</span>
              </div>
              <p className="text-gray-500 text-xs">Typical response time: &lt; 24 hours</p>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex gap-1 glass rounded-xl p-1 mb-6">
              {(["contact", "inquiry"] as Tab[]).map((t) => (
                <button key={t} onClick={() => { setTab(t); setSent(false); }}
                  className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
                  style={tab === t ? { background: "linear-gradient(135deg,#7c3aed,#06b6d4)", color: "white" } : { color: "#9ca3af" }}>
                  {t === "contact" ? "Send a Message" : "Project Inquiry"}
                </button>
              ))}
            </div>

            {sent ? (
              <m.div
                className="glass rounded-2xl p-12 text-center border border-emerald-500/30"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="font-display font-bold text-white text-xl mb-2">Message Sent!</h3>
                <p className="text-gray-400 text-sm">We&apos;ll get back to you within 24 hours.</p>
                <Button onClick={() => setSent(false)} variant="secondary" className="mt-6">Send Another</Button>
              </m.div>
            ) : tab === "contact" ? (
              <m.form key="contact" onSubmit={handleContact}
                className="glass rounded-2xl p-8 border border-white/[0.07] space-y-4"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input name="name" label="Full Name" placeholder="John Doe" required />
                  <Input name="email" label="Email" type="email" placeholder="john@company.com" required />
                </div>
                <Input name="phone" label="Phone (optional)" placeholder="+91 9000000000" />
                <Input name="subject" label="Subject" placeholder="Project discussion / Question" required />
                <Textarea name="message" label="Message" placeholder="Tell us about your project or question..." rows={5} required />
                <Button type="submit" loading={sending} className="w-full justify-center" icon={<Send className="w-4 h-4" />}>
                  Send Message
                </Button>
              </m.form>
            ) : (
              <m.form key="inquiry" onSubmit={handleInquiry}
                className="glass rounded-2xl p-8 border border-white/[0.07] space-y-4"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input name="name" label="Full Name" placeholder="John Doe" required />
                  <Input name="email" label="Email" type="email" placeholder="john@company.com" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input name="phone" label="Phone" placeholder="+91 9000000000" />
                  <Input name="company" label="Company" placeholder="Acme Inc." />
                </div>
                <Select name="service_needed" label="Service Needed" options={serviceOptions} required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select name="budget_range" label="Budget Range" options={budgetOptions} />
                  <Input name="timeline" label="Timeline" placeholder="e.g. 2 months, ASAP" />
                </div>
                <Textarea name="project_details" label="Project Details" placeholder="Describe your project, goals, and any specific requirements..." rows={5} required />
                <Input name="reference_urls" label="Reference URLs (optional)" placeholder="https://example.com, https://another.com" />
                <Input name="how_found" label="How did you find us?" placeholder="Google, Referral, Social Media..." />
                <Button type="submit" loading={sending} className="w-full justify-center" icon={<Send className="w-4 h-4" />}>
                  Submit Inquiry
                </Button>
              </m.form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
