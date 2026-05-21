# Working PowerShell script to download jewelry images
# Using Unsplash API with proper error handling

$basePath = "public\images"
$imageSize = "600x600"

# Create directories
$categories = @("rings", "necklaces", "earrings", "bracelets", "pendants", "chains", "bangles", "anklets", "brooches", "watches")
foreach ($cat in $categories) {
    $path = Join-Path $basePath $cat
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Created directory: $path" -ForegroundColor Green
    }
}

# Function to download image with retry
function Download-Image {
    param(
        [string]$Category,
        [string]$FileName,
        [string]$SearchTerms
    )
    
    $categoryPath = Join-Path $basePath $Category
    $filePath = Join-Path $categoryPath "$FileName.jpg"
    
    if (Test-Path $filePath) {
        $fileInfo = Get-Item $filePath
        if ($fileInfo.Length -gt 1000) {  # File exists and has content
            Write-Host "⏭  Skipping $FileName (exists)" -ForegroundColor Yellow
            return $true
        }
    }
    
    # Use Unsplash Source API
    $url = "https://source.unsplash.com/$imageSize/?$SearchTerms"
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            Write-Host "⬇  Downloading $Category\$FileName... (attempt $($retryCount + 1))" -ForegroundColor Cyan -NoNewline
            
            # Use WebClient for better control
            $webClient = New-Object System.Net.WebClient
            $webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
            $webClient.DownloadFile($url, $filePath)
            $webClient.Dispose()
            
            # Verify file was downloaded
            if (Test-Path $filePath) {
                $fileInfo = Get-Item $filePath
                if ($fileInfo.Length -gt 1000) {
                    Write-Host " ✓ ($([math]::Round($fileInfo.Length/1KB, 2)) KB)" -ForegroundColor Green
                    return $true
                } else {
                    Remove-Item $filePath -Force
                }
            }
        }
        catch {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Write-Host " ✗ Retrying..." -ForegroundColor Yellow
                Start-Sleep -Seconds 2
            } else {
                Write-Host " ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    return $false
}

# Image mappings with better search terms
$images = @{
    "rings" = @{
        "classic-18k-gold-wedding-ring" = "gold+wedding+ring"
        "diamond-solitaire-engagement-ring" = "diamond+engagement+ring"
        "diamond-solitaire-engagement-ring-1" = "diamond+ring+closeup"
        "vintage-art-deco-ring" = "vintage+gold+ring"
        "platinum-eternity-band" = "platinum+ring+diamond"
        "rose-gold-stackable-ring-set" = "rose+gold+ring"
    }
    "necklaces" = @{
        "pearl-strand-necklace" = "pearl+necklace"
        "diamond-pendant-necklace" = "diamond+pendant+necklace"
        "diamond-pendant-necklace-1" = "diamond+necklace"
        "gold-choker-with-gemstones" = "gold+choker+necklace"
        "layered-gold-chain-set" = "gold+chain+necklace"
        "vintage-locket-necklace" = "vintage+locket"
    }
    "earrings" = @{
        "diamond-stud-earrings" = "diamond+earrings"
        "pearl-drop-earrings" = "pearl+earrings"
        "hoop-earrings-22k-gold" = "gold+hoop+earrings"
        "chandelier-earrings-with-crystals" = "chandelier+earrings"
        "minimalist-gold-huggies" = "gold+huggie+earrings"
    }
    "bracelets" = @{
        "tennis-bracelet-diamond" = "diamond+tennis+bracelet"
        "gold-bangle-set" = "gold+bangle"
        "charm-bracelet-18k-gold" = "gold+charm+bracelet"
        "cuff-bracelet-with-gemstones" = "gold+cuff+bracelet"
        "link-chain-bracelet" = "gold+chain+bracelet"
    }
    "pendants" = @{
        "heart-pendant-18k-gold" = "gold+heart+pendant"
        "cross-pendant-diamond" = "diamond+cross+pendant"
        "initial-pendant-custom" = "gold+initial+pendant"
        "tree-of-life-pendant" = "gold+tree+pendant"
    }
    "chains" = @{
        "cuban-link-chain-22k" = "cuban+link+chain"
        "rope-chain-18k-gold" = "gold+rope+chain"
        "box-chain-14k-gold" = "gold+box+chain"
        "figaro-chain-22k-gold" = "gold+figaro+chain"
    }
    "bangles" = @{
        "traditional-gold-bangle" = "traditional+gold+bangle"
        "diamond-bangle-set" = "diamond+bangle"
        "hinged-bangle-18k" = "gold+hinged+bangle"
        "open-cuff-bangle" = "gold+cuff+bangle"
    }
    "anklets" = @{
        "delicate-gold-anklet" = "gold+anklet"
        "chain-anklet-with-pendant" = "gold+anklet+chain"
        "beaded-anklet" = "beaded+anklet"
    }
    "brooches" = @{
        "vintage-floral-brooch" = "vintage+brooch"
        "art-deco-brooch" = "art+deco+brooch"
        "butterfly-brooch-diamond" = "diamond+butterfly+brooch"
    }
    "watches" = @{
        "luxury-gold-watch" = "luxury+gold+watch"
        "diamond-watch-22k" = "diamond+gold+watch"
        "vintage-gold-watch" = "vintage+gold+watch"
        "sport-gold-watch" = "sport+gold+watch"
    }
}

# Download all images
$downloaded = 0
$skipped = 0
$failed = 0

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Starting Jewelry Image Download" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($category in $images.Keys) {
    Write-Host "`n📁 Category: $category" -ForegroundColor Magenta
    foreach ($fileName in $images[$category].Keys) {
        $searchTerms = $images[$category][$fileName]
        $result = Download-Image -Category $category -FileName $fileName -SearchTerms $searchTerms
        if ($result) {
            $downloaded++
        } else {
            $failed++
        }
        Start-Sleep -Milliseconds 1500  # Rate limiting
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Download Summary" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ Downloaded: $downloaded" -ForegroundColor Green
Write-Host "  ⏭  Skipped: $skipped" -ForegroundColor Yellow
Write-Host "  ❌ Failed: $failed" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan








