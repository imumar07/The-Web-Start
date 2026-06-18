"use client";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>

        <h1 className="font-display font-bold text-2xl text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-500 text-sm mb-2">
          An unexpected error occurred in the admin panel.
        </p>
        {error.digest && (
          <p className="text-gray-700 text-xs font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <a
            href="/admin"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
