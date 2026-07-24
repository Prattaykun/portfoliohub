// components/dashboard/resume/ResumeWizard.tsx
"use client"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import TemplateSelector from "./TemplateSelector"
import SectionTogglesStep from "./SectionToggles"
import ItemPicker from "./ItemPicker"
import { defaultSectionToggles, TEMPLATES } from "@/lib/resumeTemplates"
import type { TemplateId, SectionToggles, SelectedItems, TemplateInfo } from "@/lib/resumeTemplates"

interface WizardProps {
  about: any
  skills: any
  projects: any
  contact?: any
  langint: any
  certificates: any[]
  onGenerate: (template: TemplateId, sections: SectionToggles, selectedItems: SelectedItems) => void
  onCancel: () => void
  generating: boolean
}

export default function ResumeWizard({
  about, skills, projects, contact, langint, certificates,
  onGenerate, onCancel, generating
}: WizardProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [template, setTemplate] = useState<TemplateId>("teal-sidebar")
  const [sections, setSections] = useState<SectionToggles>(defaultSectionToggles())

  // Contact items list
  const contactItems = useMemo(() => {
    const items: { id: string; label: string; subtitle?: string }[] = []
    if (contact?.email) items.push({ id: 'email', label: 'Email Address', subtitle: contact.email })
    if (contact?.phone) items.push({ id: 'phone', label: 'Phone Number', subtitle: contact.phone })
    if (contact?.address) items.push({ id: 'address', label: 'Location / Address', subtitle: contact.address })
    if (contact?.linkedin) items.push({ id: 'linkedin', label: 'LinkedIn Profile', subtitle: contact.linkedin })
    if (contact?.github) items.push({ id: 'github', label: 'GitHub Profile', subtitle: contact.github })
    if (Array.isArray(contact?.other_links)) {
      contact.other_links.forEach((link: any, i: number) => {
        items.push({
          id: link.id || `other_${i}`,
          label: link.name || 'Social Link',
          subtitle: link.url,
        })
      })
    }
    return items
  }, [contact])

  // Selected item IDs
  const [contactItemIds, setContactItemIds] = useState<string[]>(() =>
    contactItems.map(i => i.id)
  )
  const [eduIds, setEduIds] = useState<string[]>(() =>
    (about?.education || []).map((e: any) => e.id)
  )
  const [compIds, setCompIds] = useState<string[]>(() =>
    (about?.experience || []).map((c: any) => c.id)
  )
  const [roleIds, setRoleIds] = useState<string[]>(() =>
    (about?.experience || []).flatMap((c: any) =>
      Array.isArray(c.roles) ? c.roles.map((r: any) => r.id) : []
    )
  )
  const [techIds, setTechIds] = useState<string[]>(() =>
    (skills?.technical || []).map((s: any) => s.id)
  )
  const [softSkills, setSoftSkills] = useState<string[]>(() =>
    skills?.soft || []
  )
  const [projIds, setProjIds] = useState<string[]>(() =>
    (projects?.projects || []).map((p: any) => p.id)
  )
  const [achIndices, setAchIndices] = useState<number[]>(() => {
    const achs = extractAch(skills)
    return achs.map((_: any, i: number) => i)
  })
  const [langIds, setLangIds] = useState<string[]>(() =>
    (langint?.language || []).map((l: any) => l.id)
  )
  const [certIndices, setCertIndices] = useState<number[]>(() =>
    (certificates || []).map((_: any, i: number) => i)
  )

  // Build dynamic steps based on toggled sections
  const wizardSteps = useMemo(() => {
    const steps: { key: string; label: string }[] = [
      { key: "template", label: "Template" },
      { key: "sections", label: "Sections" },
    ]
    if (sections.contacts && contactItems.length) steps.push({ key: "contacts", label: "Contacts" })
    if (sections.education && about?.education?.length) steps.push({ key: "education", label: "Education" })
    if (sections.experience && about?.experience?.length) steps.push({ key: "experience", label: "Experience" })
    if (sections.skills && ((skills?.technical?.length) || (skills?.soft?.length)))
      steps.push({ key: "skills", label: "Skills" })
    if (sections.projects && projects?.projects?.length) steps.push({ key: "projects", label: "Projects" })
    const achs = extractAch(skills)
    if (sections.achievements && achs.length) steps.push({ key: "achievements", label: "Achievements" })
    if (sections.certificates && certificates?.length) steps.push({ key: "certificates", label: "Certificates" })
    if (sections.languages && langint?.language?.length) steps.push({ key: "languages", label: "Languages" })
    steps.push({ key: "review", label: "Review" })
    return steps
  }, [sections, contactItems, about, skills, projects, certificates, langint])

  const currentKey = wizardSteps[step]?.key || "template"
  const isLast = step === wizardSteps.length - 1

  function goNext() {
    if (step < wizardSteps.length - 1) { setDirection(1); setStep(step + 1) }
  }
  function goBack() {
    if (step > 0) { setDirection(-1); setStep(step - 1) }
  }

  // When sections change, clamp step if needed
  function handleSectionsChange(newSections: SectionToggles) {
    setSections(newSections)
    // Stay on step 1 (sections step)
  }

  function handleGenerate() {
    onGenerate(template, sections, {
      contactItemIds,
      educationIds: eduIds,
      experienceCompanyIds: compIds,
      experienceRoleIds: roleIds,
      technicalSkillIds: techIds,
      softSkills,
      projectIds: projIds,
      achievementIndices: achIndices,
      languageIds: langIds,
      certificateIndices: certIndices,
    })
  }

  // Toggle helpers
  function toggleId(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter(x => x !== id) : [...list, id]
  }
  function toggleIdx(list: number[], idx: number): number[] {
    return list.includes(idx) ? list.filter(x => x !== idx) : [...list, idx]
  }

  // Build picker items
  const eduItems = (about?.education || []).map((e: any) => ({
    id: e.id, label: e.degree || e.institution, subtitle: `${e.institution} • ${e.startYear || ''} - ${e.pursuing ? 'Present' : e.endYear || ''}`
  }))

  const expItems = (about?.experience || []).map((c: any) => ({
    id: c.id, label: c.company,
    children: Array.isArray(c.roles) ? c.roles.map((r: any) => ({
      id: r.id, label: r.title, subtitle: `${r.start || ''} - ${r.present ? 'Present' : r.end || ''}`
    })) : []
  }))

  const techItems = (skills?.technical || []).map((s: any) => ({
    id: s.id, label: s.name, subtitle: s.category || undefined
  }))
  const softItems = (skills?.soft || []).map((s: string) => ({
    id: s, label: s
  }))

  const projItems = (projects?.projects || []).map((p: any) => ({
    id: p.id, label: p.title, subtitle: p.role ? `Role: ${p.role}` : undefined
  }))

  const achievements = extractAch(skills)
  const achItems = achievements.map((a: any, i: number) => ({
    id: String(i), label: a.title, subtitle: a.description || undefined
  }))

  const certItems = (certificates || []).map((c: any, i: number) => ({
    id: String(i), label: c.name, subtitle: c.organization || undefined
  }))

  const langItems = (langint?.language || []).map((l: any) => ({
    id: l.id, label: l.name, subtitle: l.proficiency
  }))

  // Animation variants
  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  }

  function renderStep() {
    switch (currentKey) {
      case "template":
        return <TemplateSelector selected={template} onSelect={setTemplate} />
      case "sections":
        return <SectionTogglesStep sections={sections} onChange={handleSectionsChange} />
      case "contacts":
        return <ItemPicker title="Select Contact Info & Socials" description="Choose which contact channels and links to include"
          items={contactItems} selectedIds={contactItemIds}
          onToggle={(id) => setContactItemIds(toggleId(contactItemIds, id))}
          onToggleAll={(all) => setContactItemIds(all ? contactItems.map((i: any) => i.id) : [])} />
      case "education":
        return <ItemPicker title="Select Education" description="Choose which schools & degrees to include"
          items={eduItems} selectedIds={eduIds}
          onToggle={(id) => setEduIds(toggleId(eduIds, id))}
          onToggleAll={(all) => setEduIds(all ? eduItems.map((i: any) => i.id) : [])} />
      case "experience":
        return <ItemPicker title="Select Experience" description="Choose which companies & roles to include"
          items={expItems} selectedIds={compIds}
          onToggle={(id) => setCompIds(toggleId(compIds, id))}
          onToggleAll={(all) => setCompIds(all ? expItems.map((i: any) => i.id) : [])}
          childSelectedIds={roleIds}
          onToggleChild={(id) => setRoleIds(toggleId(roleIds, id))} />
      case "skills":
        return (
          <div>
            {techItems.length > 0 && (
              <ItemPicker title="Select Technical Skills" description="Choose which technical skills to include"
                items={techItems} selectedIds={techIds}
                onToggle={(id) => setTechIds(toggleId(techIds, id))}
                onToggleAll={(all) => setTechIds(all ? techItems.map((i: any) => i.id) : [])} />
            )}
            {softItems.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <ItemPicker title="Select Soft Skills" description="Choose which soft skills to include"
                  items={softItems} selectedIds={softSkills}
                  onToggle={(id) => setSoftSkills(toggleId(softSkills, id))}
                  onToggleAll={(all) => setSoftSkills(all ? softItems.map((i: any) => i.id) : [])} />
              </div>
            )}
          </div>
        )
      case "projects":
        return <ItemPicker title="Select Projects" description="Choose which projects to include"
          items={projItems} selectedIds={projIds}
          onToggle={(id) => setProjIds(toggleId(projIds, id))}
          onToggleAll={(all) => setProjIds(all ? projItems.map((i: any) => i.id) : [])} />
      case "achievements":
        return <ItemPicker title="Select Achievements" description="Choose which achievements to include"
          items={achItems} selectedIds={achIndices.map(String)}
          onToggle={(id) => setAchIndices(toggleIdx(achIndices, Number(id)))}
          onToggleAll={(all) => setAchIndices(all ? achItems.map((_: any, i: number) => i) : [])} />
      case "certificates":
        return <ItemPicker title="Select Certificates" description="Choose which certifications to include"
          items={certItems} selectedIds={certIndices.map(String)}
          onToggle={(id) => setCertIndices(toggleIdx(certIndices, Number(id)))}
          onToggleAll={(all) => setCertIndices(all ? certItems.map((_: any, i: number) => i) : [])} />
      case "languages":
        return <ItemPicker title="Select Languages" description="Choose which languages to include"
          items={langItems} selectedIds={langIds}
          onToggle={(id) => setLangIds(toggleId(langIds, id))}
          onToggleAll={(all) => setLangIds(all ? langItems.map((i: any) => i.id) : [])} />
      case "review":
        return renderReview()
      default:
        return null
    }
  }

  function renderReview() {
    const tmpl = TEMPLATES.find((t: TemplateInfo) => t.id === template)
    return (
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>
          Review & Generate
        </h3>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
          background: "#f8fafc", borderRadius: 12, padding: 20, marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 4 }}>TEMPLATE</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: tmpl?.accentColor || "#333" }}>{tmpl?.name || template}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 4 }}>SECTIONS</div>
            <div style={{ fontSize: 13, color: "#444" }}>
              {Object.entries(sections).filter(([, v]) => v).map(([k]) => k).join(", ")}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 4 }}>CONTACTS</div>
            <div style={{ fontSize: 13, color: "#444" }}>{sections.contacts ? `${contactItemIds.length} items selected` : 'Disabled'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 4 }}>EDUCATION</div>
            <div style={{ fontSize: 13, color: "#444" }}>{eduIds.length} selected</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 4 }}>EXPERIENCE</div>
            <div style={{ fontSize: 13, color: "#444" }}>{compIds.length} companies, {roleIds.length} roles</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 4 }}>SKILLS</div>
            <div style={{ fontSize: 13, color: "#444" }}>{techIds.length} technical, {softSkills.length} soft</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 4 }}>PROJECTS</div>
            <div style={{ fontSize: 13, color: "#444" }}>{projIds.length} selected</div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            width: "100%", padding: "14px 24px", fontSize: 15, fontWeight: 700,
            color: "#fff", background: generating ? "#94a3b8" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
            border: "none", borderRadius: 12, cursor: generating ? "not-allowed" : "pointer",
            transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {generating ? (
            <>
              <svg className="animate-spin" style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating Resume...</span>
            </>
          ) : (
            <>
              <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Generate Resume PDF</span>
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0",
      overflow: "hidden",
    }}>
      {/* Progress bar */}
      <div style={{
        display: "flex", alignItems: "center", padding: "16px 24px",
        borderBottom: "1px solid #f1f5f9", gap: 4, overflowX: "auto",
      }}>
        {wizardSteps.map((s, i) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => { setDirection(i > step ? 1 : -1); setStep(i) }}
              style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: "none", cursor: "pointer", whiteSpace: "nowrap",
                background: i === step ? "#4f46e5" : i < step ? "#e0e7ff" : "#f1f5f9",
                color: i === step ? "#fff" : i < step ? "#4f46e5" : "#94a3b8",
                transition: "all 0.15s ease",
              }}
            >
              {s.label}
            </button>
            {i < wizardSteps.length - 1 && (
              <span style={{ color: "#d1d5db", fontSize: 14 }}>›</span>
            )}
          </div>
        ))}
      </div>

      {/* Step content with animation */}
      <div style={{ padding: "24px", minHeight: 350, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentKey}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div style={{
        display: "flex", justifyContent: "space-between", padding: "16px 24px",
        borderTop: "1px solid #f1f5f9",
      }}>
        <button
          onClick={step === 0 ? onCancel : goBack}
          style={{
            padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
            border: "1px solid #e2e8f0", background: "#fff", color: "#64748b",
            cursor: "pointer",
          }}
        >
          {step === 0 ? "Cancel" : "← Back"}
        </button>
        {!isLast && (
          <button
            onClick={goNext}
            style={{
              padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              border: "none", background: "#4f46e5", color: "#fff", cursor: "pointer",
            }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}

// Helper
function extractAch(skills: any): { title: string; description?: string }[] {
  const achs: { title: string; description?: string }[] = []
  try {
    if (skills?.media && Array.isArray(skills.media)) {
      const blocks = skills.media.filter((m: any) => (m?.name || '').toLowerCase() === 'achievements')
      for (const block of blocks) {
        const items = Array.isArray(block.items) ? block.items : []
        for (const it of items) {
          const title = it?.type === 'text' ? (it?.url || it?.title || '') : (it?.title || it?.url || '')
          if (title) achs.push({ title, description: it?.description || '' })
        }
      }
    }
  } catch { /* ignore */ }
  return achs
}
