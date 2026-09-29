export type AudienceType = "Senior Officials" | "Technical Personnel" | "Field Personnel" | "General Audience";
export type ToneType = "Formal" | "Technical" | "Neutral" | "Simplified";
export type LanguageType = "English" | "Hindi" | "Marathi";
export type DetailLevelType = "Brief" | "Medium" | "Detailed";
export type ObjectiveType = "Inform" | "Brief" | "Advise" | "Explain" | "Recommend";

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  backend: string;
  database?: string;
  mock_mode?: boolean;
}

export interface TransformationSettings {
  audience: AudienceType;
  tone: ToneType;
  language: LanguageType;
  detailLevel: DetailLevelType;
  objective: ObjectiveType;
}

export interface OutputFormatOption {
  id: string;
  title: string;
  description: string;
  isSupported: boolean;
  badgeText?: string;
}

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_status: string;
}

export interface ExtractedPage {
  page_number: number;
  text: string;
  char_count?: number;
  preview?: string;
}

export interface DocumentMetadata {
  total_pages: number;
  word_count: number;
  char_count: number;
}

export interface DocumentExtractionResponse {
  document_id: string;
  filename: string;
  file_type?: string;
  file_size?: number;
  file_size_bytes?: number;
  page_count?: number;
  extracted_characters?: number;
  language?: string;
  full_text: string;
  pages: ExtractedPage[];
  metadata?: DocumentMetadata;
}

/* Step 4: Common Content Representation Schemas */

export interface SourceReference {
  page_number?: number;
  source_page?: number;
  supporting_text?: string;
  snippet?: string;
  reference_id?: string;
}

export interface KeyFact {
  fact?: string;
  statement?: string;
  fact_id?: string;
  confidence?: number;
  source_page?: number;
}

export interface Entity {
  name: string;
  type?: string;
  entity_type?: string;
  description?: string;
  source_page?: number;
}

export interface EventItem {
  description: string;
  date?: string;
  source_page?: number;
}

export interface KeyFinding {
  finding?: string;
  finding_id?: string;
  topic?: string;
  insight?: string;
  importance?: string;
  source_page?: number;
}

export interface RiskItem {
  risk: string;
  risk_id?: string;
  severity?: string;
  mitigation?: string;
  source_page?: number;
}

export interface RecommendationItem {
  recommendation: string;
  rec_id?: string;
  priority?: string;
  expected_impact?: string;
  source_page?: number;
}

export interface StatisticItem {
  metric: string;
  value: string;
  context?: string;
  source_page?: number;
}

export interface CommonContentRepresentation {
  document_title: string;
  document_topic: string;
  executive_context: string;
  key_facts: KeyFact[];
  entities: Entity[];
  events: EventItem[];
  key_findings: KeyFinding[];
  risks: RiskItem[];
  recommendations: RecommendationItem[];
  important_statistics: StatisticItem[];
  source_references: SourceReference[];
}

/* Step 5: Multi-Output Generation Schemas */

export interface ExecutiveSummaryOutput {
  title: string;
  executive_summary: string;
  key_points: string[];
  important_statistics: StatisticItem[];
  risks: RiskItem[];
  recommendations: RecommendationItem[];
  source_references: SourceReference[];
}

export interface AdvisoryOutput {
  title: string;
  situation: string;
  key_findings: KeyFinding[];
  risk_assessment: string;
  recommended_actions: RecommendationItem[];
  priority: string;
  intended_audience: string;
  source_references: SourceReference[];
}

export interface PresentationSlide {
  slide_number: number;
  title: string;
  key_points: string[];
  speaker_notes: string;
  source_references: SourceReference[];
}

export interface PresentationOutput {
  title: string;
  subtitle: string;
  slides: PresentationSlide[];
}

export interface SocialMediaPost {
  post_id: string;
  platform: string;
  content: string;
  hashtags: string[];
  source_references: SourceReference[];
}

export interface SocialMediaOutput {
  title: string;
  platform: string;
  posts: SocialMediaPost[];
  hashtags: string[];
  source_references: SourceReference[];
}

export interface InfographicSection {
  heading: string;
  content: string;
  suggested_visual: string;
  source_references: SourceReference[];
}

export interface InfographicOutput {
  title: string;
  subtitle: string;
  sections: InfographicSection[];
  key_statistics: StatisticItem[];
  key_takeaways: string[];
  source_references: SourceReference[];
}

export interface TransformationConfig {
  audience: string;
  tone: string;
  language: string;
  detail_level: string;
  communication_objective: string;
}

export interface GeneratedOutputsResponse {
  document_id: string;
  executive_summary?: ExecutiveSummaryOutput | null;
  advisory?: AdvisoryOutput | null;
  presentation?: PresentationOutput | null;
  social_media?: SocialMediaOutput | null;
  infographic?: InfographicOutput | null;
  configuration?: TransformationConfig | null;
  errors?: Record<string, string>;
}

/* Step 7: AI Quality Control & Provenance Schemas */

export type SupportStatus = "supported" | "partially_supported" | "unsupported" | "recommendation";
export type OverallQualityStatus = "passed" | "review_required" | "failed";
export type HumanReviewStatus = "none" | "reviewed" | "accepted" | "needs_correction";

export interface ClaimProvenance {
  claim_id: string;
  claim_text: string;
  claim_type: string;
  support_status: SupportStatus;
  source_pages: number[];
  supporting_text: string[];
  confidence?: "high" | "medium" | "low" | null;
  reason: string;
  slide_number?: number | null;
  output_type: string;
}

export interface QualityControlReport {
  document_id: string;
  overall_status: OverallQualityStatus;
  total_claims: number;
  supported_claims: number;
  partially_supported_claims: number;
  unsupported_claims: number;
  recommendations: number;
  claims: ClaimProvenance[];
}
