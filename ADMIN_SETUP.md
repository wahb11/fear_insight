# Admin Portal Setup Guide

## Overview
The admin portal provides a secure interface to manage your Fear Insight website. It includes:
- **Orders Management**: View all customer orders
- **Analytics Dashboard**: Track visitors, page views, orders, and revenue
- **Product Upload**: Upload new products with automatic image renaming

## Setup Instructions

### 1. Environment Variables
Add the following to your `.env.local` file:

```env
# Admin Portal Password (change this to a strong password!)
ADMIN_PASSWORD=your_secure_password_here

# Site URL (for generating product image URLs)
NEXT_PUBLIC_SITE_URL=https://fearinsight.com

# Supabase Configuration (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Service Role Key (for admin operations - optional but recommended)
# Get this from Supabase Dashboard > Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Create Analytics Table in Supabase
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `scripts/create_analytics_table.sql`
   - This creates the `analytics` table for tracking visitors

### 3. Access the Admin Portal
1. Navigate to: `https://yourdomain.com/admin/login`
2. Enter the password you set in `ADMIN_PASSWORD`
3. You'll be redirected to the admin dashboard

## Features

### Orders Tab
- View all customer orders
- See order details including customer info, products, and payment status
- Filter and search orders (future enhancement)

### Analytics Tab
- **Total Visitors**: Cumulative visitor count
- **Today's Visitors**: Visitors for the current day
- **Total Orders**: All orders placed
- **Paid Orders**: Orders with completed payment
- **Total Revenue**: Sum of all paid orders
- **Conversion Rate**: Percentage of visitors who placed orders
- **Daily Statistics**: Last 30 days of visitor and page view data

### Products Tab
- Upload new products with multiple images
- Images are automatically renamed (f001.jpg, f002.jpg, etc.) matching your existing naming convention
- Product URLs are automatically generated
- Products are automatically added to your Supabase database
- Form includes:
  - Product name, description, price
  - Colors and sizes (comma-separated)
  - Featured and Best Seller flags
  - Material, care instructions, shipping info

## How Image Upload Works

1. Select one or more product images
2. Images are automatically:
   - Renamed to follow the pattern: `f001.jpg`, `f002.jpg`, etc.
   - Saved to `public/product/` directory
   - Assigned the next available number (checks existing files)
3. URLs are generated in the format: `https://fearinsight.com/product/f001.jpg`
4. Product is saved to Supabase with all image URLs

## Security Notes

- The admin portal uses password-based authentication
- Sessions are stored in HTTP-only cookies
- All admin API routes check authentication
- **Important**: Change the default password in production!
- Consider using environment-specific passwords

## Troubleshooting

### Can't access admin portal
- Check that `ADMIN_PASSWORD` is set in your environment variables
- Clear browser cookies and try again
- Check browser console for errors

### Analytics not showing data
- Ensure the `analytics` table exists in Supabase
- Check that the VisitorTracker component is loaded (it's in the root layout)
- Verify API routes are working: `/api/analytics/track`

### Product upload fails
- Check that `public/product/` directory exists and is writable
- Verify Supabase connection and permissions
- Check that product images are valid formats (jpg, png, webp)

### Images not appearing
- Verify `NEXT_PUBLIC_SITE_URL` is set correctly
- Check that images are saved to `public/product/` directory
- Ensure image URLs are accessible (check file permissions)

## Future Enhancements

Potential features to add:
- Edit existing products
- Delete products
- Order status management
- Export orders to CSV
- Advanced analytics charts
- User management
- Email notifications for new orders

