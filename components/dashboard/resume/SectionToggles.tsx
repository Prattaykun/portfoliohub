// components/dashboard/resume/SectionToggles.tsx
"use client"
import { WIZARD_SECTIONS } from "@/lib/resumeTemplates"
import type { SectionToggles as SectionTogglesType } from "@/lib/resumeTemplates"

interface Props {
  sections: SectionTogglesType
  onChange: (sections: SectionTogglesType) => void
}

export default function SectionTogglesStep({ sections, onChange }: Props) {
  const toggle = (key: string) => {
    onChange({ ...sections, [key]: !sections[key as keyof SectionTogglesType] })
  }

  return (
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>
        Choose Sections
      </h3>
      <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
        Toggle which sections to include in your resume
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {WIZARD_SECTIONS.map((sec) => {
          const isOn = sections[sec.key as keyof SectionTogglesType]
          return (
            <button
              key={sec.key}
              onClick={() => toggle(sec.key)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                border: isOn ? "2px solid #4f46e5" : "2px solid #e2e8f0",
                borderRadius: 10,
                background: isOn ? "#eef2ff" : "#fff",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: isOn ? "#4f46e5" : "#333" }}>
                  {sec.label}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  {sec.description}
                </div>
              </div>
              <div style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: isOn ? "#4f46e5" : "#cbd5e1",
                position: "relative",
                transition: "background 0.2s ease",
                flexShrink: 0,
                marginLeft: 12,
              }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: 2,
                  left: isOn ? 22 : 2,
                  transition: "left 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
