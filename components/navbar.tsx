"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      else setUser(null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("users_usernames")
        .select("username")
        .eq("uid", user.id)
        .single();
      if (data?.username) setUsername(data.username);
    };
    fetchUsername();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className="fixed top-0 w-full flex items-center justify-between px-6 py-4 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <Link
        href="/"
        className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-400 to-purple-400"
      >
  <>
    <img
      src="/logo.png"
      alt="PortfolioHub Logo"
      className="hidden md:block h-15 w-80 object-contain"
    />
    <img
      src="/favicon.png"
      alt="PortfolioHub Favicon"
      className="block md:hidden h-10 w-10 object-contain"
    />
  </>
      </Link>

      {/* Desktop Navigation */}
      <ul className="hidden md:flex items-center gap-6 text-zinc-300">
        {/* {/* <Link href="/projects" className="hover:text-white transition-colors">Projects</Link> */}
        <Link href="/Prattay" className="hover:text-white transition-colors">Contact The Dev.</Link>
        {user ? (
          <>
            <Link href="/dashboard" className="inline-block">
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-black font-bold uppercase">
                {username ? username[0] : user.email?.[0]}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="ml-3 text-sm text-zinc-400 hover:text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 hover:scale-105 transition-transform text-sm font-medium"
          >
            Login
          </Link>
        )}
      </ul>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden relative">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500"
        >
          {user ? (
            <span className="font-bold text-black uppercase">
              {username ? username[0] : user.email?.[0]}
            </span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="black"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M5 6h14M5 18h14"
              />
            </svg>
          )}
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-black/80 rounded-lg shadow-lg backdrop-blur-md border border-white/10 py-2 flex flex-col text-zinc-300">
            {/* <Link href="/projects" className="px-4 py-2 hover:bg-white/10">Projects</Link> */}
            <Link href="/Prattay" className="px-4 py-2 hover:bg-white/10">Contact The Dev.</Link> 
            {user ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-left hover:bg-white/10"
              >
                Logout
              </button>
            ) : (
              <Link href="/auth" className="px-4 py-2 hover:bg-white/10">
                Login
              </Link>
            )}
          </div>
          
        )}
      </div>
    </nav>
  );
}
