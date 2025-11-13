# 🚀 Vercel Deployment Guide - Library of Echoes

## ✅ Prerequisites

1. **GitHub Repository:** ✅ Already done!
   - Repo: `kaenlabs/library-of-echoes`
   - Branch: `main`

2. **Vercel Account:** [Create free account](https://vercel.com/signup)
   - Sign up with GitHub (recommended)
   - No credit card needed!

3. **Supabase Project:** ✅ Already configured
   - URL and Anon Key ready

---

## 📦 Step 1: Prepare for Deployment

### Check Environment Variables
You need your Supabase credentials:

```bash
# From your .env.local file:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key...
```

**Write these down!** You'll need them in Vercel.

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (RECOMMENDED)

1. **Go to:** https://vercel.com
2. **Sign in** with GitHub
3. **Click:** "Add New..." → "Project"
4. **Import Git Repository:**
   - Search for: `library-of-echoes`
   - Click: "Import"
5. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `web`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
6. **Environment Variables:**
   - Click "Add" for each:
   ```
   NEXT_PUBLIC_SUPABASE_URL → your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY → your_anon_key
   ```
7. **Click:** "Deploy"
8. **Wait:** ~2-3 minutes
9. **Done!** 🎉

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from web directory
cd web
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? Your account
# - Link to existing project? N
# - Project name? library-of-echoes
# - Directory? ./
# - Override settings? N

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

---

## 🔧 Step 3: Configure Domain

### Free Subdomain (Automatic)
Your site will be live at:
```
https://library-of-echoes.vercel.app
```
or
```
https://library-of-echoes-kaenlabs.vercel.app
```

### Custom Domain (Optional)
If you have your own domain:

1. **Vercel Dashboard** → Project → Settings → Domains
2. **Add Domain:** `yourdomain.com`
3. **Add DNS Records** (in your domain registrar):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. **Wait:** 5-10 minutes for DNS propagation
5. **SSL:** Automatic (Let's Encrypt)

---

## ✅ Step 4: Verify Deployment

### Check These Pages:
- ✅ Homepage: `/`
- ✅ Intro: `/intro`
- ✅ Epochs: `/epochs`
- ✅ Message Map: `/message-map`
- ✅ Admin: `/admin`
- ✅ Babel Moment: `/babel` (if epoch closed)

### Test Functionality:
- ✅ Send a message
- ✅ Check system state
- ✅ View epochs archive
- ✅ Try admin panel (if you're admin)
- ✅ Mobile responsive test

### Check Performance:
- ✅ Lighthouse audit (F12 → Lighthouse)
- ✅ Load time < 3 seconds
- ✅ No console errors

---

## 🐛 Troubleshooting

### Build Fails
**Problem:** Build error on Vercel
**Solution:**
1. Check build locally: `npm run build`
2. Fix any TypeScript errors
3. Push to GitHub
4. Vercel auto-redeploys

### Environment Variables Missing
**Problem:** "Supabase client not configured"
**Solution:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy: Deployments → ... → Redeploy

### 404 on Pages
**Problem:** Pages not found
**Solution:**
1. Check `web/` is set as root directory
2. Framework preset is "Next.js"
3. Build output is `.next`

### Slow Load Times
**Problem:** Site loads slowly
**Solution:**
1. Enable Edge Functions (automatic)
2. Check Supabase region (should be close to users)
3. Use Vercel Analytics to find bottlenecks

---

## 📊 Post-Deployment

### Enable Analytics (Optional)
1. Vercel Dashboard → Project → Analytics
2. Click "Enable"
3. Free tier: 100k events/month

### Set Up Monitoring
1. Check deployment logs: Vercel Dashboard → Deployments
2. Monitor errors: Vercel Dashboard → Logs
3. Performance: Vercel Dashboard → Analytics → Speed Insights

### Update README
Add deployment URL to your README.md:
```markdown
## 🌐 Live Demo

**Production:** https://library-of-echoes.vercel.app

Try it now! Send anonymous messages and watch them echo across layers.
```

---

## 🔄 Continuous Deployment

**Automatic Updates:**
- Every `git push` to `main` → Auto-deploys to production
- Every PR → Preview deployment URL
- Rollback anytime with one click

**Preview Deployments:**
- Each pull request gets unique URL
- Test before merging
- Share with team

---

## 💡 Tips

### Performance Optimization
- ✅ Images optimized (Next.js Image component)
- ✅ Code splitting (automatic)
- ✅ Edge functions (automatic)
- ✅ Caching headers (automatic)

### Security
- ✅ HTTPS (automatic)
- ✅ Environment variables (encrypted)
- ✅ Supabase RLS (already configured)
- ✅ Rate limiting (implemented)

### Scaling
- ✅ Auto-scales with traffic
- ✅ Global CDN (150+ locations)
- ✅ No server management needed

---

## 📝 Checklist

Before deploying:
- [x] Code pushed to GitHub
- [x] .env.example created
- [x] Build works locally: `npm run build`
- [ ] Supabase credentials ready
- [ ] Vercel account created
- [ ] Environment variables added

After deploying:
- [ ] Test all pages
- [ ] Send test message
- [ ] Check mobile version
- [ ] Run Lighthouse audit
- [ ] Share URL with friends! 🎉

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Site loads at vercel.app URL
- ✅ Can send messages
- ✅ Supabase connection works
- ✅ All animations play
- ✅ No console errors
- ✅ Lighthouse score > 80

---

## 🚀 Expected Results

- **Deployment Time:** 2-3 minutes
- **Build Time:** 1-2 minutes
- **Load Time:** 1-2 seconds (first visit)
- **Load Time:** <500ms (cached)
- **Global:** Available in 150+ locations
- **Uptime:** 99.99% guaranteed

---

## 📞 Support

**Vercel Issues:**
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support
- Status: https://vercel-status.com

**Project Issues:**
- GitHub Issues: https://github.com/kaenlabs/library-of-echoes/issues

---

**Ready to deploy?** Let's go! 🚀

**Last Updated:** November 13, 2025
