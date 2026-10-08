#!/usr/bin/env python3
"""Favicon (SVG), Apple touch icon and the social preview image (og.png). Needs Pillow.
    ~/work/fin-venv/bin/python tools/make_icons.py"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

A = Path(__file__).resolve().parent.parent / "site" / "assets"
SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SERIF_R = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
NAVY, INK, PAPER = (36, 66, 124), (23, 24, 28), (247, 245, 241)

(A / "favicon.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#24427c"/>'
    '<text x="32" y="42" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-weight="700" '
    'font-size="28" fill="#fff">SB</text></svg>\n')

def mono(size):
    im = Image.new("RGB", (size, size), NAVY)
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(SERIF, int(size * 0.44))
    d.text((size / 2, size / 2 + size * 0.02), "SB", font=f, fill="white", anchor="mm")
    return im

mono(180).save(A / "apple-touch-icon.png")

W, H = 1200, 630
og = Image.new("RGB", (W, H), PAPER)
d = ImageDraw.Draw(og)
d.rectangle([0, 0, 18, H], fill=NAVY)
d.ellipse([90, 90, 250, 250], fill=NAVY)
d.text((170, 172), "SB", font=ImageFont.truetype(SERIF, 70), fill="white", anchor="mm")
d.text((90, 300), "Muhammad Syauqi Al Bashir", font=ImageFont.truetype(SERIF, 72), fill=INK)
d.text((92, 395), "DATA & INTEGRATION ENGINEER · GOOGLE CLOUD", font=ImageFont.truetype(SANS, 28), fill=NAVY)
d.text((92, 460), "Daily data syncs and ERP / e-commerce integrations at Monotaro Indonesia,", font=ImageFont.truetype(SERIF_R, 32), fill=(70, 72, 80))
d.text((92, 502), "plus six production apps I built and run on my own server.", font=ImageFont.truetype(SERIF_R, 32), fill=(70, 72, 80))
d.text((92, 570), "syauqi.bashir.my.id", font=ImageFont.truetype(SANS, 24), fill=(110, 112, 120))
og.save(A / "og.png", optimize=True)
print("icons written")
