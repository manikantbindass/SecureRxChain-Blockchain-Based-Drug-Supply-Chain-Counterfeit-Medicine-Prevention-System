const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const { getAdminContract } = require('../blockchain/web3');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  const { name, email, password, role, walletAddress, privateKey } = req.body;
  
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    let finalWalletAddress = walletAddress;
    if (privateKey && !finalWalletAddress) {
      try {
        const wallet = new ethers.Wallet(privateKey);
        finalWalletAddress = wallet.address;
      } catch(e) {
        console.error("Failed to derive wallet address from private key");
      }
    }

    user = new User({
      name, email, password, role, walletAddress: finalWalletAddress, privateKey
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    if (privateKey && finalWalletAddress) {
      try {
        const adminContract = getAdminContract();
        let roleBytes;
        if (role === 'manufacturer') roleBytes = ethers.id("MANUFACTURER_ROLE");
        else if (role === 'distributor') roleBytes = ethers.id("DISTRIBUTOR_ROLE");
        else if (role === 'pharmacy') roleBytes = ethers.id("PHARMACY_ROLE");
        
        if (roleBytes) {
           const tx = await adminContract.grantRole(roleBytes, finalWalletAddress);
           await tx.wait();
           console.log(`Granted ${role} role to ${finalWalletAddress}`);
        }
      } catch (err) {
        console.error("Failed to grant role:", err);
      }
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        walletAddress: user.walletAddress
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role, walletAddress: user.walletAddress } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        walletAddress: user.walletAddress
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, role: user.role, walletAddress: user.walletAddress } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
