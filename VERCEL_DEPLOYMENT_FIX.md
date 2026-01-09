# Fixing Vercel Deployment - Serverless Function Size Error

## Problem
Vercel deployment fails with:
```
Error: A Serverless Function has exceeded the unzipped maximum size of 250 MB
```

## Root Cause
1. **Product images in `public/product/`** are large (some 900+ KB each)
2. **API routes that write files** won't work on Vercel (serverless functions are read-only)
3. Images might be getting bundled into serverless functions

## Solutions

### Solution 1: Use Supabase Storage (Recommended)

**Why**: 
- Vercel serverless functions have read-only filesystem
- Supabase Storage is designed for file uploads
- Better scalability and performance

**Steps**:
1. Create a storage bucket in Supabase called "products"
2. Update upload API routes to use Supabase Storage instead of filesystem
3. Images will be stored in Supabase, not in your codebase

### Solution 2: Exclude Images from Git (Quick Fix)

**For now**, to get deployed:

1. **Remove product images from Git** (they're too large):
   ```bash
   # Add to .gitignore (already done)
   # Remove from Git tracking
   git rm -r --cached public/product/*.jpg
   git commit -m "Remove product images from Git"
   git push
   ```

2. **Deploy without images first** - your site will work, just no product images initially

3. **Upload images through admin portal** - they'll be stored in Supabase Storage (after implementing Solution 1)

### Solution 3: Use Vercel Blob Storage

Vercel offers Blob Storage for file uploads. This requires:
- Updating API routes to use Vercel Blob
- Changing image URLs to use Vercel Blob URLs

## Immediate Fix (Deploy Now)

1. **Temporarily exclude product images**:
   ```bash
   # Move images out temporarily
   mkdir product_images_backup
   mv public/product/*.jpg product_images_backup/
   
   # Commit and push
   git add .
   git commit -m "Temporarily remove product images for deployment"
   git push
   ```

2. **Deploy** - should work now

3. **After deployment**, implement Supabase Storage for image uploads

## Long-term Solution: Supabase Storage

The admin portal's image upload feature needs to be updated to use Supabase Storage instead of filesystem writes. This is the proper solution for production.

**Benefits**:
- ✅ Works on serverless platforms
- ✅ Scalable
- ✅ CDN delivery
- ✅ No size limits
- ✅ Better performance

Would you like me to update the upload routes to use Supabase Storage?

