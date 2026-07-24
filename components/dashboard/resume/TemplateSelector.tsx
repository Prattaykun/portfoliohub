// components/dashboard/resume/TemplateSelector.tsx
"use client"
import { TEMPLATES } from "@/lib/resumeTemplates"
import type { TemplateId } from "@/lib/resumeTemplates"

interface Props {
  selected: TemplateId
  onSelect: (id: TemplateId) => void
}

export default function TemplateSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>
        Choose a Template
      </h3>
      <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
        Select a resume design that matches your style
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 16,
      }}>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            style={{
              border: selected === t.id ? `3px solid ${t.accentColor}` : "2px solid #e2e8f0",
              borderRadius: 12,
              padding: 0,
              cursor: "pointer",
              background: selected === t.id ? "#f8fafc" : "#fff",
              transition: "all 0.2s ease",
              overflow: "hidden",
              boxShadow: selected === t.id ? `0 0 0 2px ${t.accentColor}33` : "0 1px 3px rgba(0,0,0,0.08)",
              textAlign: "left" as const,
            }}
          >
            <div style={{
              width: "100%",
              height: 200,
              overflow: "hidden",
              background: "#f1f5f9",
            }}>
              <img
                src={t.previewImage}
                alt={t.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div style={{
                fontWeight: 700,
                fontSize: 14,
                color: selected === t.id ? t.accentColor : "#333",
                marginBottom: 4,
              }}>
                {t.name}
                {selected === t.id && (
                  <span style={{
                    marginLeft: 6,
                    fontSize: 11,
                    background: t.accentColor,
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: 10,
                  }}>Selected</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.4 }}>
                {t.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
