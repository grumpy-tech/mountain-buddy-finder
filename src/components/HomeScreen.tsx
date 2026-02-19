import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, ArrowRight, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const GENERATED_NAMES = [
  'Top Gun', 'Powder Hound', 'Snow Ghost', 'Avalanche',
  'Blizzard', 'Ice Hawk', 'Storm Rider', 'Frost Bite',
  'Yeti', 'Snow Fox', 'Glacier', 'Summit',
  'Mogul King', 'Shredder', 'Steep Seeker', 'White Out',
];

function getRandomNames(count: number): string[] {
  const shuffled = [...GENERATED_NAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface HomeScreenProps {
  onStart: (username: string) => void;
  onJoin: (code: string, username: string) => void;
  loading: boolean;
  error: string | null;
}

type Mode = 'home' | 'pick-name' | 'join-code' | 'join-name';

export default function HomeScreen({ onStart, onJoin, loading, error }: HomeScreenProps) {
  const [mode, setMode] = useState<Mode>('home');
  const [username, setUsername] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [suggestions, setSuggestions] = useState(() => getRandomNames(4));

  const refreshNames = useCallback(() => {
    setSuggestions(getRandomNames(4));
  }, []);

  const selectName = (name: string) => {
    setUsername(name);
  };

  const handleStart = () => {
    if (!username.trim()) return;
    onStart(username.trim());
  };

  const handleJoin = () => {
    if (!username.trim() || !joinCode.trim()) return;
    onJoin(joinCode.trim(), username.trim());
  };

  const goBack = () => {
    if (mode === 'join-name') {
      setMode('join-code');
      setUsername('');
    } else {
      setMode('home');
      setUsername('');
      setJoinCode('');
    }
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

        <AnimatePresence mode="wait">
          {mode === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <Button
                onClick={() => { setMode('pick-name'); setUsername(''); refreshNames(); }}
                className="w-full tap-target text-base font-display font-semibold gap-2"
                size="lg"
              >
                <Mountain className="w-5 h-5" />
                Start a Session
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button
                onClick={() => setMode('join-code')}
                variant="outline"
                className="w-full tap-target text-base font-display font-semibold gap-2"
                size="lg"
              >
                <Users className="w-5 h-5" />
                Join a Session
              </Button>
            </motion.div>
          )}

          {mode === 'pick-name' && (
            <motion.div
              key="pick-name"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground text-center">Pick a trail name or type your own</p>

              {/* Generated name chips */}
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((name) => (
                  <button
                    key={name}
                    onClick={() => selectName(name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      username === name
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {name}
                  </button>
                ))}
                <button
                  onClick={refreshNames}
                  className="px-3 py-2 rounded-full bg-secondary text-muted-foreground hover:bg-secondary/80 transition-all"
                  aria-label="Refresh names"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Custom name input */}
              <Input
                placeholder="Or type your own..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="tap-target text-center text-lg font-medium bg-card border-border placeholder:text-muted-foreground"
                maxLength={20}
                autoComplete="off"
              />

              <Button
                onClick={handleStart}
                disabled={!username.trim() || loading}
                className="w-full tap-target text-base font-display font-semibold gap-2"
                size="lg"
              >
                <Mountain className="w-5 h-5" />
                Start Session
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button onClick={goBack} variant="ghost" className="w-full text-muted-foreground">
                Back
              </Button>
            </motion.div>
          )}

          {mode === 'join-code' && (
            <motion.div
              key="join-code"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
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
                onClick={() => { setMode('join-name'); setUsername(''); refreshNames(); }}
                disabled={joinCode.length !== 4}
                className="w-full tap-target text-base font-display font-semibold gap-2"
                size="lg"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button onClick={goBack} variant="ghost" className="w-full text-muted-foreground">
                Back
              </Button>
            </motion.div>
          )}

          {mode === 'join-name' && (
            <motion.div
              key="join-name"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground text-center">Pick a trail name or type your own</p>

              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((name) => (
                  <button
                    key={name}
                    onClick={() => selectName(name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      username === name
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {name}
                  </button>
                ))}
                <button
                  onClick={refreshNames}
                  className="px-3 py-2 rounded-full bg-secondary text-muted-foreground hover:bg-secondary/80 transition-all"
                  aria-label="Refresh names"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <Input
                placeholder="Or type your own..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="tap-target text-center text-lg font-medium bg-card border-border placeholder:text-muted-foreground"
                maxLength={20}
                autoComplete="off"
              />

              <Button
                onClick={handleJoin}
                disabled={!username.trim() || loading}
                className="w-full tap-target text-base font-display font-semibold gap-2"
                size="lg"
              >
                <Users className="w-5 h-5" />
                Join Session
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button onClick={goBack} variant="ghost" className="w-full text-muted-foreground">
                Back
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

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
