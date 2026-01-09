# Fixing Image Display Issue

## Problem
Images aren't showing because:
1. Existing images in database have URLs like `https://fearinsight.com/product/f001.jpg`
2. But those files aren't in Supabase Storage yet
3. On Vercel, there's no `public/product/` folder

## Solution Options

### Option 1: Check Current Image URLs
Visit: `http://localhost:3000/api/admin/check-images` (or your domain)
This will show what URLs are currently in your database.

### Option 2: Upload Existing Images to Supabase Storage
1. Go to Supabase Dashboard → Storage → Create bucket `products` (if not exists)
2. Upload your existing images from `public/product/` folder to Supabase Storage
3. Update database URLs to use Supabase Storage URLs

### Option 3: Use Local Files for Existing Images
If you're running locally, images in `public/product/` should work.
Make sure the URLs in database match the file names.

## Quick Fix
The code now uses direct Supabase Storage URLs for NEW uploads.
But EXISTING images in database need to be updated.

## Next Steps
1. Check what URLs are in your database (use check-images endpoint)
2. Either:
   - Upload existing images to Supabase Storage and update URLs
   - Or keep using local files if running locally

