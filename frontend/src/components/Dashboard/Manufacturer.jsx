import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Send, CheckCircle, AlertTriangle, Box as BoxIcon, Calendar, FileText, Download } from 'lucide-react';
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

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

import { Web3Context } from '../../context/Web3Context';
import { useContext } from 'react';

const Manufacturer = () => {
  const [formData, setFormData] = useState({
    batchId: '', drugName: '', manufacturingDate: '', expiryDate: '', quantity: '', description: ''
  });
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [transferData, setTransferData] = useState({ batchId: '', toAddress: '' });
  const [loadingTransfer, setLoadingTransfer] = useState(false);
  const [errorTransfer, setErrorTransfer] = useState('');
  const [successTransfer, setSuccessTransfer] = useState('');

  const { contract, account } = useContext(Web3Context);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) { setError('Please connect MetaMask first'); return; }
    if (!contract) { setError('Smart contract not loaded'); return; }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const q = Number(formData.quantity);
      // Execute transaction on Blockchain via MetaMask
      const tx = await contract.registerDrug(
        formData.batchId,
        formData.drugName,
        formData.manufacturingDate,
        formData.expiryDate,
        q
      );
      await tx.wait();

      const payload = { ...formData, quantity: q, txHash: tx.hash };
      const res = await api.post('/drugs/register', payload);
      setSuccess(`Drug Registered! Tx Hash: ${tx.hash}`);
      setQrCode(res.data.qrImage);
    } catch (err) {
      console.error(err);
      setError(err.reason || err.message || 'Failed to register drug on blockchain');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!account) { setErrorTransfer('Please connect MetaMask first'); return; }
    if (!contract) { setErrorTransfer('Smart contract not loaded'); return; }

    setLoadingTransfer(true);
    setErrorTransfer('');
    setSuccessTransfer('');
    try {
      const tx = await contract.transferDrug(transferData.batchId, transferData.toAddress);
      await tx.wait();

      const payload = { ...transferData, newState: 1, txHash: tx.hash }; // 1 = InTransit
      const res = await api.post('/drugs/transfer', payload);
      setSuccessTransfer(`Transfer Successful! Tx Hash: ${tx.hash}`);
    } catch (err) {
      console.error(err);
      setErrorTransfer(err.reason || err.message || 'Failed to transfer drug on blockchain');
    } finally {
      setLoadingTransfer(false);
    }
  };

  return (
    <motion.div 
      initial="hidden" animate="visible" variants={staggerContainer}
      className="max-w-5xl mx-auto space-y-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <Badge className="mb-4">Manufacturer Portal</Badge>
          <h1 className="text-4xl md:text-5xl font-serif">
            Batch <span className="gradient-text">Management</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div variants={fadeInUp} className="lg:col-span-7">
          <Card elevated className="h-full">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <div className="bg-accent/10 p-3 rounded-lg text-accent">
                <Package size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Register New Batch</h2>
                <p className="text-sm text-muted-foreground">Mint a new drug batch onto the blockchain</p>
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
                <p className="text-sm break-all">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground ml-1">Batch ID</label>
                  <Input placeholder="e.g. BATCH-001" value={formData.batchId} onChange={e => setFormData({...formData, batchId: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground ml-1">Drug Name</label>
                  <Input placeholder="e.g. Paracetamol 500mg" value={formData.drugName} onChange={e => setFormData({...formData, drugName: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2"><Calendar size={14}/> Mfg Date</label>
                  <Input type="date" value={formData.manufacturingDate} onChange={e => setFormData({...formData, manufacturingDate: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2"><Calendar size={14}/> Expiry Date</label>
                  <Input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2"><BoxIcon size={14}/> Quantity</label>
                  <Input type="number" placeholder="Total units" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required />
                </div>
                <div className="space-y-1.5 md:col-span-2 flex flex-col">
                  <label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2"><FileText size={14}/> Description</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-xl border border-border bg-transparent md:bg-muted/10 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    placeholder="Additional details..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Minting...
                  </span>
                ) : 'Register on Blockchain'}
              </Button>
            </form>
          </Card>
        </motion.div>

        <div className="lg:col-span-5 space-y-8 flex flex-col">
          {qrCode && (
            <motion.div variants={fadeInUp}>
              <Card featured className="text-center">
                <div className="bg-accent/10 p-3 rounded-lg text-accent inline-block mb-4">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">QR Code Generated</h3>
                <p className="text-sm text-muted-foreground mb-6">Attach this to the physical batch packaging</p>
                <div className="bg-white p-4 rounded-xl border border-border inline-block shadow-sm">
                  <img src={qrCode} alt="Drug QR Code" className="w-48 h-48" />
                </div>
                <Button asChild variant="outline" className="w-full mt-6 gap-2">
                  <a href={qrCode} download={`QR_${formData.batchId}.png`}>
                    <Download size={16} /> Download Label
                  </a>
                </Button>
              </Card>
            </motion.div>
          )}

          <motion.div variants={fadeInUp} className="flex-grow">
            <Card className="h-full bg-slate-900 border-slate-800 text-white shadow-xl relative overflow-hidden">
              {/* Texture on dark card */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,white_1px,transparent_1px)] opacity-[0.03] [background-size:16px_16px]" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white/10 p-2 rounded-lg text-white backdrop-blur-sm">
                    <Send size={20} />
                  </div>
                  <h3 className="text-lg font-semibold">Transfer Batch</h3>
                </div>

                {errorTransfer && <div className="text-red-400 text-sm mb-4 bg-red-400/10 p-3 rounded-lg">{errorTransfer}</div>}
                {successTransfer && <div className="text-green-400 text-sm mb-4 bg-green-400/10 p-3 rounded-lg break-all">{successTransfer}</div>}

                <form onSubmit={handleTransfer} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300 ml-1">Batch ID</label>
                    <Input 
                      placeholder="e.g. BATCH-001" 
                      value={transferData.batchId} 
                      onChange={e => setTransferData({...transferData, batchId: e.target.value})} 
                      required 
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-accent-secondary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300 ml-1">Distributor Address</label>
                    <Input 
                      placeholder="0x..." 
                      value={transferData.toAddress} 
                      onChange={e => setTransferData({...transferData, toAddress: e.target.value})} 
                      required 
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-accent-secondary font-mono text-sm"
                    />
                  </div>
                  
                  <Button type="submit" variant="primary" className="w-full mt-2" disabled={loadingTransfer}>
                    {loadingTransfer ? 'Processing...' : 'Transfer Ownership'}
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default Manufacturer;
