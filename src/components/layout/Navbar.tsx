"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const services = [
  { label: "Full-Stack Development", href: "/services/full-stack-development" },
  { label: "WordPress Development",  href: "/services/wordpress-development" },
  { label: "UI/UX Design",           href: "/services/ui-ux-design" },
  { label: "SEO",                    href: "/services/seo" },
  { label: "Social Media Marketing", href: "/services/social-media-marketing" },
  { label: "Branding",               href: "/services/branding" },
];

const navLinks = [
  { label: "Home",      href: "/" },
  { label: "About",     href: "/about" },
  { label: "Services",  href: "/services", dropdown: services },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog",      href: "/blog" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <m.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-[rgba(4,4,10,0.85)] backdrop-blur-xl border-b border-white/[0.06] shadow-lg"
            : "bg-transparent"
        )}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/images/logo-mark.svg"
              alt="The Web Start"
              width={32}
              height={32}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <span className="font-display font-bold text-lg text-white">
              The Web <span className="gradient-text">Start</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.dropdown ? (
                <li key={link.label} className="relative"
                    onMouseEnter={() => setServicesOpen(true)}
                    onMouseLeave={() => setServicesOpen(false)}>
                  <button className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    pathname.startsWith("/services")
                      ? "text-purple-300"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}>
                    {link.label}
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", servicesOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {servicesOpen && (
                      <m.div
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="rounded-2xl p-2 border border-white/10 shadow-2xl" style={{ background: "rgba(10,10,28,0.97)", backdropFilter: "blur(24px)" }}>
                          {link.dropdown.map((s) => (
                            <Link key={s.href} href={s.href}
                              className="block px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-150">
                              {s.label}
                            </Link>
                          ))}
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </li>
              ) : (
                <li key={link.label}>
                  <Link href={link.href} className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 block",
                    pathname === link.href
                      ? "text-purple-300"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}>
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Button href="/contact" size="sm" variant="secondary">Contact</Button>
            <Button href="/contact#inquiry" size="sm">Get a Quote</Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </m.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <m.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <m.div
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#08081a] border-l border-white/10 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <span className="font-display font-bold text-white">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {navLinks.map((link) => (
                  <div key={link.label}>
                    <Link href={link.href}
                      className={cn(
                        "block px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                        pathname === link.href || pathname.startsWith(link.href + "/")
                          ? "text-white bg-purple-500/20 border border-purple-500/30"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}>
                      {link.label}
                    </Link>
                    {link.dropdown && (
                      <div className="ml-4 mt-1 space-y-1">
                        {link.dropdown.map((s) => (
                          <Link key={s.href} href={s.href}
                            className="block px-3 py-2 text-xs text-gray-500 hover:text-gray-300 rounded-lg transition-colors">
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 space-y-2 border-t border-white/10">
                <Button href="/contact" variant="secondary" className="w-full justify-center">Contact</Button>
                <Button href="/contact#inquiry" className="w-full justify-center">Get a Quote</Button>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
