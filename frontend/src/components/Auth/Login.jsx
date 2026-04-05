import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

const easeOut = [0.16, 1, 0.3, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      // Route based on role
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Login Failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative z-10 w-full pt-10">
      
      {/* Abstract Background Elements (Visible on larger screens) */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 hidden lg:flex flex-col gap-6 w-1/3 animate-float opacity-80 pointer-events-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-secondary rotate-12 shadow-accent" />
        <div className="w-32 h-8 rounded-full border border-border backdrop-blur-sm -rotate-6" />
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-accent/20 animate-rotate-slow absolute -top-10 -left-10" />
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="w-full max-w-md mx-auto"
      >
        <Card elevated className="backdrop-blur-xl bg-white/80 dark:bg-card/80 border-white/20 relative overflow-visible">
          {/* Decorative rotating ring around card corner */}
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full border border-dashed border-accent/30 animate-rotate-slow pointer-events-none" />
          
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-accent to-accent-secondary p-4 rounded-2xl shadow-accent-lg mb-6 group hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-center relative z-10">
              Welcome to <br />
              <span className="gradient-text relative inline-block">
                SecureRxChain
                <span className="gradient-underline" />
              </span>
            </h1>
            <p className="text-muted-foreground text-center mt-4">
              Access the secure blockchain supply network to verify authentic medicine.
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-12"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <Button type="submit" variant="primary" className="w-full mt-4 group">
              Secure Login
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account? <span onClick={() => navigate('/register')} className="text-accent cursor-pointer hover:underline font-medium">Register here</span>
            </p>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
