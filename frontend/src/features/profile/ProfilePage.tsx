import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  LogOut, Settings, Moon, Volume2, Minimize2, 
  MapPin, Calendar, Heart, MessageCircle, BarChart3,
  ChevronRight, ExternalLink, Shield, User, Bell,
  Activity, Sparkles, TrendingUp, FlaskConical
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';

const Floating3DBg: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-accent-primary/20 blur-[120px] rounded-full"
      />
      <motion.div 
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-accent-secondary/20 blur-[100px] rounded-full"
      />
    </div>
  );
};

const TiltedCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX: springRotateX,
        rotateY: springRotateY,
        x: springX,
        y: springY,
      }}
      className={cn("glass-effect rounded-3xl p-8 shadow-2xl transition-all duration-300", className)}
    >
      {children}
    </motion.div>
  );
};

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundLevel, setSoundLevel] = useState(0.8);
  const [activeTab, setActiveTab] = useState('settings');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : 'January 2026';

  const stats = [
    { label: 'Resonances', value: '42', icon: Activity, color: 'text-accent-primary' },
    { label: 'Avg Mood', value: 'Calm', icon: Heart, color: 'text-accent-secondary' },
    { label: 'Streak', value: '7 Days', icon: TrendingUp, color: 'text-emerald-400' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <Floating3DBg />
      
      <div className="relative z-10 max-w-5xl mx-auto space-y-10">
        {/* Header Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <TiltedCard className="lg:col-span-2 relative overflow-hidden group">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-5xl font-bold shadow-glow relative overflow-hidden">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-[#0A0A0F] z-20" />
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tight mb-1">
                    {user?.name || 'Explorer'}
                  </h1>
                  <p className="text-white/50 text-lg flex items-center justify-center md:justify-start gap-2">
                    <MapPin className="w-4 h-4" /> San Francisco, CA
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <Calendar className="w-4 h-4 text-accent-primary" />
                    <span className="text-white/70 text-sm">Joined {memberSince}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <Sparkles className="w-4 h-4 text-accent-secondary" />
                    <span className="text-white/70 text-sm">Beta Pioneer</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background elements for card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/10 blur-3xl -z-10" />
          </TiltedCard>

          <div className="grid grid-cols-1 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-effect rounded-2xl p-6 flex items-center gap-4 hover:bg-white/10 transition-colors"
              >
                <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/40 text-sm font-medium">{stat.label}</p>
                  <p className="text-white text-xl font-bold">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Content Tabs/Sections */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            {[
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'notifications', label: 'Alerts', icon: Bell },
              { id: 'data', label: 'My Data', icon: BarChart3 },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-medium",
                  activeTab === item.id 
                    ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/30" 
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all mt-8"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>

          {/* Main Action Area */}
          <div className="lg:col-span-3">
            <TiltedCard className="h-full">
              {activeTab === 'settings' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                    <div className="p-3 rounded-2xl bg-accent-primary/20 text-accent-primary">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Interface Customization</h2>
                      <p className="text-white/40 text-sm">Tailor your resonance experience</p>
                    </div>
                  </div>

                  <div className="space-y-8 pt-4">
                    {/* Reduced Motion */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:bg-accent-primary/20 group-hover:text-accent-primary transition-colors">
                          <Minimize2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">Cinematic Animations</p>
                          <p className="text-white/40 text-sm">Enable high-performance motion effects</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setReducedMotion(!reducedMotion)}
                        className={cn(
                          'w-14 h-7 rounded-full transition-all relative overflow-hidden p-1',
                          !reducedMotion ? 'bg-accent-primary' : 'bg-white/10'
                        )}
                      >
                        <motion.div
                          className="w-5 h-5 bg-white rounded-full shadow-md relative z-10"
                          animate={{ x: !reducedMotion ? 28 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>

                    {/* Sound Level */}
                    <div className="space-y-6 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:bg-accent-primary/20 group-hover:text-accent-primary transition-colors">
                            <Volume2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Audio Immersion</p>
                            <p className="text-white/40 text-sm">Master volume for spatial therapy</p>
                          </div>
                        </div>
                        <span className="text-accent-primary font-mono text-xl font-bold">
                          {Math.round(soundLevel * 100)}%
                        </span>
                      </div>
                      <div className="relative pt-4 px-2">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={soundLevel}
                          onChange={(e) => setSoundLevel(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-primary hover:accent-accent-secondary transition-all"
                        />
                        <div 
                          className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full pointer-events-none transition-all duration-300" 
                          style={{ width: `${soundLevel * 100}%` }} 
                        />
                      </div>
                    </div>

                    {/* Experimental Features Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:bg-accent-secondary/20 group-hover:text-accent-secondary transition-colors">
                          <FlaskConical className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">Pre-release Features</p>
                          <p className="text-white/40 text-sm">Access experimental resonance patterns</p>
                        </div>
                      </div>
                      <button className="px-4 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-bold hover:bg-white/10 transition-colors">
                        OPT IN
                      </button>
                    </div>

                    {/* Theme Toggle placeholder */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-white/5 text-white/60">
                          <Moon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">Luminance Mode</p>
                          <p className="text-white/40 text-sm">System default darkness</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-md">Coming Soon</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab !== 'settings' && (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                  <div className="p-6 rounded-full bg-white/5 text-white/20">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Module Under Development</h3>
                  <p className="text-white/40 max-w-md">We''re building advanced analytics for this section. Stay tuned for the next update.</p>
                </div>
              )}
            </TiltedCard>
          </div>
        </section>

        {/* Footer info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/10">
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Terms of Service</a>
            <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Help Center</a>
          </div>
          <p className="text-white/20 text-sm">Resonance v1.0.4 • Build 8291</p>
        </div>
      </div>
    </div>
  );
};

