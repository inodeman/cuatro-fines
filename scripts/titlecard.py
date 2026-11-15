#!/usr/bin/env python3
"""4K title card: void ground, cream title, ash subtitle."""
import sys
from PIL import Image, ImageDraw, ImageFont

title, subtitle, dest = sys.argv[1], sys.argv[2], sys.argv[3]
width, height = 3840, 2160
image = Image.new("RGB", (width, height), (0x0A, 0x09, 0x08))
draw = ImageDraw.Draw(image)
display = ImageFont.truetype(
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf", 200
)
italic = ImageFont.truetype(
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf", 64
)


def center(text: str, font: ImageFont.FreeTypeFont, y: int, fill: tuple[int, int, int]) -> None:
    box = draw.textbbox((0, 0), text, font=font)
    draw.text(((width - (box[2] - box[0])) / 2, y), text, font=font, fill=fill)


center(title, display, height // 2 - 220, (0xE6, 0xDC, 0xC8))
center(subtitle, italic, height // 2 + 40, (0x8A, 0x81, 0x78))
image.save(dest, quality=95)
