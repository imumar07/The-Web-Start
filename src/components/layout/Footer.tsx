import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { GradientText } from "@/components/ui/GradientText";

const services = [
  { label: "Full-Stack Development", href: "/services/full-stack-development" },
  { label: "WordPress Development",  href: "/services/wordpress-development" },
  { label: "UI/UX Design",           href: "/services/ui-ux-design" },
  { label: "SEO",                    href: "/services/seo" },
  { label: "Social Media Marketing", href: "/services/social-media-marketing" },
  { label: "Branding",               href: "/services/branding" },
];

const company = [
  { label: "About Us",   href: "/about" },
  { label: "Portfolio",  href: "/portfolio" },
  { label: "Blog",       href: "/blog" },
  { label: "Contact",    href: "/contact" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+919000000000";
  const waUrl = `https://wa.me/${wa.replace(/\D/g, "")}`;

  return (
    <footer className="relative border-t border-white/[0.06] bg-[#04040a]">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Image
                src="/images/logo-mark.svg"
                alt="The Web Start"
                width={32}
                height={32}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <span className="font-display font-bold text-lg text-white">
                The Web <GradientText>Start</GradientText>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Premium software agency delivering full-stack solutions, design, and growth services to ambitious brands.
            </p>
            <div className="flex items-center gap-3">
              {[
                { label: "𝕏", href: "https://twitter.com/thewebstart" },
                { label: "in", href: "https://linkedin.com/company/thewebstart" },
                { label: "ig", href: "https://instagram.com/thewebstart" },
                { label: "gh", href: "https://github.com/thewebstart" },
              ].map(({ label, href }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                   className="w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:border-purple-500/40 transition-all duration-200 text-xs font-bold">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Services</h4>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Company</h4>
            <ul className="space-y-2.5">
              {company.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@thewebstart.in" className="flex items-center gap-2 text-gray-500 text-sm hover:text-gray-300 transition-colors group">
                  <Mail className="w-3.5 h-3.5 text-purple-500 group-hover:text-purple-400 flex-shrink-0" />
                  info@thewebstart.in
                </a>
              </li>
              <li>
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 text-sm hover:text-gray-300 transition-colors group">
                  <Phone className="w-3.5 h-3.5 text-purple-500 group-hover:text-purple-400 flex-shrink-0" />
                  WhatsApp Us
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-gray-500 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                  India (Remote)
                </div>
              </li>
            </ul>

            {/* Mini CTA */}
            <div className="mt-5 glass rounded-xl p-4 border border-purple-500/20">
              <p className="text-xs text-gray-500 mb-2">Ready to start your project?</p>
              <Link href="/contact#inquiry" className="text-xs font-semibold gradient-text hover:opacity-80 transition-opacity">
                Get a free quote →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © {year} The Web Start. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
