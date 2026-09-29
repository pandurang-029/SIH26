import os
import logging
from pathlib import Path
from typing import Tuple, Dict, Any
from app.core.config import settings
from app.services.exporters import PdfExporter, PptxExporter
from app.services.output_service import OutputService
from app.services.document_service import DocumentService
from app.services.ai_service import GeminiAIService, MockAIService

logger = logging.getLogger(__name__)


class ExportService:
    """
    Service managing temporary physical file generation and download paths.
    Consumes ONLY validated Step 5 Pydantic output models.
    Does NOT call Gemini or regenerate content during export.
    """

    @classmethod
    def export_output(
        cls, document_id: str, output_type: str, output_format: str
    ) -> Tuple[Path, str, str]:
        out_type_clean = output_type.lower().strip()
        format_clean = output_format.lower().strip()

        # Format validation
        if out_type_clean in ["social_media", "infographic"]:
            raise ValueError(f"Export for '{output_type}' is coming later. Direct export for this format is not supported in Step 8.")
        if out_type_clean in ["executive_summary", "advisory"] and format_clean != "pdf":
            raise ValueError(f"Output type '{output_type}' only supports format 'pdf'.")
        if out_type_clean == "presentation" and format_clean != "pptx":
            raise ValueError(f"Output type '{output_type}' only supports format 'pptx'.")

        # 1. Retrieve existing document info
        file_path, meta = DocumentService.get_document_info(document_id)

        # 2. Get CCR and generated output model from Step 5
        use_mock = os.environ.get("USE_MOCK_AI", "false").lower() == "true"
        if use_mock:
            ai_service = MockAIService()
        else:
            ai_service = GeminiAIService()

        pages = DocumentService.extract_document(document_id)["pages"]
        filename = meta["filename"]
        ccr = ai_service.analyze_document(pages, filename)

        # Step 5 Output Service
        generated_resp = OutputService.generate_outputs(
            document_id=document_id,
            ccr=ccr,
            output_types=[out_type_clean],
        )

        # 3. Verify output was generated
        pdf_exporter = PdfExporter()
        pptx_exporter = PptxExporter()

        if out_type_clean == "executive_summary":
            if not generated_resp.executive_summary:
                raise ValueError("Requested Executive Summary output has not been generated yet.")
            file_name = f"executive_summary_{document_id}.pdf"
            dest_path = settings.UPLOAD_DIR / file_name
            pdf_exporter.export_executive_summary_pdf(generated_resp.executive_summary, dest_path)
            mime_type = "application/pdf"

        elif out_type_clean == "advisory":
            if not generated_resp.advisory:
                raise ValueError("Requested Advisory output has not been generated yet.")
            file_name = f"advisory_{document_id}.pdf"
            dest_path = settings.UPLOAD_DIR / file_name
            pdf_exporter.export_advisory_pdf(generated_resp.advisory, dest_path)
            mime_type = "application/pdf"

        elif out_type_clean == "presentation":
            if not generated_resp.presentation:
                raise ValueError("Requested Presentation output has not been generated yet.")
            file_name = f"presentation_{document_id}.pptx"
            dest_path = settings.UPLOAD_DIR / file_name
            pptx_exporter.export_presentation_pptx(generated_resp.presentation, dest_path)
            mime_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"

        else:
            raise ValueError(f"Unsupported output type for export: '{output_type}'")

        return dest_path, mime_type, file_name
