from PIL import Image
import os

def remove_bg(img_path, output_path, threshold=40):
    print(f"Processing {img_path}...")
    try:
        img = Image.open(img_path)
        img = img.convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        # Sample the corner for background color
        bg_color = img.getpixel((0, 0))
        # ensure bg_color is a tuple of 3 or 4
        if isinstance(bg_color, int): # Grayscale
            bg_color = (bg_color, bg_color, bg_color)
            
        bg_r, bg_g, bg_b = bg_color[:3]
        
        print(f"Detected background color: {bg_color}")

        for item in datas:
            # item is (r, g, b, a)
            r, g, b = item[:3]
            
            # Calculate distance from background color
            dist = abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b)
            
            # If closer to background than threshold, make transparent
            # Also ensure we don't accidentally remove dark parts of the logo if the logo is dark?
            # But logo is "logo_white", so it should be white text.
            # So anything dark is background.
            
            if dist < threshold or (r < 50 and g < 50 and b < 50):
                new_data.append((255, 255, 255, 0)) # Fully transparent
            else:
                # Keep original color but ensure full opacity
                new_data.append((item[0], item[1], item[2], 255))
        
        img.putdata(new_data)
        
        # Now trim transparent borders again just in case
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        img.save(output_path, "PNG")
        print(f"Saved transparent logo to {output_path} Size: {img.size}")
        
    except Exception as e:
        print(f"Error processing {img_path}: {e}")

# Process logo_full.png -> logo_white.png
public_dir = os.path.join(os.getcwd(), 'public')
logo_full = os.path.join(public_dir, 'logo_full.png')
logo_white = os.path.join(public_dir, 'logo_white.png')

remove_bg(logo_full, logo_white)
