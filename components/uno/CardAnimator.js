import { useState, useCallback, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';
import UnoCard from './UnoCard';

const AnimatedCard = ({ anim, onComplete }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const animation = cardRef.current.animate([
      {
        transform: `translate(${anim.startX}px, ${anim.startY}px) translate(-50%, -50%) scale(0.85)`,
        opacity: 1,
      },
      {
        transform: `translate(${anim.endX}px, ${anim.endY}px) translate(-50%, -50%) scale(0.95)`,
        opacity: 0.6,
      },
    ], {
      duration: 400,
      easing: 'ease-out',
      fill: 'forwards',
    });

    animation.onfinish = onComplete;
  }, [anim, onComplete]);

  return (
    <div
      ref={cardRef}
      className="absolute"
      style={{ left: 0, top: 0, pointerEvents: 'none', opacity: 0 }}
    >
      <UnoCard card={anim.cardData} faceDown={anim.faceDown} className="shadow-2xl" />
    </div>
  );
};

const CardAnimator = forwardRef((props, ref) => {
  const [animations, setAnimations] = useState([]);

  const animateCard = useCallback((sourceId, targetId, cardData = {}, faceDown = false) => {
    const sourceEl = document.getElementById(sourceId);
    const targetEl = document.getElementById(targetId);
    if (!sourceEl || !targetEl) return;

    const sr = sourceEl.getBoundingClientRect();
    const tr = targetEl.getBoundingClientRect();

    setAnimations((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        cardData,
        faceDown,
        startX: sr.left + sr.width / 2,
        startY: sr.top + sr.height / 2,
        endX: tr.left + tr.width / 2,
        endY: tr.top + tr.height / 2,
      },
    ]);
  }, []);

  const removeAnimation = useCallback((id) => {
    setAnimations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  useImperativeHandle(ref, () => ({
    animateCard,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {animations.map((anim) => (
        <AnimatedCard 
          key={anim.id} 
          anim={anim} 
          onComplete={() => removeAnimation(anim.id)} 
        />
      ))}
    </div>
  );
});

CardAnimator.displayName = 'CardAnimator';
export default CardAnimator;
