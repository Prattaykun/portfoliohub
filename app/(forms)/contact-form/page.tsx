"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

// Country codes data
const countryCodes = [
  { code: "+1", flag: "🇺🇸", country: "United States" },
  { code: "+91", flag: "🇮🇳", country: "India" },
  { code: "+44", flag: "🇬🇧", country: "United Kingdom" },
  { code: "+61", flag: "🇦🇺", country: "Australia" },
  { code: "+86", flag: "🇨🇳", country: "China" },
  { code: "+49", flag: "🇩🇪", country: "Germany" },
  { code: "+33", flag: "🇫🇷", country: "France" },
  { code: "+81", flag: "🇯🇵", country: "Japan" },
  { code: "+82", flag: "🇰🇷", country: "South Korea" },
  { code: "+55", flag: "🇧🇷", country: "Brazil" },
  { code: "+7", flag: "🇷🇺", country: "Russia" },
  { code: "+39", flag: "🇮🇹", country: "Italy" },
  { code: "+34", flag: "🇪🇸", country: "Spain" },
  { code: "+31", flag: "🇳🇱", country: "Netherlands" },
  { code: "+41", flag: "🇨🇭", country: "Switzerland" },
  { code: "+46", flag: "🇸🇪", country: "Sweden" },
  { code: "+47", flag: "🇳🇴", country: "Norway" },
  { code: "+45", flag: "🇩🇰", country: "Denmark" },
  { code: "+358", flag: "🇫🇮", country: "Finland" },
  { code: "+32", flag: "🇧🇪", country: "Belgium" },
  { code: "+43", flag: "🇦🇹", country: "Austria" },
  { code: "+353", flag: "🇮🇪", country: "Ireland" },
  { code: "+351", flag: "🇵🇹", country: "Portugal" },
  { code: "+30", flag: "🇬🇷", country: "Greece" },
  { code: "+48", flag: "🇵🇱", country: "Poland" },
  { code: "+36", flag: "🇭🇺", country: "Hungary" },
  { code: "+420", flag: "🇨🇿", country: "Czech Republic" },
  { code: "+65", flag: "🇸🇬", country: "Singapore" },
  { code: "+60", flag: "🇲🇾", country: "Malaysia" },
  { code: "+66", flag: "🇹🇭", country: "Thailand" },
  { code: "+84", flag: "🇻🇳", country: "Vietnam" },
  { code: "+62", flag: "🇮🇩", country: "Indonesia" },
  { code: "+63", flag: "🇵🇭", country: "Philippines" },
  { code: "+971", flag: "🇦🇪", country: "UAE" },
  { code: "+966", flag: "🇸🇦", country: "Saudi Arabia" },
  { code: "+20", flag: "🇪🇬", country: "Egypt" },
  { code: "+27", flag: "🇿🇦", country: "South Africa" },
  { code: "+234", flag: "🇳🇬", country: "Nigeria" },
  { code: "+254", flag: "🇰🇪", country: "Kenya" },
  { code: "+52", flag: "🇲🇽", country: "Mexico" },
  { code: "+54", flag: "🇦🇷", country: "Argentina" },
  { code: "+56", flag: "🇨🇱", country: "Chile" },
  { code: "+57", flag: "🇨🇴", country: "Colombia" },
  { code: "+51", flag: "🇵🇪", country: "Peru" },
  { code: "+92", flag: "🇵🇰", country: "Pakistan" },
  { code: "+880", flag: "🇧🇩", country: "Bangladesh" },
  { code: "+94", flag: "🇱🇰", country: "Sri Lanka" },
  { code: "+98", flag: "🇮🇷", country: "Iran" },
  { code: "+962", flag: "🇯🇴", country: "Jordan" },
  { code: "+961", flag: "🇱🇧", country: "Lebanon" },
  { code: "+972", flag: "🇮🇱", country: "Israel" },
  { code: "+90", flag: "🇹🇷", country: "Turkey" },
];

export default function ContactForm() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  // Contact form state
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [address, setAddress] = useState("");
  const [otherLinks, setOtherLinks] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const questions = [
    { key: "contact", title: "📞 Add your contact information", type: "contact" },
  ];

  const current = questions[step];

  // Common social media platforms for quick adds
  const platformExamples = [
    "Portfolio", "Twitter", "Personal Website", "Blog", "YouTube", 
    "Instagram", "Facebook", "Discord", "Telegram", "Stack Overflow",
    "Dev.to", "Medium", "Behance", "Dribbble", "Kaggle"
  ];

  // Helper functions for other links
  const makeOtherLink = (seed?: any) => ({
    id: Math.random().toString(36).slice(2),
    name: seed?.name ?? "Platform Name",
    url: seed?.url ?? "",
  });

  const addOtherLink = (seed?: any) => setOtherLinks((s) => [...s, makeOtherLink(seed)]);
  const updateOtherLink = (id: string, patch: any) =>
    setOtherLinks((s) => s.map((link) => (link.id === id ? { ...link, ...patch } : link)));
  const removeOtherLink = (id: string) => setOtherLinks((s) => s.filter((link) => link.id !== id));

  // Add platform from quick examples
  const addPlatform = (platform: string) => {
    if (!platform) return;
    const existing = otherLinks.find(link => link.name === platform);
    if (!existing) {
      addOtherLink({ name: platform, url: "" });
    }
    setInput("");
  };

  const handleNext = async () => {
    await handleSubmit();
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  // Function to validate URLs
  const validateUrl = (url: string): string => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  // Function to extract username from social URLs
  const getUsernameFromUrl = (url: string, platform: string): string => {
    if (!url) return '';
    
    try {
      const urlObj = new URL(validateUrl(url));
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment);
      
      switch (platform.toLowerCase()) {
        case 'linkedin':
          return pathSegments[pathSegments.length - 1] || '';
        case 'github':
          return pathSegments[0] || '';
        case 'twitter':
          return pathSegments[0]?.replace('@', '') || '';
        default:
          return pathSegments[pathSegments.length - 1] || '';
      }
    } catch {
      return url.split('/').filter(segment => segment).pop() || '';
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Combine country code and phone number
      const fullPhone = phone ? `${countryCode} ${phone}` : null;

      const payload = {
        auth_user_id: user.id,
        email: email || null,
        linkedin: linkedin ? validateUrl(linkedin) : null,
        github: github ? validateUrl(github) : null,
        phone: fullPhone, // Store combined phone number
        address: address || null,
        other_links: otherLinks.length ? otherLinks.map(link => ({
          ...link,
          url: link.url ? validateUrl(link.url) : ""
        })) : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("contact").upsert(payload, {
        onConflict: 'auth_user_id'
      });
      
      if (error) throw error;
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Failed to save contact information");
    } finally {
      setSaving(false);
    }
  };

  // Enhanced data loading with better error handling
  const loadContactData = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No user found");
        return;
      }

      const { data, error } = await supabase
        .from("contact")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      // PGRST116 means no rows returned - which is fine for new users
      if (error && error.code !== 'PGRST116') {
        console.error("Error loading contact data:", error);
        return;
      }

      if (data) {
        console.log("Loaded existing contact data:", data);
        setEmail(data.email || "");
        setLinkedin(data.linkedin || "");
        setGithub(data.github || "");
        setAddress(data.address || "");
        setOtherLinks(data.other_links || []);
        
        // Parse phone number if it exists
        if (data.phone) {
          const phoneParts = data.phone.split(' ');
          if (phoneParts.length >= 2) {
            const foundCountry = countryCodes.find(cc => cc.code === phoneParts[0]);
            setCountryCode(foundCountry?.code || "+91");
            setPhone(phoneParts.slice(1).join(' '));
          } else {
            setPhone(data.phone);
          }
        }
      } else {
        console.log("No existing contact data found - starting fresh");
      }
    } catch (err) {
      console.error("Error loading contact data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load existing data if available
  useEffect(() => {
    loadContactData();
  }, [loadContactData]);

  // Reset form function
  const resetForm = () => {
    setEmail("");
    setLinkedin("");
    setGithub("");
    setPhone("");
    setCountryCode("+91");
    setAddress("");
    setOtherLinks([]);
    setInput("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white px-4 py-10">
        <div className="w-full max-w-2xl bg-white/8 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
          <div className="text-xl">Loading your contact information...</div>
          <div className="mt-4 text-zinc-300">Please wait while we load your data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white px-4 py-10">
      <motion.div
        key={current.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white/8 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
      >
        {!done ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 via-blue-400 to-purple-400 text-transparent bg-clip-text">
                {current.title}
              </h1>
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm transition"
              >
                Reset Form
              </button>
            </div>

            {current.type === "contact" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-zinc-300">
                    {email || linkedin || github ? "Update your contact details" : "Fill in your contact details"}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-200">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-200">Phone Number</label>
                  <div className="flex gap-3">
                    {/* Country Code Selector */}
                    <div className="relative flex-1 max-w-[140px]">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl  border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none appearance-none cursor-pointer"
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code} className="bg-gray-800">
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Phone Number Input */}
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="123-456-7890"
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-200">LinkedIn Profile</label>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">💼</div>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                  {linkedin && (
                    <div className="text-xs text-zinc-400">
                      Username: {getUsernameFromUrl(linkedin, 'linkedin') || 'Invalid URL'}
                    </div>
                  )}
                </div>

                {/* GitHub */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-200">GitHub Profile</label>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🐙</div>
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/yourusername"
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                  {github && (
                    <div className="text-xs text-zinc-400">
                      Username: {getUsernameFromUrl(github, 'github') || 'Invalid URL'}
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-200">Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Your complete address (street, city, state, country, zip code)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                  />
                </div>

                {/* Other Links */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-zinc-200">Other Social Links</label>
                    <button onClick={() => addOtherLink()} className="text-sm underline">+ Add Link</button>
                  </div>

                  {/* Quick Add Platform Input */}
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addPlatform(input)}
                      placeholder="Add platform (e.g., Twitter, Portfolio)"
                      className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                    <button
                      onClick={() => addPlatform(input)}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                    >
                      Add
                    </button>
                  </div>

                  {/* Quick Platform Examples */}
                  <div className="flex flex-wrap gap-2">
                    {platformExamples.map((platform) => (
                      <button
                        key={platform}
                        onClick={() => addPlatform(platform)}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm transition"
                      >
                        {platform}
                      </button>
                    ))}
                  </div>

                  {/* Other Links List */}
                  <div className="space-y-3">
                    {otherLinks.map((link) => (
                      <motion.div 
                        key={link.id} 
                        initial={{ opacity: 0, y: 8 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white/6 rounded-xl border border-white/8"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-sm font-medium text-white">{link.name}</h4>
                          <button 
                            onClick={() => removeOtherLink(link.id)} 
                            className="text-xs text-red-300 hover:text-red-100"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            value={link.name}
                            onChange={(e) => updateOtherLink(link.id, { name: e.target.value })}
                            placeholder="Platform Name"
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                          />
                          
                          <input
                            value={link.url}
                            onChange={(e) => updateOtherLink(link.id, { url: e.target.value })}
                            placeholder="https://example.com/yourprofile"
                            className="md:col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                          />
                        </div>
                        
                        {link.url && (
                          <div className="text-xs text-zinc-400 mt-2">
                            Username: {getUsernameFromUrl(link.url, link.name) || 'Invalid URL'}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Preview Section */}
                {(email || phone || linkedin || github || address || otherLinks.length > 0) && (
                  <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-sm font-medium text-zinc-200 mb-3">Preview</h3>
                    <div className="space-y-2 text-sm">
                      {email && <div className="flex items-center gap-2">📧 <span className="text-zinc-300">{email}</span></div>}
                      {phone && <div className="flex items-center gap-2">📱 <span className="text-zinc-300">{countryCode} {phone}</span></div>}
                      {linkedin && <div className="flex items-center gap-2">💼 <span className="text-zinc-300">{linkedin}</span></div>}
                      {github && <div className="flex items-center gap-2">🐙 <span className="text-zinc-300">{github}</span></div>}
                      {address && <div className="flex items-center gap-2">🏠 <span className="text-zinc-300">{address}</span></div>}
                      {otherLinks.map((link, index) => (
                        <div key={index} className="flex items-center gap-2">
                          🔗 <span className="text-zinc-300">{link.name}: {link.url}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <button onClick={handleBack} className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 transition">
                  ← Back
                </button>
              ) : (
                <div />
              )}

              <button 
                onClick={handleNext} 
                disabled={saving}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {saving ? "Saving..." : (email || linkedin || github ? "Update Contact Info ✅" : "Save Contact Info 🎉")}
              </button>
            </div>
          </>
        ) : (
          <motion.div 
            className="text-center py-10 text-2xl font-semibold text-white-300" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
          >
            <div className="space-y-4">
              <div>Awesome! Your contact information has been saved 🚀</div>
              <div className="flex justify-center gap-4">
                <Link 
                  href="/dashboard" 
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold hover:scale-105 transition-transform"
                >
                  Go to Dashboard
                </Link>
                <button 
                  onClick={() => {
                    setDone(false);
                    loadContactData(); // Reload data when editing again
                  }}
                  className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                >
                  Edit Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}