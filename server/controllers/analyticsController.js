const Drug = require('../models/Drug');
const User = require('../models/User');

// @desc   Get analytics dashboard data
// @route  GET /api/analytics/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [totalDrugs, quarantined, inTransit, delivered, totalUsers] = await Promise.all([
      Drug.countDocuments(),
      Drug.countDocuments({ status: 'quarantined' }),
      Drug.countDocuments({ status: 'in_transit' }),
      Drug.countDocuments({ status: 'delivered' }),
      User.countDocuments(),
    ]);

    const totalTransfers = await Drug.aggregate([
      { $project: { transferCount: { $size: '$transferHistory' } } },
      { $group: { _id: null, total: { $sum: '$transferCount' } } },
    ]);

    const recentDrugs = await Drug.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('batchId name manufacturer status createdAt');

    const drugsByManufacturer = await Drug.aggregate([
      { $group: { _id: '$manufacturer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const monthlyRegistrations = await Drug.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDrugs,
          quarantined,
          inTransit,
          delivered,
          totalUsers,
          totalTransfers: totalTransfers[0]?.total || 0,
        },
        recentDrugs,
        drugsByManufacturer,
        monthlyRegistrations,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
