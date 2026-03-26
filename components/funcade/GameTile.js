import Link from 'next/link';
import { FaPlay, FaLock } from 'react-icons/fa';

export default function GameTile({ title, description, imageColor, coverImage, href, isAvailable }) {
  const content = (
    <div className={`relative group overflow-hidden rounded-2xl bg-black/40 border border-white/10 transition-all duration-300 ${isAvailable ? 'hover:scale-[1.03] hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer' : 'opacity-70 grayscale-[0.5] pb-2'}`}>
      
      {/* Dynamic Background Area */}
      <div className={`h-40 w-full relative overflow-hidden bg-gradient-to-br ${imageColor}`}>
        {coverImage && (
          <img 
            src={coverImage} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-110 group-hover:opacity-80 transition-all duration-700" 
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
        
        {/* Glow effect on hover */}
        {isAvailable && (
          <div className="absolute -inset-10 bg-white/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-10 group-hover:translate-y-0" />
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          {!isAvailable && (
            <span className="bg-white/10 text-xs font-semibold px-2 py-1 rounded-md text-gray-300 flex items-center gap-1">
              <FaLock className="text-[10px]" /> Soon
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{description}</p>
        
        {isAvailable && (
          <div className="flex items-center text-purple-400 text-sm font-bold gap-2 group-hover:text-pink-400 transition-colors">
             Play Now <FaPlay className="text-[10px] group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </div>
  );

  if (isAvailable && href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
