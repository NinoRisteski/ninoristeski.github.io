from PIL import Image
import os

def create_favicon():
    # Create favicon directory if it doesn't exist
    if not os.path.exists('favicon'):
        os.makedirs('favicon')

    # Open the image
    img = Image.open('images/ninoprofile2.jpg')

    # Create square image by cropping to the center
    width, height = img.size
    size = min(width, height)
    left = (width - size) // 2
    top = (height - size) // 2
    right = left + size
    bottom = top + size
    img = img.crop((left, top, right, bottom))

    # Create different sizes
    sizes = {
        16: 'favicon-16x16.png',
        32: 'favicon-32x32.png',
        180: 'apple-touch-icon.png'
    }

    for size, filename in sizes.items():
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(f'favicon/{filename}')

    # Create ICO file
    img_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    img_32.save('favicon/favicon.ico', format='ICO')

if __name__ == '__main__':
    create_favicon() 