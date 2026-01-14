from PIL import Image
import os

def make_white(path, output_name):
    try:
        img = Image.open(path).convert("RGBA")
        data = img.getdata()
        
        new_data = []
        for item in data:
            # item is (r, g, b, a)
            if item[3] > 0: # If not transparent
                # Change to White with original Alpha
                new_data.append((255, 255, 255, item[3]))
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        
        public_dir = os.path.join(os.getcwd(), 'public')
        out_path = os.path.join(public_dir, output_name)
        img.save(out_path)
        print(f"Saved {out_path}")
        return out_path
    except Exception as e:
        print(f"Error processing {path}: {e}")

public_dir = os.path.join(os.getcwd(), 'public')
make_white(os.path.join(public_dir, 'logo_full.png'), 'logo_white.png')
make_white(os.path.join(public_dir, 'icon.png'), 'icon_white.png')
