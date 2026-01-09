# Deployment with Supabase Storage

## How It Works Now

When you upload images through the admin portal:

1. **Images are uploaded to Supabase Storage** (bucket: `products`)
2. **Automatic renaming** happens (f001.jpg, f002.jpg, etc.) - same logic as `renameAndGenerate.js`
3. **URLs are generated** automatically
4. **URLs are saved to database** in the product's `images` array

## Why Supabase Storage?

- ✅ **Works on Vercel** (serverless functions can't write to filesystem)
- ✅ **Same naming convention** (f001.jpg, f002.jpg, etc.)
- ✅ **Automatic URL generation**
- ✅ **CDN delivery** (faster than local files)
- ✅ **Scalable** (no size limits)

## Setup Steps

### 1. Create Supabase Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click **"New bucket"**
3. Settings:
   - **Name**: `products` (must be exact)
   - **Public bucket**: ✅ Enable
   - **File size limit**: 10 MB or higher
4. Click **"Create bucket"**

### 2. Remove Images from Git

```bash
# Remove from Git (they stay on your computer)
git rm -r --cached public/product/*.jpg
git rm -r --cached public/product/*.jpeg
git rm -r --cached public/product/*.png
git rm -r --cached public/product/*.webp

git commit -m "Remove product images - using Supabase Storage"
git push
```

### 3. Deploy

- Vercel will redeploy automatically
- Build will succeed (no large images)

### 4. Upload Images Through Admin Portal

- Go to `/admin/login`
- Navigate to Products tab
- Upload new products with images
- Images will be:
  - Renamed automatically (f001.jpg, f002.jpg, etc.)
  - Stored in Supabase Storage
  - URLs saved to database automatically

## Image URLs

Images will be stored at:
```
https://[your-project].supabase.co/storage/v1/object/public/products/f001.jpg
```

These URLs are:
- ✅ Publicly accessible
- ✅ Served via CDN (fast)
- ✅ Automatically saved to database
- ✅ Same naming as your `renameAndGenerate.js` script

## Migrating Existing Images

If you have existing images in `public/product/`:

1. **Option A**: Upload them through admin portal (they'll be renamed and stored in Supabase)
2. **Option B**: Use your existing `upload_products.py` script to upload to Supabase Storage
3. **Option C**: Manually upload to Supabase Storage dashboard

The naming convention (f001.jpg, f002.jpg, etc.) is preserved!

