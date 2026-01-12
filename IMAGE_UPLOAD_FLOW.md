# Image Upload Flow Documentation

## Overview
This document explains how images are uploaded from the admin portal to Supabase Storage and how their URLs are stored in the database.

---

## Database Structure

### Images Column
- **Type**: `string[]` (Array of strings)
- **Location**: `products` table, `images` column
- **Format**: Array of public URLs from Supabase Storage
- **Example**: 
  ```json
  [
    "https://[project].supabase.co/storage/v1/object/public/products/f001.jpg",
    "https://[project].supabase.co/storage/v1/object/public/products/f002.jpg"
  ]
  ```

---

## Flow 1: Creating a New Product (Upload Product)

### Route: `/api/admin/upload-product`
**File**: `app/api/admin/upload-product/route.ts`

### Step-by-Step Process:

1. **Authentication Check**
   - Verifies admin session cookie
   - Returns 401 if not authenticated

2. **Receive Form Data**
   - Extracts product data (JSON string)
   - Extracts image files from FormData
   - Validates at least one image is provided

3. **Generate Unique Filename**
   - Lists all existing files in Supabase Storage bucket `products`
   - Finds the highest numbered file matching pattern `f###.ext` (e.g., `f001.jpg`, `f002.png`)
   - Increments the number for new files
   - Example: If `f099.jpg` exists, next file will be `f100.jpg`

4. **Upload Images to Supabase Storage**
   For each image file:
   - Validates file extension (`.jpg`, `.jpeg`, `.png`, `.webp`)
   - Converts file to Buffer
   - Uploads to Supabase Storage bucket `products` with unique name
   - Generates public URL using `supabase.storage.from(BUCKET_NAME).getPublicUrl(filename)`
   - Collects all URLs in `imageUrls` array

5. **Insert Product to Database**
   ```typescript
   const productToInsert = {
     // ... other fields
     images: imageUrls  // Array of public URLs
   }
   
   await supabase
     .from("products")
     .insert([productToInsert])
   ```

### ✅ Important Points:
- **New product creation** - no existing images to preserve
- Images are uploaded to Supabase Storage bucket `products`
- URLs are stored as an array in the `images` column
- Each image gets a unique filename: `f###.ext`

---

## Flow 2: Adding Images to Existing Product

### Route: `/api/admin/products/[id]/add-images`
**File**: `app/api/admin/products/[id]/add-images/route.ts`

### Step-by-Step Process:

1. **Authentication Check**
   - Verifies admin session cookie
   - Returns 401 if not authenticated

2. **Fetch Existing Product**
   ```typescript
   const { data: existingProduct } = await supabase
     .from("products")
     .select("images")
     .eq("id", id)
     .single()
   ```
   - **Retrieves current images array** from database
   - This preserves all existing image URLs

3. **Receive New Image Files**
   - Extracts image files from FormData
   - Validates at least one image is provided

4. **Generate Unique Filename**
   - Same process as Flow 1
   - Finds highest numbered file in storage
   - Increments for new files

5. **Upload New Images to Supabase Storage**
   - Same process as Flow 1
   - Uploads each new image
   - Collects new URLs in `newImageUrls` array

6. **Merge with Existing Images** ⭐ **KEY POINT**
   ```typescript
   // Get existing images (preserved)
   const existingImages = (existingProduct?.images || []) as string[]
   
   // Merge: existing first, then new
   const updatedImages = [...existingImages, ...newImageUrls]
   ```
   
   **This ensures:**
   - ✅ All existing URLs are preserved
   - ✅ New URLs are appended to the end
   - ✅ No existing images are lost or modified

7. **Update Product in Database**
   ```typescript
   await supabase
     .from("products")
     .update({ images: updatedImages })  // Merged array
     .eq("id", id)
   ```

### ✅ Important Points:
- **Existing images are preserved** - fetched before update
- **New images are appended** - not replaced
- **Array merging**: `[...existingImages, ...newImageUrls]`
- **No URLs are deleted or modified** - only new ones added

---

## Safety Guarantees

### ✅ Existing URLs Are Never Disturbed

1. **When Adding Images:**
   - Existing images array is fetched first
   - New images are merged (existing + new)
   - Only the merged array is saved
   - **Result**: All existing URLs remain intact

2. **When Creating New Product:**
   - No existing images to preserve
   - Clean slate with new URLs

3. **Filename Generation:**
   - Uses incremental numbering (`f001`, `f002`, etc.)
   - Prevents filename conflicts
   - Each upload gets a unique identifier

### ❌ What Does NOT Happen:
- Existing URLs are NOT replaced
- Existing URLs are NOT deleted (unless explicitly removed via delete-image endpoint)
- Existing URLs are NOT modified
- Array is NOT overwritten, only merged

---

## Code Locations

### Admin Portal Frontend
- **Component**: `components/admin/ProductsTab.tsx`
- **New Product Upload**: `handleSubmit()` function
- **Add Images**: `handleAddImages()` function

### API Routes
- **New Product**: `app/api/admin/upload-product/route.ts`
- **Add Images**: `app/api/admin/products/[id]/add-images/route.ts`
- **Delete Image**: `app/api/admin/products/[id]/delete-image/route.ts`

---

## Example Scenarios

### Scenario 1: Create Product with 3 Images
```
Before: Product doesn't exist
Upload: [image1.jpg, image2.jpg, image3.jpg]
Storage: f001.jpg, f002.jpg, f003.jpg
Database: [
  "https://...supabase.co/.../f001.jpg",
  "https://...supabase.co/.../f002.jpg",
  "https://...supabase.co/.../f003.jpg"
]
```

### Scenario 2: Add 2 More Images to Existing Product
```
Before: Product has 3 images
Database: [url1, url2, url3]

Upload: [image4.jpg, image5.jpg]
Storage: f004.jpg, f005.jpg
New URLs: [url4, url5]

After Merge: [url1, url2, url3, url4, url5]
Database Update: [url1, url2, url3, url4, url5] ✅
Result: All 5 images preserved
```

### Scenario 3: Multiple Add Operations
```
Initial: [url1, url2]
Add 1st time: [url3, url4]
Result: [url1, url2, url3, url4] ✅

Add 2nd time: [url5]
Before add: Fetch → [url1, url2, url3, url4]
Merge: [url1, url2, url3, url4, url5] ✅
Result: All 5 images preserved
```

---

## Testing Checklist

To verify existing URLs are not disturbed:

1. ✅ Create a product with images
2. ✅ Note the image URLs in database
3. ✅ Add more images via "Add Images" button
4. ✅ Verify all original URLs still exist
5. ✅ Verify new URLs are appended
6. ✅ Check that array length = original + new

---

## Troubleshooting

### If URLs seem to be missing:
- Check browser console for errors
- Verify Supabase Storage bucket permissions
- Check database directly: `SELECT images FROM products WHERE id = '...'`
- Verify the merge logic in add-images route (line 118-119)

### If upload fails:
- Check file extensions (must be .jpg, .jpeg, .png, .webp, .gif)
- Verify Supabase Storage bucket exists and is public
- Check file size limits
- Verify authentication (admin session cookie)
