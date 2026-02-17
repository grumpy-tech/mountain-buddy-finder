import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mountain, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HomeScreenProps {
  onStart: (username: string) => void;
  onJoin: (code: string, username: string) => void;
  loading: boolean;
  error: string | null;
}

export default function HomeScreen({ onStart, onJoin, loading, error }: HomeScreenProps) {
  const [username, setUsername] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'home' | 'join'>('home');

  const handleStart = () => {
    if (!username.trim()) return;
    onStart(username.trim());
  };

  const handleJoin = () => {
    if (!username.trim() || !joinCode.trim()) return;
    onJoin(joinCode.trim(), username.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Mountain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Peak Tracker
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Find your crew on the mountain
          </p>
        </div>

        {/* Username input - always visible */}
        <div className="mb-4">
          <Input
            placeholder="Your trail name for today..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="tap-target text-center text-lg font-medium bg-card border-border placeholder:text-muted-foreground"
            maxLength={20}
            autoComplete="off"
          />
        </div>

        {mode === 'home' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {/* Start Session */}
            <Button
              onClick={handleStart}
              disabled={!username.trim() || loading}
              className="w-full tap-target text-base font-display font-semibold gap-2"
              size="lg"
            >
              <Mountain className="w-5 h-5" />
              Start a Session
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>

            {/* Join Session */}
            <Button
              onClick={() => setMode('join')}
              disabled={!username.trim()}
              variant="outline"
              className="w-full tap-target text-base font-display font-semibold gap-2"
              size="lg"
            >
              <Users className="w-5 h-5" />
              Join a Session
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Input
              placeholder="Enter 4-letter code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="tap-target text-center text-2xl font-display font-bold tracking-[0.3em] bg-card border-border uppercase placeholder:text-muted-foreground placeholder:text-base placeholder:tracking-normal placeholder:font-normal"
              maxLength={4}
              autoComplete="off"
            />
            <Button
              onClick={handleJoin}
              disabled={!username.trim() || joinCode.length !== 4 || loading}
              className="w-full tap-target text-base font-display font-semibold gap-2"
              size="lg"
            >
              <Users className="w-5 h-5" />
              Join Session
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button
              onClick={() => setMode('home')}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              Back
            </Button>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-destructive text-sm text-center mt-4"
          >
            {error}
          </motion.p>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Sessions last 18 hours. No account needed.
        </p>
      </motion.div>
    </div>
  );
}
