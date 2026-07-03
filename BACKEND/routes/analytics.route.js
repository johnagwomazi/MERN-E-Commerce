import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireManagerOrAdmin } from '../middleware/rolesMiddleware.js';
import { getAnalyticsData, getDailySalesData } from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/', protect, requireManagerOrAdmin, async (req, res) => {
	try {
		const range = String(req.query.range || 'weekly').toLowerCase();
		const analyticsData = await getAnalyticsData();

		const endDate = new Date();
		const startDate = new Date(endDate);
		if (range === 'yearly') {
			startDate.setMonth(startDate.getMonth() - 11);
		} else if (range === 'monthly') {
			startDate.setDate(startDate.getDate() - 29);
		} else {
			startDate.setDate(startDate.getDate() - 6);
		}

		const salesData = await getDailySalesData(startDate, endDate, range);

		res.json({
			analyticsData,
			dailySalesData: salesData,
			range
		});
	} catch (error) {
		console.log('Error in analytics route', error.message);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

export default router;
