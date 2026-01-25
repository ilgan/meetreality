## Requirements:

we are building a static web site that will be hosted in cloudfare. It will have a data saved in json or a csv file. similar to https://delusionmeter.com/

## Data
The data will consist of: age, sex, salary, location, education level, ethnicity, height, weight, martial status (married or not), have kids or not... and a few more fields.

## Front End
The front end is very simplistic consisting of checkmarks, selectors.

## Output
It will output the percentage of population that falls within the seleced parameters.

## Ads integration
The app will need to make income to pay for the service and will need an ad integration.

## Technology

### Frontend Framework
- **HTML5 + Vanilla JavaScript** - Minimal dependencies to keep bundle size small
- **TailwindCSS** - Lightweight CSS framework (can be purged to remove unused styles)
- Alternative: Plain CSS for absolute minimum footprint

### Data Storage
- **JSON file** - Serves as the data source for population statistics
- Embedded directly in the frontend bundle or loaded dynamically
- Can be compressed (gzip) for minimal transfer size

### Build & Deployment
- **Static site hosting** - Cloudflare Pages (free tier available)
- **Vite** - Lightning-fast build tool that optimizes bundle size and generates minimal JavaScript
- Bundle size target: < 100KB (including all JavaScript, CSS, and compressed data)

### Ad Integration
- **Google AdSense** or **Carbon Ads** - Simple script injection, no backend required
- Works directly on static pages hosted on Cloudflare

## Implementation

### Architecture
- **Single-page application (SPA)** - All filtering and calculations happen in the browser
- **No backend required** - Eliminates server hosting costs entirely
- **Offline capable** - Can work without internet after initial load (PWA optional)

### Data Processing
- Filter and calculate statistics in real-time using JavaScript
- Pre-process data at build time to create lookup tables for instant results
- Store Slavic population data in optimized JSON format (or CSV parsed at build time)

### Performance Optimizations
- Minify all assets (HTML, CSS, JavaScript)
- Gzip compression for data files
- Lazy load ads only when visible
- Cache-bust with Vite's automatic asset hashing

### File Structure
- HTML entry point with embedded or linked JSON data
- Single JavaScript bundle with all filtering logic
- Stylesheet with only used CSS classes
- Total expected size: < 50KB uncompressed, < 15KB gzipped