// backend/routes/parentRoutes.js
const express     = require('express')
const router      = express.Router()
const { protect } = require('../middleware/authMiddleware')
const ctrl        = require('../controllers/parentController')

const parentOnly = (req, res, next) => {
  if (req.user?.role !== 'parent')
    return res.status(403).json({ success: false, error: 'Parent access only' })
  next()
}

router.use(protect, parentOnly)

router.get('/children',             ctrl.getChildren)
router.get('/overview/:studentId',  ctrl.getOverview)
router.get('/activity/:studentId',  ctrl.getActivity)
router.get('/education/:studentId', ctrl.getEducation)
router.get('/schemes/:studentId',   ctrl.getSchemes)
router.get('/alerts/:studentId',    ctrl.getAlerts)
router.get('/support',              ctrl.getSupport)
router.post('/support',             ctrl.submitSupport)

module.exports = router