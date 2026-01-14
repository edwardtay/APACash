from PIL import Image, ImageChops
import sys
import os

def trim(im):
    bg = Image.new(im.mode, im.size, (13, 13, 21)) # Dark navy roughly Check manually? 
    # Actually just trim based on corner pixel
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

try:
    path = sys.argv[1]
    img = Image.open(path)
    
    # Split vertically
    w, h = img.size
    top = img.crop((0, 0, w, h // 2))
    bottom = img.crop((0, h // 2, w, h))
    
    # Trim
    icon = trim(top)
    logo = trim(bottom)
    
    # Output paths
    public_dir = os.path.join(os.getcwd(), 'public')
    icon.save(os.path.join(public_dir, 'icon.png'))
    logo.save(os.path.join(public_dir, 'logo_full.png'))
    
    print(f"Saved to {public_dir}/icon.png and {public_dir}/logo_full.png")

except Exception as e:
    print(f"Error: {e}")
