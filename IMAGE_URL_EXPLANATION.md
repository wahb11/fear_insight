# Image URL Format Explanation

## How It Works

### URL Format
When you upload images through the admin portal, the URLs generated are:
```
https://fearinsight.com/product/f001.jpg?color=
https://fearinsight.com/product/f002.jpg?color=
```

**Same format as your `renameAndGenerate.js` script!**

### Where Images Are Actually Stored

**On Vercel (Production)**:
- Images are stored in **Supabase Storage** (bucket: `products`)
- But URLs use **your domain** (`https://fearinsight.com/product/...`)
- Next.js automatically proxies these requests to Supabase Storage
- This gives you:
  - ✅ Your domain in URLs (clean, branded)
  - ✅ Supabase CDN delivery (fast, global)
  - ✅ No deployment size issues

**Locally (Development)**:
- Images are stored in `public/product/` folder
- URLs are `http://localhost:3000/product/f001.jpg`
- Works exactly like before

## The Magic: Next.js Rewrite

The `next.config.mjs` has a rewrite rule:
```javascript
{
  source: '/product/:path*',
  destination: 'https://[your-project].supabase.co/storage/v1/object/public/products/:path*'
}
```

This means:
- User requests: `https://fearinsight.com/product/f001.jpg`
- Next.js proxies to: `https://[project].supabase.co/storage/v1/object/public/products/f001.jpg`
- User sees: Your domain URL (clean!)
- User gets: Supabase CDN speed (fast!)

## Benefits

✅ **Same URL format** as `renameAndGenerate.js`
✅ **Your domain** in URLs (not Supabase URLs)
✅ **Supabase CDN** delivery (fast, global)
✅ **Works on Vercel** (no filesystem writes needed)
✅ **Automatic** - no manual steps

## Example

When you upload an image:
1. Image uploaded to Supabase Storage as `f001.jpg`
2. URL generated: `https://fearinsight.com/product/f001.jpg?color=`
3. URL saved to database
4. When someone visits that URL, Next.js proxies to Supabase Storage
5. Image loads fast via Supabase CDN

**Result**: Clean URLs with fast CDN delivery! 🚀

