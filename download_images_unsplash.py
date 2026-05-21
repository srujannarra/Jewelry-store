"""
Download jewelry images from Unsplash for all products
Uses Unsplash API to get relevant images for each product
"""

import json
import requests
from pathlib import Path
from urllib.parse import quote
import time

# Read products from search results
with open('image_search_results.json', 'r') as f:
    data = json.load(f)

PRODUCTS = data['products']
OUTPUT_DIR = Path("public/images")
UNSPLASH_ACCESS_KEY = "YOUR_UNSPLASH_ACCESS_KEY"  # Free API key from unsplash.com/developers

def download_image(url, filepath):
    """Download an image from URL and save to filepath"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Create directory if it doesn't exist
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Save image
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def search_unsplash_image(query, access_key=None):
    """Search Unsplash for an image"""
    if not access_key or access_key == "YOUR_UNSPLASH_ACCESS_KEY":
        # Use Unsplash Source API (no key required, but limited)
        # For production, get a free API key from unsplash.com/developers
        search_url = f"https://source.unsplash.com/1920x1080/?{quote(query)}"
        return search_url
    
    # Use official API with key
    api_url = "https://api.unsplash.com/search/photos"
    headers = {"Authorization": f"Client-ID {access_key}"}
    params = {
        "query": query,
        "per_page": 1,
        "orientation": "landscape"
    }
    
    try:
        response = requests.get(api_url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('results') and len(data['results']) > 0:
            return data['results'][0]['urls']['regular']
    except Exception as e:
        print(f"API search error for {query}: {e}")
    
    # Fallback to source API
    return f"https://source.unsplash.com/1920x1080/?{quote(query)}"

def get_product_slug(name):
    """Convert product name to slug format"""
    return name.lower().replace(" ", "-").replace("/", "-").replace("'", "").replace('"', '')

def main():
    print(f"Starting image download for {len(PRODUCTS)} products...")
    print("Note: Using Unsplash Source API (no key required)")
    print("For better results, get a free API key from unsplash.com/developers\n")
    
    downloaded = 0
    skipped = 0
    
    for product in PRODUCTS:
        product_id = product['id']
        product_name = product['name']
        category = product['category']
        
        # Generate filename
        slug = get_product_slug(product_name)
        filename = f"{slug}.jpg"
        filepath = OUTPUT_DIR / category / filename
        
        # Skip if already exists
        if filepath.exists():
            print(f"[SKIP] {product_name} - already exists")
            skipped += 1
            continue
        
        # Search for image
        search_query = product_name.lower()
        print(f"[SEARCH] {product_name}...")
        
        # Try multiple search variations
        search_variations = [
            search_query,
            product_name.split()[0] + " " + product_name.split()[-1] if len(product_name.split()) > 1 else search_query,
            " ".join(product_name.split()[:3]),  # First 3 words
        ]
        
        image_url = None
        for variation in search_variations:
            image_url = search_unsplash_image(variation)
            if image_url:
                break
        
        if image_url:
            print(f"[DOWNLOAD] {product_name} from {image_url[:50]}...")
            if download_image(image_url, filepath):
                print(f"[OK] Saved: {filepath}")
                downloaded += 1
            else:
                print(f"[FAIL] Could not download {product_name}")
        else:
            print(f"[FAIL] No image found for {product_name}")
        
        # Be nice to the API
        time.sleep(0.5)
    
    print(f"\n=== Summary ===")
    print(f"Downloaded: {downloaded}")
    print(f"Skipped (already exist): {skipped}")
    print(f"Total: {len(PRODUCTS)}")

if __name__ == "__main__":
    main()



