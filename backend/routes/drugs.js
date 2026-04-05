const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const DrugMetadata = require('../models/DrugMetadata');
const User = require('../models/User');
const { getUserContract, getReadOnlyContract } = require('../blockchain/web3');
const axios = require('axios');

// Generate QR Code mapping to verification URL
const generateQR = async (batchId) => {
    const verifyUrl = `http://localhost:5173/verify/${batchId}`;
    return await QRCode.toDataURL(verifyUrl);
};

// @route   POST /api/drugs/register
// @desc    Register new drug batch on blockchain
// @access  Private (Manufacturer)
router.post('/register', verifyToken, authorizeRoles('manufacturer'), async (req, res) => {
    const { batchId, drugName, description, ingredients, imageURL, txHash } = req.body;
    try {
        // 1. Transaction was already executed on frontend via MetaMask!
        // We just need to save the off-chain metadata to MongoDB.
        
        const newMetadata = new DrugMetadata({
            batchId, name: drugName, description, ingredients, imageURL
        });
        await newMetadata.save();

        // 2. Generate QR Code
        const qrImage = await generateQR(batchId);

        res.status(201).json({ success: true, txHash, qrImage, batchId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: err.message });
    }
});

// @route   POST /api/drugs/transfer
// @desc    Transfer drug ownership (Legacy route wrapper for frontend logging)
// @access  Private (Manufacturer, Distributor)
router.post('/transfer', verifyToken, authorizeRoles('manufacturer', 'distributor'), async (req, res) => {
    const { txHash } = req.body;
    try {
        // Transaction executed on frontend. We can log it or just return OK.
        res.json({ success: true, txHash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: err.message });
    }
});

// @route   POST /api/drugs/sell
// @desc    Sell drug to consumer (Legacy route wrapper for frontend logging)
// @access  Private (Pharmacy)
router.post('/sell', verifyToken, authorizeRoles('pharmacy'), async (req, res) => {
    const { txHash } = req.body;
    try {
        // Transaction executed on frontend. We can log it or just return OK.
        res.json({ success: true, txHash });
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

        // Call true Python AI Microservice
        let riskScore = 0;
        let aiClassification = "Authentic";
        try {
            const aiPayload = {
                currentState: Number(drugDetails.state),
                events: history.map((addr, idx) => ({ address: addr, step: idx })),
                quantity: Number(drugDetails.quantity)
            };
            const aiResponse = await axios.post('http://localhost:5002/predict-risk', aiPayload, { timeout: 3000 });
            riskScore = aiResponse.data.risk_score;
            aiClassification = aiResponse.data.classification;
        } catch (aiError) {
            console.error("AI Service Offline, falling back to basic analysis:", aiError.message);
            if (history.length > 5) riskScore += 30; 
            if (Number(drugDetails.quantity) > 10000) riskScore += 20;
            riskScore = Math.min(riskScore, 100);
        }

        res.json({
            success: true,
            isAuthentic,
            aiRiskScore: riskScore,
            aiClassification: aiClassification,
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
