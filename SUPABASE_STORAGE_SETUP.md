# Supabase Storage Setup for Product Images

## Step 1: Create Storage Bucket in Supabase

1. **Go to your Supabase Dashboard**
   - Navigate to: https://app.supabase.com
   - Select your project

2. **Go to Storage**
   - Click "Storage" in the left sidebar
   - Click "New bucket"

3. **Create Bucket**
   - **Name**: `products` (must match exactly)
   - **Public bucket**: ✅ **Enable this** (so images are publicly accessible)
   - **File size limit**: Set to 10 MB or higher (for product images)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/jpg`
   - Click "Create bucket"

4. **Set Bucket Policies** (Important!)
   - Click on the `products` bucket
   - Go to "Policies" tab
   - Click "New Policy"
   - **Policy name**: "Allow public read access"
   - **Allowed operation**: SELECT (for reading)
   - **Policy definition**: 
     ```sql
     (bucket_id = 'products')
     ```
   - Click "Review" → "Save policy"
   
   - Create another policy for uploads:
   - **Policy name**: "Allow authenticated uploads"
   - **Allowed operation**: INSERT
   - **Policy definition**:
     ```sql
     (bucket_id = 'products')
     ```
   - **OR** if you want to allow uploads via service role (for admin):
   - Use service role key in API routes (which we already do)

## Step 2: Verify Bucket is Ready

- Bucket name: `products`
- Public: ✅ Enabled
- Policies: Read access for public, Insert for service role

## Step 3: Test Upload (After Code Update)

Once we update the code to use Supabase Storage, you can test uploading images through the admin portal.

## Benefits

✅ Images stored in Supabase (not in your codebase)
✅ Works on Vercel (serverless functions can't write files)
✅ CDN delivery (fast image loading)
✅ Scalable (no size limits)
✅ Automatic image URLs generated

