# Quick Deployment Guide

## 🚀 Deploy to Vercel (5 Minutes)

### Step 1: Prepare Your Code
```bash
# Make sure everything is committed
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Deploy on Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Click "Add New Project"**
   - Import your repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL = (your Supabase URL)
   NEXT_PUBLIC_SUPABASE_ANON_KEY = (your anon key)
   SUPABASE_SERVICE_ROLE_KEY = (your service role key)
   ADMIN_PASSWORD = (your secure password)
   NEXT_PUBLIC_SITE_URL = https://your-project.vercel.app
   ```
   
   **Important**: 
   - Check "Production", "Preview", and "Development" for all variables
   - `NEXT_PUBLIC_*` variables are public (safe)
   - Keep `ADMIN_PASSWORD` and `SUPABASE_SERVICE_ROLE_KEY` secret

4. **Click "Deploy"**
   - Wait 2-3 minutes
   - Your site will be live!

### Step 3: Update Site URL

After first deployment:
1. Copy your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Go to Project Settings → Environment Variables
3. Update `NEXT_PUBLIC_SITE_URL` to your Vercel URL
4. Redeploy (or it will auto-redeploy)

### Step 4: Test Your Live Site

- [ ] Visit your live URL
- [ ] Test homepage
- [ ] Test products page
- [ ] Test admin portal: `https://your-site.com/admin/login`
- [ ] Login with your `ADMIN_PASSWORD`
- [ ] Test product upload

## 🔧 Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS as instructed
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain
5. Redeploy

## ⚠️ Important Notes

1. **Database**: Make sure analytics table exists in Supabase
2. **Images**: Product images in `public/product/` are deployed with your code
3. **Admin Portal**: Access at `/admin/login` on your live site
4. **Environment Variables**: Must be set in Vercel dashboard (not just `.env.local`)

## 🐛 Troubleshooting

**Build fails?**
- Check build logs in Vercel
- Verify all dependencies in `package.json`

**Environment variables not working?**
- Make sure they're set in Vercel dashboard
- Redeploy after adding variables

**Admin portal not working?**
- Verify `ADMIN_PASSWORD` is set correctly
- Check Supabase credentials

## 📝 Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Products display
- [ ] Admin portal accessible
- [ ] Can upload products
- [ ] Images load correctly
- [ ] Analytics tracking works (if set up)

That's it! Your site is live! 🎉

