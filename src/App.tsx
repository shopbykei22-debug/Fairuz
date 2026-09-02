import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowRight,
  CakeSlice,
  Check,
  ChevronLeft,
  Gift,
  Music,
  Play,
  Star,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';

const BIRTHDAY_SONG = '/Adella_-_Selamat_ulang_tahun_-_All_artist.mp3';

const PLAYER_NAME = 'Fairuz';
const FAIRUZ_PHOTO = '/assets/IMG-20260902-WA0011(2) copy.jpg';
const DANA_QR = '/assets/IMG_Wed_Sep_02_12_38_19_GMT+07_00_2026.jpg';
const DANA_LINK = 'https://link.dana.id/danakaget?c=sjvnp4kdw&r=g5GLCN&orderId=20260902101214537515010300166434296842301';
const REWARD_DURATION = 15;

type Flavor = 'Chocolate' | 'Vanilla' | 'Strawberry';
type Frosting = 'Pink' | 'White' | 'Cream';
type Topping = 'Sprinkles' | 'Strawberry' | 'Stars' | 'Chocolate';
type Screen = 'opening' | 'cake' | 'candles' | 'moment' | 'message' | 'ending' | 'surprise' | 'reward' | 'over';

const flavors: { name: Flavor; icon: string; color: string }[] = [
  { name: 'Chocolate', icon: '🍫', color: '#7b4935' },
  { name: 'Vanilla', icon: '🍦', color: '#efc878' },
  { name: 'Strawberry', icon: '🍓', color: '#e98792' },
];
const frostings: { name: Frosting; color: string }[] = [
  { name: 'Pink', color: '#f29bb0' },
  { name: 'White', color: '#fffaf1' },
  { name: 'Cream', color: '#f6d7a0' },
];
const toppingIcons: Record<Topping, string> = { Sprinkles: '🧁', Strawberry: '🍓', Stars: '⭐', Chocolate: '🍫' };
const toppingPositions = [
  { left: '16%', top: '13%' }, { left: '42%', top: '8%' }, { left: '68%', top: '15%' },
  { left: '28%', top: '33%' }, { left: '56%', top: '31%' }, { left: '79%', top: '35%' },
];

function App() {
  const [screen, setScreen] = useState<Screen>('opening');
  const [flavor, setFlavor] = useState<Flavor | null>(null);
  const [frosting, setFrosting] = useState<Frosting | null>(null);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [photoAdded, setPhotoAdded] = useState(false);
  const [candles, setCandles] = useState(0);
  const [blown, setBlown] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0;
    audio.loop = true;
  }, []);

  const unlockAudio = () => {
    if (hasInteracted.current) return;
    hasInteracted.current = true;
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0;
      void audio.play().then(() => {
        if (soundOn) {
          const t = window.setInterval(() => {
            if (!audio) return;
            if (audio.volume < 0.9) audio.volume = Math.min(audio.volume + 0.05, 1);
            else window.clearInterval(t);
          }, 80);
        }
      }).catch(() => { hasInteracted.current = false; });
    }
  };

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) { setSoundOn(!soundOn); return; }
    if (soundOn) {
      audio.pause();
      setSoundOn(false);
    } else {
      void audio.play().then(() => setSoundOn(true)).catch(() => setSoundOn(false));
    }
  };
  const [rewardTime, setRewardTime] = useState(REWARD_DURATION);
  const [rewardClosed, setRewardClosed] = useState(false);

  useEffect(() => {
    if (screen === 'reward' && !rewardClosed && rewardTime > 0) {
      const timer = window.setTimeout(() => setRewardTime((time) => time - 1), 1000);
      return () => window.clearTimeout(timer);
    }
    if (screen === 'reward' && rewardTime === 0) setRewardClosed(true);
  }, [screen, rewardTime, rewardClosed]);

  const progress = useMemo(() => ({
    flavor: Boolean(flavor), frosting: Boolean(frosting), toppings: toppings.length > 0, photo: photoAdded,
  }), [flavor, frosting, toppings, photoAdded]);

  const nextFromCake = () => {
    if (progress.flavor && progress.frosting && progress.toppings && progress.photo) setScreen('candles');
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <audio ref={audioRef} src={BIRTHDAY_SONG} loop preload="auto" />
      {screen === 'opening' && <OpeningScreen soundOn={soundOn} onSound={toggleSound} onStart={() => { unlockAudio(); setScreen('cake'); }} />}
      {screen === 'cake' && <CakeGame flavor={flavor} frosting={frosting} toppings={toppings} photoAdded={photoAdded} setFlavor={setFlavor} setFrosting={setFrosting} setToppings={setToppings} setPhotoAdded={setPhotoAdded} onBack={() => setScreen('opening')} onNext={nextFromCake} />}
      {screen === 'candles' && <CandleGame flavor={flavor} frosting={frosting} toppings={toppings} photoAdded={photoAdded} candles={candles} setCandles={setCandles} onBack={() => setScreen('cake')} onFinish={() => setScreen('moment')} />}
      {screen === 'moment' && <BirthdayMoment flavor={flavor} frosting={frosting} toppings={toppings} photoAdded={photoAdded} candles={candles} blown={blown} onBlow={() => setBlown(true)} onContinue={() => setScreen('message')} />}
      {screen === 'message' && <BirthdayMessage onContinue={() => setScreen('ending')} />}
      {screen === 'ending' && <FakeEnding onOpen={() => setScreen('surprise')} />}
      {screen === 'surprise' && <FinalSurprise onReveal={() => { setRewardTime(REWARD_DURATION); setRewardClosed(false); setScreen('reward'); }} />}
      {screen === 'reward' && <DanaReward time={rewardTime} closed={rewardClosed} onClose={() => setScreen('over')} />}
      {screen === 'over' && <GameOver onRestart={() => window.location.reload()} />}
    </main>
  );
}

function GameFrame({ children, eyebrow, title, subtitle, onBack }: { children: ReactNode; eyebrow?: string; title: string; subtitle?: string; onBack?: () => void }) {
  return <section className="screen page-screen">{onBack && <button className="back-button" onClick={onBack}><ChevronLeft size={18} /> Back</button>}<div className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{subtitle && <p className="subtitle">{subtitle}</p>}</div>{children}</section>;
}

function OpeningScreen({ soundOn, onSound, onStart }: { soundOn: boolean; onSound: () => void; onStart: () => void }) {
  return <section className="screen opening-screen"><button className="sound-toggle" onClick={onSound}>{soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />} SOUND {soundOn ? 'ON' : 'OFF'}</button><div className="now-playing"><Music size={13} /><span>Adella — Selamat Ulang Tahun</span></div><div className="opening-copy"><div className="mini-badge"><Star size={14} /> LEVEL 01 · SPECIAL EDITION</div><div className="hero-cake"><div className="hero-candle">🕯️</div><div className="hero-topper">🎉</div><div className="hero-frosting" /><div className="hero-tier hero-tier-top" /><div className="hero-tier hero-tier-bottom" /><div className="cake-plate" /></div><p className="eyebrow">A MINI BIRTHDAY ADVENTURE</p><h1>Birthday Cake<br /><span>Game</span></h1><p className="opening-subtitle">A little birthday surprise made just for Fairuz.</p><div className="player-card"><span>PLAYER DETECTED</span><strong>{PLAYER_NAME}</strong><div className="player-dots"><i /><i /><i /><i /></div></div><button className="primary-button start-button" onClick={onStart}><Play size={18} fill="currentColor" /> START GAME <ArrowRight size={18} /></button><p className="hint">Best played with a little imagination.</p></div><div className="opening-footer"><span>BUILD • DECORATE • CELEBRATE</span><span>2026 / FAIRUZ EDITION</span></div></section>;
}

function CakeGame({ flavor, frosting, toppings, photoAdded, setFlavor, setFrosting, setToppings, setPhotoAdded, onBack, onNext }: { flavor: Flavor | null; frosting: Frosting | null; toppings: Topping[]; photoAdded: boolean; setFlavor: (f: Flavor) => void; setFrosting: (f: Frosting) => void; setToppings: (t: Topping[]) => void; setPhotoAdded: (v: boolean) => void; onBack: () => void; onNext: () => void }) {
  const toggleTopping = (topping: Topping) => setToppings(toppings.includes(topping) ? toppings.filter((item) => item !== topping) : [...toppings, topping]);
  return <GameFrame eyebrow="LEVEL 01 · CAKE LAB" title="Make Fairuz's birthday cake" subtitle="Let's make your birthday cake!" onBack={onBack}><div className="cake-stage"><CakeVisual flavor={flavor} frosting={frosting} toppings={toppings} photoAdded={photoAdded} candles={0} /></div><div className="steps-panel"><Step number="01" title="Choose your cake" done={Boolean(flavor)}><div className="choice-grid">{flavors.map((item) => <button key={item.name} className={`choice-card ${flavor === item.name ? 'selected' : ''}`} onClick={() => setFlavor(item.name)}><span className="choice-icon">{item.icon}</span><span>{item.name}</span>{flavor === item.name && <Check size={16} />}</button>)}</div></Step><Step number="02" title="Choose your frosting" done={Boolean(frosting)} locked={!flavor}><div className="frosting-grid">{frostings.map((item) => <button key={item.name} className={`frosting-card ${frosting === item.name ? 'selected' : ''}`} onClick={() => setFrosting(item.name)}><span style={{ background: item.color }} />{item.name}</button>)}</div></Step><Step number="03" title="Add some toppings" done={toppings.length > 0} locked={!frosting}><div className="topping-grid">{(Object.keys(toppingIcons) as Topping[]).map((item) => <button key={item} className={`topping-card ${toppings.includes(item) ? 'selected' : ''}`} onClick={() => toggleTopping(item)}><span>{toppingIcons[item]}</span>{item}</button>)}</div></Step><Step number="04" title="Add Fairuz's topper" done={photoAdded} locked={toppings.length === 0}><button className={`photo-add-card ${photoAdded ? 'selected' : ''}`} onClick={() => setPhotoAdded(true)}><SmartImage src={FAIRUZ_PHOTO} alt="Fairuz" fallback="📸" /><span><strong>{photoAdded ? 'Fairuz’s cake topper added!' : 'Tap to add the photo topper'}</strong><small>{photoAdded ? 'Looking good! The cake is almost ready.' : 'A real photo, just for this cake.'}</small></span>{photoAdded ? <Check size={20} /> : <Gift size={20} />}</button></Step></div><button className="primary-button next-button" disabled={!(flavor && frosting && toppings.length && photoAdded)} onClick={onNext}>CONTINUE TO CANDLES <ArrowRight size={18} /></button></GameFrame>;
}

function Step({ number, title, done, locked, children }: { number: string; title: string; done: boolean; locked?: boolean; children: ReactNode }) { return <div className={`step ${locked ? 'locked' : ''}`}><div className="step-title"><span className={`step-number ${done ? 'complete' : ''}`}>{done ? <Check size={14} /> : number}</span><strong>{title}</strong>{done && <span className="done-label">DONE</span>}</div>{!locked && children}{locked && <p className="locked-note">Complete the step above to unlock this.</p>}</div>; }

function CakeVisual({ flavor, frosting, toppings, photoAdded, candles }: { flavor: Flavor | null; frosting: Frosting | null; toppings: Topping[]; photoAdded: boolean; candles: number }) {
  const baseColor = flavors.find((item) => item.name === flavor)?.color ?? '#dfb7a1';
  const frostingColor = frostings.find((item) => item.name === frosting)?.color ?? '#f7d5c9';
  return <div className="cake-visual"><div className="cake-shadow" />{photoAdded && <div className="photo-topper"><SmartImage src={FAIRUZ_PHOTO} alt="Fairuz cake topper" fallback="📸" className="topper-img" /></div>}{Array.from({ length: candles }).map((_, index) => <div className="candle" style={{ left: `${35 + index * 12}%` }} key={index}><b /><i /></div>)}<div className="cake-body" style={{ '--cake': baseColor, '--frosting': frostingColor } as CSSProperties}><div className="cake-drip" />{toppings.map((topping, index) => <span className="cake-topping" style={toppingPositions[index]} key={`${topping}-${index}`}>{toppingIcons[topping]}</span>)}</div><div className="cake-base" /></div>;
}

function SmartImage({ src, alt, fallback, className }: { src: string; alt: string; fallback: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className={`img-fallback ${className ?? ''}`}>{fallback}</div>;
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

function CandleGame({ flavor, frosting, toppings, photoAdded, candles, setCandles, onBack, onFinish }: { flavor: Flavor | null; frosting: Frosting | null; toppings: Topping[]; photoAdded: boolean; candles: number; setCandles: (n: number) => void; onBack: () => void; onFinish: () => void }) {
  return <GameFrame eyebrow="LEVEL 02 · FINAL TOUCH" title="One last thing..." subtitle="A birthday cake needs candles!" onBack={onBack}><div className="candle-stage"><CakeVisual flavor={flavor} frosting={frosting} toppings={toppings} photoAdded={photoAdded} candles={candles} /><button className="candle-tap" onClick={() => setCandles(candles >= 5 ? 0 : candles + 1)}><span>＋</span> TAP TO ADD CANDLE</button><p>{candles === 0 ? 'Give the cake a little glow.' : candles >= 5 ? 'Perfect! Tap to start over.' : `${candles} candle${candles > 1 ? 's' : ''} added — keep going!`}</p></div><div className={`ready-card ${candles >= 3 ? 'ready' : ''}`}><div className="ready-icon">{candles >= 3 ? <Check /> : <CakeSlice />}</div><div><strong>{candles >= 3 ? 'CAKE READY!' : 'BUILD YOUR CANDLE SET'}</strong><span>{candles >= 3 ? 'Your celebration is ready to begin.' : 'Add at least 3 candles to continue.'}</span></div></div><button className="primary-button next-button" disabled={candles < 3} onClick={onFinish}>FINISH CAKE <CakeSlice size={18} /></button></GameFrame>;
}

function BirthdayMoment({ flavor, frosting, toppings, photoAdded, candles, blown, onBlow, onContinue }: { flavor: Flavor | null; frosting: Frosting | null; toppings: Topping[]; photoAdded: boolean; candles: number; blown: boolean; onBlow: () => void; onContinue: () => void }) { return <GameFrame eyebrow="LEVEL 03 · WISH TIME" title="Happy Birthday, Fairuz!" subtitle={blown ? 'Wish complete!' : 'Make a wish...'}><div className={`moment-stage ${blown ? 'blown' : ''}`}><div className="confetti">🎂 🎉 🎈 🎁 🎂</div><CakeVisual flavor={flavor} frosting={frosting} toppings={toppings} photoAdded={photoAdded} candles={blown ? 0 : candles} />{!blown && <button className="blow-button" onClick={onBlow}><Wind size={19} /> TAP / HOLD TO BLOW</button>}{blown && <div className="wish-complete"><Check size={18} /> WISH COMPLETE!</div>}</div>{blown && <button className="primary-button next-button" onClick={onContinue}>OPEN YOUR BIRTHDAY MESSAGE <ArrowRight size={18} /></button>}</GameFrame>; }

function BirthdayMessage({ onContinue }: { onContinue: () => void }) { return <GameFrame eyebrow="A MESSAGE FOR YOU" title="HBD Fairuz!" subtitle="A little note from someone cheering you on."><article className="message-card"><div className="message-stamp">🎂</div><p><strong>HBD Fairuz!</strong></p><p>Semoga di umur yang baru ini kamu bisa menjadi manusia yang lebih baik, lebih jujur, lebih bisa mengontrol diri dengan baik, dan tentunya semakin berkembang menjadi versi terbaik dari dirimu.</p><p>Semoga semua hal baik yang sedang kamu usahakan bisa berjalan dengan lancar. Terutama untuk perjalanan studi lanjutan S2-nya, semoga nanti dilancarkan dari awal sampai akhir, dimudahkan setiap prosesnya, dan mendapatkan hasil yang terbaik.</p><p>Semoga tahun ini membawa lebih banyak pengalaman baru, kesempatan baru, pencapaian baru, dan tentunya banyak hal baik yang datang ke hidupmu.</p><p><strong>Once again, Happy Birthday, Fairuz! 🎂🎉</strong></p><div className="message-sign">— your birthday game crew</div></article><button className="primary-button next-button" onClick={onContinue}>CONTINUE <ArrowRight size={18} /></button></GameFrame>; }

function FakeEnding({ onOpen }: { onOpen: () => void }) { const [showMore, setShowMore] = useState(false); useEffect(() => { const timer = window.setTimeout(() => setShowMore(true), 1900); return () => window.clearTimeout(timer); }, []); return <GameFrame eyebrow="MISSION REPORT" title="Birthday complete!"><div className="stats-card"><div>🍰 <span>Cake: DONE</span><Check size={16} /></div><div>🕯️ <span>Candles: BLOWN</span><Check size={16} /></div><div>🎉 <span>Wish: MADE</span><Check size={16} /></div><div>🎂 <span>Birthday Message: UNLOCKED</span><Check size={16} /></div></div><div className={`wait-reveal ${showMore ? 'visible' : ''}`}><div className="gift-box"><div className="gift-ribbon" /><div className="gift-lid" /><div className="gift-body" /></div><p className="eyebrow">WAIT...</p><h2>Kayaknya masih ada satu hal lagi. 👀</h2><p>You haven't found the final surprise yet.</p><button className="primary-button next-button" onClick={onOpen}>🎁 OPEN FINAL SURPRISE</button></div></GameFrame>; }

function FinalSurprise({ onReveal }: { onReveal: () => void }) { return <GameFrame eyebrow="BONUS LEVEL UNLOCKED" title="Surprise, Fairuz!" subtitle="You found the final gift!"><div className="surprise-box"><div className="big-gift gift-box"><div className="gift-ribbon" /><div className="gift-lid" /><div className="gift-body" /></div><div className="sparkle-row">🎁 🎂 🎉 🎂 🎁</div><h2>One last little surprise</h2><p>Ready to open the secret gift?</p></div><button className="primary-button next-button" onClick={onReveal}>OPEN SECRET GIFT <Gift size={18} /></button></GameFrame>; }

function DanaReward({ time, closed, onClose }: { time: number; closed: boolean; onClose: () => void }) { return <GameFrame eyebrow="FINAL REVEAL" title={closed ? 'Gift closed' : 'Secret gift'} subtitle={closed ? 'Hope you got your surprise! 🎉' : 'The final surprise is yours.'}>{closed ? <div className="closed-card"><div className="lock-icon">🔒</div><h2>GIFT CLOSED</h2><p>The surprise window has ended.</p><button className="primary-button next-button" onClick={onClose}>SEE FINAL STATS <ArrowRight size={18} /></button></div> : <div className="reward-card"><div className="reward-top"><span className="eyebrow">📸 SCREENSHOT THIS!</span><span className="countdown">{time}</span></div><p className="reward-tip">Save this screen if you need to.</p><div className="qr-frame"><SmartImage src={DANA_QR} alt="Reward scan code" fallback="📱" /></div><h2>SCAN TO CLAIM YOUR GIFT</h2><p>Scan this code using your DANA app.</p><div className="reward-divider"><span>Or, if you prefer...</span></div><a className="primary-button link-button" href={DANA_LINK} target="_blank" rel="noreferrer">💰 CLAIM VIA DANA <ArrowRight size={18} /></a><p className="timer-note">This screen closes in {time} seconds.</p></div>}</GameFrame>; }

function GameOver({ onRestart }: { onRestart: () => void }) { return <GameFrame eyebrow="FINAL STATS" title="Birthday game complete!" subtitle="See you on the next level, Fairuz."><div className="game-over-card"><div className="over-badge"><Star size={22} fill="currentColor" /> FAIRUZ</div><div className="final-stats"><div><span>🍰</span><strong>Cake</strong><em>PERFECT</em></div><div><span>🕯️</span><strong>Candles</strong><em>BLOWN</em></div><div><span>🎉</span><strong>Birthday</strong><em>COMPLETE</em></div><div><span>🎁</span><strong>Secret Gift</strong><em>CLAIMED</em></div></div><div className="game-over-title"><span>🎮</span><h2>GAME OVER</h2><p>Happy Birthday once again! 🎂🎉</p></div></div><button className="secondary-button next-button" onClick={onRestart}><Play size={16} /> PLAY AGAIN</button></GameFrame>; }

export default App;
