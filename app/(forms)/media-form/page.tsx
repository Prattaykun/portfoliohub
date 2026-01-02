"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CldUploadWidget } from "next-cloudinary";
import { supabase } from "@/lib/supabaseClient";

// Types
type MediaItem = {
  id: string;
  type: "image" | "video" | "text" | "link";
  url: string;
  title?: string;
  description?: string;
};

type Section = {
  id: string;
  name: string; // e.g. "Achievements" or custom
  items: MediaItem[];
};

export default function MediaForm() {
  const [step, setStep] = useState<number>(0); // 0: selector, 1..n: section pages, final: summary
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // how many sections user wants (including Achievements)
  const [sectionsCount, setSectionsCount] = useState<number>(1); // min 1 max 5

  // sections state: first one is always Achievements by default
  const [sections, setSections] = useState<Section[]>([{
    id: generateId(),
    name: "Achievements",
    items: [
      // initially empty — user can add cards
    ]
  }]);

  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchExistingSkills();
  }, []);

  async function fetchExistingSkills() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data, error } = await supabase
        .from("skills")
        .select("media")
        .eq("auth_user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("fetch skills error", error);
      }

      if (data && Array.isArray(data.media) && data.media.length > 0) {
        // adopt stored structure
        const storedSections: Section[] = data.media.map((s: any) => ({
          id: s.id || generateId(),
          name: s.name || "Untitled",
          items: Array.isArray(s.items) ? s.items.map((it: any) => ({
            id: it.id || generateId(),
            type: it.type || "image",
            url: it.url || "",
            title: it.title || "",
            description: it.description || "",
          })) : []
        }));

        // ensure at least Achievements exists
        if (!storedSections.length) storedSections.unshift({ id: generateId(), name: "Achievements", items: [] });

        setSections(storedSections);
        setSectionsCount(Math.max(1, storedSections.length));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // utilities
  function generateId() {
    return Math.random().toString(36).slice(2, 10);
  }

  function clampSectionsCount(n: number) {
    if (n < 1) return 1;
    if (n > 5) return 5;
    return n;
  }

  // when user changes the number on page 0, update sections array accordingly
  function applySectionsCount(count: number) {
    count = clampSectionsCount(count);
    setSectionsCount(count);

    setSections((prev) => {
      const target = [...prev];
      // ensure first is Achievements
      if (!target[0]) target[0] = { id: generateId(), name: "Achievements", items: [] };

      // if we need more sections, append defaults
      while (target.length < count) {
        target.push({ id: generateId(), name: `Section ${target.length + 1}`, items: [] });
      }

      // if we need fewer, slice
      if (target.length > count) {
        target.splice(count);
      }

      return target;
    });
  }

  // section editing helpers
  function updateSectionName(sectionId: string, name: string) {
    setSections((s) => s.map(sec => sec.id === sectionId ? { ...sec, name } : sec));
  }

  function addCardToSection(sectionId: string, seed?: Partial<MediaItem>) {
    const newItem: MediaItem = {
      id: generateId(),
      type: (seed?.type as any) || "image",
      url: seed?.url || "",
      title: seed?.title || "",
      description: seed?.description || "",
    };
    setSections((s) => s.map(sec => sec.id === sectionId ? { ...sec, items: [...sec.items, newItem] } : sec));
  }

  function updateCard(sectionId: string, cardId: string, patch: Partial<MediaItem>) {
    setSections((s) => s.map(sec => sec.id === sectionId ? {
      ...sec,
      items: sec.items.map(it => it.id === cardId ? { ...it, ...patch } : it)
    } : sec));
  }

  function removeCard(sectionId: string, cardId: string) {
    setSections((s) => s.map(sec => sec.id === sectionId ? ({ ...sec, items: sec.items.filter(i => i.id !== cardId) }) : sec));
  }

  async function handleSubmit() {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Prepare payload: each section as a JSONB object
      const payloadSections = sections.map(sec => ({
        id: sec.id,
        name: sec.name,
        items: sec.items.map(it => ({ id: it.id, type: it.type, url: it.url, title: it.title, description: it.description }))
      }));

      const payload = {
        auth_user_id: user.id,
        media: payloadSections,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from("skills").upsert(payload);
      if (error) throw error;

      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Failed to save media sections.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/30 mx-auto"></div>
        <p className="mt-3">Loading...</p>
      </div>
    </div>
  );

  // UI pieces
  const selectorPage = (
    <motion.div key="selector" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-xl bg-black/30 backdrop-blur-md border border-white/10">
      <h2 className="text-xl font-semibold mb-3">How many sections do you want in your portfolio?</h2>
      <p className="text-sm text-zinc-200 mb-4">Achievements will always be included as the first section. Choose between 1 and 5 sections total.</p>

      <div className="flex items-center gap-3">
        <button onClick={() => { const n = clampSectionsCount(sectionsCount - 1); applySectionsCount(n); }} className="px-3 py-1 rounded bg-white/10 cursor-pointer active:scale-95 transition-transform">-</button>
        <div className="px-4 py-2 rounded bg-white/5 text-white font-medium">{sectionsCount}</div>
        <button onClick={() => { const n = clampSectionsCount(sectionsCount + 1); applySectionsCount(n); }} className="px-3 py-1 rounded bg-white/10 cursor-pointer active:scale-95 transition-transform">+</button>
      </div>

      <div className="mt-6 flex justify-between">
        <div />
        <div>
          <button onClick={() => { setStep(1); }} className="px-5 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold cursor-pointer active:scale-95 hover:scale-105 transition-transform">Next →</button>
        </div>
      </div>
    </motion.div>
  );

  function renderSectionPage(index: number) {
    const section = sections[index - 1]; // because step 1 corresponds to sections[0]
    if (!section) return null;

    return (
      <motion.div key={section.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-xl bg-black/30 backdrop-blur-md border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{index === 1 ? "Achievements" : `Section ${index}`}</h2>
          <div className="text-sm text-zinc-200">{index} / {sectionsCount}</div>
        </div>

        <div className="mb-4">
          <input value={section.name} onChange={(e) => updateSectionName(section.id, e.target.value)} placeholder="Section name (e.g. Achievements)" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white outline-none" />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-200 mb-1">Cards (media, videos, links)</div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => addCardToSection(section.id, { type: "image" })} className="text-sm underline cursor-pointer hover:text-white transition">+ Image</button>
              <button onClick={() => addCardToSection(section.id, { type: "video" })} className="text-sm underline cursor-pointer hover:text-white transition">+ Video</button>
              <button onClick={() => addCardToSection(section.id, { type: "link" })} className="text-sm underline cursor-pointer hover:text-white transition">+ Link</button>
              <button onClick={() => addCardToSection(section.id, { type: "text" })} className="text-sm underline cursor-pointer hover:text-white transition">+ Text</button>
            </div>
          </div>

          <div className="space-y-3 mt-3">
            {section.items.map(item => (
              <div key={item.id} className="p-3 rounded-lg border border-white/8 bg-white/5">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium">{item.type.toUpperCase()}</div>
                  <div className="flex gap-2">
                    <button onClick={() => removeCard(section.id, item.id)} className="text-xs text-red-400 cursor-pointer">Remove</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-2">
                    <input value={item.url} onChange={(e) => updateCard(section.id, item.id, { url: e.target.value })} placeholder={item.type === "image" ? "Image URL" : item.type === "video" ? "Video URL (YouTube/Vimeo/etc)" :item.type==="link" ? "Link URL" : "Text Preview Appears On Card"} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white placeholder-white outline-none" />
                  </div>

                  <div className="flex items-end gap-2">
                    {item.type === "image" && (
                      <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!} options={{ multiple: false, folder: "skills_media" }} onSuccess={(res: any) => {
                        if (res?.info?.secure_url) {
                          updateCard(section.id, item.id, { url: res.info.secure_url });
                        }
                      }}>
                        {({ open }) => (
                          <button type="button" onClick={() => open()} className="px-3 py-2 rounded bg-white/10 text-white cursor-pointer active:scale-95 transition-transform">Upload</button>
                        )}
                      </CldUploadWidget>
                    )}
                  </div>

                  <div className="lg:col-span-3">
                    <input value={item.title} onChange={(e) => updateCard(section.id, item.id, { title: e.target.value })} placeholder="Card title" className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white placeholder-white outline-none" />

                    <textarea value={item.description} onChange={(e) => updateCard(section.id, item.id, { description: e.target.value })} placeholder="Short description" className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white placeholder-white outline-none mt-2" />
                  </div>
                </div>
              </div>
            ))}

            {section.items.length === 0 && (
              <div className="text-sm text-zinc-200">No cards yet. Use the buttons above to add images, videos or links.</div>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <div>
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="px-4 py-2 rounded-full bg-white/10 cursor-pointer active:scale-95 transition-transform">← Back</button>
          </div>

          <div className="flex gap-2">
            {index < sectionsCount ? (
              <button onClick={() => setStep(index + 1)} className="px-4 py-2 rounded-full bg-white/10 cursor-pointer active:scale-95 transition-transform">Skip →</button>
            ) : (
              <button onClick={() => setStep(sectionsCount + 1)} className="px-4 py-2 rounded-full bg-white/10 cursor-pointer active:scale-95 transition-transform">Review →</button>
            )}

            <button onClick={async () => {
              // quick save current section and continue to next
              if (index < sectionsCount) setStep(index + 1);
              else setStep(sectionsCount + 1);
            }} className="px-5 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold cursor-pointer active:scale-95 hover:scale-105 transition-transform">Save & Continue</button>
          </div>
        </div>
      </motion.div>
    );
  }

  const reviewPage = (
    <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-xl bg-black/30 backdrop-blur-md border border-white/10">
      <h2 className="text-xl font-semibold mb-3">Review your sections</h2>
      <div className="space-y-4">
        {sections.map((sec, i) => (
          <div key={sec.id} className="p-3 rounded bg-white/5">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{sec.name}</div>
              <div className="text-sm text-zinc-200">{sec.items.length} card(s)</div>
            </div>
            <div className="space-y-2">
              {sec.items.map(it => (
                <div key={it.id} className="text-sm">
                  <div className="font-semibold">{it.title || '(untitled)'}</div>
                  <div className="text-xs text-zinc-200">{it.type} • {it.url}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => setStep(sectionsCount)} className="px-4 py-2 rounded-full bg-white/10 cursor-pointer active:scale-95 transition-transform">← Back</button>
        <div className="flex gap-2">
          <button onClick={() => { applySectionsCount(sectionsCount); setStep(0); }} className="px-4 py-2 rounded-full bg-white/10 cursor-pointer active:scale-95 transition-transform">Edit sections</button>
          <button onClick={handleSubmit} disabled={saving} className="px-6 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold cursor-pointer active:scale-95 hover:scale-105 transition-transform">{saving ? 'Saving...' : 'Save to profile'}</button>
        </div>
      </div>
    </motion.div>
  );

  const donePage = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-8 bg-black/30 rounded-xl">
      <h3 className="text-2xl font-semibold mb-2">Saved!</h3>
      <p className="text-sm text-zinc-200">Your media sections have been saved to your profile.</p>
      <div className="mt-4">
        <button onClick={() => setDone(false)} className="px-4 py-2 rounded-full bg-white/10 cursor-pointer active:scale-95 transition-transform">Continue Editing</button>
        <button onClick={() => window.location.href = "/dashboard"} className="ml-3 px-4 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold cursor-pointer active:scale-95 hover:scale-105 transition-transform">Go to Dashboard</button>
      </div>
    </motion.div>
  );

  return (
    // Fullscreen gradient background, content centered but not boxed in white
    <div className="min-h-screen pt-24 md:pt-32 bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white flex items-start justify-center py-12 px-4 md:px-6">
      <div className="w-full max-w-6xl">
        {!done ? (
          <div className="w-full">
            {step === 0 && selectorPage}

            {step >= 1 && step <= sectionsCount && renderSectionPage(step)}

            {step === sectionsCount + 1 && reviewPage}

          </div>
        ) : donePage}
      </div>
    </div>
  );
}
