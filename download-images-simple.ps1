# Simple PowerShell script to download jewelry images
# Using direct Unsplash image URLs with specific photo IDs

$basePath = "public\images"
$imageSize = "600x600"

# Create directories
$categories = @("rings", "necklaces", "earrings", "bracelets", "pendants", "chains", "bangles", "anklets", "brooches", "watches")
foreach ($cat in $categories) {
    $path = Join-Path $basePath $cat
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
}

# Function to download image
function Download-Image {
    param(
        [string]$Category,
        [string]$FileName,
        [string]$SearchTerms
    )
    
    $categoryPath = Join-Path $basePath $Category
    $filePath = Join-Path $categoryPath "$FileName.jpg"
    
    if (Test-Path $filePath) {
        Write-Host "⏭  Skipping $FileName (exists)" -ForegroundColor Yellow
        return $true
    }
    
    $url = "https://source.unsplash.com/$imageSize/?$SearchTerms"
    
    try {
        Write-Host "⬇  Downloading $Category\$FileName..." -ForegroundColor Cyan -NoNewline
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30 -MaximumRedirection 5 -ErrorAction Stop
        [System.IO.File]::WriteAllBytes($filePath, $response.Content)
        Write-Host " ✓" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host " ✗ ($($_.Exception.Message))" -ForegroundColor Red
        return $false
    }
}

# Image mappings
$images = @{
    "rings" = @{
        "classic-18k-gold-wedding-ring" = "gold+wedding+ring+band"
        "diamond-solitaire-engagement-ring" = "diamond+engagement+ring+solitaire"
        "diamond-solitaire-engagement-ring-1" = "diamond+ring+closeup"
        "vintage-art-deco-ring" = "vintage+art+deco+ring+gold"
        "platinum-eternity-band" = "platinum+ring+band+diamond"
        "rose-gold-stackable-ring-set" = "rose+gold+ring+stackable"
    }
    "necklaces" = @{
        "pearl-strand-necklace" = "pearl+necklace+strand"
        "diamond-pendant-necklace" = "diamond+pendant+necklace+gold"
        "diamond-pendant-necklace-1" = "diamond+pendant+closeup"
        "gold-choker-with-gemstones" = "gold+choker+necklace+gemstone"
        "layered-gold-chain-set" = "gold+chain+necklace+layered"
        "vintage-locket-necklace" = "vintage+locket+necklace+gold"
    }
    "earrings" = @{
        "diamond-stud-earrings" = "diamond+stud+earrings+gold"
        "pearl-drop-earrings" = "pearl+drop+earrings+gold"
        "hoop-earrings-22k-gold" = "hoop+earrings+gold"
        "chandelier-earrings-with-crystals" = "chandelier+earrings+crystal+gold"
        "minimalist-gold-huggies" = "huggie+earrings+gold+minimalist"
    }
    "bracelets" = @{
        "tennis-bracelet-diamond" = "tennis+bracelet+diamond+gold"
        "gold-bangle-set" = "gold+bangle+bracelet+set"
        "charm-bracelet-18k-gold" = "charm+bracelet+gold"
        "cuff-bracelet-with-gemstones" = "cuff+bracelet+gemstone+gold"
        "link-chain-bracelet" = "chain+bracelet+gold+link"
    }
    "pendants" = @{
        "heart-pendant-18k-gold" = "heart+pendant+gold"
        "cross-pendant-diamond" = "cross+pendant+diamond+gold"
        "initial-pendant-custom" = "initial+pendant+gold+letter"
        "tree-of-life-pendant" = "tree+life+pendant+gold"
    }
    "chains" = @{
        "cuban-link-chain-22k" = "cuban+link+chain+gold"
        "rope-chain-18k-gold" = "rope+chain+gold"
        "box-chain-14k-gold" = "box+chain+gold"
        "figaro-chain-22k-gold" = "figaro+chain+gold"
    }
    "bangles" = @{
        "traditional-gold-bangle" = "traditional+gold+bangle"
        "diamond-bangle-set" = "diamond+bangle+gold+set"
        "hinged-bangle-18k" = "hinged+bangle+gold"
        "open-cuff-bangle" = "cuff+bangle+gold+open"
    }
    "anklets" = @{
        "delicate-gold-anklet" = "delicate+gold+anklet"
        "chain-anklet-with-pendant" = "chain+anklet+pendant+gold"
        "beaded-anklet" = "beaded+anklet+gold"
    }
    "brooches" = @{
        "vintage-floral-brooch" = "vintage+floral+brooch+gold"
        "art-deco-brooch" = "art+deco+brooch+gold"
        "butterfly-brooch-diamond" = "butterfly+brooch+diamond+gold"
    }
    "watches" = @{
        "luxury-gold-watch" = "luxury+gold+watch"
        "diamond-watch-22k" = "diamond+watch+gold"
        "vintage-gold-watch" = "vintage+gold+watch"
        "sport-gold-watch" = "sport+gold+watch"
    }
}

# Download all images
$downloaded = 0
$skipped = 0
$failed = 0

Write-Host "`nStarting image download...`n" -ForegroundColor Cyan

foreach ($category in $images.Keys) {
    foreach ($fileName in $images[$category].Keys) {
        $searchTerms = $images[$category][$fileName]
        $result = Download-Image -Category $category -FileName $fileName -SearchTerms $searchTerms
        if ($result) {
            if (Test-Path (Join-Path (Join-Path $basePath $category) "$fileName.jpg")) {
                $downloaded++
            } else {
                $skipped++
            }
        } else {
            $failed++
        }
        Start-Sleep -Milliseconds 1000  # Rate limiting
    }
}

Write-Host "`n" -NoNewline
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "Download Summary:" -ForegroundColor White
Write-Host "  Downloaded: $downloaded" -ForegroundColor Green
Write-Host "  Skipped: $skipped" -ForegroundColor Yellow
Write-Host "  Failed: $failed" -ForegroundColor Red
Write-Host "=" * 50 -ForegroundColor Cyan








