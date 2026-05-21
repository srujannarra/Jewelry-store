"""
Download jewelry images from Pixabay API
Pixabay API is free and doesn't require authentication for basic use
"""

import json
import requests
from pathlib import Path
from urllib.parse import quote
import time

# Read products
with open('image_search_results.json', 'r') as f:
    data = json.load(f)

PRODUCTS = data['products']
OUTPUT_DIR = Path("public/images")

# Pixabay API - Free, no key required for basic searches
# For better results, get a free API key from pixabay.com/api/docs/
PIXABAY_API_KEY = None  # Optional: Add your API key here for better results
PIXABAY_API_URL = "https://pixabay.com/api/"

def get_product_slug(name):
    """Convert product name to slug format"""
    return name.lower().replace(" ", "-").replace("/", "-").replace("'", "").replace('"', '').replace(".", "")

def search_pixabay_image(query, api_key=None):
    """Search Pixabay for an image"""
    params = {
        "q": query,
        "image_type": "photo",
        "category": "fashion",
        "safesearch": "true",
        "per_page": 3,
        "min_width": 1920,
        "min_height": 1080
    }
    
    if api_key:
        params["key"] = api_key
    
    try:
        response = requests.get(PIXABAY_API_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('hits') and len(data['hits']) > 0:
            # Return the first (best match) image
            return data['hits'][0]['largeImageURL'] or data['hits'][0]['webformatURL']
    except Exception as e:
        print(f"  API Error: {e}")
    
    return None

def download_image(url, filepath):
    """Download an image from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        if filepath.exists() and filepath.stat().st_size > 1000:
            return True
        return False
    except Exception as e:
        print(f"  Download Error: {e}")
        return False

def get_search_query(product_name, category):
    """Generate optimized search query"""
    name_lower = product_name.lower()
    
    # Extract key terms - focus on jewelry type and material
    query_parts = []
    
    # Add material if mentioned
    if 'diamond' in name_lower:
        query_parts.append('diamond')
    if 'gold' in name_lower or '18k' in name_lower or '22k' in name_lower or '14k' in name_lower:
        query_parts.append('gold')
    if 'pearl' in name_lower:
        query_parts.append('pearl')
    if 'platinum' in name_lower:
        query_parts.append('platinum')
    
    # Add jewelry type
    type_map = {
        'ring': 'ring',
        'necklace': 'necklace',
        'earring': 'earring',
        'bracelet': 'bracelet',
        'pendant': 'pendant',
        'chain': 'chain',
        'bangle': 'bangle',
        'anklet': 'anklet',
        'brooch': 'brooch',
        'watch': 'watch'
    }
    
    for key, value in type_map.items():
        if key in name_lower or category.startswith(key):
            query_parts.append(value)
            break
    
    # Add "jewelry" to ensure relevant results
    if 'jewelry' not in ' '.join(query_parts):
        query_parts.append('jewelry')
    
    return ' '.join(query_parts[:4])  # Limit to 4 terms

def main():
    print("=" * 60)
    print("Pixabay Jewelry Image Downloader")
    print("=" * 60)
    print(f"Products to process: {len(PRODUCTS)}\n")
    
    if PIXABAY_API_KEY:
        print("Using Pixabay API key for better results")
    else:
        print("Using Pixabay public API (limited)")
        print("For better results, get a free API key from pixabay.com/api/docs/\n")
    
    downloaded = 0
    skipped = 0
    failed = 0
    
    for i, product in enumerate(PRODUCTS, 1):
        product_id = product['id']
        product_name = product['name']
        category = product['category']
        
        slug = get_product_slug(product_name)
        filename = f"{slug}.jpg"
        filepath = OUTPUT_DIR / category / filename
        
        print(f"\n[{i}/{len(PRODUCTS)}] {product_name}")
        print(f"  Category: {category}")
        
        # Generate search query
        search_query = get_search_query(product_name, category)
        print(f"  Search: {search_query}")
        
        # Search Pixabay
        image_url = search_pixabay_image(search_query, PIXABAY_API_KEY)
        
        if image_url:
            print(f"  Found image: {image_url[:60]}...")
            if download_image(image_url, filepath):
                file_size = filepath.stat().st_size
                print(f"  [OK] Downloaded ({file_size} bytes) -> {filepath}")
                downloaded += 1
            else:
                print(f"  [FAIL] Download failed")
                failed += 1
        else:
            print(f"  [FAIL] No image found")
            failed += 1
        
        # Rate limiting
        time.sleep(0.5)
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Downloaded: {downloaded}")
    print(f"Skipped: {skipped}")
    print(f"Failed: {failed}")
    print(f"Total: {len(PRODUCTS)}")
    print("=" * 60)

if __name__ == "__main__":
    main()



