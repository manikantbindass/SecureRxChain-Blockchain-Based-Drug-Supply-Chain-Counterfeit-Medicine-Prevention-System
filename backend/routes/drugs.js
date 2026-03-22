const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const DrugMetadata = require('../models/DrugMetadata');
const User = require('../models/User');
const { getUserContract, getReadOnlyContract } = require('../blockchain/web3');

// Generate QR Code mapping to verification URL
const generateQR = async (batchId) => {
    const verifyUrl = `http://localhost:5173/verify/${batchId}`;
    return await QRCode.toDataURL(verifyUrl);
};

// @route   POST /api/drugs/register
// @desc    Register new drug batch on blockchain
// @access  Private (Manufacturer)
router.post('/register', verifyToken, authorizeRoles('manufacturer'), async (req, res) => {
    const { batchId, drugName, manufacturingDate, expiryDate, quantity, description, ingredients, imageURL } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const contract = getUserContract(user.privateKey);

        // 1. Send transaction to blockchain
        const tx = await contract.registerDrug(
            batchId, 
            drugName, 
            Math.floor(new Date(manufacturingDate).getTime() / 1000), 
            Math.floor(new Date(expiryDate).getTime() / 1000), 
            quantity
        );
        await tx.wait(); // Wait for confirmation

        // 2. Save off-chain metadata to MongoDB
        const newMetadata = new DrugMetadata({
            batchId, name: drugName, description, ingredients, imageURL
        });
        await newMetadata.save();

        // 3. Generate QR Code
        const qrImage = await generateQR(batchId);

        res.status(201).json({ success: true, txHash: tx.hash, qrImage, batchId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: err.message });
    }
});

// @route   POST /api/drugs/transfer
// @desc    Transfer drug ownership
// @access  Private (Manufacturer, Distributor)
router.post('/transfer', verifyToken, authorizeRoles('manufacturer', 'distributor'), async (req, res) => {
    const { batchId, toAddress, newState } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const contract = getUserContract(user.privateKey);

        const tx = await contract.transferDrug(batchId, toAddress, newState);
        await tx.wait();

        res.json({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: err.message });
    }
});

// @route   POST /api/drugs/sell
// @desc    Sell drug to consumer (Pharmacy only)
// @access  Private (Pharmacy)
router.post('/sell', verifyToken, authorizeRoles('pharmacy'), async (req, res) => {
    const { batchId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const contract = getUserContract(user.privateKey);

        const tx = await contract.sellDrug(batchId);
        await tx.wait();

        res.json({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: err.message });
    }
});

// @route   GET /api/drugs/verify/:batchId
// @desc    Verify drug authenticity and get provenance history
// @access  Public
router.get('/verify/:batchId', async (req, res) => {
    try {
        const contract = getReadOnlyContract();
        
        // 1. Get from blockchain
        const [isAuthentic, drugDetails, history] = await contract.verifyDrug(req.params.batchId);
        
        if (!drugDetails.batchId || drugDetails.batchId === "") {
            return res.status(404).json({ success: false, isAuthentic: false, msg: "Counterfeit: Drug batch not found on blockchain." });
        }

        // 2. Get from MongoDB
        const metadata = await DrugMetadata.findOne({ batchId: req.params.batchId });

        // Resolve history addresses to User Names
        const resolvedHistory = await Promise.all(history.map(async (address) => {
            const user = await User.findOne({ walletAddress: address });
            return user ? { address, name: user.name, role: user.role } : { address, name: 'Unknown' };
        }));

        // Simulated AI Risk model
        let riskScore = 0;
        if (history.length > 5) riskScore += 30; // Too many hops
        if (Number(drugDetails.quantity) > 10000) riskScore += 20; // Unusually large batch
        riskScore += Math.floor(Math.random() * 10); // Random noise
        riskScore = Math.min(riskScore, 100);

        res.json({
            success: true,
            isAuthentic,
            aiRiskScore: riskScore,
            onChainData: {
                drugName: drugDetails.drugName,
                manufacturer: drugDetails.manufacturer,
                manufacturingDate: Number(drugDetails.manufacturingDate),
                expiryDate: Number(drugDetails.expiryDate),
                quantity: Number(drugDetails.quantity),
                currentOwner: drugDetails.currentOwner,
                state: Number(drugDetails.state)
            },
            offChainData: metadata,
            history: resolvedHistory
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: err.message });
    }
});

module.exports = router;
