"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        className="bg-white shadow-lg rounded-xl p-10 text-center w-[420px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          Survey Builder
        </h1>

        <p className="text-gray-500 mb-6">
          Create AI-powered surveys with XML, JSON & YAML support.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-green-500 text-white py-2 rounded-md"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full border py-2 rounded-md"
          >
            Login
          </button>
        </div>
      </motion.div>
    </main>
  );
}