import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, AlertTriangle, CheckCircle, ShoppingBag } from 'lucide-react';
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

const Pharmacy = () => {
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { contract, account, connectWallet } = useContext(Web3Context);

  const handleSell = async (e) => {
    e.preventDefault();
    if (!account) { setError('Please connect MetaMask first'); return; }
    if (!contract) { setError('Smart contract not loaded'); return; }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const tx = await contract.sellDrug(batchId);
      await tx.wait();

      // Sync backend
      const res = await api.post('/drugs/sell', { batchId, txHash: tx.hash });
      setSuccess(`Drug Sold! Tx Hash: ${tx.hash}`);
    } catch (err) {
      console.error(err);
      setError(err.reason || err.message || 'Failed to sell drug on blockchain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pt-4">
      <div className="text-center mb-10">
        <Badge className="mb-4">Pharmacy Portal</Badge>
        <h1 className="text-4xl md:text-5xl font-serif">
          Point of <span className="gradient-text">Sale</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Finalize the supply chain journey. Mark drug batches as sold to consumers to prevent double-spending or resale of used batches.
        </p>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-md mx-auto">
        <Card elevated>
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="bg-gradient-to-br from-accent to-accent-secondary p-3 rounded-xl text-white shadow-accent">
              <Store size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Dispense Medicine</h2>
              <p className="text-sm text-muted-foreground">Record sale on blockchain</p>
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

          <form onSubmit={handleSell} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground ml-1">Batch ID</label>
              <Input 
                placeholder="e.g. BATCH-001" 
                value={batchId} 
                onChange={e => setBatchId(e.target.value)} 
                required 
                className="text-lg py-6"
              />
            </div>
            
            <Button type="submit" variant="primary" className="w-full text-lg h-14 group" disabled={loading}>
              {loading ? 'Processing...' : (
                <>
                  <ShoppingBag size={20} className="mr-2" />
                  Mark as Sold
                </>
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Pharmacy;
