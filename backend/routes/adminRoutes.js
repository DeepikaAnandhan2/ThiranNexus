// backend/routes/adminRoutes.js
// All routes are open — no authentication required
const express = require('express')
const router  = express.Router()

const dashboard = require('../controllers/admin/adminDashboardController')
const users     = require('../controllers/admin/adminUsersController')
const analytics = require('../controllers/admin/adminAnalyticsController')
const content   = require('../controllers/admin/adminContentController')
const alerts    = require('../controllers/admin/adminAlertsController')
const feedback  = require('../controllers/admin/adminFeedbackController')
const rewards   = require('../controllers/admin/adminRewardsController')
const settings  = require('../controllers/admin/adminSettingsController')
const auth = require('../controllers/admin/adminAuthController')
// ── Dashboard ─────────────────────────────────────────────────
router.get('/dashboard/overview', dashboard.getOverview)

// ── Users ─────────────────────────────────────────────────────
router.get   ('/users',          users.getAllUsers)
router.get   ('/users/stats',    users.getUserStats)
router.get   ('/users/:id',      users.getUserById)
router.put   ('/users/:id',      users.updateUser)
router.delete('/users/:id',      users.deleteUser)

// ── Analytics ─────────────────────────────────────────────────
router.get('/analytics', analytics.getAnalytics)

// ── Content / Schemes ─────────────────────────────────────────
router.get   ('/content/schemes',        content.getAllSchemes)
router.post  ('/content/schemes',        content.createScheme)
router.put   ('/content/schemes/:id',    content.updateScheme)
router.delete('/content/schemes/:id',    content.deleteScheme)
router.get   ('/content/game-stats',     content.getGameContentStats)

// ── Alerts ────────────────────────────────────────────────────
router.get   ('/alerts',                 alerts.getAlerts)
router.post  ('/alerts',                 alerts.createAlert)
router.put   ('/alerts/:id/resolve',     alerts.resolveAlert)
router.delete('/alerts/:id',            alerts.deleteAlert)

// ── Feedback ──────────────────────────────────────────────────
router.get ('/feedback',                 feedback.getAllFeedback)
router.get ('/feedback/:id',             feedback.getFeedbackById)
router.post('/feedback',                 feedback.submitFeedback)
router.post('/feedback/:id/reply',       feedback.replyToFeedback)
router.put ('/feedback/:id/status',      feedback.updateStatus)

// ── Rewards ───────────────────────────────────────────────────
router.get('/rewards/leaderboard',       rewards.getLeaderboard)
router.get('/rewards/badges',            rewards.getBadgeStats)

// ── Settings / Admins ─────────────────────────────────────────
router.get   ('/settings/admins',              settings.getAllAdmins)
router.post  ('/settings/admins',              settings.createAdmin)
router.put   ('/settings/admins/:id',          settings.updateAdmin)
router.delete('/settings/admins/:id',          settings.deleteAdmin)
router.get   ('/settings/platform',            settings.getPlatformInfo)


router.post('/auth/login', auth.adminLogin) 
router.get('/auth/me', auth.getAdminMe)
module.exports = router