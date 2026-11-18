"""
Generates the companion PowerPoint presentation (8 slides) for SupeRR Selector S2.
Theme: Rajasthan Royals Pink (#EA1A85), Royal Blue (#254AA5), Midnight Navy (#0A1128).
"""

import os
import json
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

def build_pptx():
    out_dir = r"C:\Users\PRIYANRAJ J\.gemini\antigravity\scratch\rr_pressure_selector\out"
    chart_dir = os.path.join(out_dir, "charts")
    pptx_path = os.path.join(out_dir, "RR_Pressure_Presentation.pptx")

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    COLOR_NAVY = RGBColor(10, 17, 40)
    COLOR_PINK = RGBColor(234, 26, 133)
    COLOR_BLUE = RGBColor(37, 74, 165)
    COLOR_WHITE = RGBColor(255, 255, 255)
    COLOR_MUTED = RGBColor(148, 163, 184)
    COLOR_DARK = RGBColor(30, 41, 59)

    blank_layout = prs.slide_layouts[6]

    with open(os.path.join(out_dir, "rankings.json")) as f:
        rankings = json.load(f)

    # Slide 1: Title Slide (Dark Theme)
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(1, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = COLOR_NAVY
    bg1.line.color.rgb = COLOR_NAVY

    # Title box
    tb = s1.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.333), Inches(3.5))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p0 = tf.paragraphs[0]
    p0.text = "SUPERR SELECTOR SEASON 2 | RAJASTHAN ROYALS"
    p0.font.size = Pt(18)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_PINK

    p1 = tf.add_paragraph()
    p1.text = "Identifying the Most Reliable Players Under Pressure"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_WHITE
    p1.space_before = Pt(12)

    p2 = tf.add_paragraph()
    p2.text = "A Sabermetric Ball-by-Ball Analysis of 200,999 Deliveries (IPL & T20I, 2022-2026)"
    p2.font.size = Pt(18)
    p2.font.color.rgb = COLOR_MUTED
    p2.space_before = Pt(12)

    # Slide 2: Executive Summary & Core Top Picks
    s2 = prs.slides.add_slide(blank_layout)
    # Header
    tb = s2.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.0))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "Executive Summary: The Modern Pressure Paradigm"
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY

    # Add Top 10 Chart image
    img_path = os.path.join(chart_dir, "top10_rankings_ci.png")
    if os.path.exists(img_path):
        s2.shapes.add_picture(img_path, Inches(0.8), Inches(1.6), width=Inches(11.7))

    # Slide 3: Pressure Architecture Diagram
    s3 = prs.slides.add_slide(blank_layout)
    tb = s3.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.0))
    p = tb.text_frame.paragraphs[0]
    p.text = "Pressure Index Architecture (PI ∈ [0, 1])"
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY

    img_arch = os.path.join(chart_dir, "pressure_architecture.png")
    if os.path.exists(img_arch):
        s3.shapes.add_picture(img_arch, Inches(1.2), Inches(1.6), width=Inches(10.9))

    # Slide 4: Empirical Proof
    s4 = prs.slides.add_slide(blank_layout)
    tb = s4.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.0))
    p = tb.text_frame.paragraphs[0]
    p.text = "Empirical Proof: High Pressure vs Baseline Shift"
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY

    img_dist = os.path.join(chart_dir, "pressure_distribution_proof.png")
    if os.path.exists(img_dist):
        s4.shapes.add_picture(img_dist, Inches(1.2), Inches(1.6), width=Inches(10.9))

    # Slide 5: Baseline vs Pressure Elevation Scatter
    s5 = prs.slides.add_slide(blank_layout)
    tb = s5.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.0))
    p = tb.text_frame.paragraphs[0]
    p.text = "Player Elevation: Baseline vs High-Pressure Performance"
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY

    img_scat = os.path.join(chart_dir, "baseline_vs_pressure_scatter.png")
    if os.path.exists(img_scat):
        s5.shapes.add_picture(img_scat, Inches(1.2), Inches(1.6), width=Inches(10.9))

    # Slide 6: Statistical Reliability & Limitations
    s6 = prs.slides.add_slide(blank_layout)
    tb = s6.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.0))
    p = tb.text_frame.paragraphs[0]
    p.text = "Reliability Validation & Methodological Boundaries"
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY

    img_rel = os.path.join(chart_dir, "split_half_reliability.png")
    if os.path.exists(img_rel):
        s6.shapes.add_picture(img_rel, Inches(1.2), Inches(1.6), width=Inches(10.9))

    # Slide 7: Submission Dropdown Selections
    s7 = prs.slides.add_slide(blank_layout)
    tb = s7.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.0))
    p = tb.text_frame.paragraphs[0]
    p.text = "Unstop Submission Table (Official Dropdown Selections)"
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY

    # Table on slide 7
    rows, cols = 11, 5
    table_shape = s7.shapes.add_table(rows, cols, Inches(0.8), Inches(1.5), Inches(11.7), Inches(5.2))
    table = table_shape.table

    col_names = ["Rank", "Top 10 Batter Pick", "Reliability Score", "Top 10 Bowler Pick", "Reliability Score"]
    for i, name in enumerate(col_names):
        cell = table.cell(0, i)
        cell.text = name
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLOR_NAVY

    top_b = rankings["top_batters"][:10]
    top_bw = rankings["top_bowlers"][:10]
    for r in range(10):
        c0 = table.cell(r + 1, 0)
        c0.text = f"Rank {r + 1}"
        c1 = table.cell(r + 1, 1)
        c1.text = top_b[r]["player_name"]
        c2 = table.cell(r + 1, 2)
        c2.text = f"{top_b[r]['reliability_score']:.2f}"
        c3 = table.cell(r + 1, 3)
        c3.text = top_bw[r]["player_name"]
        c4 = table.cell(r + 1, 4)
        c4.text = f"{top_bw[r]['reliability_score']:.2f}"

    # Slide 8: Closing & Reproducibility
    s8 = prs.slides.add_slide(blank_layout)
    bg8 = s8.shapes.add_shape(1, 0, 0, Inches(13.333), Inches(7.5))
    bg8.fill.solid()
    bg8.fill.fore_color.rgb = COLOR_NAVY
    bg8.line.color.rgb = COLOR_NAVY

    tb8 = s8.shapes.add_textbox(Inches(1.5), Inches(2.2), Inches(10.333), Inches(3.0))
    tf8 = tb8.text_frame
    p = tf8.paragraphs[0]
    p.text = "Rajasthan Royals | SupeRR Selector Season 2"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_PINK

    p_c = tf8.add_paragraph()
    p_c.text = "100% Data-Driven • Reproducible • Statistically Validated"
    p_c.font.size = Pt(32)
    p_c.font.bold = True
    p_c.font.color.rgb = COLOR_WHITE
    p_c.space_before = Pt(12)

    p_sub = tf8.add_paragraph()
    p_sub.text = "Reproduce full analysis pipeline: python analysis.py\nReport PDF: out/RR_Pressure_Report.pdf\nInteractive 3D Dashboard: ./dashboard"
    p_sub.font.size = Pt(16)
    p_sub.font.color.rgb = COLOR_MUTED
    p_sub.space_before = Pt(16)

    prs.save(pptx_path)
    print(f"Presentation PPTX generated successfully at: {pptx_path}")

if __name__ == "__main__":
    build_pptx()
