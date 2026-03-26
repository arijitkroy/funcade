import { useState, useEffect } from 'react';
import Head from 'next/head';
import { FaTrophy, FaMedal, FaUserCircle } from 'react-icons/fa';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        const data = await res.json();
        setLeaderboard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const getRankBadge = (index) => {
    switch (index) {
      case 0: return <FaMedal className="text-yellow-400" size={24} />;
      case 1: return <FaMedal className="text-gray-300" size={22} />;
      case 2: return <FaMedal className="text-amber-600" size={20} />;
      default: return <span className="text-gray-500 font-bold text-sm">#{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-uno-purple/30">
      <Head>
        <title>Leaderboard | UNO No Mercy</title>
        <meta name="description" content="Global Leaderboard for UNO No Mercy" />
      </Head>

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-10">
          <FaTrophy className="text-uno-gold text-5xl mx-auto mb-4 animate-float" />
          <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-uno-gold via-white to-uno-gold bg-300% animate-gradient">
            HALL OF FAME
          </h1>
          <p className="text-gray-400 mt-2 font-medium tracking-wide uppercase text-sm">
            Top Players Ranking
          </p>
        </div>

        <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-uno-gold/30 border-t-uno-gold rounded-full animate-spin mb-4" />
              <p className="text-gray-400 animate-pulse">Loading legends...</p>
            </div>
          ) : error ? (
            <div className="p-20 text-center text-red-400 font-semibold uppercase tracking-widest">
              Error: {error}
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse hidden sm:table">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="py-5 px-6 font-bold text-gray-400 uppercase text-xs tracking-widest">Rank</th>
                    <th className="py-5 px-6 font-bold text-gray-400 uppercase text-xs tracking-widest">Player</th>
                    <th className="py-5 px-6 font-bold text-gray-400 uppercase text-xs tracking-widest text-right">Points</th>
                    <th className="py-5 px-6 font-bold text-gray-400 uppercase text-xs tracking-widest text-right">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, idx) => (
                    <tr 
                      key={player.uid} 
                      className={`border-b border-white/5 transition-colors hover:bg-white/5 group ${
                        idx === 0 ? 'bg-uno-gold/5' : ''
                      }`}
                    >
                      <td className="py-6 px-6 align-middle">
                        <div className="flex items-center justify-center w-8">
                          {getRankBadge(idx)}
                        </div>
                      </td>
                      <td className="py-6 px-6 align-middle">
                        <div className="flex items-center gap-3">
                          {player.photoURL ? (
                            <img 
                              src={player.photoURL} 
                              alt={player.displayName} 
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full border-2 border-white/10 group-hover:border-uno-gold/50 transition-colors shadow-lg"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-uno-surface-light flex items-center justify-center border-2 border-white/10 group-hover:border-uno-gold/50 transition-colors">
                              <FaUserCircle className="text-gray-500" size={24} />
                            </div>
                          )}
                          <div>
                            <p className={`font-bold transition-colors ${
                              idx === 0 ? 'text-uno-gold text-lg' : 'text-white'
                            }`}>
                              {player.displayName}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                              {player.gamesWon} Wins / {player.gamesPlayed} Games
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6 align-middle text-right">
                        <span className={`font-black text-xl italic ${
                          idx === 0 ? 'text-uno-gold' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500'
                        }`}>
                          {player.totalPoints.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-6 px-6 align-middle text-right">
                        <div className="text-xs font-bold text-gray-400 uppercase">
                          {player.gamesPlayed > 0 
                            ? `${Math.round((player.gamesWon / player.gamesPlayed) * 100)}%` 
                            : '0%'}
                        </div>
                        <div className="w-24 h-1 bg-white/5 rounded-full mt-1 ml-auto overflow-hidden">
                          <div 
                            className="h-full bg-uno-gold rounded-full transition-all duration-1000"
                            style={{ width: `${player.gamesPlayed > 0 ? (player.gamesWon / player.gamesPlayed) * 100 : 0}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="sm:hidden divide-y divide-white/5">
                {leaderboard.map((player, idx) => (
                  <div 
                    key={player.uid} 
                    className={`flex items-center gap-3 p-4 transition-colors ${
                      idx === 0 ? 'bg-uno-gold/5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 flex-shrink-0">
                      {getRankBadge(idx)}
                    </div>
                    {player.photoURL ? (
                      <img 
                        src={player.photoURL} 
                        alt={player.displayName} 
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border-2 border-white/10 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-uno-surface-light flex items-center justify-center border-2 border-white/10 flex-shrink-0">
                        <FaUserCircle className="text-gray-500" size={20} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className={`font-bold truncate ${idx === 0 ? 'text-uno-gold' : 'text-white'}`}>
                        {player.displayName}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {player.gamesWon}W / {player.gamesPlayed}G
                        {player.gamesPlayed > 0 && (
                          <span className="ml-1 text-gray-400">
                            ({Math.round((player.gamesWon / player.gamesPlayed) * 100)}%)
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`font-black text-lg italic ${
                        idx === 0 ? 'text-uno-gold' : 'text-white'
                      }`}>
                        {player.totalPoints.toLocaleString()}
                      </span>
                      <p className="text-[9px] text-gray-500 uppercase tracking-wider">pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        .bg-300% {
          background-size: 300% auto;
        }
        .animate-gradient {
          animation: shine 5s linear infinite;
        }
        @keyframes shine {
          to { background-position: 300% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
