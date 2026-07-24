// components/dashboard/resume/ItemPicker.tsx
"use client"

// Generic item picker with checkboxes — used for education, experience, skills, projects, achievements

interface PickerItem {
  id: string
  label: string
  subtitle?: string
  children?: { id: string; label: string; subtitle?: string }[]
}

interface Props {
  title: string
  description: string
  items: PickerItem[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onToggleAll: (selectAll: boolean) => void
  // For items with children (e.g. companies with roles)
  childSelectedIds?: string[]
  onToggleChild?: (id: string) => void
}

export default function ItemPicker({
  title, description, items, selectedIds, onToggle, onToggleAll,
  childSelectedIds, onToggleChild
}: Props) {
  const allSelected = items.every(i => selectedIds.includes(i.id))

  return (
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
        {description}
      </p>

      <button
        onClick={() => onToggleAll(!allSelected)}
        style={{
          fontSize: 13, color: "#4f46e5", background: "none", border: "none",
          cursor: "pointer", fontWeight: 600, marginBottom: 12, padding: 0,
        }}
      >
        {allSelected ? "✕ Deselect All" : "✓ Select All"}
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item) => {
          const checked = selectedIds.includes(item.id)
          return (
            <div key={item.id}>
              <button
                onClick={() => onToggle(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", border: checked ? "2px solid #4f46e5" : "2px solid #e2e8f0",
                  borderRadius: 10, background: checked ? "#eef2ff" : "#fff",
                  cursor: "pointer", transition: "all 0.15s ease", width: "100%",
                  textAlign: "left",
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: checked ? "2px solid #4f46e5" : "2px solid #cbd5e1",
                  background: checked ? "#4f46e5" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}>
                  {checked ? "✓" : ""}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: checked ? "#4f46e5" : "#333" }}>
                    {item.label}
                  </div>
                  {item.subtitle && (
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{item.subtitle}</div>
                  )}
                </div>
              </button>

              {/* Children (e.g. roles within a company) */}
              {checked && item.children && childSelectedIds && onToggleChild && (
                <div style={{ marginLeft: 36, marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                  {item.children.map((child) => {
                    const childChecked = childSelectedIds.includes(child.id)
                    return (
                      <button
                        key={child.id}
                        onClick={() => onToggleChild(child.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 14px",
                          border: childChecked ? "1.5px solid #818cf8" : "1.5px solid #e2e8f0",
                          borderRadius: 8, background: childChecked ? "#f5f3ff" : "#fafafa",
                          cursor: "pointer", transition: "all 0.15s ease", width: "100%",
                          textAlign: "left",
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: 4,
                          border: childChecked ? "2px solid #818cf8" : "2px solid #d1d5db",
                          background: childChecked ? "#818cf8" : "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
                        }}>
                          {childChecked ? "✓" : ""}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13, color: childChecked ? "#6366f1" : "#555" }}>
                            {child.label}
                          </div>
                          {child.subtitle && (
                            <div style={{ fontSize: 11, color: "#999" }}>{child.subtitle}</div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {items.length === 0 && (
        <div style={{ padding: 30, textAlign: "center", color: "#999", fontSize: 14 }}>
          No items found in this section
        </div>
      )}
    </div>
  )
}
