"""
Get jewelry images for all products using Unsplash Source API
This uses Unsplash's public API that doesn't require authentication
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

def get_product_slug(name):
    """Convert product name to slug format matching inventory"""
    return name.lower().replace(" ", "-").replace("/", "-").replace("'", "").replace('"', '').replace(".", "")

def download_unsplash_image(query, filepath):
    """Download image from Unsplash Source API"""
    try:
        # Unsplash Source API - no key required
        # Format: https://source.unsplash.com/{width}x{height}/?{query}
        url = f"https://source.unsplash.com/1920x1080/?{quote(query)}"
        
        print(f"  Downloading from: {url}")
        response = requests.get(url, timeout=15, allow_redirects=True)
        response.raise_for_status()
        
        # Create directory if needed
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Save image
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        # Verify file was created and has content
        if filepath.exists() and filepath.stat().st_size > 0:
            return True
        return False
    except Exception as e:
        print(f"  Error: {e}")
        return False

def get_search_query(product_name, category):
    """Generate search query optimized for jewelry images"""
    # Create more specific search queries based on product type
    name_lower = product_name.lower()
    
    # Extract key jewelry terms
    jewelry_types = {
        'ring': 'gold ring jewelry',
        'necklace': 'gold necklace jewelry',
        'earring': 'gold earrings jewelry',
        'bracelet': 'gold bracelet jewelry',
        'pendant': 'gold pendant jewelry',
        'chain': 'gold chain jewelry',
        'bangle': 'gold bangle jewelry',
        'anklet': 'gold anklet jewelry',
        'brooch': 'vintage brooch jewelry',
        'watch': 'luxury gold watch'
    }
    
    # Find matching jewelry type
    base_query = None
    for j_type, query in jewelry_types.items():
        if j_type in name_lower or category == j_type + 's':
            base_query = query
            break
    
    if not base_query:
        base_query = f"{category} jewelry"
    
    # Add specific descriptors
    descriptors = []
    if 'diamond' in name_lower:
        descriptors.append('diamond')
    if 'gold' in name_lower or '18k' in name_lower or '22k' in name_lower or '14k' in name_lower:
        descriptors.append('gold')
    if 'pearl' in name_lower:
        descriptors.append('pearl')
    if 'vintage' in name_lower:
        descriptors.append('vintage')
    if 'platinum' in name_lower:
        descriptors.append('platinum')
    
    # Build final query
    if descriptors:
        query = f"{' '.join(descriptors[:2])} {base_query}"
    else:
        query = base_query
    
    return query

def main():
    print("=" * 60)
    print("Jewelry Image Downloader")
    print("=" * 60)
    print(f"Products to process: {len(PRODUCTS)}\n")
    
    downloaded = 0
    skipped = 0
    failed = 0
    
    for i, product in enumerate(PRODUCTS, 1):
        product_id = product['id']
        product_name = product['name']
        category = product['category']
        
        # Generate filename matching inventory format
        slug = get_product_slug(product_name)
        filename = f"{slug}.jpg"
        filepath = OUTPUT_DIR / category / filename
        
        print(f"\n[{i}/{len(PRODUCTS)}] {product_name}")
        print(f"  Category: {category}")
        print(f"  Target: {filepath}")
        
        # Force download new images (backup old ones first)
        backup_path = None
        if filepath.exists():
            backup_path = filepath.with_suffix('.jpg.backup')
            import shutil
            shutil.copy2(filepath, backup_path)
            print(f"  [BACKUP] Backed up existing image")
        
        # Generate search query
        search_query = get_search_query(product_name, category)
        print(f"  Search: {search_query}")
        
        # Download image
        if download_unsplash_image(search_query, filepath):
            file_size = filepath.stat().st_size
            print(f"  [OK] Downloaded ({file_size} bytes)")
            downloaded += 1
        else:
            print(f"  [FAIL] Could not download")
            failed += 1
        
        # Small delay to be nice to the API
        time.sleep(1)
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Downloaded: {downloaded}")
    print(f"Skipped (already exist): {skipped}")
    print(f"Failed: {failed}")
    print(f"Total: {len(PRODUCTS)}")
    print("=" * 60)

if __name__ == "__main__":
    main()

