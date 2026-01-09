# Diagnosing Image Display Issue

## Quick Check

1. **Check what URLs are in your database:**
   - Visit: `http://localhost:3000/api/admin/check-images` (if running locally)
   - Or: `https://yourdomain.com/api/admin/check-images` (on production)
   - This will show you the actual image URLs stored in your database

2. **Check browser console:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for image loading errors
   - Check Network tab to see if images are 404 or blocked

## Common Issues

### Issue 1: Images in `public/product/` but URLs point to domain
- **Symptom**: Images work locally but not on Vercel
- **Fix**: Upload images to Supabase Storage and update database URLs

### Issue 2: Supabase Storage bucket doesn't exist
- **Symptom**: New uploads fail
- **Fix**: Create `products` bucket in Supabase Dashboard → Storage

### Issue 3: CORS or permissions issue
- **Symptom**: Images load in some browsers but not others
- **Fix**: Check Supabase Storage bucket is public

## Next Steps

After checking the diagnostic endpoint, we can:
1. Update existing image URLs to use Supabase Storage
2. Or create a migration script to upload existing images
3. Or fix the URL format issue

