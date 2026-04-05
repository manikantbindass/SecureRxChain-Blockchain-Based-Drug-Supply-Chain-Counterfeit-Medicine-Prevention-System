import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Web3Context } from '../../context/Web3Context';
import { ShieldCheck, LogOut, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/utils';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { account, connectWallet } = useContext(Web3Context);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
      scrolled ? "bg-white/70 backdrop-blur-md border-border shadow-sm py-3" : "bg-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
          <div className="bg-gradient-to-br from-accent to-accent-secondary p-2 rounded-xl shadow-accent group-hover:scale-105 transition-transform duration-300">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="font-serif text-xl sm:text-2xl tracking-tight text-foreground group-hover:opacity-80 transition-opacity">
            Secure<span className="gradient-text">Rx</span>Chain
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Web3 Wallet Section */}
              <div className="flex items-center">
                {account ? (
                  <Badge variant="outline" className="border-accent/40 bg-accent/10 px-3 py-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow"></span>
                    <span className="font-mono text-accent">
                      {account.substring(0, 6)}...{account.substring(account.length - 4)}
                    </span>
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={connectWallet} className="border-accent text-accent hover:bg-accent hover:text-white">
                    Connect MetaMask
                  </Button>
                )}
              </div>

              <div className="hidden md:flex flex-col items-end border-l border-border pl-4">
                <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User size={14} className="text-accent" />
                  {user.name} ({user.role})
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 ml-2">
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
              <Button variant="primary" onClick={() => navigate('/register')}>Get Started</Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
