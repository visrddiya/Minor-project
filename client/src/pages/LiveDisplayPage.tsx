import React, { useEffect, useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { Link } from 'react-router-dom';
import { playCallChime } from '../lib/audioUtils';
import {
  Volume2,
  VolumeX,
  Tv,
  ArrowLeft,
  Clock,
  Sparkles,
  CheckCircle,
  Megaphone,
  Building
} from 'lucide-react';

export const LiveDisplayPage: React.FC = () => {
  const { tokens, counters, branches, selectedBranchId, lastCalledToken, audioAnnouncementMessage, clearAudioAnnouncement } = useQueue();
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Speech API Voice synthesis trigger when a new token is called
  useEffect(() => {
    // Strict Guard: Prevent voice announcements if no tokens are currently active or being called
    const hasActiveCallingTokens = tokens.some(t => t.status === 'CALLING' || t.status === 'SERVING');
    if (!hasActiveCallingTokens) {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
      clearAudioAnnouncement();
      return;
    }

    if (audioAnnouncementMessage && audioEnabled && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Cancel any lingering speech tasks first
        playCallChime(); // Play authentic airport/hospital double chime
        setTimeout(() => {
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(audioAnnouncementMessage);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
          }
        }, 350);
      } catch (err) {
        console.log('Speech synth error:', err);
      } finally {
        clearAudioAnnouncement();
      }
    }
  }, [audioAnnouncementMessage, audioEnabled, clearAudioAnnouncement, tokens]);

  const currentlyCallingTokens = tokens.filter(t => t.status === 'CALLING' || t.status === 'SERVING');
  const upcomingWaitingTokens = tokens.filter(t => t.status === 'WAITING').slice(0, 8);

  const activeCounters = counters.filter(c => c.isOnline);

  // Find live state of the last called token to ensure completed tokens are NOT displayed
  const activeLastCalledToken = tokens.find(
    t => t.id === lastCalledToken?.id && (t.status === 'CALLING' || t.status === 'SERVING')
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between p-6 select-none">
      {/* Top TV Bar */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition"
            title="Exit Fullscreen TV Mode"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-400 flex items-center justify-center font-black text-white text-xl shadow-glow">
              Q
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
                {activeBranch?.name}
              </h1>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                Live Queue Display Signage
              </span>
            </div>
          </div>
        </div>

        {/* Audio Toggle & Clock */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
              audioEnabled
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{audioEnabled ? 'Voice Chime ON' : 'Muted'}</span>
          </button>

          <div className="text-right">
            <div className="text-2xl font-black font-mono text-teal-400 tracking-wider">
              {currentTime}
            </div>
            <div className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
              System Time
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Column: Big NOW CALLING Banner (Cols 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Main Flash Banner */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-blue-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Megaphone className="w-48 h-48 text-blue-400" />
            </div>

            <div className="flex items-center space-x-3 text-amber-400 font-bold text-sm uppercase tracking-widest mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span>NOW CALLING TICKET</span>
            </div>

            {activeLastCalledToken ? (
              <div className="space-y-4 my-auto">
                <div className="text-7xl sm:text-8xl lg:text-9xl font-black font-mono text-teal-300 tracking-tight animate-pulse drop-shadow-md">
                  {activeLastCalledToken.tokenNumber}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800">
                  <div className="bg-slate-800/90 border border-slate-700 px-6 py-3 rounded-2xl">
                    <span className="text-xs text-slate-400 block font-semibold uppercase">Proceed To</span>
                    <span className="text-3xl font-extrabold text-white">
                      Counter {activeLastCalledToken.counterNumber || '01'}
                    </span>
                  </div>

                  <div className="bg-slate-800/90 border border-slate-700 px-6 py-3 rounded-2xl">
                    <span className="text-xs text-slate-400 block font-semibold uppercase">Department</span>
                    <span className="text-lg font-bold text-teal-400">
                      {activeLastCalledToken.departmentName}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Clock className="w-16 h-16 mx-auto mb-3 opacity-40 animate-spin" style={{ animationDuration: '8s' }} />
                <p className="text-xl font-bold text-slate-400">All Active Tokens Completed (Station Idle)</p>
                <p className="text-xs text-slate-500 mt-1">Counter operators will call waiting tokens shortly</p>
              </div>
            )}
          </div>

          {/* Active Counters Grid */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
              <Tv className="w-4 h-4 text-teal-400" />
              <span>Active Counter Service Status</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeCounters.map((c) => {
                const counterToken = tokens.find(
                  t => t.counterId === c.id && (t.status === 'CALLING' || t.status === 'SERVING')
                );
                return (
                  <div
                    key={c.id}
                    className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Counter {c.number}</span>
                      <span className="text-sm font-bold text-white line-clamp-1">{c.assignedStaffName || 'Active'}</span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2.5 py-1 rounded-md font-mono text-sm font-black border ${
                          counterToken
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-slate-800/50 text-slate-500 border-slate-700/50'
                        }`}
                      >
                        {counterToken ? counterToken.tokenNumber : 'IDLE'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Waiting Queue (Cols 5) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">Upcoming Queue</h3>
                <p className="text-xs text-slate-400">Tokens next in line for service</p>
              </div>
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-bold rounded-full border border-teal-500/30">
                {upcomingWaitingTokens.length} Waiting
              </span>
            </div>

            <div className="space-y-3">
              {upcomingWaitingTokens.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No tokens waiting in queue right now.
                </div>
              ) : (
                upcomingWaitingTokens.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 font-mono font-black text-teal-400 flex items-center justify-center text-base border border-slate-700">
                        {t.tokenNumber}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{t.departmentName}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-400">Est. Wait</span>
                      <p className="text-sm font-extrabold text-blue-400">~{t.estimatedWaitMinutes}m</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Voice chime trigger simulator box */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 to-teal-900/40 border border-blue-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Megaphone className="w-5 h-5 text-teal-400" />
              <span className="text-xs font-bold text-slate-200">Voice Announcement Audio System</span>
            </div>
            <button
              onClick={() => {
                if ('speechSynthesis' in window) {
                  const u = new SpeechSynthesisUtterance('Attention please: QueueSphere voice announcement test active.');
                  window.speechSynthesis.speak(u);
                }
              }}
              className="text-xs font-bold bg-teal-500 text-slate-950 px-3 py-1.5 rounded-lg hover:bg-teal-400 transition"
            >
              Test Voice
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Live Ticker Bar */}
      <footer className="bg-slate-900/90 border border-slate-800 rounded-2xl px-6 py-3 flex items-center space-x-4 overflow-hidden text-xs">
        <span className="px-2.5 py-1 bg-blue-600 text-white font-extrabold rounded-md text-[10px] uppercase tracking-wider shrink-0">
          ANNOUNCEMENT
        </span>
        <div className="text-slate-300 truncate">
          Please have your token ticket or mobile QR code ready when your number is called. Thank you for your patience!
        </div>
      </footer>
    </div>
  );
};
