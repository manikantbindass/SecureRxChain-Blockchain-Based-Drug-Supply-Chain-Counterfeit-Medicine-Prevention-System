const DrugBatch = require('../models/DrugBatch');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * GET /api/analytics/dashboard
 */
exports.getDashboard = async (req, res) => {
  const totalBatches = await DrugBatch.countDocuments();
  const activeBatches = await DrugBatch.countDocuments({ status: 'active' });
  const quarantinedBatches = await DrugBatch.countDocuments({ status: 'quarantined' });
  const totalManufacturers = await User.countDocuments({ role: 'manufacturer' });
  const totalDistributors = await User.countDocuments({ role: 'distributor' });
  const totalPharmacists = await User.countDocuments({ role: 'pharmacist' });

  // Recent batches
  const recentBatches = await DrugBatch.find()
    .populate('manufacturer', 'name organizationName')
    .sort({ createdAt: -1 })
    .limit(10);

  // Batches by status
  const batchesByStatus = await DrugBatch.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Batches by manufacturer
  const batchesByManufacturer = await DrugBatch.aggregate([
    { $group: { _id: '$manufacturer', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  // Monthly batch registrations (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyBatches = await DrugBatch.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  logger.info('Dashboard analytics fetched');

  res.json({
    success: true,
    data: {
      overview: {
        totalBatches,
        activeBatches,
        quarantinedBatches,
        totalManufacturers,
        totalDistributors,
        totalPharmacists,
      },
      recentBatches,
      batchesByStatus,
      batchesByManufacturer,
      monthlyBatches,
    },
  });
};

/**
 * GET /api/analytics/transfers
 */
exports.getTransferStats = async (req, res) => {
  const totalTransfers = await DrugBatch.aggregate([
    { $project: { transferCount: { $size: '$transferHistory' } } },
    { $group: { _id: null, total: { $sum: '$transferCount' } } },
  ]);

  res.json({
    success: true,
    data: { totalTransfers: totalTransfers[0]?.total || 0 },
  });
};
