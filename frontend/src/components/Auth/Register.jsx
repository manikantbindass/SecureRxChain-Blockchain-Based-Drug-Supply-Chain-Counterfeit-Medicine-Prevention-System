import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Web3Context } from '../../context/Web3Context';
import { Mail, Lock, User, Briefcase, Eye, EyeOff, ShieldCheck, ArrowRight, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

const easeOut = [0.16, 1, 0.3, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } }
};

const TEST_ACCOUNTS = [
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Admin
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // Manuf
  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // Dist
  "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"  // Pharm
];

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'consumer' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { account, connectWallet } = useContext(Web3Context);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account && formData.role !== 'consumer') {
      setError('Please connect your MetaMask wallet first to register as a business role.');
      return;
    }
    
    try {
      // The backend gets the walletAddress. We no longer send hidden private keys over the wire!
      const payload = { ...formData, walletAddress: account || '' };
      const data = await register(payload);
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration Failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative z-10 w-full pt-10">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="w-full max-w-md mx-auto"
      >
        <Card elevated className="backdrop-blur-xl bg-white/80 dark:bg-card/80 border-white/20 relative overflow-visible">
          <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full border border-dashed border-accent/30 animate-rotate-slow pointer-events-none" />
          
          <div className="flex flex-col items-center mb-8">
             <div className="bg-gradient-to-br from-accent to-accent-secondary p-4 rounded-2xl shadow-accent-lg mb-6 group hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-center relative z-10">
              Create an Account
            </h1>
            <p className="text-muted-foreground text-center mt-2">
              Join the transparent supply chain.
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-xl mb-6 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="pl-12"
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="pl-12"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="pl-12 pr-12"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative group">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="flex h-12 w-full appearance-none rounded-xl border border-border bg-transparent md:bg-muted/10 px-3 py-2 pl-12 text-sm text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 cursor-pointer"
              >
                <option value="consumer">Consumer</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="distributor">Distributor</option>
                <option value="pharmacy">Pharmacy</option>
              </select>
            </div>

            {formData.role !== 'consumer' && !account && (
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                <p className="text-sm text-center text-muted-foreground">
                  Business roles require a blockchain identity. 
                </p>
                <Button type="button" variant="outline" onClick={connectWallet} className="w-full gap-2 border-accent text-accent">
                  <Wallet size={16} /> 
                  Connect MetaMask
                </Button>
              </div>
            )}
            {formData.role !== 'consumer' && account && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                <ShieldCheck className="text-green-500 w-5 h-5" />
                <p className="text-sm font-mono text-green-700">Wallet Linked: {account.substring(0,6)}...{account.slice(-4)}</p>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full mt-6 group">
              Register Account
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account? <span onClick={() => navigate('/login')} className="text-accent cursor-pointer hover:underline font-medium">Log in</span>
            </p>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
