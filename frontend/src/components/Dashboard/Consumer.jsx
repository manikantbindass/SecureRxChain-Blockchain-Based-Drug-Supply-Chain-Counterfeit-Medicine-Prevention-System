import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, ShieldCheck, Activity, Link as LinkIcon, 
  AlertTriangle, Fingerprint, MapPin, Search, ChevronDown
} from 'lucide-react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/utils';

const easeOut = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } }
};

const Consumer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { web3Account, connectWallet } = useContext(AuthContext);
  const [drugData, setDrugData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDrug = async () => {
      try {
        const res = await api.get(`/drugs/verify/${id}`);
        setDrugData(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to verify drug. It may be counterfeit.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      setLoading(true);
      fetchDrug();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
        <div className="absolute inset-0 rounded-full border-4 border-accent border-b-transparent border-r-transparent animate-spin"></div>
      </div>
      <p className="font-mono text-sm tracking-widest text-muted-foreground uppercase shadow-sm">Querying Blockchain Ledger...</p>
    </div>
  );

  return (
    <div className="pb-24">
      <div className="max-w-5xl mx-auto pt-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <Badge className="mb-4 text-sm"><Search size={14} className="mr-1"/> Verification Portal</Badge>
            <h1 className="text-4xl md:text-5xl font-serif">
              Authenticity <span className="gradient-text">Report</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 bg-card border border-border p-2 rounded-2xl shadow-sm">
            {!web3Account ? (
              <Button onClick={connectWallet} variant="outline" className="h-10 text-xs px-4">
                <span className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse" />
                Connect MetaMask
              </Button>
            ) : (
              <div className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-mono font-bold flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                {web3Account.slice(0, 6)}...{web3Account.slice(-4)}
              </div>
            )}
          </div>
        </div>

        {!id && !drugData && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center mt-20">
            <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scan size={40} className="text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif mb-2">No Batch Specified</h2>
            <p className="text-muted-foreground mb-8">Please scan a Drug QR Code to query the immutable blockchain ledger.</p>
            <Button onClick={() => navigate('/consumer')} variant="primary" className="gap-2">
              <Search size={18} /> Open Scanner
            </Button>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl shadow-sm flex gap-4">
               <ShieldAlert className="text-red-500 shrink-0 w-8 h-8" />
               <div>
                  <h3 className="text-lg font-bold text-red-800 mb-1">Critical Warning</h3>
                  <p className="text-red-700">{error}</p>
                  <Button variant="outline" className="mt-4 border-red-200 text-red-700 hover:bg-red-100" onClick={() => navigate('/consumer')}>
                    Scan Another Code
                  </Button>
               </div>
            </div>
          </motion.div>
        )}

        {drugData && !error && (
          <motion.div 
            variants={containerVariants}
            initial="hidden" animate="visible"
            className="space-y-8"
          >
            {/* Primary Status Alert */}
            <motion.div variants={itemVariants}>
              <div className={cn(
                "p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 border shadow-lg relative overflow-hidden",
                drugData.isAuthentic 
                  ? "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200" 
                  : "bg-gradient-to-br from-red-50 to-rose-100 border-red-200"
              )}>
                {/* Decorative background glow */}
                <div className={cn(
                  "absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] pointer-events-none",
                  drugData.isAuthentic ? "bg-green-400/30" : "bg-red-400/30"
                )} />

                <div className={cn(
                  "p-4 rounded-2xl shadow-sm shrink-0 z-10",
                  drugData.isAuthentic ? "bg-white text-green-500" : "bg-white text-red-500"
                )}>
                  {drugData.isAuthentic ? <ShieldCheck size={48} /> : <ShieldAlert size={48}/>}
                </div>
                
                <div className="text-center sm:text-left z-10">
                  <h2 className={cn(
                    "text-2xl sm:text-3xl font-bold mb-2",
                    drugData.isAuthentic ? "text-green-800" : "text-red-800"
                  )}>
                    {drugData.isAuthentic ? "Authentic: Blockchain Verified" : "WARNING: Counterfeit Detected"}
                  </h2>
                  <p className={cn(
                    "text-sm sm:text-base",
                    drugData.isAuthentic ? "text-green-700" : "text-red-700"
                  )}>
                    {drugData.isAuthentic 
                      ? "This cryptographic signature uniquely matches the immutable ledger record."
                      : "This batch hash does not match the ledger or has suspicious tampering history."}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* AI Risk Score (Inverted Contrast Section) */}
              <motion.div variants={itemVariants}>
                <Card className="h-full bg-slate-900 border-slate-800 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle,white_1px,transparent_1px)] opacity-[0.03] [background-size:16px_16px]" />
                  
                  <div className="relative z-10">
                    <h3 className="text-lg text-slate-200 font-semibold flex items-center gap-2 mb-6">
                      <Activity size={20} className="text-accent-secondary" /> AI Fraud Analysis
                    </h3>
                    
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                        {/* Simulated glowing progress ring */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" className="stroke-slate-800" strokeWidth="8"/>
                          <circle 
                            cx="50" cy="50" r="45" fill="none" 
                            className={drugData.aiRiskScore > 40 ? "stroke-red-500" : "stroke-green-400"} 
                            strokeWidth="8"
                            strokeDasharray="283" 
                            strokeDashoffset={283 - (283 * drugData.aiRiskScore / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className={cn(
                            "text-3xl font-mono font-bold block leading-none",
                            drugData.aiRiskScore > 40 ? "text-red-400" : "text-green-400"
                          )}>
                            {drugData.aiRiskScore}%
                          </span>
                          <span className="text-xs text-slate-400 font-mono tracking-widest mt-1 uppercase">Risk</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex justify-between items-center">
                        <span className="text-sm text-slate-400">Classification</span>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide",
                          drugData.aiRiskScore > 40 ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-green-500/20 text-green-300 border border-green-500/30"
                        )}>
                          {drugData.aiClassification || (drugData.aiRiskScore > 40 ? "SUSPICIOUS" : "AUTHENTIC")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Batch Metadata */}
              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 border-b border-border pb-4">
                    <Fingerprint size={20} className="text-accent" /> Batch Metadata
                  </h3>
                  
                  <div className="space-y-5">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Product Name</span>
                      <p className="font-semibold text-lg">{drugData.onChainData.drugName}</p>
                    </div>
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Batch Identifier</span>
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">{id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Manufactured</span>
                        <p className="font-medium">{new Date(drugData.onChainData.manufacturingDate * 1000).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Expiration</span>
                        <p className="font-medium">{new Date(drugData.onChainData.expiryDate * 1000).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Provenance Map Timeline */}
            <motion.div variants={itemVariants}>
              <Card>
                <div className="flex items-center justify-between border-b border-border pb-6 mb-8">
                  <h3 className="text-xl font-serif flex items-center gap-3">
                    <div className="bg-accent/10 p-2 rounded-lg"><LinkIcon size={20} className="text-accent"/></div>
                    Provenance Ledger Map
                  </h3>
                </div>
                
                <div className="relative pl-6 sm:pl-10 pb-4">
                  {/* Vertical Line Line */}
                  <div className="absolute left-[15px] sm:left-[31px] top-4 bottom-8 w-0.5 bg-gradient-to-b from-accent/50 via-border to-green-400/50"></div>

                  {drugData.history.map((step, index) => {
                    const isFirst = index === 0;
                    const isLast = index === drugData.history.length - 1;
                    
                    return (
                      <div key={index} className="relative mb-10 last:mb-0 group">
                        {/* Dot */}
                        <div className={cn(
                          "absolute -left-6 sm:-left-10 mt-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-transform group-hover:scale-125 duration-300",
                          isFirst ? "border-accent text-accent" : isLast ? "border-green-500 text-green-500" : "border-slate-400 text-slate-400"
                        )}>
                          {isLast && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow" />}
                          {isFirst && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                        </div>

                        <div className="bg-white hover:bg-muted/30 transition-colors rounded-xl border border-border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin size={14} className="text-muted-foreground" />
                              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                                {isFirst ? "Minted By" : isLast ? "Final Custodian" : "Transited Through"}
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-foreground">
                              {step.name || "Unknown Entity"}
                            </h4>
                            <p className="text-xs font-mono text-muted-foreground mt-1 truncate max-w-[200px] sm:max-w-md">
                              {step.address}
                            </p>
                          </div>
                          
                          <div className={cn(
                            "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border w-fit",
                            step.role === 'manufacturer' ? "bg-accent/10 border-accent/20 text-accent" :
                            step.role === 'pharmacy' ? "bg-green-50 border-green-200 text-green-700" :
                            "bg-slate-100 border-slate-200 text-slate-700"
                          )}>
                            {step.role}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Consumer;
