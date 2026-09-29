import os
import logging
import io
import zipfile
from pathlib import Path

try:
    import pptx
    from pptx.util import Inches, Pt
    from pptx.enum.text import PP_ALIGN
    from pptx.dml.color import RGBColor
except ImportError:
    pptx = None

from app.schemas.output_schemas import PresentationOutput
from app.services.exporters.base_exporter import BaseDocumentExporter

logger = logging.getLogger(__name__)


class PptxExporter(BaseDocumentExporter):
    """
    python-pptx Exporter for Presentation slide deck models.
    Converts PresentationOutput model to physical .pptx file with speaker notes and citations.
    Does NOT call Gemini or regenerate content.
    """

    def export(self, output_model: PresentationOutput, destination_path: Path) -> Path:
        if not isinstance(output_model, PresentationOutput):
            raise ValueError(f"Unsupported model type for PPTX export: {type(output_model)}")

        return self.export_presentation_pptx(output_model, destination_path)

    def export_presentation_pptx(
        self, output: PresentationOutput, destination_path: Path
    ) -> Path:
        destination_path.parent.mkdir(parents=True, exist_ok=True)

        if pptx is None:
            with zipfile.ZipFile(destination_path, 'w', zipfile.ZIP_DEFLATED) as z:
                z.writestr('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/></Types>')
                z.writestr('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>')
                slides_xml = "".join([f'<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:sp><p:txBody><a:p xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:r><a:t>{slide.title}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>' for slide in output.slides])
                z.writestr('ppt/presentation.xml', f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">{slides_xml}</p:presentation>')
                for idx, slide in enumerate(output.slides, start=1):
                    z.writestr(f'ppt/slides/slide{idx}.xml', f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:sp><p:txBody><a:p xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:r><a:t>{slide.title}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>')
                    if slide.speaker_notes:
                        z.writestr(f'ppt/notesSlides/notesSlide{idx}.xml', f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:notes xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:sp><p:txBody><a:p xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:r><a:t>{slide.speaker_notes}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:notes>')
            return destination_path

        prs = pptx.Presentation()

        # Set 16:9 widescreen dimensions (13.333 x 7.5 inches)
        prs.slide_width = Inches(13.333)
        prs.slide_height = Inches(7.5)

        blank_layout = prs.slide_layouts[6]  # Blank slide layout

        # Color Palette (NTRO Government Dark Navy / Slate theme)
        NAVY_BG = RGBColor(15, 23, 42)       # #0F172A
        DARK_CARD_BG = RGBColor(30, 41, 59)  # #1E293B
        TEXT_LIGHT = RGBColor(248, 250, 252) # #F8FAFC
        BLUE_ACCENT = RGBColor(59, 130, 246) # #3B82F6
        PURPLE_ACCENT = RGBColor(168, 85, 247) # #A855F7
        TEXT_MUTED = RGBColor(148, 163, 184) # #94A3B8

        # --- Slide 1: Title Slide ---
        title_slide = prs.slides.add_slide(blank_layout)
        
        # Background fill
        background = title_slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = NAVY_BG

        # Title Box
        tx_box = title_slide.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(11.333), Inches(3.0))
        tf = tx_box.text_frame
        tf.word_wrap = True

        p_badge = tf.paragraphs[0]
        p_badge.text = "NTRO GENAI CONTENT TRANSFORMATION PLATFORM"
        p_badge.font.size = Pt(12)
        p_badge.font.bold = True
        p_badge.font.color.rgb = BLUE_ACCENT
        p_badge.space_after = Pt(14)

        p_title = tf.add_paragraph()
        p_title.text = output.title
        p_title.font.size = Pt(32)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_LIGHT
        p_title.space_after = Pt(12)

        p_sub = tf.add_paragraph()
        p_sub.text = output.subtitle or "Official Briefing Presentation"
        p_sub.font.size = Pt(18)
        p_sub.font.color.rgb = TEXT_MUTED

        # --- Subsequent Slides ---
        for s_idx, slide_data in enumerate(output.slides):
            slide = prs.slides.add_slide(blank_layout)

            # Slide Background
            bg = slide.background
            s_fill = bg.fill
            s_fill.solid()
            s_fill.fore_color.rgb = NAVY_BG

            # Slide Header (Title & Slide Counter)
            header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.733), Inches(1.0))
            h_tf = header_box.text_frame
            h_tf.word_wrap = True

            h_p = h_tf.paragraphs[0]
            h_p.text = slide_data.title
            h_p.font.size = Pt(22)
            h_p.font.bold = True
            h_p.font.color.rgb = PURPLE_ACCENT

            # Slide Bullet Points Box
            content_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(11.733), Inches(4.5))
            c_tf = content_box.text_frame
            c_tf.word_wrap = True

            if slide_data.key_points:
                for pt_idx, pt_text in enumerate(slide_data.key_points):
                    p_pt = c_tf.paragraphs[0] if pt_idx == 0 else c_tf.add_paragraph()
                    p_pt.text = f"•  {pt_text}"
                    p_pt.font.size = Pt(16)
                    p_pt.font.color.rgb = TEXT_LIGHT
                    p_pt.space_after = Pt(14)

            # Source Reference Footer
            if slide_data.source_references:
                src_pages = ", ".join([f"Page {r.page_number}" for r in slide_data.source_references])
                footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(6.5), Inches(11.733), Inches(0.5))
                f_tf = footer_box.text_frame
                f_p = f_tf.paragraphs[0]
                f_p.text = f"Source Provenance: {src_pages}"
                f_p.font.size = Pt(10)
                f_p.font.italic = True
                f_p.font.color.rgb = BLUE_ACCENT

            # Insert Speaker Notes into PPTX Notes Frame
            if slide_data.speaker_notes:
                try:
                    notes_slide = slide.notes_slide
                    text_frame = notes_slide.notes_text_frame
                    text_frame.text = slide_data.speaker_notes
                except Exception as n_err:
                    logger.warning(f"Could not write speaker notes on slide {slide_data.slide_number}: {str(n_err)}")

        prs.save(str(destination_path))
        return destination_path
