"""
Script to search and download jewelry images from free stock photo websites
Uses browser automation and direct URL searches to find the best matching images
"""

import os
from urllib.parse import quote
import json
from pathlib import Path

# Product inventory
PRODUCTS = [
    # Rings
    {"id": "ring-001", "name": "Classic 18K Gold Wedding Ring", "category": "rings", "search": "gold wedding ring"},
    {"id": "ring-002", "name": "Diamond Solitaire Engagement Ring", "category": "rings", "search": "diamond solitaire engagement ring"},
    {"id": "ring-003", "name": "Vintage Art Deco Ring", "category": "rings", "search": "art deco ring vintage"},
    {"id": "ring-004", "name": "Platinum Eternity Band", "category": "rings", "search": "platinum eternity band diamond"},
    {"id": "ring-005", "name": "Rose Gold Stackable Ring Set", "category": "rings", "search": "rose gold stackable rings"},
    
    # Necklaces
    {"id": "necklace-001", "name": "Pearl Strand Necklace", "category": "necklaces", "search": "pearl strand necklace"},
    {"id": "necklace-002", "name": "Diamond Pendant Necklace", "category": "necklaces", "search": "diamond pendant necklace gold"},
    {"id": "necklace-003", "name": "Gold Choker with Gemstones", "category": "necklaces", "search": "gold choker gemstones"},
    {"id": "necklace-004", "name": "Layered Gold Chain Set", "category": "necklaces", "search": "layered gold chains"},
    {"id": "necklace-005", "name": "Vintage Locket Necklace", "category": "necklaces", "search": "vintage locket necklace"},
    
    # Earrings
    {"id": "earring-001", "name": "Diamond Stud Earrings", "category": "earrings", "search": "diamond stud earrings"},
    {"id": "earring-002", "name": "Pearl Drop Earrings", "category": "earrings", "search": "pearl drop earrings"},
    {"id": "earring-003", "name": "Hoop Earrings 22K Gold", "category": "earrings", "search": "gold hoop earrings"},
    {"id": "earring-004", "name": "Chandelier Earrings with Crystals", "category": "earrings", "search": "chandelier earrings crystals"},
    {"id": "earring-005", "name": "Minimalist Gold Huggies", "category": "earrings", "search": "gold huggie earrings"},
    
    # Bracelets
    {"id": "bracelet-001", "name": "Tennis Bracelet Diamond", "category": "bracelets", "search": "tennis bracelet diamond"},
    {"id": "bracelet-002", "name": "Gold Bangle Set", "category": "bracelets", "search": "gold bangle set"},
    {"id": "bracelet-003", "name": "Charm Bracelet 18K Gold", "category": "bracelets", "search": "charm bracelet gold"},
    {"id": "bracelet-004", "name": "Cuff Bracelet with Gemstones", "category": "bracelets", "search": "cuff bracelet gemstones"},
    {"id": "bracelet-005", "name": "Link Chain Bracelet", "category": "bracelets", "search": "gold chain bracelet"},
    
    # Pendants
    {"id": "pendant-001", "name": "Heart Pendant 18K Gold", "category": "pendants", "search": "heart pendant gold"},
    {"id": "pendant-002", "name": "Cross Pendant Diamond", "category": "pendants", "search": "cross pendant diamond"},
    {"id": "pendant-003", "name": "Initial Pendant Custom", "category": "pendants", "search": "initial pendant letter"},
    {"id": "pendant-004", "name": "Tree of Life Pendant", "category": "pendants", "search": "tree of life pendant"},
    
    # Chains
    {"id": "chain-001", "name": "Cuban Link Chain 22K", "category": "chains", "search": "cuban link chain gold"},
    {"id": "chain-002", "name": "Rope Chain 18K Gold", "category": "chains", "search": "rope chain gold"},
    {"id": "chain-003", "name": "Box Chain 14K Gold", "category": "chains", "search": "box chain gold"},
    {"id": "chain-004", "name": "Figaro Chain 22K Gold", "category": "chains", "search": "figaro chain gold"},
    
    # Bangles
    {"id": "bangle-001", "name": "Traditional Gold Bangle", "category": "bangles", "search": "traditional gold bangle"},
    {"id": "bangle-002", "name": "Diamond Bangle Set", "category": "bangles", "search": "diamond bangle set"},
    {"id": "bangle-003", "name": "Hinged Bangle 18K", "category": "bangles", "search": "hinged bangle gold"},
    {"id": "bangle-004", "name": "Open Cuff Bangle", "category": "bangles", "search": "open cuff bangle"},
    
    # Anklets
    {"id": "anklet-001", "name": "Delicate Gold Anklet", "category": "anklets", "search": "gold anklet delicate"},
    {"id": "anklet-002", "name": "Chain Anklet with Pendant", "category": "anklets", "search": "chain anklet pendant"},
    {"id": "anklet-003", "name": "Beaded Anklet", "category": "anklets", "search": "beaded anklet"},
    
    # Brooches
    {"id": "brooch-001", "name": "Vintage Floral Brooch", "category": "brooches", "search": "vintage floral brooch"},
    {"id": "brooch-002", "name": "Art Deco Brooch", "category": "brooches", "search": "art deco brooch"},
    {"id": "brooch-003", "name": "Butterfly Brooch Diamond", "category": "brooches", "search": "butterfly brooch diamond"},
    
    # Watches
    {"id": "watch-001", "name": "Luxury Gold Watch", "category": "watches", "search": "luxury gold watch"},
    {"id": "watch-002", "name": "Diamond Watch 22K", "category": "watches", "search": "diamond watch gold"},
    {"id": "watch-003", "name": "Vintage Gold Watch", "category": "watches", "search": "vintage gold watch"},
    {"id": "watch-004", "name": "Sport Gold Watch", "category": "watches", "search": "sport gold watch"},
]

# Free image websites with search URLs
WEBSITES = {
    "Pixabay": "https://pixabay.com/images/search/{query}/",
    "Unsplash": "https://unsplash.com/s/photos/{query}",
    "Pexels": "https://www.pexels.com/search/{query}/",
}

# Output directory
OUTPUT_DIR = Path("public/images")
RESULTS_FILE = "image_search_results.json"

def generate_search_urls(product):
    """Generate search URLs for a product across all websites"""
    urls = {}
    query = quote(product["search"].replace(" ", "-"))
    for site_name, url_template in WEBSITES.items():
        urls[site_name] = url_template.format(query=query)
    return urls

def save_search_results(results):
    """Save search results to JSON file"""
    with open(RESULTS_FILE, "w") as f:
        json.dump(results, f, indent=2)

def main():
    """Main function to generate search URLs for all products"""
    print(f"Generating search URLs for {len(PRODUCTS)} products...")
    
    results = {
        "websites": list(WEBSITES.keys()),
        "products": []
    }
    
    for product in PRODUCTS:
        search_urls = generate_search_urls(product)
        results["products"].append({
            "id": product["id"],
            "name": product["name"],
            "category": product["category"],
            "search_urls": search_urls
        })
        print(f"[OK] {product['name']}")
    
    save_search_results(results)
    print(f"\n[OK] Search URLs saved to {RESULTS_FILE}")
    print(f"\nNext steps:")
    print(f"1. Use browser MCP to visit each search URL")
    print(f"2. Find the best matching image")
    print(f"3. Download and save to public/images/<category>/")
    print(f"4. Update inventoryCache.ts with new image paths")

if __name__ == "__main__":
    main()

