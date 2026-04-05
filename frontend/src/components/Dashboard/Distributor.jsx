import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

const easeOut = [0.16, 1, 0.3, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } }
};

import { Web3Context } from '../../context/Web3Context';
import { useContext } from 'react';

const Distributor = () => {
  const [formData, setFormData] = useState({ batchId: '', toAddress: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { contract, account } = useContext(Web3Context);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!account) { setError('Please connect MetaMask first'); return; }
    if (!contract) { setError('Smart contract not loaded'); return; }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const tx = await contract.transferDrug(formData.batchId, formData.toAddress);
      await tx.wait();

      const payload = { ...formData, newState: 2, txHash: tx.hash }; // 2 = Distributed
      const res = await api.post('/drugs/transfer', payload);
      setSuccess(`Transfer Successful! Tx Hash: ${tx.hash}`);
    } catch (err) {
      console.error(err);
      setError(err.reason || err.message || 'Failed to transfer drug on blockchain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pt-4">
      <div className="text-center mb-10">
        <Badge className="mb-4">Distributor Portal</Badge>
        <h1 className="text-4xl md:text-5xl font-serif">
          Logistics & <span className="gradient-text">Transfer</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Pass ownership of drug batches to certified pharmacies in the blockchain network.
        </p>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-md mx-auto">
        <Card elevated>
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="bg-gradient-to-br from-accent to-accent-secondary p-3 rounded-xl text-white shadow-accent">
              <Truck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Transfer Batch</h2>
              <p className="text-sm text-muted-foreground">Ship to Pharmacy</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-xl mb-6 flex items-start gap-3">
              <AlertTriangle className="shrink-0" size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-700 border border-green-100 p-4 rounded-xl mb-6 flex items-start gap-3">
              <CheckCircle className="shrink-0 text-green-500" size={20} />
              <p className="text-sm truncate" title={success}>{success}</p>
            </div>
          )}

          <form onSubmit={handleTransfer} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground ml-1">Batch ID</label>
              <Input 
                placeholder="e.g. BATCH-001" 
                value={formData.batchId} 
                onChange={e => setFormData({...formData, batchId: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground ml-1">Pharmacy Wallet Address</label>
              <Input 
                placeholder="0x..." 
                value={formData.toAddress} 
                onChange={e => setFormData({...formData, toAddress: e.target.value})} 
                required 
                className="font-mono text-sm"
              />
            </div>
            
            <Button type="submit" variant="primary" className="w-full mt-2 group" disabled={loading}>
              {loading ? 'Processing...' : (
                <>
                  Transfer to Pharmacy
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Distributor;
