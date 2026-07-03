import PendingOrder from '../models/PendingOrder.js';
import DeliveredOrder from '../models/DeliveredOrder.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const getAnalyticsData = async () => {
	const totalUsers = await User.countDocuments();
	const totalProducts = await Product.countDocuments();

	const [pendingSales, deliveredSales] = await Promise.all([
		PendingOrder.aggregate([
			{
				$match: {
					paymentStatus: 'success'
				}
			},
			{
				$group: {
					_id: null,
					totalSales: { $sum: 1 },
					totalRevenue: { $sum: '$totalAmount' }
				}
			}
		]),
		DeliveredOrder.aggregate([
			{
				$group: {
					_id: null,
					totalSales: { $sum: 1 },
					totalRevenue: { $sum: '$totalAmount' }
				}
			}
		])
	]);

	const pendingTotals = pendingSales[0] || { totalSales: 0, totalRevenue: 0 };
	const deliveredTotals = deliveredSales[0] || { totalSales: 0, totalRevenue: 0 };

	return {
		users: totalUsers,
		products: totalProducts,
		totalSales: pendingTotals.totalSales + deliveredTotals.totalSales,
		totalRevenue: pendingTotals.totalRevenue + deliveredTotals.totalRevenue
	};
};

export const getDailySalesData = async (startDate, endDate, range = 'weekly') => {
	try {
		const groupFormat = range === 'yearly' ? '%Y-%m' : '%Y-%m-%d';
		const [pendingDailySales, deliveredDailySales] = await Promise.all([
			PendingOrder.aggregate([
				{
					$match: {
						paymentStatus: 'success',
						createdAt: {
							$gte: startDate,
							$lte: endDate
						}
					}
				},
				{
					$group: {
						_id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
						sales: { $sum: 1 },
						revenue: { $sum: '$totalAmount' }
					}
				},
				{ $sort: { _id: 1 } }
			]),
			DeliveredOrder.aggregate([
				{
					$match: {
						createdAt: {
							$gte: startDate,
							$lte: endDate
						}
					}
				},
				{
					$group: {
						_id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
						sales: { $sum: 1 },
						revenue: { $sum: '$totalAmount' }
					}
				},
				{ $sort: { _id: 1 } }
			])
		]);

		const dateArray = range === 'yearly'
			? getMonthsInRange(startDate, endDate)
			: getDatesInRange(startDate, endDate);

		return dateArray.map((date) => {
			const pendingData = pendingDailySales.find((item) => item._id === date.key);
			const deliveredData = deliveredDailySales.find((item) => item._id === date.key);

			return {
				date: date.label,
				sales: (pendingData?.sales || 0) + (deliveredData?.sales || 0),
				revenue: (pendingData?.revenue || 0) + (deliveredData?.revenue || 0),
				orders: (pendingData?.sales || 0) + (deliveredData?.sales || 0)
			};
		});
	} catch (error) {
		throw error;
	}
};

function getDatesInRange(startDate, endDate) {
	const dates = [];
	let currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		const key = currentDate.toISOString().split('T')[0];
		const label = new Intl.DateTimeFormat('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		}).format(currentDate);
		dates.push({ key, label });
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}

function getMonthsInRange(startDate, endDate) {
	const months = [];
	const currentDate = new Date(startDate);
	currentDate.setDate(1);

	while (currentDate <= endDate) {
		const key = currentDate.toISOString().slice(0, 7);
		const label = new Intl.DateTimeFormat('en-US', {
			month: 'short',
			year: 'numeric'
		}).format(currentDate);
		months.push({ key, label });
		currentDate.setMonth(currentDate.getMonth() + 1);
	}

	return months;
}
