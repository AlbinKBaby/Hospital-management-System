# Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Create `.env` file from `.env.example`
- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Configure `DATABASE_URL` with production credentials
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` with frontend URL
- [ ] Set appropriate `PORT` (default: 5000)

### 2. Database Setup
- [ ] MySQL server is running
- [ ] Database created: `hospital_management_system`
- [ ] Run: `npx prisma generate`
- [ ] Run: `npx prisma migrate deploy`
- [ ] (Optional) Run: `node prisma/seed.js` for initial data
- [ ] Verify database connection

### 3. Dependencies
- [ ] Run: `npm install --production`
- [ ] Verify all packages installed successfully
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Update vulnerable packages if needed

### 4. Security Review
- [ ] Strong JWT_SECRET configured
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Rate limiting considered (optional)
- [ ] HTTPS enabled (production)
- [ ] Environment variables not committed to git

### 5. Code Quality
- [ ] All routes tested
- [ ] Error handling verified
- [ ] Validation working correctly
- [ ] No console.logs in production code
- [ ] Database connections properly closed

### 6. Testing
- [ ] Test all authentication endpoints
- [ ] Test all CRUD operations
- [ ] Test role-based access control
- [ ] Test error scenarios
- [ ] Test pagination and filtering
- [ ] Load testing (optional)

## 🚀 Deployment Steps

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your settings

# 3. Setup database
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed data (optional)
node prisma/seed.js

# 5. Start development server
npm run dev
```

### Production Deployment

#### Option 1: Traditional Server (VPS/Dedicated)
```bash
# 1. Clone repository
git clone <repository-url>
cd HMSBackend

# 2. Install dependencies
npm install --production

# 3. Setup environment
nano .env
# Add production environment variables

# 4. Setup database
npx prisma generate
npx prisma migrate deploy

# 5. Use PM2 for process management
npm install -g pm2
pm2 start index.js --name hms-backend
pm2 save
pm2 startup
```

#### Option 2: Docker Deployment
```dockerfile
# Create Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t hms-backend .
docker run -p 5000:5000 --env-file .env hms-backend
```

#### Option 3: Cloud Platforms

**Heroku**
```bash
# Install Heroku CLI
heroku login
heroku create hms-backend
heroku config:set DATABASE_URL="your_database_url"
heroku config:set JWT_SECRET="your_secret"
git push heroku main
```

**AWS/Azure/GCP**
- Use respective deployment guides
- Configure environment variables
- Setup database connection
- Configure load balancer
- Enable auto-scaling

## 🔒 Security Hardening

### Production Environment Variables
```env
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host:3306/db?ssl=true
JWT_SECRET=<generate-strong-secret-min-32-chars>
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://yourdomain.com
PORT=5000
```

### Additional Security Measures
- [ ] Enable HTTPS/SSL
- [ ] Implement rate limiting
- [ ] Add helmet.js for security headers
- [ ] Setup monitoring and logging
- [ ] Configure firewall rules
- [ ] Regular security audits
- [ ] Backup strategy implemented

### Rate Limiting (Optional)
```bash
npm install express-rate-limit
```

Add to `index.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 📊 Monitoring & Logging

### Setup Logging
```bash
npm install winston
```

### Setup Monitoring
- [ ] Application monitoring (PM2, New Relic, DataDog)
- [ ] Database monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Uptime monitoring

## 🔄 Maintenance

### Regular Tasks
- [ ] Database backups (daily/weekly)
- [ ] Security updates
- [ ] Dependency updates
- [ ] Log rotation
- [ ] Performance optimization
- [ ] Monitor disk space
- [ ] Review error logs

### Backup Strategy
```bash
# MySQL backup
mysqldump -u username -p hospital_management_system > backup_$(date +%Y%m%d).sql

# Automated backup script
0 2 * * * /path/to/backup-script.sh
```

## 🧪 Post-Deployment Testing

### Health Check
```bash
curl http://your-domain.com/
```

### API Testing
```bash
# Test login
curl -X POST http://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'

# Test protected route
curl -X GET http://your-domain.com/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

### Load Testing (Optional)
```bash
# Install Apache Bench
apt-get install apache2-utils

# Test
ab -n 1000 -c 10 http://your-domain.com/
```

## 📝 Documentation

- [ ] API documentation updated
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide created
- [ ] Contact information for support

## 🚨 Rollback Plan

### If Deployment Fails
1. Revert to previous version
2. Check error logs
3. Verify database migrations
4. Test in staging environment
5. Fix issues and redeploy

### Database Rollback
```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back <migration-name>
```

## 📞 Support Contacts

- **Database Admin**: [contact]
- **DevOps Team**: [contact]
- **Security Team**: [contact]
- **On-Call Engineer**: [contact]

## ✅ Final Verification

- [ ] Application is running
- [ ] Database is connected
- [ ] All endpoints responding
- [ ] Authentication working
- [ ] CORS configured correctly
- [ ] Error handling working
- [ ] Logs are being generated
- [ ] Monitoring is active
- [ ] Backups are scheduled
- [ ] Documentation is complete

---

## 🎯 Production Readiness Score

Check all items above. Aim for 100% completion before production deployment.

**Status**: [ ] Ready for Production | [ ] Needs Work

**Deployed By**: _______________

**Deployment Date**: _______________

**Version**: 1.0.0
