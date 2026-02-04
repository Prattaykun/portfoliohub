"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Particles from "@/components/particles";
// import Navbar from "@/components/navbar";
import { motion } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      else setUser(null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white">
      {/* <Navbar user={user} /> */}

      {/* Particle background (fixed and behind everything) */}
      <Particles className="absolute inset-0 z-0 opacity-60 pointer-events-none" quantity={90} />

      {/* Animated text reveal section */}
<main className="relative z-10 flex flex-col items-center justify-center text-center px-6">
  <div className="relative flex flex-col items-center justify-center overflow-hidden h-[10rem] md:h-[14rem]">
    {/* Top line (moves upward) */}
    <motion.div
      initial={{ y: 0, opacity: 0, width: "12rem" }}
      animate={{ y: "-4rem", opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="h-[2px] bg-gradient-to-r from-green-300 to-blue-500 rounded-full absolute"
    ></motion.div>

    {/* Bottom line (moves downward) */}
    <motion.div
      initial={{ y: 0, opacity: 0, width: "12rem" }}
      animate={{ y: "4rem", opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut", delay: 0.1 }}
      className="h-[2px] bg-gradient-to-r from-purple-500 to-blue-500 rounded-full absolute"
    ></motion.div>

    {/* Text Reveal (vertical reveal) */}
    <motion.h1
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 1.4, ease: "easeOut", delay: 0.6 }}
      className="text-5xl md:text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-blue-400 to-purple-500 drop-shadow-lg origin-center"
    >
      PortfolioHUB
    </motion.h1>
  </div>

  <motion.p
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay: 1.6 }}
    className="text-zinc-300 mt-6 max-w-xl text-sm md:text-lg"
  >
    Build, manage, and showcase your engineering journey — all in one place.
  </motion.p>

  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 1, delay: 2 }}
    className="mt-10"
  >
    {user ? (
      <button
        onClick={() => router.push("/dashboard")}
        className="px-8 py-3 text-lg font-semibold cursor-pointer rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 hover:scale-105 transition-transform shadow-lg"
      >
        Visit Your Dashboard
      </button>
    ) : (
      <button 
        onClick={() => router.push("/auth")}
        className="px-8 py-3 text-lg font-semibold cursor-pointer  rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 hover:scale-105 transition-transform shadow-lg"
      >
        Create Your Portfolio
      </button>
    )}
  </motion.div>
</main>


      <footer className="absolute bottom-4 text-zinc-400 text-xs z-10">
        © {new Date().getFullYear()} PortfolioHUB — All rights reserved.
      </footer>
    </div>
  );
}
