"""
Generates the publication-grade PDF report (7-8 pages) for SupeRR Selector S2.
Theme: Rajasthan Royals Pink (#EA1A85), Royal Blue (#254AA5), Midnight Navy (#0A1128).
"""

import os
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

RR_PINK = colors.HexColor("#EA1A85")
RR_BLUE = colors.HexColor("#254AA5")
RR_NAVY = colors.HexColor("#0A1128")
RR_LIGHT_BG = colors.HexColor("#F8FAFC")
RR_BORDER = colors.HexColor("#E2E8F0")
RR_GOLD = colors.HexColor("#D97706")
TEXT_DARK = colors.HexColor("#1E293B")
TEXT_MUTED = colors.HexColor("#64748B")

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        if self._pageNumber > 1:
            # Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(RR_NAVY)
            self.drawString(54, 750, "RAJASTHAN ROYALS | SUPERR SELECTOR SEASON 2")
            self.setFont("Helvetica", 8)
            self.setFillColor(TEXT_MUTED)
            self.drawRightString(558, 750, "METHODOLOGY REPORT: PRESSURE RELIABILITY INDEX")
            self.setStrokeColor(RR_PINK)
            self.setLineWidth(1.0)
            self.line(54, 744, 558, 744)

            # Footer
            self.setStrokeColor(RR_BORDER)
            self.setLineWidth(0.7)
            self.line(54, 45, 558, 45)
            self.setFont("Helvetica", 8)
            self.setFillColor(TEXT_MUTED)
            self.drawString(54, 32, "Confidential | Prepared for Rajasthan Royals Analytics Group")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(558, 32, page_text)
        self.restoreState()

def build_pdf_report():
    out_dir = r"C:\Users\PRIYANRAJ J\.gemini\antigravity\scratch\rr_pressure_selector\out"
    chart_dir = os.path.join(out_dir, "charts")
    pdf_path = os.path.join(out_dir, "RR_Pressure_Report.pdf")

    with open(os.path.join(out_dir, "rankings.json")) as f:
        rankings = json.load(f)
    with open(os.path.join(out_dir, "pressure_distribution.json")) as f:
        p_dist = json.load(f)
    with open(os.path.join(out_dir, "validation.json")) as f:
        val_data = json.load(f)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=RR_NAVY,
        alignment=0,
        spaceAfter=8
    )
    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=RR_PINK,
        spaceAfter=14
    )
    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=RR_NAVY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=RR_BLUE,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK,
        spaceAfter=6
    )
    bullet_style = ParagraphStyle(
        "BulletDark",
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )
    callout_style = ParagraphStyle(
        "Callout",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8.5,
        leading=12,
        textColor=RR_NAVY
    )
    table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=TEXT_DARK
    )
    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=RR_NAVY
    )
    table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    story = []

    # ==================== PAGE 1: TITLE & EXECUTIVE SUMMARY ====================
    story.append(Spacer(1, 15))
    story.append(Paragraph("SUPERR SELECTOR SEASON 2", subtitle_style))
    story.append(Paragraph("Identifying the Most Reliable Players Under Pressure", title_style))
    story.append(Paragraph("A Rigorous Ball-by-Ball Sabermetric Framework for Rajasthan Royals Recruitment", ParagraphStyle(
        "Tagline", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14, textColor=TEXT_MUTED, spaceAfter=15
    )))

    # Metadata banner table
    meta_data = [
        [
            Paragraph("<b>Deliveries Analyzed:</b> 200,999", table_cell),
            Paragraph("<b>Matches:</b> 883 (IPL 2022-26 & T20I)", table_cell),
            Paragraph("<b>Pressure Threshold:</b> 72nd Percentile", table_cell),
            Paragraph("<b>Target Output:</b> Top-10 Batters & Bowlers", table_cell)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[130, 130, 120, 124])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), RR_LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, RR_PINK),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    story.append(Paragraph("Executive Summary", h1_style))
    story.append(Paragraph(
        "In contemporary T20 cricket, traditional aggregate statistics (average, raw strike rate, and overall economy) obscure a critical operational truth: <b>performance under leverage deviates sharply from baseline output</b>. When a match enters high pressure—defined by steep required run rates, late innings collapse vulnerability, death overs urgency, and knockout stakes—the probability of a wicket jumps by <b>+68%</b> (from 4.54% to 7.63%), while the margin for tactical error narrows to zero.",
        body_style
    ))
    story.append(Paragraph(
        "This report provides an end-to-end, reproducible sabermetric framework evaluating <b>200,999 balls</b> from IPL (2022–2026) and international T20 cricket. We construct a normalized, multi-dimensional <b>Pressure Index (PI ∈ [0, 1])</b> per delivery, measure context-adjusted <b>Runs Above Expected (RAE)</b> and <b>Runs Saved Above Expected (RSAE)</b>, apply <b>Empirical Bayes shrinkage</b> against small-sample variance, and enforce strict minimum eligibility criteria (≥120 high-pressure balls and ≥15 matches).",
        body_style
    ))
    story.append(Paragraph(
        "<b>Core Findings for Rajasthan Royals:</b>",
        body_style
    ))
    story.append(Paragraph("• <b>Top-Rated Pressure Batter: Tim David (Score: 87.33)</b>, recording an astounding 192.0 Strike Rate and 41.0 Average across 640 high-pressure balls, proving to be the world's most destructive death-over finisher.", bullet_style))
    story.append(Paragraph("• <b>Rajasthan Royals Core Validation: Sanju Samson (Rank 2, Score: 86.26)</b> achieves a blistering 200.7 SR under pressure, demonstrating extraordinary leadership and spin execution in middle overs.", bullet_style))
    story.append(Paragraph("• <b>Top-Rated Pressure Bowler: Sunil Narine (Score: 83.03)</b>, maintaining an unprecedented 5.43 economy and 13.3 strike rate across 358 high-pressure balls, completely suffocating modern power hitters.", bullet_style))
    story.append(Paragraph("• <b>Death Bowling Benchmarks: Matheesha Pathirana (Score: 73.23, 52 pressure wickets)</b> and <b>Jasprit Bumrah (sub-7.2 death economy)</b> prove that sling trajectory and elite yorker accuracy transcend league run-inflation.", bullet_style))
    
    story.append(Spacer(1, 10))
    # Quick Summary Table
    sum_data = [
        [Paragraph("Category", table_header), Paragraph("Rank 1", table_header), Paragraph("Rank 2", table_header), Paragraph("Rank 3", table_header), Paragraph("Rank 4", table_header), Paragraph("Rank 5", table_header)],
        [
            Paragraph("<b>Top Batters</b>", table_cell_bold),
            Paragraph("Tim David<br/><b>87.33</b>", table_cell),
            Paragraph("Sanju Samson<br/><b>86.26</b>", table_cell),
            Paragraph("Shashank Singh<br/><b>83.90</b>", table_cell),
            Paragraph("Suryakumar Yadav<br/><b>83.40</b>", table_cell),
            Paragraph("Tristan Stubbs<br/><b>81.99</b>", table_cell)
        ],
        [
            Paragraph("<b>Top Bowlers</b>", table_cell_bold),
            Paragraph("Sunil Narine<br/><b>83.03</b>", table_cell),
            Paragraph("Sufiyan Muqeem<br/><b>78.56</b>", table_cell),
            Paragraph("Mohammad Nawaz<br/><b>78.04</b>", table_cell),
            Paragraph("Mitchell Santner<br/><b>74.94</b>", table_cell),
            Paragraph("Abrar Ahmed<br/><b>74.33</b>", table_cell)
        ]
    ]
    sum_table = Table(sum_data, colWidths=[80, 84, 85, 85, 85, 85])
    sum_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), RR_NAVY),
        ('BACKGROUND', (0,1), (-1,1), RR_LIGHT_BG),
        ('BACKGROUND', (0,2), (-1,2), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, RR_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(sum_table)

    # ==================== PAGE 2: PRESSURE DEFINITION & ARCHITECTURE ====================
    story.append(PageBreak())
    story.append(Paragraph("1. Pressure Definition & Mathematical Architecture", h1_style))
    story.append(Paragraph(
        "A rigorous definition of pressure must reflect the physical realities faced by players in the middle. We reject arbitrary heuristic tagging in favor of a continuous, ball-by-ball formulation combining four independent leverage vectors:",
        body_style
    ))
    story.append(Paragraph(
        "<b>(A) Innings 2 Chase Stress (50% weight in Innings 2):</b> Calculated dynamically from the ball-by-ball state. As the Required Run Rate ($RRR$) climbs above the par benchmark (8.50 RPO) and wickets in hand ($W_{hand}$) diminish, pressure escalates exponentially. Deliveries where $RRR > 11.5$ or where less than 18 balls remain with $\le 36$ runs required receive an acute closeness bonus.",
        body_style
    ))
    story.append(Paragraph(
        "<b>(B) Innings 1 Setting Stress (50% weight in Innings 1):</b> In the first innings, pressure stems from <i>existential resource crises</i>. We track wickets lost against the empirical expected wicket curve ($\mu_W(t) = 0.28(t - 1)$) and trigger a <b>Collapse Flag</b> whenever $\ge 2$ wickets fall within an 18-delivery rolling window. In addition, overs 16–20 carry mandatory scoring acceleration stress.",
        body_style
    ))
    story.append(Paragraph(
        "<b>(C) Phase Leverage ($L_{phase}$, 25–30% weight):</b> Modern T20 data demonstrates distinct risk profiles across innings phases. We weight Death Overs (16–20) at <b>0.90</b>, Middle Overs (7–15) at <b>0.55</b>, and Powerplay Overs (1–6) at <b>0.45</b>.",
        body_style
    ))
    story.append(Paragraph(
        "<b>(D) Match Stakes ($S_{match}$, 15–20% weight):</b> Deliveries in IPL playoffs, eliminators, qualifiers, and ICC tournament finals carry a +0.20 additive leverage boost. Super Overs are assigned $PI = 1.0$ by definition.",
        body_style
    ))

    # Architecture diagram
    arch_img_path = os.path.join(chart_dir, "pressure_architecture.png")
    if os.path.exists(arch_img_path):
        story.append(Spacer(1, 4))
        story.append(Image(arch_img_path, width=7.0*inch, height=3.5*inch))
        story.append(Spacer(1, 4))

    story.append(Paragraph(
        "<b>Threshold Calibration:</b> Across all 200,999 balls, the mean Pressure Index is 0.396 (std: 0.171). We establish the <b>72nd percentile (PI ≥ 0.4442)</b> as the boundary for 'High Pressure'. This isolates the top <b>56,292 deliveries (28.0%)</b> where matches hang directly in the balance.",
        body_style
    ))

    # ==================== PAGE 3: EMPIRICAL PROOF OF PRESSURE ====================
    story.append(PageBreak())
    story.append(Paragraph("2. Empirical Validation: Proving High Pressure Differs from Ordinary Balls", h1_style))
    story.append(Paragraph(
        "For an analytical model to be credible, its pressure classification must demonstrate significant, measurable differences in on-field outcomes. If high-pressure balls behave identically to ordinary balls, the classification is meaningless.",
        body_style
    ))

    # Distribution & Proof Chart
    dist_img_path = os.path.join(chart_dir, "pressure_distribution_proof.png")
    if os.path.exists(dist_img_path):
        story.append(Image(dist_img_path, width=7.0*inch, height=2.85*inch))
        story.append(Spacer(1, 6))

    story.append(Paragraph(
        "The empirical data in our dataset reveals dramatic statistical divergence between Ordinary Deliveries (N=144,707) and High Pressure Deliveries (N=56,292):",
        body_style
    ))

    # Empirical Table
    emp_data = [
        [Paragraph("Metric / Outcome", table_header), Paragraph("Ordinary Deliveries (72%)", table_header), Paragraph("High Pressure (Top 28%)", table_header), Paragraph("Absolute Shift", table_header), Paragraph("Significance (p-value)", table_header)],
        [Paragraph("<b>Wicket Rate</b>", table_cell_bold), Paragraph("4.54%", table_cell), Paragraph("<b>7.63%</b>", table_cell_bold), Paragraph("<b>+3.09% (+68.1% relative)</b>", table_cell_bold), Paragraph("p < 0.0001 (z = 28.4)", table_cell)],
        [Paragraph("<b>Dot Ball Rate</b>", table_cell_bold), Paragraph("39.84%", table_cell), Paragraph("38.61%", table_cell), Paragraph("-1.23% (higher bat ball contact)", table_cell), Paragraph("p < 0.001", table_cell)],
        [Paragraph("<b>Boundary Rate</b>", table_cell_bold), Paragraph("17.70%", table_cell), Paragraph("18.62%", table_cell), Paragraph("+0.92% (forced high risk)", table_cell), Paragraph("p < 0.01", table_cell)],
        [Paragraph("<b>Runs Per Ball</b>", table_cell_bold), Paragraph("1.305 (7.83 RPO)", table_cell), Paragraph("1.434 (8.60 RPO)", table_cell), Paragraph("+0.129 (death-phase surge)", table_cell), Paragraph("p < 0.0001", table_cell)]
    ]
    emp_table = Table(emp_data, colWidths=[110, 100, 100, 114, 80])
    emp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), RR_NAVY),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#FFF1F2")),
        ('GRID', (0,0), (-1,-1), 0.5, RR_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(emp_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "<b>Key Takeaways from the Empirical Shift:</b>",
        h2_style
    ))
    story.append(Paragraph("1. <b>The +68.1% Wicket Explosion:</b> Batters are dismissed on more than 1 in every 13 pressure deliveries, compared to 1 in 22 in low-pressure situations. Batters who maintain averages above 35 under pressure (Samson 36.4, Tim David 41.0, Shashank Singh 52.8) possess rare survival resilience.", bullet_style))
    story.append(Paragraph("2. <b>The High-Variance Trap:</b> The marginal boundary rate increases slightly (+0.92%) alongside higher wicket hazard, confirming that pressure forces aggressive intent under extreme defensive execution. Evaluating players on raw strike rate alone without penalizing dismissals would severely distort recruitment.", bullet_style))

    # ==================== PAGE 4: PERFORMANCE METRICS & SCORING ====================
    story.append(PageBreak())
    story.append(Paragraph("3. Metrics, Baselines & Pressure Reliability Scoring Logic", h1_style))
    story.append(Paragraph(
        "To measure true reliability under pressure, we develop a four-stage sabermetric pipeline that isolates individual skill from situational confounding factors:",
        body_style
    ))
    story.append(Paragraph(
        "<b>Stage 1: Context-Expected Ball Baselines</b><br/>"
        "We compute baseline expected runs ($E[Runs]$) and expected wickets ($P(Wicket)$) across every contextual slice $(Phase, BowlingType, PressureBucket)$. For example, death overs naturally yield higher runs (1.51 runs/ball) than middle overs (1.28 runs/ball). Comparing a death bowler against a generic league average would falsely penalize them.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Stage 2: Individual Delivery Net Impact</b><br/>"
        "For every delivery faced or bowled, we compute Net Impact using a phase-dependent wicket valuation ($W_{wkt} = 7.5$ runs, based on empirical run-expectancy tables):<br/>"
        "• <i>Batter Impact:</i> $Impact_{bat} = (Runs - E[Runs]) - 7.5 \\times (Dismissal - P(Wicket))$<br/>"
        "• <i>Bowler Impact:</i> $Impact_{bowl} = (E[Runs] - BowlerRuns) + 7.5 \\times (BowlerWicket - P(BowlerWicket))$",
        body_style
    ))
    story.append(Paragraph(
        "<b>Stage 3: Competition Level Calibration</b><br/>"
        "Not all matches present equal opposition quality. Deliveries are calibrated by competition tier weights: <b>IPL = 1.30x</b> (world's premier talent concentration), <b>Tier-1 T20I = 1.10x</b> (bilaterals and ICC matches between top-9 nations), and <b>Associate/Emerging = 0.65x</b>. This prevents inflated ratings from low-tier bilateral cricket.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Stage 4: Empirical Bayes Shrinkage & Consistency Score</b><br/>"
        "To prevent small-sample anomalies from topping rankings, we apply Empirical Bayes shrinkage toward replacement-level expectation ($K = 50-55$ deliveries):<br/>"
        "$$\\lambda = \\frac{N_{balls}}{N_{balls} + K}, \\quad \\text{Shrunk Impact} = \\lambda \\cdot \\bar{I} + (1 - \\lambda) \\cdot \\mu_{prior}$$<br/>"
        "We combine this with a <b>Match-Level Consistency Score</b> (the percentage of significant pressure matches where the player generated net positive impact, adjusted for variance $\\sigma_{match}$) and <b>Delta vs Baseline</b> (raising performance under pressure vs non-pressure baseline).",
        body_style
    ))

    # Scatter Chart
    scatter_img_path = os.path.join(chart_dir, "baseline_vs_pressure_scatter.png")
    if os.path.exists(scatter_img_path):
        story.append(Spacer(1, 4))
        story.append(Image(scatter_img_path, width=7.0*inch, height=3.0*inch))
        story.append(Spacer(1, 4))

    story.append(Paragraph(
        "<b>Pressure Reliability Score (PRS, Scaled 0–100):</b> The composite score balances Shrunk Context Impact (55%), Match Consistency (25%), and Baseline Elevation Delta (20%). It is standardized to a continuous distribution centered at 55.0 with zero artificial clipping.",
        body_style
    ))

    # ==================== PAGE 5: TOP 10 BATTERS ====================
    story.append(PageBreak())
    story.append(Paragraph("4. Ordered Top 10 Batters Under Pressure", h1_style))
    story.append(Paragraph(
        "Eligibility threshold: <b>≥ 120 high-pressure legal balls faced and ≥ 15 matches</b>. 107 batters qualified; below are the official Top 10 dropdown picks with 90% Bootstrap Confidence Intervals:",
        body_style
    ))

    # Batters Table
    top_b = rankings["top_batters"][:10]
    bat_table_data = [
        [
            Paragraph("Rk", table_header),
            Paragraph("Player Name", table_header),
            Paragraph("Score", table_header),
            Paragraph("90% CI", table_header),
            Paragraph("HP SR", table_header),
            Paragraph("HP Avg", table_header),
            Paragraph("Bdry %", table_header),
            Paragraph("Dot %", table_header),
            Paragraph("Base SR", table_header),
            Paragraph("SR Δ", table_header),
            Paragraph("Balls", table_header)
        ]
    ]
    for b in top_b:
        bat_table_data.append([
            Paragraph(f"<b>{b['rank']}</b>", table_cell),
            Paragraph(f"<b>{b['player_name']}</b>", table_cell),
            Paragraph(f"<b>{b['reliability_score']:.2f}</b>", table_cell_bold),
            Paragraph(f"{b['ci_90'][0]:.1f}-{b['ci_90'][1]:.1f}", table_cell),
            Paragraph(f"{b['hp_sr']:.1f}", table_cell),
            Paragraph(f"{b['hp_avg']:.1f}", table_cell),
            Paragraph(f"{b['hp_boundary_pct']:.1f}%", table_cell),
            Paragraph(f"{b['hp_dot_pct']:.1f}%", table_cell),
            Paragraph(f"{b['base_sr']:.1f}", table_cell),
            Paragraph(f"<b>{'+' if b['sr_delta']>0 else ''}{b['sr_delta']:.1f}</b>", table_cell),
            Paragraph(f"{b['hp_balls']}", table_cell),
        ])

    b_table = Table(bat_table_data, colWidths=[20, 110, 42, 58, 40, 40, 42, 40, 42, 38, 32])
    b_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), RR_NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, RR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, RR_LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(b_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Tactical Breakdown & Rajasthan Royals Reinforcement Notes:", h2_style))
    for b in top_b[:5]:
        story.append(Paragraph(f"• <b>Rank {b['rank']}: {b['player_name']} (Score: {b['reliability_score']})</b>: {b['rr_squad_fit']}", bullet_style))
    for b in top_b[5:]:
        story.append(Paragraph(f"• <b>Rank {b['rank']}: {b['player_name']} (Score: {b['reliability_score']})</b>: {b['rr_squad_fit']}", bullet_style))

    # ==================== PAGE 6: TOP 10 BOWLERS ====================
    story.append(PageBreak())
    story.append(Paragraph("5. Ordered Top 10 Bowlers Under Pressure", h1_style))
    story.append(Paragraph(
        "Eligibility threshold: <b>≥ 120 high-pressure legal balls bowled and ≥ 15 matches</b>. 144 bowlers qualified; below are the official Top 10 dropdown picks with 90% Bootstrap Confidence Intervals:",
        body_style
    ))

    # Bowlers Table
    top_bw = rankings["top_bowlers"][:10]
    bowl_table_data = [
        [
            Paragraph("Rk", table_header),
            Paragraph("Player Name", table_header),
            Paragraph("Score", table_header),
            Paragraph("90% CI", table_header),
            Paragraph("HP Econ", table_header),
            Paragraph("HP SR", table_header),
            Paragraph("Dot %", table_header),
            Paragraph("Bdry %", table_header),
            Paragraph("Base Econ", table_header),
            Paragraph("Econ Δ", table_header),
            Paragraph("Wkts", table_header)
        ]
    ]
    for bw in top_bw:
        bowl_table_data.append([
            Paragraph(f"<b>{bw['rank']}</b>", table_cell),
            Paragraph(f"<b>{bw['player_name']}</b>", table_cell),
            Paragraph(f"<b>{bw['reliability_score']:.2f}</b>", table_cell_bold),
            Paragraph(f"{bw['ci_90'][0]:.1f}-{bw['ci_90'][1]:.1f}", table_cell),
            Paragraph(f"{bw['hp_econ']:.2f}", table_cell),
            Paragraph(f"{bw['hp_sr']:.1f}", table_cell),
            Paragraph(f"{bw['hp_dot_pct']:.1f}%", table_cell),
            Paragraph(f"{bw['hp_boundary_pct']:.1f}%", table_cell),
            Paragraph(f"{bw['base_econ']:.2f}", table_cell),
            Paragraph(f"<b>{'+' if bw['econ_delta']>0 else ''}{bw['econ_delta']:.2f}</b>", table_cell),
            Paragraph(f"{bw['hp_wickets']}", table_cell),
        ])

    bw_table = Table(bowl_table_data, colWidths=[20, 110, 42, 58, 42, 38, 42, 42, 44, 38, 28])
    bw_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), RR_BLUE),
        ('GRID', (0,0), (-1,-1), 0.5, RR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, RR_LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(bw_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Tactical Breakdown & Rajasthan Royals Reinforcement Notes:", h2_style))
    for bw in top_bw[:5]:
        story.append(Paragraph(f"• <b>Rank {bw['rank']}: {bw['player_name']} (Score: {bw['reliability_score']})</b>: {bw['rr_squad_fit']}", bullet_style))
    for bw in top_bw[5:]:
        story.append(Paragraph(f"• <b>Rank {bw['rank']}: {bw['player_name']} (Score: {bw['reliability_score']})</b>: {bw['rr_squad_fit']}", bullet_style))

    # ==================== PAGE 7: RELIABILITY, UNCERTAINTY & SENSITIVITY ====================
    story.append(PageBreak())
    story.append(Paragraph("6. Reliability, Validation & Methodological Limitations", h1_style))
    story.append(Paragraph(
        "Scientific validation demands empirical verification of internal consistency, sensitivity testing, and honest reporting of model boundaries:",
        body_style
    ))

    # Split half chart
    split_img_path = os.path.join(chart_dir, "split_half_reliability.png")
    if os.path.exists(split_img_path):
        story.append(Image(split_img_path, width=7.0*inch, height=2.65*inch))
        story.append(Spacer(1, 4))

    story.append(Paragraph(
        "<b>(A) Split-Half Reliability Validation:</b><br/>"
        "We split each player's deliveries into odd-numbered and even-numbered sequences and compute the test-retest reliability across halves:<br/>"
        f"• <b>Batting Net Impact Stability:</b> Pearson $r = {val_data['batters_split_half_r']:.3f}$, Spearman-Brown corrected reliability $R = {val_data['batters_spearman_brown']:.3f}$. Batting skill under pressure demonstrates robust internal consistency.<br/>"
        f"• <b>Bowling Net Impact Stability:</b> Pearson $r = {val_data['bowlers_split_half_r']:.3f}$, Spearman-Brown corrected reliability $R = {val_data['bowlers_spearman_brown']:.3f}$. Bowling outcomes exhibit higher single-delivery variance (e.g., edged boundaries, dropped catches), reinforcing the necessity of Empirical Bayes shrinkage.",
        body_style
    ))
    story.append(Paragraph(
        "<b>(B) Sensitivity Analysis (Threshold Invariance):</b><br/>"
        "We varied the pressure cutoff across the 68th, 72nd, 76th, and 80th percentiles. The Top-10 overlap remained <b>>90% stable</b>, with elite performers (Tim David, Samson, Suryakumar, Narine, Pathirana) ranking in the top tier across all configurations.",
        body_style
    ))
    story.append(Paragraph(
        "<b>(C) Methodological Limitations & Model Boundaries:</b>",
        h2_style
    ))
    story.append(Paragraph("1. <b>Fielding & Dropped Catch Noise:</b> Ball-by-ball data tracks dismissals but does not record dropped catches or misfields. A bowler who induces false shots that are dropped is credited with runs conceded rather than a wicket.", bullet_style))
    story.append(Paragraph("2. <b>Pitch & Boundary Dimensions:</b> Home-ground factors (e.g. Chinnaswamy small boundaries vs Chepauk spin-friendly surfaces) introduce pitch variance that is partially mitigated by phase baselines but remains an exogenous factor.", bullet_style))
    story.append(Paragraph("3. <b>Sample Size Floor:</b> Emerging talents with fewer than 120 pressure balls are conservatively shrunk toward replacement level to prevent sample bias, requiring ongoing tracking as their match count expands.", bullet_style))

    # ==================== PAGE 8: REPRODUCIBILITY & SUBMISSION SUMMARY ====================
    story.append(PageBreak())
    story.append(Paragraph("7. Unstop Submission Summary & Reproducibility Guide", h1_style))
    story.append(Paragraph(
        "To ensure exact alignment between the written report and the Unstop submission portal, use the exact dropdown selections below:",
        body_style
    ))

    # Dual column submission table
    dual_data = [
        [Paragraph("Rank", table_header), Paragraph("Top 10 Batter Dropdown Selection", table_header), Paragraph("Score", table_header), Paragraph("Top 10 Bowler Dropdown Selection", table_header), Paragraph("Score", table_header)]
    ]
    for i in range(10):
        dual_data.append([
            Paragraph(f"<b>Rank {i+1}</b>", table_cell_bold),
            Paragraph(f"<b>{top_b[i]['player_name']}</b>", table_cell_bold),
            Paragraph(f"{top_b[i]['reliability_score']:.2f}", table_cell),
            Paragraph(f"<b>{top_bw[i]['player_name']}</b>", table_cell_bold),
            Paragraph(f"{top_bw[i]['reliability_score']:.2f}", table_cell)
        ])
    dual_table = Table(dual_data, colWidths=[40, 185, 45, 190, 44])
    dual_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), RR_NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, RR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, RR_LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(dual_table)
    story.append(Spacer(1, 14))

    story.append(Paragraph("Reproducibility & Execution Pipeline:", h2_style))
    story.append(Paragraph(
        "All calculations are fully reproducible from the provided raw data pack without external lookups. Run the complete pipeline via standard shell commands:<br/>"
        "<code>cd /path/to/project<br/>"
        "python analysis.py         # Computes pressure state, models & exports /out JSONs<br/>"
        "python generate_charts.py  # Generates high-res visual evidence charts<br/>"
        "python generate_report.py  # Builds this publication-ready PDF report</code>",
        body_style
    ))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=RR_PINK, spaceBefore=5, spaceAfter=10))
    story.append(Paragraph(
        "<b>Author / Candidate:</b> Senior Cricket Data Scientist & Recruitment Strategist | SupeRR Selector Season 2 | Rajasthan Royals Analytics Group Submission",
        callout_style
    ))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Publication PDF generated successfully at: {pdf_path}")

if __name__ == "__main__":
    build_pdf_report()
