# Plan System - Production Deployment Checklist

Use this checklist when deploying the plan system to production.

---

## Pre-Deployment (Local Testing)

- [ ] Run setup script: `node scripts/setup-plans.js`
- [ ] Run test script: `node scripts/test-plan-system.js` - all tests passing
- [ ] Database: Verify 3 plans created in MongoDB
- [ ] Sample API calls work:
  - [ ] `GET /api/plans` returns array of 3 plans
  - [ ] `POST /api/subscriptions/check` returns subscription status
  - [ ] `GET /api/subscriptions/usage` returns usage data

---

## Code Review

- [ ] No changes to any existing API routes (only additive)
- [ ] All new files follow project conventions
- [ ] ESLint passes on new files
- [ ] No console.error calls left in production code
- [ ] Imports are correct (relative paths, no typos)

---

## Database Pre-Checks

- [ ] MongoDB connection string is set (NEXT_PUBLIC_DATABASE_URI)
- [ ] Can connect to production database
- [ ] Backup existing database before deploying
- [ ] Verify database has sufficient storage for new collections
- [ ] Indexes created (automatically by Mongoose)

---

## Integration Verification

Before deploying, integrate into at least ONE API route:

- [ ] Orders API / similar has subscription check
- [ ] Test with valid subscription: works ✅
- [ ] Test with no subscription: returns 401 ✅
- [ ] Test with expired subscription: returns 401 ✅
- [ ] Test with limit reached: returns 429 ✅
- [ ] Usage tracking working: counters increment ✅

---

## Environment Variables

- [ ] `NEXT_PUBLIC_DATABASE_URI` set in production
- [ ] `NEXTAUTH_SECRET` set (should already exist)
- [ ] No hardcoded passwords or secrets in code
- [ ] All config files don't contain secrets

---

## Admin Setup

- [ ] At least one user has `role: "super_admin"`
- [ ] Admin can access `/api/admin/subscriptions`
- [ ] Can manually create subscriptions via admin endpoint
- [ ] Can manage plans via admin endpoint

Testing:

```bash
# Test admin subscription creation
curl -X POST https://yourdomain.com/api/admin/subscriptions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "...",
    "planId": "...",
    "durationMonths": 1,
    "notes": "Testing"
  }'
```

---

## Feature Gates (If Integrating)

If gating premium features behind plans:

- [ ] Table requests route checks feature access
- [ ] Analytics route checks feature access
- [ ] API access route checks feature access
- [ ] Error messages are helpful (mention plan name)

---

## Frontend Readiness

- [ ] Billing/plans page accessible (if created)
- [ ] Plan selector shows all plans
- [ ] Can "purchase" plan (even if manual payment)
- [ ] Current subscription displayed
- [ ] Usage stats shown with correct format
- [ ] Limit warning shows when usage > 80%

---

## Payment Processing (If Using)

- [ ] Stripe/PayPal integration added (if applicable)
- [ ] Test payment with test card
- [ ] `transactionId` stored in subscription
- [ ] Email confirmation sent after purchase
- [ ] Webhook configured for refunds/chargebacks
- [ ] Have process for manual transaction approval

---

## Monitoring & Logging

Set up monitoring for:

- [ ] `/api/subscriptions/check` response times
- [ ] Usage tracking latency
- [ ] Plan creation/update errors
- [ ] Subscription expiration alerts
- [ ] Failed payment processing

---

## Backup & Rollback Plan

- [ ] Full database backup completed
- [ ] Backup location documented
- [ ] Rollback procedure documented
- [ ] Can restore from backup if needed
- [ ] Have tested rollback at least once

---

## Security Checklist

- [ ] All subscription endpoints require authentication
- [ ] Admin endpoints check `super_admin` role
- [ ] No SQL injection vectors
- [ ] No exposed payment information
- [ ] Usage limits enforced server-side (not client-side)
- [ ] Rate limiting on purchase endpoint
- [ ] CORS configured correctly
- [ ] HTTPS enforced

Testing:

```bash
# Should fail - no auth
curl https://yourdomain.com/api/admin/subscriptions

# Should fail - wrong role
curl -H "Authorization: Bearer USER_TOKEN" \
  https://yourdomain.com/api/admin/subscriptions

# Should succeed - correct admin
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  https://yourdomain.com/api/admin/subscriptions
```

---

## Documentation Ready

- [ ] Team knows plan system exists
- [ ] Integration guide shared
- [ ] Quick reference available
- [ ] Support team trained on admin endpoints
- [ ] Runbooks created for common tasks

---

## Communication Plan

- [ ] When deploying, notify:
  - [ ] Internal team
  - [ ] Support/customer service
  - [ ] If public, announce to users
- [ ] Have FAQ ready for user questions
- [ ] Support number for issues
- [ ] Status page updated if applicable

---

## Post-Deployment (First 24 Hours)

- [ ] Monitor error logs for issues
- [ ] Verify plans display correctly
- [ ] Test purchasing a plan
- [ ] Check monthly usage reset logic (or schedule for next month)
- [ ] Confirm emails sent (if applicable)

Daily for first week:

- [ ] Check subscription creation success rate
- [ ] Review limit enforcement logs
- [ ] Verify no stuck subscriptions
- [ ] Monitor API response times

---

## Gradual Rollout (Recommended)

Instead of immediate full deployment:

**Phase 1: Admin & Internal (1-3 days)**

- [ ] Deploy to staging
- [ ] Admin can create subscriptions manually
- [ ] Internal team tests all features
- [ ] Works without affecting users

**Phase 2: Early Adopters (1 week)**

- [ ] Deploy to 10% of restaurants
- [ ] Monitor for issues
- [ ] Gather feedback
- [ ] Fix any problems

**Phase 3: Everyone (1 week)**

- [ ] Roll out to remaining restaurants
- [ ] Run communication campaign
- [ ] Support on standby
- [ ] Monitor closely

---

## Deployment Command

From your staging/production server:

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies (if needed)
npm install

# 3. Build
npm run build

# 4. Initialize/update plans (safe to re-run)
node scripts/setup-plans.js

# 5. Test everything
node scripts/test-plan-system.js

# 6. Start/restart application
npm restart
# or
vercel deploy --prod
```

---

## Troubleshooting During Deployment

**Plans not showing:**

```bash
node scripts/setup-plans.js
# Check MongoDB for 'plans' collection
# Verify NEXT_PUBLIC_DATABASE_URI is set
```

**Subscriptions not created:**

```bash
# Check MongoDB connection
# Verify Subscription model loaded correctly
# Check authentication working
```

**Usage not tracking:**

```bash
# Verify trackUsage() called in your API routes
# Check subscription status is "active"
# Verify monthly usage record exists
```

**API 500 errors:**

```bash
# Check server logs
# Verify MongoDB connection
# Run test-plan-system.js
# Check NEXT_PUBLIC_DATABASE_URI set
```

---

## After Deployment (Ongoing)

- [ ] Monitor API performance
- [ ] Track subscription conversion rate
- [ ] Monitor usage limit enforcement rate
- [ ] Review subscription cancellations
- [ ] Collect user feedback
- [ ] Plan next features:
  - [ ] Payment integration
  - [ ] Billing history
  - [ ] Usage analytics
  - [ ] Automatic renewal reminders

---

## Success Criteria

Deployment is successful when:

1. ✅ Plans display on frontend
2. ✅ Can purchase plan and get subscription
3. ✅ Limits are enforced on API calls
4. ✅ Usage counters increment correctly
5. ✅ No errors in server logs
6. ✅ All tests passing
7. ✅ Admin can manage subscriptions
8. ✅ Users report positive experience

---

## Emergency Procedures

**If something goes wrong:**

1. **Immediate (first 5 minutes)**
   - Identify the issue
   - Stop accepting new subscriptions (manual)
   - Notify team

2. **Short-term (next hour)**
   - Try to fix in code
   - Test in staging
   - Deploy fix

3. **If can't fix quickly**
   - Rollback to previous version
   - Restore from backup if data corrupted
   - Investigate in staging

**Keep emergency contacts:**

- Database admin: ****\_\_****
- Server admin: ****\_\_****
- CTO/Tech lead: ****\_\_****

---

## Sign-Off

- [ ] QA Lead: ******\_****** Date: **\_\_\_**
- [ ] Tech Lead: ******\_****** Date: **\_\_\_**
- [ ] Product Manager: ******\_****** Date: **\_\_\_**

---

## Post-Launch Review

Schedule review meeting 1 week after launch:

- [ ] What went well?
- [ ] What could be better?
- [ ] Any issues encountered?
- [ ] User feedback?
- [ ] Next improvements?

---

**Good luck with your deployment! 🚀**
