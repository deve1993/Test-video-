import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';

export const FPS = 30;
export const TOTAL = 75; // seconds — always within the 90s limit

const GOLD = '#8B6B14';
const GOLD2 = '#B08D2E';
const IVORY = '#FBF6EA';
const INK = '#2B2416';
const CLIP_LEN = 5.04; // Kling clips are ~5.04s

const fontFace = `@font-face{font-family:"Bodoni";src:url("${staticFile('img/bodoni.woff2')}") format("woff2");font-weight:400 900;}`;
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const s = (sec: number) => Math.round(sec * FPS);

/** 0→1 between two times (seconds, absolute or local depending on caller). */
const prog = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// ---------------------------------------------------------------- timeline
type Shot = {from: number; to: number; src: string; offset?: number; zoom?: [number, number]};
const SHOTS: Shot[] = [
  {from: 0, to: 5.5, src: 'clips/milano.mp4', zoom: [1.0, 1.04]},
  // impact block — the speeding car with the numbers on top
  {from: 5.5, to: 9.5, src: 'clips/impatto_autostrada.mp4', zoom: [1.06, 1.0]},
  {from: 9.5, to: 13, src: 'clips/impatto_tunnel.mp4', zoom: [1.0, 1.06]},
  {from: 13, to: 16.5, src: 'clips/impatto_ruota.mp4', zoom: [1.05, 1.0]},
  {from: 16.5, to: 20.5, src: 'clips/impatto_costa.mp4', zoom: [1.0, 1.05]},
  {from: 20.5, to: 24, src: 'clips/lago.mp4', zoom: [1.05, 1.0]},
  {from: 24, to: 27, src: 'clips/impatto_tunnel.mp4', offset: 1.6, zoom: [1.08, 1.0]},
  // potential
  {from: 27, to: 32.5, src: 'clips/milano_aereo.mp4', zoom: [1.0, 1.05]},
  // product
  {from: 40, to: 45.5, src: 'clips/chiavi.mp4', zoom: [1.0, 1.04]},
  {from: 45.5, to: 51, src: 'clips/famiglia.mp4', zoom: [1.0, 1.04]},
  {from: 51, to: 56.5, src: 'clips/stretta.mp4', zoom: [1.0, 1.05]},
];
// ivory brand cards (graphics on warm white)
const CARDS: [number, number][] = [[32.5, 40], [56.5, 64], [64, TOTAL]];

const VO: [number, string][] = [
  [0.8, 'audio/vo1.mp3'],   // Il modo di vivere l'auto sta cambiando.
  [6.0, 'audio/vo2.mp3'],   // Nel 2025 ... massimo storico.
  [27.6, 'audio/vo3.mp3'],  // Eppure, su oltre 41 milioni di auto ...
  [35.2, 'audio/vo4.mp3'],  // Un mercato ancora quasi tutto da conquistare.
  [40.6, 'audio/vo5.mp3'],  // Canone mensile fisso ... pensieri della proprietà.
  [60.0, 'audio/vo6.mp3'],  // Dalla proprietà all'uso: è questo il cambiamento.
  [66.6, 'audio/vo8.mp3'],  // Rebirth.
];

// ---------------------------------------------------------------- pieces
const XF = 0.4; // crossfade length between contiguous shots (s)
const Shot: React.FC<{shot: Shot; lead: number; span: number; tailFade: boolean}> = ({shot, lead, span, tailFade}) => {
  const f = useCurrentFrame();
  const dur = span;
  const usable = CLIP_LEN - (shot.offset ?? 0) - 0.05;
  const rate = Math.min(1, usable / dur); // slow down only when the clip is shorter than the slot
  const t = f / FPS;
  const [z0, z1] = shot.zoom ?? [1, 1];
  const z = interpolate(t, [0, dur], [z0, z1]);
  const fin = shot.from === 0 ? prog(t, 0, 0.8) : prog(t, 0, Math.max(lead, 0.35));
  const fout = tailFade ? 1 - prog(t, dur - 0.35, dur) : 1;
  return (
    <AbsoluteFill style={{opacity: Math.min(fin, fout), overflow: 'hidden', backgroundColor: '#0d0b08'}}>
      <OffthreadVideo
        src={staticFile(shot.src)}
        startFrom={s(shot.offset ?? 0)}
        playbackRate={rate}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, filter: 'contrast(1.03) saturate(0.96)'}}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.38) 100%)'}} />
    </AbsoluteFill>
  );
};

const Card: React.FC<{dur: number; fadeOut: boolean}> = ({dur, fadeOut}) => {
  const t = useCurrentFrame() / FPS;
  const a = Math.min(prog(t, 0, 0.6), fadeOut ? 1 - prog(t, dur - 0.6, dur) : 1);
  return <AbsoluteFill style={{opacity: a, background: 'radial-gradient(ellipse 80% 75% at 50% 45%, #FCF9F2 0%, #F5EEDF 62%, #EBDFC4 100%)'}} />;
};

const GoldLines: React.FC<{start: number; opacity?: number}> = ({start, opacity = 0.75}) => {
  const t = useCurrentFrame() / FPS;
  const L = [[1920, 40, 980, 1080], [1920, 300, 1240, 1080], [1920, 620, 1500, 1080], [1460, 0, 1920, 520], [1180, 0, 1920, 860], [1920, 0, 700, 1080]];
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {L.map((l, i) => {
        const len = Math.hypot(l[2] - l[0], l[3] - l[1]);
        const d = prog(t, start + i * 0.12, start + 1.6 + i * 0.12);
        return <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke={i % 2 ? GOLD2 : '#C9AE63'} strokeWidth={1.5}
          strokeDasharray={len} strokeDashoffset={len * (1 - d)} opacity={opacity} />;
      })}
    </svg>
  );
};

/** Fade-up text helper (times relative to the parent Sequence). */
const Up: React.FC<{t0: number; t1?: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, t1, children, style}) => {
  const t = useCurrentFrame() / FPS;
  const k = prog(t, t0, t0 + 0.8);
  const out = t1 !== undefined ? 1 - prog(t, t1, t1 + 0.5) : 1;
  return <div style={{opacity: Math.min(k, out), transform: `translateY(${(1 - k) * 22}px)`, ...style}}>{children}</div>;
};

const fmt = (v: number, dec = 0) => {
  const [i, d] = v.toFixed(dec).split('.');
  const ii = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return d ? `${ii},${d}` : ii;
};

/** Big impact number with a fast count and a gentle scale settle. */
const BigNumber: React.FC<{dur: number; value?: number; dec?: number; text?: string; unit?: string; label: string}> = ({dur, value, dec = 0, text, unit, label}) => {
  const t = useCurrentFrame() / FPS;
  const inK = prog(t, 0.15, 0.9);
  const outK = 1 - prog(t, dur - 0.45, dur - 0.05);
  const counted = value !== undefined ? fmt(value * prog(t, 0.15, 1.6), dec) : text;
  const sc = interpolate(inK, [0, 1], [1.12, 1]);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'flex-start', paddingLeft: 140, paddingTop: 120, opacity: Math.min(inK, outK)}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 60% at 22% 26%, rgba(12,9,4,.62), rgba(12,9,4,.3) 55%, rgba(12,9,4,0) 85%)'}} />
      <div style={{position: 'relative', transform: `scale(${sc})`, transformOrigin: 'left center'}}>
        <div style={{fontFamily: 'Inter', fontWeight: 200, fontSize: 230, lineHeight: 1, color: '#F3DFA4', letterSpacing: '-0.02em', textShadow: '0 4px 40px rgba(0,0,0,.35)'}}>
          {counted}{unit && <span style={{fontSize: 96, fontWeight: 300, marginLeft: 18}}>{unit}</span>}
        </div>
        <div style={{width: 260 * prog(t, 0.5, 1.3), height: 2, background: `linear-gradient(90deg, ${GOLD2}, rgba(176,141,46,0))`, margin: '26px 0 22px'}} />
        <div style={{fontFamily: 'Bodoni', fontWeight: 600, fontSize: 34, letterSpacing: '0.36em', textTransform: 'uppercase', color: IVORY, textShadow: '0 2px 14px rgba(0,0,0,.5)'}}>{label}</div>
      </div>
    </AbsoluteFill>
  );
};

const LowerTitle: React.FC<{lines: string[]; kicker?: string; at?: number[]}> = ({lines, kicker, at = []}) => (
  <AbsoluteFill>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 520, background: 'linear-gradient(0deg, rgba(14,10,3,.78), rgba(14,10,3,.42) 45%, rgba(14,10,3,0))'}} />
    <div style={{position: 'absolute', left: 140, bottom: 120, color: IVORY, textShadow: '0 2px 20px rgba(0,0,0,.35)'}}>
      {kicker && <Up t0={0.2}><div style={{fontFamily: 'Bodoni', fontWeight: 600, fontSize: 26, letterSpacing: '0.42em', color: '#EBD49A', marginBottom: 18}}>{kicker}</div></Up>}
      {lines.map((l, i) => (
        <Up key={i} t0={at[i] ?? 0.4 + i * 0.9}><div style={{fontFamily: 'Bodoni', fontSize: 64, lineHeight: 1.22, fontWeight: 500}}>{l}</div></Up>
      ))}
    </div>
  </AbsoluteFill>
);

const MiniLogo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const a = Math.min(prog(t, 1.0, 2.0), 1 - prog(t, 63.4, 64)) * 0.9;
  return <Img src={staticFile('img/logo.png')} style={{position: 'absolute', right: 56, bottom: 46, width: 58, opacity: a}} />;
};

// ---------------------------------------------------------------- composition
export const Rebirth: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  // music: duck under the voice, fade at the end
  const VO_LEN: Record<string, number> = {'audio/vo1.mp3': 2.8, 'audio/vo2.mp3': 6.35, 'audio/vo3.mp3': 6.45, 'audio/vo4.mp3': 2.95, 'audio/vo5.mp3': 8.45, 'audio/vo6.mp3': 3.65, 'audio/vo8.mp3': 1.15};
  const musicVolume = (f: number) => {
    const tt = f / fps;
    const base = interpolate(tt, [0, 1.2, TOTAL - 4.5, TOTAL - 0.2], [0, 0.85, 0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    let duck = 1;
    for (const [at, src] of VO) {
      const end = at + VO_LEN[src];
      duck = Math.min(duck, interpolate(tt, [at - 0.4, at - 0.05, end + 0.1, end + 0.6], [1, 0.32, 0.32, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
    }
    return base * duck;
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#0d0b08', fontFamily: 'Inter'}}>
      <style>{fontFace}</style>

      {SHOTS.map((sh, i) => {
        const prevShot = i > 0 && Math.abs(SHOTS[i - 1].to - sh.from) < 1e-6;
        const nextShot = i < SHOTS.length - 1 && Math.abs(SHOTS[i + 1].from - sh.to) < 1e-6;
        const afterCard = CARDS.some(([, b]) => Math.abs(b - sh.from) < 1e-6);
        const beforeCard = CARDS.some(([a]) => Math.abs(a - sh.to) < 1e-6);
        const lead = prevShot ? XF : afterCard ? 0.6 : 0;
        const tail = beforeCard ? 0.7 : 0; // keep the shot underneath while the ivory card fades in
        return (
          <Sequence key={i} from={s(sh.from - lead)} durationInFrames={s(sh.to - sh.from + lead + tail)}>
            <Shot shot={sh} lead={afterCard ? 0.01 : lead} span={sh.to - sh.from + lead + tail} tailFade={!(nextShot || beforeCard)} />
          </Sequence>
        );
      })}
      {CARDS.map(([a, b], i) => (
        <Sequence key={'c' + i} from={s(a)} durationInFrames={s(b - a)}><Card dur={b - a} fadeOut={SHOTS.some((sh) => Math.abs(sh.from - b) < 1e-6)} /></Sequence>
      ))}

      {/* 1 · incipit (the teaser opening) */}
      <Sequence from={0} durationInFrames={s(5.5)}>
        <AbsoluteFill style={{opacity: 1 - prog(frame / fps, 5.0, 5.5)}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1400, height: 760, background: 'radial-gradient(ellipse 60% 55% at 28% 34%, rgba(24,15,3,.62), rgba(24,15,3,.28) 55%, rgba(24,15,3,0) 80%)'}} />
          <div style={{position: 'absolute', left: 140, top: 160, color: IVORY, textShadow: '0 2px 24px rgba(40,25,0,.45)'}}>
            <Up t0={0.6}><div style={{fontFamily: 'Bodoni', fontSize: 24, letterSpacing: '0.42em', color: '#F3E3B8', marginBottom: 22}}>REBIRTH · NOLEGGIO A LUNGO TERMINE</div></Up>
            <Up t0={0.9}><div style={{fontFamily: 'Bodoni', fontSize: 86, lineHeight: 1.08, fontWeight: 500}}>Il modo di vivere l’auto<br />sta cambiando.</div></Up>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* 2 · impact: speeding car + numbers */}
      <Sequence from={s(5.5)} durationInFrames={s(4)}><BigNumber dur={4} value={13} unit="MLD €" label="Fatturato NLT 2025" /></Sequence>
      <Sequence from={s(9.5)} durationInFrames={s(3.5)}><BigNumber dur={3.5} text="1 su 4" label="Auto nuove a noleggio" /></Sequence>
      <Sequence from={s(13)} durationInFrames={s(3.5)}><BigNumber dur={3.5} value={1.3} dec={1} unit="MLN" label="Veicoli in flotta" /></Sequence>
      <Sequence from={s(16.5)} durationInFrames={s(4)}><BigNumber dur={4} value={411660} label="Immatricolazioni · +10%" /></Sequence>
      <Sequence from={s(20.5)} durationInFrames={s(3.5)}><BigNumber dur={3.5} text="+31%" label="Settore noleggio in 3 anni" /></Sequence>
      <Sequence from={s(24)} durationInFrames={s(3)}><BigNumber dur={3} value={185000} label="Clienti privati · +4%" /></Sequence>
      <Sequence from={s(5.5)} durationInFrames={s(21.5)}>
        <AbsoluteFill>
          <div style={{position: 'absolute', left: 142, bottom: 60, fontSize: 16, letterSpacing: '0.22em', fontWeight: 600, color: 'rgba(251,246,234,.75)', opacity: Math.min(prog(frame / fps - 5.5, 0.5, 1.2), 1 - prog(frame / fps - 5.5, 21, 21.5))}}>FONTE: 25° RAPPORTO ANIASA</div>
        </AbsoluteFill>
      </Sequence>

      {/* 3 · potential */}
      <Sequence from={s(27)} durationInFrames={s(5.5)}>
        <LowerTitle kicker="IL POTENZIALE" lines={['41,3 milioni di auto in Italia']} at={[0.7]} />
      </Sequence>
      <Sequence from={s(32.5)} durationInFrames={s(7.5)}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
          <Up t0={0.5} t1={7}><div style={{fontFamily: 'Inter', fontWeight: 200, fontSize: 260, lineHeight: 1, color: GOLD}}>&lt; 1%</div></Up>
          <Up t0={1.0} t1={7}><div style={{fontFamily: 'Bodoni', fontSize: 28, letterSpacing: '0.42em', color: '#6E5410', marginTop: 26, paddingLeft: '0.42em'}}>DEI PRIVATI HA SCELTO IL NOLEGGIO</div></Up>
          <Up t0={2.8} t1={7}><div style={{fontFamily: 'Bodoni', fontSize: 56, color: INK, marginTop: 70}}>Un mercato ancora da conquistare.</div></Up>
        </AbsoluteFill>
      </Sequence>

      {/* 4 · product */}
      <Sequence from={s(40)} durationInFrames={s(5.5)}>
        <LowerTitle kicker="IL PRODOTTO" lines={['Un canone mensile fisso.']} at={[1.2]} />
      </Sequence>
      <Sequence from={s(45.5)} durationInFrames={s(5.5)}>
        <LowerTitle kicker="TUTTO COMPRESO" lines={['Assicurazione · Manutenzione', 'Assistenza · Servizi']} at={[0.3, 1.1]} />
      </Sequence>
      <Sequence from={s(51)} durationInFrames={s(5.5)}>
        <LowerTitle lines={['Senza i pensieri', 'della proprietà.']} at={[0.3, 0.9]} />
      </Sequence>

      {/* 5 · the change */}
      <Sequence from={s(56.5)} durationInFrames={s(7.5)}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
          <Up t0={0.6} t1={7}><div style={{fontFamily: 'Bodoni', fontSize: 86, color: INK}}>Non si compra più l’auto.</div></Up>
          <Up t0={1.8} t1={7}><div style={{fontFamily: 'Bodoni', fontSize: 86, color: GOLD, marginTop: 22}}>Si compra mobilità senza pensieri.</div></Up>
          <Up t0={3.4} t1={7}><div style={{width: 320, height: 1.5, margin: '56px auto 30px', background: `linear-gradient(90deg, transparent, ${GOLD2}, transparent)`}} /></Up>
          <Up t0={3.6} t1={7}><div style={{fontFamily: 'Bodoni', fontSize: 28, letterSpacing: '0.42em', color: '#6E5410', paddingLeft: '0.42em'}}>DALLA PROPRIETÀ ALL’USO</div></Up>
        </AbsoluteFill>
      </Sequence>

      {/* 6 · closing: only the crown and REBIRTH */}
      <Sequence from={s(64)} durationInFrames={s(TOTAL - 64)}>
        <GoldLines start={0.3} />
        <AbsoluteFill style={{alignItems: 'center'}}>
          <Up t0={0.5}><Img src={staticFile('img/logo.png')} style={{width: 300, marginTop: 250}} /></Up>
          <Up t0={1.4}><div style={{fontFamily: 'Inter', fontWeight: 600, fontSize: 116, letterSpacing: `${0.5 - 0.12 * prog(frame / fps - 64, 2, 3.6)}em`, paddingLeft: '0.4em', color: GOLD, marginTop: 40}}>REBIRTH</div></Up>
        </AbsoluteFill>
      </Sequence>

      <MiniLogo />

      {/* audio */}
      <Audio src={staticFile('audio/music_master.mp3')} volume={musicVolume} />
      {VO.map(([at, src]) => (
        <Sequence key={src} from={s(at)}><Audio src={staticFile(src)} volume={1} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
