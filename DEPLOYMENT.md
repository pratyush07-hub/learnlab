# LearnLab Deployment Guide

## Vercel Deployment

### Prerequisites
1. Supabase project set up with database schema
2. Environment variables configured
3. Domain name (optional)

### Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables

Set these in Vercel dashboard or via CLI:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth (if using)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Other services
UPLOAD_THING_SECRET=your_uploadthing_secret
NEXT_PUBLIC_UPLOAD_THING_APP_ID=your_uploadthing_app_id
```

## Supabase Setup

### 1. Create Project
- Go to [supabase.com](https://supabase.com)
- Create new project
- Note down URL and anon key

### 2. Execute Schema
- Go to SQL Editor in Supabase dashboard
- Copy and paste the schema from `database/schema.sql`
- Execute the queries

### 3. Set up RLS Policies
The schema includes basic RLS policies. Customize based on your requirements.

### 4. Storage Buckets (if needed)
```sql
-- Create storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Create storage bucket for documents
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

-- RLS policies for storage
create policy "Avatar images are publicly accessible" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can upload their own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
```

## Custom Domain Setup

### 1. Add Domain in Vercel
- Go to project settings
- Add custom domain
- Configure DNS records

### 2. SSL Certificate
Vercel automatically handles SSL certificates for custom domains.

## Performance Optimization

### 1. Next.js Optimizations
- Image optimization is enabled by default
- Automatic code splitting
- Static generation where possible

### 2. Database Optimization
- Indexes are included in schema
- Connection pooling via Supabase
- Edge functions for heavy operations

### 3. Caching Strategy
- Static pages cached at edge
- API responses cached appropriately
- Database queries optimized

## Monitoring & Analytics

### 1. Vercel Analytics
Enable in project settings for performance monitoring.

### 2. Supabase Analytics
Monitor database performance and usage.

### 3. Error Tracking
Consider integrating Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

## Security Considerations

### 1. Environment Variables
- Never commit secrets to git
- Use Vercel's environment variable system
- Rotate keys regularly

### 2. Database Security
- RLS policies are enforced
- Use service role key only for server-side operations
- Regular security audits

### 3. Content Security Policy
Add to `next.config.js`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
}
```

## Backup Strategy

### 1. Database Backups
Supabase provides automatic backups. For additional safety:
- Regular manual backups
- Export important data

### 2. Code Backups
- Git repository with proper branching
- Multiple deployment environments

## Scaling Considerations

### 1. Database Scaling
- Supabase Pro plan for higher limits
- Read replicas for read-heavy workloads
- Connection pooling optimization

### 2. Application Scaling
- Vercel automatically scales
- Consider edge functions for heavy operations
- CDN for static assets

## Testing Strategy

### 1. Development Environment
```bash
npm run dev
```

### 2. Preview Deployments
Vercel creates preview deployments for each branch.

### 3. Production Testing
- Comprehensive testing before deployment
- Monitoring after deployment
- Rollback strategy

## Maintenance

### 1. Regular Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Regular performance reviews

### 2. Database Maintenance
- Monitor query performance
- Regular index optimization
- Data cleanup scripts

## Support & Documentation

### 1. User Documentation
Create comprehensive user guides for:
- Students
- Mentors
- Administrators

### 2. API Documentation
Document all API endpoints and their usage.

### 3. Troubleshooting Guide
Common issues and their solutions.