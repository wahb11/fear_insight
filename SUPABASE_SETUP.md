# Supabase Setup for Admin Portal

## Required Environment Variables

Make sure you have these in your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional but Recommended for Admin Operations
# This allows admin routes to bypass Row Level Security (RLS)
# Get this from: Supabase Dashboard > Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Where to Find Your Supabase Keys

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. You'll find:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → Use for `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Required Tables

Your Supabase database should already have these tables:
- ✅ `products` - Your product catalog
- ✅ `orders` - Customer orders
- ✅ `categories` - Product categories (if used)

## New Table to Create

### Analytics Table

Run the SQL script in Supabase SQL Editor:
1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy and paste the contents of `scripts/create_analytics_table.sql`
4. Click **Run**

This creates the `analytics` table for tracking visitors and page views.

## Row Level Security (RLS)

The admin portal uses:
- **Anon Key** for read operations (visitor tracking)
- **Service Role Key** (if provided) for admin write operations to bypass RLS

If you don't set `SUPABASE_SERVICE_ROLE_KEY`, the admin routes will use the anon key, which means:
- You may need to adjust RLS policies on your tables
- Or disable RLS on admin-accessible tables (not recommended for production)

## Recommended RLS Setup

For better security, keep RLS enabled and:

1. **Analytics Table**: Allow anon inserts/updates (already in the SQL script)
2. **Products Table**: 
   - Allow public read access
   - Only allow service role/admin to insert/update/delete
3. **Orders Table**:
   - Only allow service role/admin to read (for admin portal)
   - Allow inserts from authenticated users or anon (for checkout)

## Testing Your Setup

1. Verify environment variables are set
2. Run the analytics table SQL script
3. Try accessing `/admin/login`
4. Upload a test product to verify Supabase connection
5. Check analytics tab to see if visitor tracking works

## Troubleshooting

### "Unauthorized" errors in admin routes
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set (recommended)
- Or adjust RLS policies to allow anon key access

### Analytics not tracking
- Verify `analytics` table exists
- Check RLS policies allow inserts
- Check browser console for errors

### Product upload fails
- Verify Supabase connection
- Check `products` table structure matches the Product type
- Ensure RLS allows inserts (or use service role key)


