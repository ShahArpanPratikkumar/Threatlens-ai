import zlib
import struct
import os
import math

def create_png(width, height, draw_func):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type None
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    compressed = zlib.compress(bytes(raw_data), 9)
    
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png.extend(struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc))
    
    # IDAT
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png.extend(struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc))
    
    # IEND
    iend_crc = zlib.crc32(b'IEND')
    png.extend(struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc))
    
    return bytes(png)

def shield_pixel(x, y, w, h):
    # Normalized coordinates from -1 to 1
    nx = (x - w / 2.0) / (w / 2.0)
    ny = (y - h / 2.0) / (h / 2.0)
    
    # Background rounded square / badge
    dist_sq = max(abs(nx), abs(ny))
    radius = math.sqrt(nx*nx + ny*ny)
    
    # Dark high-tech badge container
    if dist_sq > 0.95:
        return (0, 0, 0, 0) # transparent
    
    # Shield shape formula:
    # top: flat or slight dip
    # sides: vertical down to y=0
    # bottom: curves to point at bottom center (0, 0.75)
    in_shield = False
    
    sy = ny + 0.1 # shift down slightly
    sx = abs(nx) * 1.3
    
    if sy >= -0.7 and sy <= 0.0 and sx <= 0.75:
        in_shield = True
    elif sy > 0.0 and sy <= 0.8:
        # curved bottom
        allowed_w = 0.75 * (1.0 - ((sy) / 0.8)**1.6)
        if sx <= allowed_w:
            in_shield = True
            
    if in_shield:
        # Border vs inner
        # Inner shield
        is_inner = False
        if sy >= -0.55 and sy <= 0.0 and sx <= 0.58:
            is_inner = True
        elif sy > 0.0 and sy <= 0.65:
            allowed_inner = 0.58 * (1.0 - ((sy) / 0.65)**1.6)
            if sx <= allowed_inner:
                is_inner = True
                
        if is_inner:
            # Center stylized lens/target or cross
            # Cyan glowing core
            if abs(nx) < 0.15 or abs(ny - 0.05) < 0.15:
                return (255, 255, 255, 255) # white core
            return (6, 182, 212, 255) # vibrant cyan #06b6d4
        else:
            # Shield rim (teal/cyan highlight)
            return (8, 145, 178, 255) # cyan-600
    
    # Background dark pill
    if radius <= 0.9:
        # Subtle dark slate gradient #0f172a
        bg_val = int(15 + (1.0 - radius) * 15)
        return (11, bg_val, 30, 255)
        
    return (0, 0, 0, 0)

def main():
    os.makedirs('extension/icons', exist_ok=True)
    os.makedirs('public/icons', exist_ok=True)
    for size in [16, 32, 48, 128]:
        data = create_png(size, size, shield_pixel)
        path1 = f'extension/icons/icon{size}.png'
        path2 = f'public/icons/icon{size}.png'
        with open(path1, 'wb') as f:
            f.write(data)
        with open(path2, 'wb') as f:
            f.write(data)
        print(f'Generated icon {size}x{size} -> {path1}')

if __name__ == '__main__':
    main()
