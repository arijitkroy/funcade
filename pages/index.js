import Head from 'next/head';
import GameTile from '@/components/funcade/GameTile';
import { useAuth } from '@/contexts/AuthContext';

export default function FuncadeHome() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden selection:bg-purple-500/30">
      <Head>
        <title>Funcade | The Ultimate Retro Arcade</title>
        <meta name="description" content="Play amazing multiplayer games on Funcade." />
      </Head>

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-600/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[30%] h-[30%] rounded-full bg-blue-600/5 blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
            Welcome to <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse">
              Funcade
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8 font-medium">
            Your premium arcade destination for real-time multiplayer games
          </p>
          
          {!user && !loading && (
            <div className="inline-block bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm animate-bounce-subtle">
              <p className="text-sm text-gray-300 font-medium">✨ Sign in through the navbar to save your progress!</p>
            </div>
          )}
        </div>

        {/* Games Grid Section */}
        <div className="mb-10 flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Featured Games</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GameTile 
            title="UNO No Mercy" 
            description="The classic game with a ruthless twist. Stacking penalties, brutal action cards, and no turning back."
            imageColor="from-red-600 via-red-900 to-black"
            coverImage="/assets/card_back.png"
            href="/uno"
            isAvailable={true}
          />        

          <GameTile 
            title="Tic-Tac-Toe Advanced" 
            description="The classic grid game reimagined for the cyber age. Custom board sizes, custom win states, pure neon domination."
            imageColor="from-purple-600 via-indigo-900 to-black"
            coverImage="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop"
            href="/tictactoe"
            isAvailable={true}
          />

          <GameTile 
            title="Coming Soon" 
            description="Coming soon."
            imageColor="from-green-600 via-emerald-900 to-black"
            coverImage="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop"
            isAvailable={false}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/40 py-8 text-center backdrop-blur-md">
        <p className="text-gray-500 text-sm font-medium">© 2026 Funcade Arcade Platform. Built with 🔥</p>
      </footer>
    </div>
  );
}
