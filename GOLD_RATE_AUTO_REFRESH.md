# Gold Rate Automatic Refresh System

## Overview

The jewelry app now includes an automatic gold price refresh system that fetches live gold prices from multiple official sources and updates the display automatically based on each source's refresh rate.

## How It Works

### 1. **Multiple Official Sources**

The system tries multiple official gold price sources in order of reliability:

1. **Metals.live** (Primary)
   - Updates: Every 60 seconds
   - No API key required
   - Most reliable free source

2. **MetalpriceAPI** (Secondary)
   - Updates: Every 60 seconds
   - Requires API key (set `METALPRICE_API_KEY` environment variable)
   - Sign up at: https://metalpriceapi.com

3. **FreeGoldPrice.org** (Fallback)
   - Updates: Every 1 hour
   - No API key required
   - Less frequent updates

### 2. **Automatic Refresh Mechanism**

- **Server-Side**: API route revalidates every 60 seconds using Next.js ISR
- **Client-Side**: Component automatically polls the API based on the source's refresh rate:
  - Metals.live: Every 60 seconds
  - MetalpriceAPI: Every 60 seconds
  - FreeGoldPrice.org: Every 1 hour
  - Error state: Every 30 seconds (for faster retry)

### 3. **Smart Refresh Rate Adjustment**

The system automatically adjusts the refresh interval based on:
- The active source's update frequency
- Error states (faster retry on errors)
- Source availability

## Configuration

### Environment Variables

To use additional sources, set these environment variables in your `.env.local`:

```env
# MetalpriceAPI (optional)
METALPRICE_API_KEY=your_api_key_here
```

### Getting API Keys

1. **MetalpriceAPI**: 
   - Visit: https://metalpriceapi.com
   - Sign up for a free account
   - Get your API key from the dashboard
   - Free tier: 100 requests/month

## Files Modified

1. **`lib/goldRate.ts`**
   - Added multiple official source functions
   - Implemented source priority system
   - Added refresh rate constants

2. **`components/GoldRateDisplay.tsx`**
   - Implemented automatic polling with dynamic refresh rates
   - Added source-based interval adjustment
   - Error handling with retry logic

3. **`app/api/gold-rate/route.ts`**
   - Enhanced caching headers
   - Added source metadata in response headers
   - Optimized revalidation settings

## Features

✅ **Automatic Updates**: Gold price refreshes automatically without page reload  
✅ **Multiple Sources**: Tries multiple official sources for reliability  
✅ **Smart Refresh**: Adjusts refresh rate based on active source  
✅ **Error Handling**: Automatic retry with shorter intervals on errors  
✅ **Source Attribution**: Shows which source is being used  
✅ **Real-time Display**: Updates in navbar on all pages  

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Check the gold rate display in the navbar
3. Wait 60 seconds and verify it updates automatically
4. Check browser console for any errors
5. Verify the source is displayed correctly

## Troubleshooting

### Gold rate not updating?

1. Check browser console for errors
2. Verify network connectivity
3. Check if API sources are accessible
4. Verify environment variables are set correctly (if using MetalpriceAPI)

### Using fallback values?

- All sources may be temporarily unavailable
- Check your internet connection
- Verify API endpoints are accessible
- The system will automatically retry

## Future Enhancements

- Add more official sources (LBMA, World Gold Council)
- Implement caching for offline support
- Add price change indicators (↑/↓)
- Historical price tracking
- Price alerts/notifications
