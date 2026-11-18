import os
import urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageOps

OUT_DIR = "dashboard/public/players"
os.makedirs(OUT_DIR, exist_ok=True)

PLAYERS = {
    "tim_david": {
        "name": "Tim David",
        "url": "https://upload.wikimedia.org/wikipedia/commons/7/78/Tim_david_K%C3%BCnstlerbild.jpg",
        "color": (234, 26, 133), # Pink
        "initials": "TD",
        "is_bowler": False,
        "rank": 1
    },
    "virat_kohli": {
        "name": "Virat Kohli",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg/500px-Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg",
        "color": (234, 26, 133),
        "initials": "VK",
        "is_bowler": False,
        "rank": 2
    },
    "vaibhav_sooryavanshi": {
        "name": "Vaibhav Sooryavanshi",
        "url": "https://upload.wikimedia.org/wikipedia/commons/6/68/Vaibhav_Suryavanshi_meets_PM_Modi.jpg",
        "color": (234, 26, 133),
        "initials": "VS",
        "is_bowler": False,
        "rank": 3
    },
    "mohammad_rizwan": {
        "name": "Mohammad Rizwan",
        "url": "https://upload.wikimedia.org/wikipedia/commons/a/af/M_Rizwan.jpg",
        "color": (234, 26, 133),
        "initials": "MR",
        "is_bowler": False,
        "rank": 4
    },
    "ravindra_jadeja": {
        "name": "Ravindra Jadeja",
        "url": "https://upload.wikimedia.org/wikipedia/commons/2/2c/PM_Shri_Narendra_Modi_with_Ravindra_Jadeja_%28Cropped%29.jpg",
        "color": (234, 26, 133),
        "initials": "RJ",
        "is_bowler": False,
        "rank": 5
    },
    "andre_russell": {
        "name": "Andre Russell",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/9f/Andre_Russell_%281%29.jpg",
        "color": (234, 26, 133),
        "initials": "AR",
        "is_bowler": False,
        "rank": 6
    },
    "pathum_nissanka": {
        "name": "Pathum Nissanka",
        "url": "https://img1.hscicdn.com/image/upload//lsci/db/PICTURES/CMS/323000/323070.png",
        "color": (234, 26, 133),
        "initials": "PN",
        "is_bowler": False,
        "rank": 7
    },
    "ashutosh_sharma": {
        "name": "Ashutosh Sharma",
        "url": "https://www.punjabkingsipl.in/static-assets/images/players/94786.png",
        "color": (234, 26, 133),
        "initials": "AS",
        "is_bowler": False,
        "rank": 8
    },
    "suryakumar_yadav": {
        "name": "Suryakumar Yadav",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Suryakumar_Yadav_in_PMO_New_Delhi.jpg/500px-Suryakumar_Yadav_in_PMO_New_Delhi.jpg",
        "color": (234, 26, 133),
        "initials": "SKY",
        "is_bowler": False,
        "rank": 9
    },
    "ayush_badoni": {
        "name": "Ayush Badoni",
        "url": "https://www.lucknowsupergiants.in/static-assets/images/players/69656.png",
        "color": (234, 26, 133),
        "initials": "AB",
        "is_bowler": False,
        "rank": 10
    },

    # Bowlers
    "umran_malik": {
        "name": "Umran Malik",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Umran_Malik_in_GGM.jpg",
        "color": (37, 99, 235), # Blue
        "initials": "UM",
        "is_bowler": True,
        "rank": 1
    },
    "lockie_ferguson": {
        "name": "Lockie Ferguson",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lockie_Ferguson.jpg/500px-Lockie_Ferguson.jpg",
        "color": (37, 99, 235),
        "initials": "LF",
        "is_bowler": True,
        "rank": 2
    },
    "sufiyan_muqeem": {
        "name": "Sufiyan Muqeem",
        "url": None,
        "color": (37, 99, 235),
        "initials": "SM",
        "is_bowler": True,
        "rank": 3
    },
    "andre_russell_bowl": {
        "name": "Andre Russell",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/9f/Andre_Russell_%281%29.jpg",
        "color": (37, 99, 235),
        "initials": "AR",
        "is_bowler": True,
        "rank": 4
    },
    "patrick_cummins": {
        "name": "Patrick Cummins",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/RSA_vs_AUS_Day_1-47_%28cropped%29.jpg/500px-RSA_vs_AUS_Day_1-47_%28cropped%29.jpg",
        "color": (37, 99, 235),
        "initials": "PC",
        "is_bowler": True,
        "rank": 5
    },
    "josh_hazlewood": {
        "name": "Josh Hazlewood",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/RSA_vs_AUS_Day_1_-_Josh_Hazlewood-1_%28cropped%29.jpg/500px-RSA_vs_AUS_Day_1_-_Josh_Hazlewood-1_%28cropped%29.jpg",
        "color": (37, 99, 235),
        "initials": "JH",
        "is_bowler": True,
        "rank": 6
    },
    "mitchell_starc": {
        "name": "Mitchell Starc",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/RSA_vs_AUS_Day_1_-_Mitchel_Starch_-2.jpg/500px-RSA_vs_AUS_Day_1_-_Mitchel_Starch_-2.jpg",
        "color": (37, 99, 235),
        "initials": "MS",
        "is_bowler": True,
        "rank": 7
    },
    "salman_mirza": {
        "name": "Salman Mirza",
        "url": None,
        "color": (37, 99, 235),
        "initials": "SM",
        "is_bowler": True,
        "rank": 8
    },
    "jacob_duffy": {
        "name": "Jacob Duffy",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/1_01_Jacob_Duffy.jpg/500px-1_01_Jacob_Duffy.jpg",
        "color": (37, 99, 235),
        "initials": "JD",
        "is_bowler": True,
        "rank": 9
    },
    "krunal_pandya": {
        "name": "Krunal Pandya",
        "url": "https://upload.wikimedia.org/wikipedia/commons/b/b3/Krunal_Pandya_and_Hardik_Pandya_%28cropped%29_%28cropped%29.jpg",
        "color": (37, 99, 235),
        "initials": "KP",
        "is_bowler": True,
        "rank": 10
    }
}

def create_stylized_avatar(key, info):
    size = 256
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Gradient background
    bg_color = (15, 23, 42, 255) if info["is_bowler"] else (24, 15, 30, 255)
    border_color = info["color"] + (255,)

    # Outer circle
    draw.ellipse([8, 8, size - 8, size - 8], fill=bg_color, outline=border_color, width=6)
    
    # Inner decorative glow circle
    glow_color = info["color"] + (80,)
    draw.ellipse([14, 14, size - 14, size - 14], outline=glow_color, width=3)

    # Try downloading photo if url exists
    downloaded = False
    if info.get("url"):
        try:
            req = urllib.request.Request(info["url"], headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            with urllib.request.urlopen(req, timeout=4) as resp:
                from io import BytesIO
                src_img = Image.open(BytesIO(resp.read())).convert("RGBA")
                # Square crop from top/center
                w, h = src_img.size
                min_dim = min(w, h)
                left = (w - min_dim) // 2
                top = 0 if h > w else (h - min_dim) // 2
                cropped = src_img.crop((left, top, left + min_dim, top + min_dim))
                resized = cropped.resize((size - 24, size - 24), Image.Resampling.LANCZOS)
                
                # Circular mask
                mask = Image.new("L", (size - 24, size - 24), 0)
                mask_draw = ImageDraw.Draw(mask)
                mask_draw.ellipse([0, 0, size - 24, size - 24], fill=255)
                
                img.paste(resized, (12, 12), mask)
                downloaded = True
                print(f"Downloaded & cropped photo for {info['name']}")
        except Exception as e:
            print(f"Fallback to graphic for {info['name']}: {e}")

    if not downloaded:
        # Draw high-end vector monogram badge
        # Silhouette head & shoulders
        head_top = 55
        head_radius = 40
        draw.ellipse([size//2 - head_radius, head_top, size//2 + head_radius, head_top + head_radius*2], fill=(45, 60, 95, 255) if info["is_bowler"] else (80, 40, 70, 255))
        # Shoulders
        draw.ellipse([size//2 - 75, head_top + 65, size//2 + 75, head_top + 175], fill=(35, 48, 80, 255) if info["is_bowler"] else (65, 30, 55, 255))
        
        # Initials text
        try:
            font = ImageFont.truetype("arial.ttf", 46)
        except:
            font = ImageFont.load_default()
        
        text = info["initials"]
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text(((size - tw) / 2, size/2 + 10), text, fill=(255, 255, 255, 255), font=font)

    # Rank badge pill at bottom
    badge_w = 80
    badge_h = 32
    bx = (size - badge_w) // 2
    by = size - 36
    draw.rounded_rectangle([bx, by, bx + badge_w, by + badge_h], radius=16, fill=border_color)
    
    try:
        badge_font = ImageFont.truetype("arial.ttf", 16)
    except:
        badge_font = ImageFont.load_default()
    rank_text = f"#{info['rank']}"
    r_bbox = draw.textbbox((0, 0), rank_text, font=badge_font)
    rw = r_bbox[2] - r_bbox[0]
    draw.text((bx + (badge_w - rw)/2, by + 6), rank_text, fill=(255, 255, 255, 255), font=badge_font)

    # Save
    out_path = os.path.join(OUT_DIR, f"{key}.png")
    img.save(out_path, "PNG")
    print(f"Saved {out_path}")

print("Generating player hologram badges...")
for k, v in PLAYERS.items():
    create_stylized_avatar(k, v)

print("All 20 player badges generated successfully!")
