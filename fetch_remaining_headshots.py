import urllib.request, re, os
from PIL import Image, ImageDraw
from io import BytesIO

OUT_DIR = "dashboard/public/players"

CRICINFO_PLAYERS = {
    "umran_malik": ("https://www.espncricinfo.com/cricketers/umran-malik-1246528", (37, 99, 235), 1),
    "josh_hazlewood": ("https://www.espncricinfo.com/cricketers/josh-hazlewood-288284", (37, 99, 235), 6),
    "andre_russell": ("https://www.espncricinfo.com/cricketers/andre-russell-276298", (234, 26, 133), 6),
    "tim_david": ("https://www.espncricinfo.com/cricketers/tim-david-892711", (234, 26, 133), 1),
    "pat_cummins": ("https://www.espncricinfo.com/cricketers/pat-cummins-489889", (37, 99, 235), 5),
    "mitchell_starc": ("https://www.espncricinfo.com/cricketers/mitchell-starc-311592", (37, 99, 235), 7),
    "jacob_duffy": ("https://www.espncricinfo.com/cricketers/jacob-duffy-502509", (37, 99, 235), 9),
    "sufiyan_muqeem": ("https://www.espncricinfo.com/cricketers/sufiyan-muqeem-1415518", (37, 99, 235), 3),
}

def process_and_save(key, img_url, color, rank):
    req = urllib.request.Request(img_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=5) as r:
        src = Image.open(BytesIO(r.read())).convert("RGBA")
        size = 256
        w, h = src.size
        min_dim = min(w, h)
        left = (w - min_dim) // 2
        top = 0 if h > w else (h - min_dim) // 2
        cropped = src.crop((left, top, left + min_dim, top + min_dim))
        resized = cropped.resize((size - 24, size - 24), Image.Resampling.LANCZOS)
        
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(canvas)
        draw.ellipse([8, 8, size - 8, size - 8], fill=(15, 23, 42, 255), outline=color + (255,), width=6)
        
        mask = Image.new("L", (size - 24, size - 24), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([0, 0, size - 24, size - 24], fill=255)
        canvas.paste(resized, (12, 12), mask)
        
        # Rank pill
        bx = (size - 80) // 2
        by = size - 36
        draw.rounded_rectangle([bx, by, bx + 80, by + 32], radius=16, fill=color + (255,))
        
        from PIL import ImageFont
        try:
            f = ImageFont.truetype("arial.ttf", 16)
        except:
            f = ImageFont.load_default()
        bbox = draw.textbbox((0, 0), f"#{rank}", font=f)
        rw = bbox[2] - bbox[0]
        draw.text((bx + (80 - rw)/2, by + 6), f"#{rank}", fill=(255, 255, 255, 255), font=f)
        
        out_path = os.path.join(OUT_DIR, f"{key}.png")
        canvas.save(out_path, "PNG")
        print(f"Successfully saved updated portrait for {key}")

for k, (page_url, color, rank) in CRICINFO_PLAYERS.items():
    try:
        req = urllib.request.Request(page_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=5) as r:
            html = r.read().decode("utf-8", errors="ignore")
            matches = re.findall(r"https://img1\.hscicdn\.com/image/upload/[^\"\'\s]+\.png", html)
            if matches:
                # Pick the player image (usually has /lsci/db/PICTURES/)
                img_url = matches[0]
                for m in matches:
                    if "PICTURES" in m or "square" in m:
                        img_url = m
                        break
                print(f"Found {k} image: {img_url}")
                process_and_save(k, img_url, color, rank)
                if k == "andre_russell":
                    process_and_save("andre_russell_bowl", img_url, (37, 99, 235), 4)
    except Exception as e:
        print(f"Failed {k}: {e}")
