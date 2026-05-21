/**
 * Script to find and download jewelry images from free stock photo websites
 * This script searches across multiple free image sites and finds the best matches
 */

const products = [
  // Rings
  { id: "ring-001", name: "Classic 18K Gold Wedding Ring", category: "rings", searchTerms: ["gold wedding ring", "18k gold ring", "classic wedding ring"] },
  { id: "ring-002", name: "Diamond Solitaire Engagement Ring", category: "rings", searchTerms: ["diamond solitaire ring", "engagement ring diamond", "solitaire engagement ring"] },
  { id: "ring-003", name: "Vintage Art Deco Ring", category: "rings", searchTerms: ["art deco ring", "vintage art deco ring", "geometric ring"] },
  { id: "ring-004", name: "Platinum Eternity Band", category: "rings", searchTerms: ["platinum eternity band", "diamond eternity ring", "platinum band"] },
  { id: "ring-005", name: "Rose Gold Stackable Ring Set", category: "rings", searchTerms: ["rose gold stackable rings", "stackable rings", "rose gold rings"] },
  
  // Necklaces
  { id: "necklace-001", name: "Pearl Strand Necklace", category: "necklaces", searchTerms: ["pearl necklace", "pearl strand", "cultured pearl necklace"] },
  { id: "necklace-002", name: "Diamond Pendant Necklace", category: "necklaces", searchTerms: ["diamond pendant necklace", "gold chain diamond pendant", "diamond necklace"] },
  { id: "necklace-003", name: "Gold Choker with Gemstones", category: "necklaces", searchTerms: ["gold choker", "gemstone choker", "gold choker necklace"] },
  { id: "necklace-004", name: "Layered Gold Chain Set", category: "necklaces", searchTerms: ["layered gold chains", "gold chain set", "multiple gold chains"] },
  { id: "necklace-005", name: "Vintage Locket Necklace", category: "necklaces", searchTerms: ["vintage locket", "gold locket necklace", "antique locket"] },
  
  // Earrings
  { id: "earring-001", name: "Diamond Stud Earrings", category: "earrings", searchTerms: ["diamond stud earrings", "diamond earrings", "gold diamond studs"] },
  { id: "earring-002", name: "Pearl Drop Earrings", category: "earrings", searchTerms: ["pearl drop earrings", "pearl earrings", "gold pearl earrings"] },
  { id: "earring-003", name: "Hoop Earrings 22K Gold", category: "earrings", searchTerms: ["gold hoop earrings", "22k gold hoops", "large hoop earrings"] },
  { id: "earring-004", name: "Chandelier Earrings with Crystals", category: "earrings", searchTerms: ["chandelier earrings", "crystal chandelier earrings", "dramatic earrings"] },
  { id: "earring-005", name: "Minimalist Gold Huggies", category: "earrings", searchTerms: ["huggie earrings", "small gold hoops", "minimalist earrings"] },
  
  // Bracelets
  { id: "bracelet-001", name: "Tennis Bracelet Diamond", category: "bracelets", searchTerms: ["tennis bracelet", "diamond tennis bracelet", "diamond bracelet"] },
  { id: "bracelet-002", name: "Gold Bangle Set", category: "bracelets", searchTerms: ["gold bangles", "bangle set", "stackable bangles"] },
  { id: "bracelet-003", name: "Charm Bracelet 18K Gold", category: "bracelets", searchTerms: ["charm bracelet", "gold charm bracelet", "personalized bracelet"] },
  { id: "bracelet-004", name: "Cuff Bracelet with Gemstones", category: "bracelets", searchTerms: ["cuff bracelet", "gemstone cuff", "gold cuff bracelet"] },
  { id: "bracelet-005", name: "Link Chain Bracelet", category: "bracelets", searchTerms: ["chain bracelet", "gold link bracelet", "classic bracelet"] },
  
  // Pendants
  { id: "pendant-001", name: "Heart Pendant 18K Gold", category: "pendants", searchTerms: ["heart pendant", "gold heart pendant", "heart necklace"] },
  { id: "pendant-002", name: "Cross Pendant Diamond", category: "pendants", searchTerms: ["cross pendant", "diamond cross", "gold cross pendant"] },
  { id: "pendant-003", name: "Initial Pendant Custom", category: "pendants", searchTerms: ["initial pendant", "letter pendant", "personalized pendant"] },
  { id: "pendant-004", name: "Tree of Life Pendant", category: "pendants", searchTerms: ["tree of life pendant", "tree pendant", "symbolic pendant"] },
  
  // Chains
  { id: "chain-001", name: "Cuban Link Chain 22K", category: "chains", searchTerms: ["cuban link chain", "thick gold chain", "22k gold chain"] },
  { id: "chain-002", name: "Rope Chain 18K Gold", category: "chains", searchTerms: ["rope chain", "gold rope chain", "twisted chain"] },
  { id: "chain-003", name: "Box Chain 14K Gold", category: "chains", searchTerms: ["box chain", "gold box chain", "square link chain"] },
  { id: "chain-004", name: "Figaro Chain 22K Gold", category: "chains", searchTerms: ["figaro chain", "gold figaro", "traditional chain"] },
  
  // Bangles
  { id: "bangle-001", name: "Traditional Gold Bangle", category: "bangles", searchTerms: ["traditional bangle", "gold bangle", "solid bangle"] },
  { id: "bangle-002", name: "Diamond Bangle Set", category: "bangles", searchTerms: ["diamond bangles", "bangle set diamond", "gold diamond bangles"] },
  { id: "bangle-003", name: "Hinged Bangle 18K", category: "bangles", searchTerms: ["hinged bangle", "open bangle", "gold hinged bracelet"] },
  { id: "bangle-004", name: "Open Cuff Bangle", category: "bangles", searchTerms: ["cuff bangle", "open cuff", "adjustable bangle"] },
  
  // Anklets
  { id: "anklet-001", name: "Delicate Gold Anklet", category: "anklets", searchTerms: ["gold anklet", "delicate anklet", "ankle bracelet"] },
  { id: "anklet-002", name: "Chain Anklet with Pendant", category: "anklets", searchTerms: ["anklet pendant", "chain anklet", "ankle chain"] },
  { id: "anklet-003", name: "Beaded Anklet", category: "anklets", searchTerms: ["beaded anklet", "ankle beads", "bohemian anklet"] },
  
  // Brooches
  { id: "brooch-001", name: "Vintage Floral Brooch", category: "brooches", searchTerms: ["floral brooch", "vintage brooch", "flower pin"] },
  { id: "brooch-002", name: "Art Deco Brooch", category: "brooches", searchTerms: ["art deco brooch", "geometric brooch", "vintage pin"] },
  { id: "brooch-003", name: "Butterfly Brooch Diamond", category: "brooches", searchTerms: ["butterfly brooch", "diamond butterfly", "gold butterfly pin"] },
  
  // Watches
  { id: "watch-001", name: "Luxury Gold Watch", category: "watches", searchTerms: ["luxury gold watch", "gold watch", "elegant watch"] },
  { id: "watch-002", name: "Diamond Watch 22K", category: "watches", searchTerms: ["diamond watch", "gold diamond watch", "luxury diamond watch"] },
  { id: "watch-003", name: "Vintage Gold Watch", category: "watches", searchTerms: ["vintage gold watch", "antique watch", "classic watch"] },
  { id: "watch-004", name: "Sport Gold Watch", category: "watches", searchTerms: ["sport gold watch", "gold sports watch", "athletic watch"] },
];

const websites = [
  { name: "Pixabay", baseUrl: "https://pixabay.com/images/search/", searchParam: "" },
  { name: "Unsplash", baseUrl: "https://unsplash.com/s/photos/", searchParam: "" },
  { name: "Pexels", baseUrl: "https://www.pexels.com/search/", searchParam: "" },
  { name: "FreeImages", baseUrl: "https://www.freeimages.com/search/", searchParam: "" },
];

console.log(`Found ${products.length} products to search for`);
console.log(`Will search across ${websites.length} websites`);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { products, websites };
}



