import {
  DocumentExtractionResponse,
  CommonContentRepresentation,
  GeneratedOutputsResponse,
} from "./types";

export interface HistoryRecord {
  id: string;
  name: string;
  docTitle: string;
  timestamp: string;
  audience: string;
  tone: string;
  language: string;
  formats: string[];
  qualityScore: number;
  unsupportedClaims: number;
  status: "Verified" | "Reviewed" | "Flagged";
  extractionData?: DocumentExtractionResponse | null;
  analysisData?: CommonContentRepresentation | null;
  outputsData?: GeneratedOutputsResponse | null;
}

const STORAGE_KEY = "transformai_history";
export const HISTORY_UPDATED_EVENT = "transformai_history_updated";

export const DEFAULT_HISTORY_RECORDS: HistoryRecord[] = [
  {
    id: "fd51164f-5fd0-425a-a9ed-53b735be63c8",
    name: "amrut2.pdf",
    docTitle: "AMRUT 2.0 National Water Security & Urban Reform Mission",
    timestamp: "Today at 09:58",
    audience: "Senior Officials",
    tone: "Formal",
    language: "English",
    formats: ["Executive Summary", "Advisory", "Presentation"],
    qualityScore: 100,
    unsupportedClaims: 0,
    status: "Verified",
    extractionData: {
      document_id: "fd51164f-5fd0-425a-a9ed-53b735be63c8",
      filename: "amrut2.pdf",
      file_size_bytes: 512000,
      page_count: 14,
      extracted_characters: 111840,
      language: "en",
      pages: [
        {
          page_number: 1,
          char_count: 8200,
          preview: "AMRUT 2.0 Operational Guidelines. Ministry of Housing and Urban Affairs, Government of India. Universal water security and rejuvenation of water bodies across 4,700 ULBs.",
          text: "AMRUT 2.0 Operational Guidelines. Ministry of Housing and Urban Affairs, Government of India. Universal water security and rejuvenation of water bodies across 4,700 ULBs.",
        },
      ],
      full_text: "AMRUT 2.0 Operational Guidelines. Ministry of Housing and Urban Affairs, Government of India. Universal water security and rejuvenation of water bodies across 4,700 ULBs.",
    },
    analysisData: {
      document_title: "AMRUT 2.0 National Water Security & Urban Reform Mission",
      document_topic: "Urban Water Governance and Wastewater Rejuvenation",
      executive_context: "AMRUT 2.0 targets universal coverage of water supply through functional household tap connections in all 4,700 statutory towns.",
      key_facts: [
        { fact_id: "f1", statement: "Mandates 100% water tap connection coverage across 4,700 statutory ULBs.", source_page: 1, confidence: 0.98 },
        { fact_id: "f2", statement: "Allocates ₹2,77,000 Crore total outlay over a 5-year mission lifespan.", source_page: 2, confidence: 0.99 },
      ],
      entities: [
        { name: "MoHUA", entity_type: "Ministry", description: "Ministry of Housing and Urban Affairs", source_page: 1 },
        { name: "AMRUT 2.0", entity_type: "National Mission", description: "Atal Mission for Rejuvenation and Urban Transformation 2.0", source_page: 1 },
      ],
      events: [],
      key_findings: [
        { finding_id: "kf1", topic: "Universal Water Security", insight: "Equitable distribution of potable drinking water is critical to urban climate resilience.", source_page: 1 },
      ],
      risks: [
        { risk_id: "r1", risk: "Municipal Capacity Bottlenecks", severity: "High", mitigation: "Deploy Project Management Units and third-party QA audits.", source_page: 3 },
      ],
      recommendations: [
        { rec_id: "rec1", recommendation: "Accelerate City Water Balance Plans (CWBP) preparation.", priority: "Immediate", expected_impact: "Faster fund release to Tier-2/3 cities.", source_page: 4 },
      ],
      important_statistics: [
        { metric: "Total Statutory ULBs Covered", value: "4,700", source_page: 1 },
        { metric: "Indicative Budgetary Outlay", value: "₹2,77,000 Cr", source_page: 2 },
      ],
      source_references: [
        { reference_id: "ref1", source_page: 1, snippet: "Ministry of Housing and Urban Affairs guidelines" },
      ],
    },
    outputsData: {
      document_id: "fd51164f-5fd0-425a-a9ed-53b735be63c8",
      executive_summary: {
        title: "Executive Summary: AMRUT 2.0 Operational Guidelines",
        executive_summary: "The Atal Mission for Rejuvenation and Urban Transformation 2.0 (AMRUT 2.0) represents India's flagship initiative for establishing national water security across 4,700 statutory towns. It emphasizes circular water economy principles, mandatory 20% recycled water utilization, and universal tap connectivity.",
        key_points: [
          "100% household tap connection coverage across all 4,700 statutory Urban Local Bodies.",
          "Total estimated scheme outlay of ₹2,77,000 Crore over 5 operational years.",
          "Mandatory City Water Balance Plans and GIS-enabled asset management.",
        ],
        important_statistics: [
          { metric: "ULBs Covered", value: "4,700 Towns", source_page: 1 },
          { metric: "Total Outlay", value: "₹2,77,000 Cr", source_page: 2 },
          { metric: "Recycled Water Target", value: "20% Municipal Demand", source_page: 5 },
        ],
        risks: [
          { risk_id: "r1", risk: "Delays in Municipal Co-financing", severity: "Medium", mitigation: "Incentivize municipal bond issuances and PPP arrangements.", source_page: 3 },
        ],
        recommendations: [
          { rec_id: "rec1", recommendation: "Expedite GIS mapping and baseline household metering.", priority: "High", expected_impact: "Mitigates non-revenue water loss by up to 28%.", source_page: 4 },
        ],
        source_references: [
          { reference_id: "ref1", source_page: 1, snippet: "Universal coverage of water supply in all statutory towns" },
        ],
      },
      advisory: {
        title: "Strategic Advisory: AMRUT 2.0 Implementation Protocol",
        situation: "Urban water scarcity and unmanaged wastewater discharge threaten sustainable economic growth across Indian metropolitan and tier-2 regions.",
        key_findings: [
          { finding_id: "kf1", topic: "Groundwater Depletion", insight: "Over 65% of municipal zones face critical aquifer depletion during pre-monsoon periods.", source_page: 2 },
        ],
        risk_assessment: "Substantial operational risks exist if local ULBs fail to enforce metering and automated billing systems.",
        recommended_actions: [
          { rec_id: "rec1", recommendation: "Mandate dual-pipe plumbing systems in new commercial and residential developments.", priority: "Immediate", expected_impact: "Reduces fresh potable water consumption by 30%.", source_page: 6 },
        ],
        priority: "High",
        intended_audience: "Municipal Commissioners & State Water Boards",
        source_references: [
          { reference_id: "ref1", source_page: 2, snippet: "MoHUA circular economy mandate" },
        ],
      },
      presentation: {
        title: "AMRUT 2.0 Strategic Briefing",
        subtitle: "Accelerating Universal Water Security & Municipal Reforms",
        slides: [
          {
            slide_number: 1,
            title: "Mission Overview & Mandate",
            key_points: [
              "Coverage: 4,700 Statutory Urban Local Bodies nationwide",
              "5-Year Total Financial Outlay: ₹2,77,000 Crore",
              "Key Objective: 100% Functional Household Tap Connections (FHTC)",
            ],
            speaker_notes: "Welcome dignitaries. Today we review the strategic roadmap for AMRUT 2.0 deployment across all urban centers.",
            source_references: [{ reference_id: "ref1", source_page: 1, snippet: "Mission targets" }],
          },
          {
            slide_number: 2,
            title: "Circular Water Economy & Wastewater Reuse",
            key_points: [
              "Universal recycling target: Minimum 20% of total municipal water demand",
              "Direct industrial supply of treated municipal sewage water",
              "Rejuvenation of water bodies and urban wetland preservation",
            ],
            speaker_notes: "Circular economy principles must guide wastewater treatment and industrial off-take contracts.",
            source_references: [{ reference_id: "ref2", source_page: 5, snippet: "Circular economy framework" }],
          },
        ],
      },
    },
  },
  {
    id: "a07cc272-e9d5-4a05-aedd-a3264f1a8e96",
    name: "Healthcare_Report_5_Pages.pdf",
    docTitle: "National Healthcare Preparedness & Infrastructure Assessment",
    timestamp: "Today at 09:25",
    audience: "Technical Personnel",
    tone: "Technical",
    language: "English",
    formats: ["Executive Summary", "Advisory"],
    qualityScore: 96,
    unsupportedClaims: 0,
    status: "Verified",
  },
  {
    id: "doc-hist-001",
    name: "cyber_infrastructure_security_report_2026.pdf",
    docTitle: "NTRO Cyber Infrastructure Vulnerability & Security Directive 2026",
    timestamp: "Yesterday at 14:32",
    audience: "Senior Officials",
    tone: "Formal",
    language: "English",
    formats: ["Executive Summary", "Advisory", "Presentation"],
    qualityScore: 100,
    unsupportedClaims: 0,
    status: "Verified",
  },
  {
    id: "doc-hist-002",
    name: "border_surveillance_protocol_marathi.pdf",
    docTitle: "Border Operational Protocol & Perimeter Defence Standard",
    timestamp: "10 Sep 2026",
    audience: "Field Personnel",
    tone: "Simplified",
    language: "Marathi",
    formats: ["Advisory", "Infographic", "Social Media"],
    qualityScore: 94,
    unsupportedClaims: 0,
    status: "Verified",
  },
];

export function getHistoryRecords(): HistoryRecord[] {
  if (typeof window === "undefined") return DEFAULT_HISTORY_RECORDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HISTORY_RECORDS));
      return DEFAULT_HISTORY_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return DEFAULT_HISTORY_RECORDS;
  } catch (err) {
    console.error("Failed to read transformation history from localStorage:", err);
    return DEFAULT_HISTORY_RECORDS;
  }
}

export function saveHistoryRecord(record: Partial<HistoryRecord> & { id: string; name?: string }): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getHistoryRecords();
    const existingIndex = current.findIndex((r) => r.id === record.id);

    const nowFormatted = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }) + " Today";

    let updated: HistoryRecord[];

    if (existingIndex >= 0) {
      const existing = current[existingIndex];
      const merged: HistoryRecord = {
        ...existing,
        ...record,
        name: record.name && record.name !== record.id ? record.name : existing.name,
        docTitle: record.docTitle && record.docTitle !== record.id ? record.docTitle : existing.docTitle,
        timestamp: record.timestamp || nowFormatted,
        formats: record.formats && record.formats.length > 0 ? record.formats : existing.formats,
        status: record.status || existing.status,
      };
      updated = [merged, ...current.filter((_, idx) => idx !== existingIndex)];
    } else {
      const fallbackName = record.name || `Document ${record.id.slice(0, 8)}`;
      const newRecord: HistoryRecord = {
        id: record.id,
        name: fallbackName,
        docTitle: record.docTitle || fallbackName.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
        timestamp: record.timestamp || nowFormatted,
        audience: record.audience || "Senior Officials",
        tone: record.tone || "Formal",
        language: record.language || "English",
        formats: record.formats && record.formats.length > 0 ? record.formats : ["Executive Summary"],
        qualityScore: record.qualityScore ?? 100,
        unsupportedClaims: record.unsupportedClaims ?? 0,
        status: record.status || "Verified",
        extractionData: record.extractionData,
        analysisData: record.analysisData,
        outputsData: record.outputsData,
      };
      updated = [newRecord, ...current];
    }

    // Keep up to 40 records max
    const trimmed = updated.slice(0, 40);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

    // Dispatch custom event for real-time reactivity across tabs/components
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT, { detail: trimmed }));

    return trimmed;
  } catch (err) {
    console.error("Failed to save transformation record to localStorage:", err);
    return [];
  }
}

export function clearHistoryRecords(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT, { detail: [] }));
  } catch (err) {
    console.error("Failed to clear transformation history:", err);
  }
}
