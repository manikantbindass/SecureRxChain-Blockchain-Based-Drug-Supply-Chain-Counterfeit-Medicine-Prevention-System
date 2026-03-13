const DrugBatch = require('../models/DrugBatch');
const { uploadToIPFS } = require('../config/ipfs');
const { hashQRPayload, buildQRPayload, generateQRDataURL } = require('../utils/qr.util');
const logger = require('../utils/logger');
const web3 = require('../blockchain/web3');

/**
 * POST /api/drugs/register
 * Manufacturer registers a new drug batch
 */
exports.registerDrug = async (req, res) => {
  const {
    drugName,
    genericName,
    dosageForm,
    strength,
    manufacturingDate,
    expiryDate,
    quantity,
    metadata,
    originLocation,
  } = req.body;

  // 1. Upload metadata to IPFS
  const ipfsData = {
    drugName,
    genericName,
    dosageForm,
    strength,
    manufacturer: req.user.organizationName || req.user.name,
    manufacturingDate,
    expiryDate,
    quantity,
    originLocation,
    ...metadata,
  };

  let ipfsCID = null;
  try {
    ipfsCID = await uploadToIPFS(ipfsData);
  } catch (ipfsErr) {
    logger.warn('IPFS upload failed, continuing without CID:', ipfsErr.message);
  }

  // 2. Call smart contract (if available)
  let batchId = null;
  let txHash = null;

  try {
    const registry = web3.drugRegistry;
    if (registry) {
      const mfgUnix = Math.floor(new Date(manufacturingDate).getTime() / 1000);
      const expUnix = Math.floor(new Date(expiryDate).getTime() / 1000);
      const qrHash = '0x' + '0'.repeat(64);

      const tx = await registry.registerBatch(
        drugName, genericName || '', dosageForm || '',
        strength || '', req.user.organizationName || '',
        mfgUnix, expUnix, quantity, ipfsCID || '', qrHash
      );
      const receipt = await tx.wait();
      txHash = receipt.transactionHash;

      const event = receipt.logs
        .map((l) => { try { return registry.interface.parseLog(l); } catch { return null; } })
        .find((e) => e && e.name === 'BatchRegistered');

      if (event) batchId = event.args.batchId;
    }
  } catch (blockchainErr) {
    logger.warn('Blockchain tx failed, using off-chain ID:', blockchainErr.message);
  }

  // Fallback batchId if blockchain unavailable
  if (!batchId) {
    const crypto = require('crypto');
    batchId = '0x' + crypto.createHash('sha256')
      .update(`${req.user._id}${drugName}${Date.now()}`)
      .digest('hex');
  }

  // 3. Generate QR code
  const qrPayload = buildQRPayload(batchId, { drugName, expiryDate });
  const qrCodeData = await generateQRDataURL(qrPayload);
  const qrCodeHash = hashQRPayload(qrPayload);

  // 4. Save to MongoDB
  const batch = await DrugBatch.create({
    batchId,
    drugName,
    genericName,
    dosageForm,
    strength,
    manufacturer: req.user._id,
    manufacturerName: req.user.organizationName || req.user.name,
    manufacturingDate,
    expiryDate,
    quantity,
    ipfsCID,
    qrCodeData,
    qrCodeHash,
    currentOwner: req.user._id,
    currentOwnerWallet: req.user.walletAddress,
    status: 'Manufactured',
    registrationTxHash: txHash,
    metadata: ipfsData,
  });

  logger.info(`Drug batch registered: ${batchId} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: { batch, txHash, ipfsCID },
  });
};

/**
 * POST /api/drugs/transfer
 */
exports.transferDrug = async (req, res) => {
  const { batchId, toWallet, toUserId, role, location, notes } = req.body;

  const batch = await DrugBatch.findOne({ batchId });
  if (!batch) {
    return res.status(404).json({ success: false, error: 'Batch not found.' });
  }

  let txHash = null;
  let newStatus = batch.status;

  // Blockchain transfer
  try {
    const sc = web3.supplyChain;
    if (sc) {
      let tx;
      if (role === 'distributor') {
        tx = await sc.transferToDistributor(batchId, toWallet, location || '', notes || '');
        newStatus = 'InTransit';
      } else if (role === 'pharmacy') {
        tx = await sc.markDistributed(batchId, toWallet, location || '', notes || '');
        newStatus = 'Distributed';
      } else if (role === 'consumer') {
        tx = await sc.markSold(batchId, toWallet, location || '', notes || '');
        newStatus = 'Sold';
      }
      if (tx) {
        const receipt = await tx.wait();
        txHash = receipt.transactionHash;
      }
    }
  } catch (err) {
    logger.warn('Transfer blockchain tx failed:', err.message);
  }

  // Status mapping fallback
  if (!txHash) {
    const roleStatusMap = {
      distributor: 'InTransit',
      pharmacy: 'Distributed',
      consumer: 'Sold',
    };
    newStatus = roleStatusMap[role] || batch.status;
  }

  batch.status = newStatus;
  batch.transfers.push({
    from: req.user.walletAddress || req.user._id.toString(),
    fromUser: req.user._id,
    to: toWallet,
    toUser: toUserId,
    role,
    location,
    notes,
    txHash,
    timestamp: new Date(),
  });

  if (toUserId) batch.currentOwner = toUserId;
  if (toWallet) batch.currentOwnerWallet = toWallet;

  await batch.save();

  logger.info(`Batch ${batchId} transferred to ${toWallet} (${role})`);

  res.json({ success: true, data: { batch, txHash } });
};

/**
 * GET /api/drugs/verify/:batchId
 */
exports.verifyDrug = async (req, res) => {
  const { batchId } = req.params;

  const batch = await DrugBatch.findOne({ batchId })
    .populate('manufacturer', 'name email organizationName')
    .populate('currentOwner', 'name email organizationName');

  if (!batch) {
    return res.json({
      success: true,
      data: {
        authentic: false,
        status: 'NotFound',
        message: 'Batch ID not found in the system.',
      },
    });
  }

  // On-chain verification
  let onChainReport = null;
  try {
    const verif = web3.verification;
    if (verif) {
      onChainReport = await verif.quickVerify(batchId);
    }
  } catch (err) {
    logger.warn('On-chain verification failed:', err.message);
  }

  // Update verification count
  batch.verificationCount += 1;
  batch.lastVerifiedAt = new Date();
  await batch.save({ validateBeforeSave: false });

  const isExpired = batch.expiryDate && batch.expiryDate < new Date();
  const authentic = !batch.isCounterfeit && !batch.isRecalled && !isExpired && batch.status !== 'Quarantined';

  res.json({
    success: true,
    data: {
      authentic,
      batchId,
      drugName: batch.drugName,
      manufacturer: batch.manufacturer,
      status: batch.status,
      expiryDate: batch.expiryDate,
      isExpired,
      isCounterfeit: batch.isCounterfeit,
      isRecalled: batch.isRecalled,
      verificationCount: batch.verificationCount,
      onChainReport,
    },
  });
};

/**
 * GET /api/drugs/history/:batchId
 */
exports.getHistory = async (req, res) => {
  const { batchId } = req.params;

  const batch = await DrugBatch.findOne({ batchId })
    .populate('manufacturer', 'name email organizationName walletAddress')
    .populate('transfers.fromUser', 'name email role')
    .populate('transfers.toUser', 'name email role');

  if (!batch) {
    return res.status(404).json({ success: false, error: 'Batch not found.' });
  }

  // On-chain history
  let onChainHistory = null;
  try {
    const verif = web3.verification;
    if (verif) {
      const [ownership, supplyHistory] = await verif.getTransactionHistory(batchId);
      onChainHistory = { ownership, supplyHistory };
    }
  } catch (err) {
    logger.warn('On-chain history fetch failed:', err.message);
  }

  res.json({
    success: true,
    data: {
      batch,
      transfers: batch.transfers,
      onChainHistory,
    },
  });
};

/**
 * POST /api/drugs/quarantine
 */
exports.quarantineDrug = async (req, res) => {
  const { batchId, reason } = req.body;

  let txHash = null;
  try {
    const sc = web3.supplyChain;
    if (sc) {
      const tx = await sc.quarantineBatch(batchId, reason || 'Quarantined via API');
      const receipt = await tx.wait();
      txHash = receipt.transactionHash;
    }
  } catch (err) {
    logger.warn('Quarantine blockchain tx failed:', err.message);
  }

  const batch = await DrugBatch.findOneAndUpdate(
    { batchId },
    { status: 'Quarantined', quarantineReason: reason },
    { new: true }
  );

  if (!batch) {
    return res.status(404).json({ success: false, error: 'Batch not found.' });
  }

  logger.info(`Batch ${batchId} quarantined by ${req.user.email}`);

  res.json({ success: true, data: { batch, txHash } });
};

/**
 * GET /api/drugs - List all batches
 */
exports.listBatches = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (req.user.role === 'manufacturer') filter.manufacturer = req.user._id;

  const batches = await DrugBatch.find(filter)
    .populate('manufacturer', 'name organizationName')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await DrugBatch.countDocuments(filter);

  res.json({
    success: true,
    data: { batches, total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
};
