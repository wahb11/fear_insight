# Deployment Guide - Fear Insight Landing

## Pre-Deployment Checklist

### 1. Database Setup
- [ ] Analytics table created in Supabase (run `scripts/create_analytics_table.sql`)
- [ ] All products, orders, and categories tables are set up
- [ ] Test database connection works

### 2. Environment Variables
Make sure you have all these ready:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (recommended for admin)
- [ ] `ADMIN_PASSWORD` (set a strong password!)
- [ ] `NEXT_PUBLIC_SITE_URL` (your production domain)
- [ ] `STRIPE_SECRET_KEY` (if using Stripe)
- [ ] `STRIPE_WEBHOOK_SECRET` (if using Stripe)
- [ ] Any email service credentials (if using nodemailer)

### 3. Code Preparation
- [ ] Test locally: `npm run build` succeeds
- [ ] All features tested locally
- [ ] No console errors
- [ ] Images are accessible

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

#### Step 1: Prepare Your Repository
```bash
# Make sure you have a .gitignore file
# Commit your code
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
   - Sign up/Login with GitHub/GitLab/Bitbucket

2. **Import Your Project**
   - Click "Add New Project"
   - Import your repository
   - Vercel will auto-detect Next.js

3. **Configure Project Settings**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (if your project is at root)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add ALL your environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_value
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
     SUPABASE_SERVICE_ROLE_KEY=your_value
     ADMIN_PASSWORD=your_secure_password
     NEXT_PUBLIC_SITE_URL=https://yourdomain.com
     STRIPE_SECRET_KEY=your_value (if using)
     STRIPE_WEBHOOK_SECRET=your_value (if using)
     ```
   - **Important**: Mark `NEXT_PUBLIC_*` variables for all environments
   - Mark others for Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `your-project.vercel.app`

#### Step 3: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain

### Option 2: Other Platforms

#### Netlify
1. Connect your Git repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in Site Settings

#### Self-Hosted (VPS/Server)
1. Build: `npm run build`
2. Start: `npm start` or use PM2
3. Use reverse proxy (Nginx) for production
4. Set up SSL certificate (Let's Encrypt)

## Post-Deployment Steps

### 1. Verify Deployment
- [ ] Visit your live site
- [ ] Test homepage loads
- [ ] Test product pages
- [ ] Test checkout flow
- [ ] Test admin portal at `/admin/login`

### 2. Admin Portal Setup
- [ ] Access `/admin/login` on your live site
- [ ] Login with your `ADMIN_PASSWORD`
- [ ] Verify you can see orders
- [ ] Test product upload
- [ ] Test product editing

### 3. Database Verification
- [ ] Check Supabase dashboard - verify connections
- [ ] Test that products load on live site
- [ ] Verify analytics tracking works

### 4. Image Uploads
- [ ] Test uploading product images through admin
- [ ] Verify images are accessible on live site
- [ ] Check image URLs are correct

### 5. Stripe Integration (if using)
- [ ] Update Stripe webhook URL to production
- [ ] Test payment flow
- [ ] Verify webhook receives events

## Important Notes

### Environment Variables
- **Never commit** `.env.local` to Git
- All `NEXT_PUBLIC_*` variables are exposed to the browser
- Keep `ADMIN_PASSWORD` and `SUPABASE_SERVICE_ROLE_KEY` secret
- Update `NEXT_PUBLIC_SITE_URL` to your production domain

### Image Storage
- Images are stored in `public/product/` directory
- On Vercel, this is part of your deployment
- For large-scale, consider Supabase Storage or AWS S3

### Performance
- Vercel automatically optimizes Next.js apps
- Images are served from CDN
- Consider enabling image optimization (remove `unoptimized: true` if needed)

### Security
- Admin portal is password-protected
- Use strong `ADMIN_PASSWORD`
- Consider adding rate limiting for admin routes
- Keep service role key secure

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Check for TypeScript/ESLint errors

### Environment Variables Not Working
- Ensure variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

### Images Not Loading
- Verify `NEXT_PUBLIC_SITE_URL` is correct
- Check image paths are relative to `/product/`
- Ensure images are committed to repository

### Admin Portal Not Working
- Verify `ADMIN_PASSWORD` is set
- Check Supabase credentials are correct
- Verify service role key has proper permissions

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test database connection in Supabase dashboard

