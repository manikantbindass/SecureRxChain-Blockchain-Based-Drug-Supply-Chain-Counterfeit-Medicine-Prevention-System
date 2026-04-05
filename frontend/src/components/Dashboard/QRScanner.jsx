import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scan, QrCode } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const easeOut = [0.16, 1, 0.3, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } }
};

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Make sure DOM is ready
    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        aspectRatio: 1.0,
      }, false);

      scanner.render(
        (result) => {
          scanner.clear();
          setScanResult(result);
          if(result.includes('/verify/')) {
              const batchId = result.split('/verify/')[1];
              navigate(`/verify/${batchId}`);
          } else {
              navigate(`/verify/${result}`);
          }
        },
        () => {
          // Ignore errors during scanning
        }
      );

      return () => {
        scanner.clear().catch(console.error);
      };
    }, 500); // Slight delay helps initialization inside animated cards

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="max-w-3xl mx-auto pt-10">
      <div className="text-center mb-10">
        <Badge className="mb-4">Consumer Portal</Badge>
        <h1 className="text-4xl md:text-5xl font-serif">
          Scan <span className="gradient-text">Medicine</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
          Verify the authenticity of your prescription by scanning the blockchain-generated QR code on the packaging.
        </p>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-lg mx-auto">
        <Card elevated className="relative overflow-visible">
          {/* Decorative scanner frame elements */}
          <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-accent rounded-tl-xl pointer-events-none" />
          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-accent rounded-br-xl pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="bg-gradient-to-br from-accent to-accent-secondary p-3 rounded-xl text-white shadow-accent">
              <Scan size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">QR Authenticator</h2>
              <p className="text-sm text-muted-foreground">Center code in frame</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-2 relative min-h-[300px]">
             {/* The html5-qrcode library injects its UI here. We wrap it to style it via targeted CSS if needed. */}
             <div id="reader" className="w-full text-white [&_video]:rounded-lg [&_video]:object-cover" />
             
             {/* Fallback visual if taking time */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -z-10 bg-slate-900">
               <QrCode className="text-slate-800 w-24 h-24 mb-4" />
               <p className="text-slate-600 font-mono text-sm">Initializing Camera...</p>
             </div>
          </div>

          {scanResult && (
            <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-xl text-center">
              <p className="text-sm text-accent font-mono truncate">Processing: {scanResult}</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default QRScanner;
