const Drug = require('../models/Drug');
const { uploadToIPFS } = require('../utils/ipfsUpload');
const { generateQRCode } = require('../utils/qrGenerator');
const { generateBatchId } = require('../utils/generateBatchId');
const {
  registerDrugOnChain,
  transferDrugOnChain,
  quarantineDrugOnChain,
  getDrugFromChain,
  getDrugHistoryFromChain,
} = require('../blockchain/drugService');

// @desc   Register a new drug batch
// @route  POST /api/drugs/register
const registerDrug = async (req, res, next) => {
  try {
    const {
      name, composition, manufacturingDate, expiryDate, quantity, currentOwner,
    } = req.body;

    const batchId = generateBatchId(req.user.name, name, manufacturingDate);

    const drugMetadata = {
      batchId, name, composition, manufacturer: req.user.name,
      manufacturingDate, expiryDate, quantity, registeredBy: req.user.email,
    };

    const ipfsHash = await uploadToIPFS(drugMetadata);

    const expiryTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);
    const receipt = await registerDrugOnChain(batchId, ipfsHash, expiryTimestamp);

    const qrCode = await generateQRCode({
      batchId,
      verifyUrl: `${process.env.APP_URL}/api/drugs/verify/${batchId}`,
    });

    const drug = await Drug.create({
      batchId, name, manufacturer: req.user.name,
      manufacturerId: req.user._id, manufacturingDate, expiryDate,
      composition, quantity, currentOwner: currentOwner || req.user.email,
      currentOwnerId: req.user._id, ipfsHash,
      blockchainTxHash: receipt.hash, qrCode,
    });

    res.status(201).json({
      success: true,
      message: 'Drug batch registered on blockchain',
      data: drug,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Transfer drug ownership
// @route  POST /api/drugs/transfer
const transferDrug = async (req, res, next) => {
  try {
    const { batchId, newOwnerAddress, newOwnerId, location, notes } = req.body;

    const drug = await Drug.findOne({ batchId });
    if (!drug) return res.status(404).json({ success: false, message: 'Drug batch not found' });
    if (drug.isQuarantined) {
      return res.status(400).json({ success: false, message: 'Cannot transfer a quarantined drug' });
    }

    const receipt = await transferDrugOnChain(batchId, newOwnerAddress);

    drug.transferHistory.push({
      from: drug.currentOwner,
      to: newOwnerAddress,
      txHash: receipt.hash,
      location,
      notes,
    });
    drug.currentOwner = newOwnerAddress;
    if (newOwnerId) drug.currentOwnerId = newOwnerId;
    drug.status = 'in_transit';
    await drug.save();

    res.status(200).json({
      success: true,
      message: 'Drug ownership transferred',
      txHash: receipt.hash,
      data: drug,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Verify drug authenticity
// @route  GET /api/drugs/verify/:batchId
const verifyDrug = async (req, res, next) => {
  try {
    const { batchId } = req.params;

    const drug = await Drug.findOne({ batchId }).populate('manufacturerId', 'name organization');
    if (!drug) return res.status(404).json({ success: false, message: 'Drug batch not found' });

    let chainData = null;
    try {
      chainData = await getDrugFromChain(batchId);
    } catch (e) {
      console.warn('Blockchain read warning:', e.message);
    }

    const isExpired = new Date(drug.expiryDate) < new Date();
    const isAuthentic = !drug.isQuarantined && drug.blockchainTxHash;

    res.status(200).json({
      success: true,
      data: {
        batchId: drug.batchId,
        name: drug.name,
        manufacturer: drug.manufacturer,
        manufacturingDate: drug.manufacturingDate,
        expiryDate: drug.expiryDate,
        status: drug.status,
        isAuthentic,
        isExpired,
        isQuarantined: drug.isQuarantined,
        ipfsHash: drug.ipfsHash,
        blockchainTxHash: drug.blockchainTxHash,
        chainData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get drug transfer history
// @route  GET /api/drugs/history/:batchId
const getDrugHistory = async (req, res, next) => {
  try {
    const { batchId } = req.params;

    const drug = await Drug.findOne({ batchId });
    if (!drug) return res.status(404).json({ success: false, message: 'Drug batch not found' });

    let chainHistory = [];
    try {
      chainHistory = await getDrugHistoryFromChain(batchId);
    } catch (e) {
      console.warn('Blockchain history warning:', e.message);
    }

    res.status(200).json({
      success: true,
      data: {
        batchId,
        dbHistory: drug.transferHistory,
        chainHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Quarantine a drug batch
// @route  POST /api/drugs/quarantine
const quarantineDrug = async (req, res, next) => {
  try {
    const { batchId, reason } = req.body;

    const drug = await Drug.findOne({ batchId });
    if (!drug) return res.status(404).json({ success: false, message: 'Drug batch not found' });

    const receipt = await quarantineDrugOnChain(batchId);

    drug.isQuarantined = true;
    drug.quarantineReason = reason || 'Suspicious activity detected';
    drug.status = 'quarantined';
    await drug.save();

    res.status(200).json({
      success: true,
      message: 'Drug batch quarantined successfully',
      txHash: receipt.hash,
      data: drug,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerDrug, transferDrug, verifyDrug, getDrugHistory, quarantineDrug };
