"use client";
import { useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GradientText } from "@/components/ui/GradientText";
import { CTASection } from "@/components/sections/home/CTASection";
import { m, AnimatePresence } from "framer-motion";

const posts = [
  {
    title: "10 Next.js Performance Optimizations for 2025",
    excerpt: "Boost your Next.js app's Core Web Vitals with these battle-tested techniques — from streaming SSR to advanced caching strategies.",
    tag: "Development",
    date: "May 2025",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    slug: "nextjs-performance-2025",
  },
  {
    title: "The Complete Guide to Glassmorphism UI in 2025",
    excerpt: "Everything you need to know to implement stunning glassmorphism effects that work across all browsers and devices.",
    tag: "Design",
    date: "Apr 2025",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop&q=80",
    slug: "glassmorphism-guide-2025",
  },
  {
    title: "Why Your WordPress Site Is Slow (And How to Fix It)",
    excerpt: "Common causes of slow WordPress sites and actionable fixes — from caching and image optimization to server configuration.",
    tag: "WordPress",
    date: "Apr 2025",
    readTime: "10 min",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&auto=format&fit=crop&q=80",
    slug: "wordpress-speed-optimization",
  },
];

const allTags = ["All", ...Array.from(new Set(posts.map(p => p.tag)))];

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = activeTab === "All" ? posts : posts.filter(p => p.tag === activeTab);

  return (
    <>
      <Navbar />
      <main>
        <section className="pt-32 pb-8 text-center px-4">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-purple-500" />
            <span className="text-purple-400 text-sm font-semibold tracking-widest uppercase">Insights & Articles</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-purple-500" />
          </div>
          <h1 className="font-display font-black text-5xl sm:text-6xl text-white mb-4">
            The <GradientText>Blog</GradientText>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Practical insights on web development, design trends, and digital growth from our team.
          </p>
        </section>

        {/* Category Tabs */}
        <section className="pb-4">
          <div className="container-custom flex items-center justify-center">
            <div className="flex gap-2 glass rounded-2xl p-1.5 flex-wrap justify-center">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTab(tag)}
                  className="relative px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={activeTab === tag ? { color: "white" } : { color: "#6b7280" }}
                >
                  {activeTab === tag && (
                    <m.span
                      layoutId="blog-tab-indicator"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tag}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="section-padding pt-6">
          <div className="container-custom">
            <AnimatePresence mode="wait">
              <m.div
                key={activeTab}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {filtered.length === 0 ? (
                  <div className="col-span-3 text-center py-20 text-gray-600">No posts in this category yet.</div>
                ) : filtered.map((post) => (
                  <article key={post.slug} className="glass rounded-2xl overflow-hidden border border-white/[0.07] hover:border-white/15 transition-all duration-300 group">
                    <div className="relative h-48 overflow-hidden">
                      <Image src={post.image} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px)100vw,33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#04040a] via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="text-xs text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2.5 py-1 rounded-full">{post.tag}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                        <span>{post.date}</span>
                        <span>·</span>
                        <span>{post.readTime} read</span>
                      </div>
                      <h2 className="font-display font-bold text-white text-lg mb-2 group-hover:text-purple-300 transition-colors leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-gray-500 text-sm leading-relaxed">{post.excerpt}</p>
                    </div>
                  </article>
                ))}
              </m.div>
            </AnimatePresence>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}
