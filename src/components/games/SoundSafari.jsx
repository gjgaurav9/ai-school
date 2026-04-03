import { useState, useEffect, useCallback, useRef } from 'react';
import Guddu from '../common/Guddu';
import Celebration from '../common/Celebration';
import GameShell from '../common/GameShell';
import ParentTip from '../common/ParentTip';
import { useVoice } from '../../hooks/useVoice';
import { useSound } from '../../hooks/useSound';
import soundsData from '../../data/sounds.json';

// ---------------------------------------------------------------------------
// Inline SVG illustrations (140x140 inside circular frames)
// ---------------------------------------------------------------------------
const AnimalSVGs = {
  cow: (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {/* Body */}
      <ellipse cx="70" cy="85" rx="38" ry="28" fill="#8B5E3C" />
      {/* White patches */}
      <ellipse cx="58" cy="80" rx="14" ry="10" fill="#FFF5E6" />
      <ellipse cx="82" cy="90" rx="10" ry="8" fill="#FFF5E6" />
      {/* Legs */}
      <rect x="42" y="105" width="10" height="20" rx="4" fill="#6B4226" />
      <rect x="58" y="107" width="10" height="18" rx="4" fill="#6B4226" />
      <rect x="74" y="107" width="10" height="18" rx="4" fill="#6B4226" />
      <rect x="88" y="105" width="10" height="20" rx="4" fill="#6B4226" />
      {/* Head */}
      <ellipse cx="70" cy="48" rx="22" ry="18" fill="#8B5E3C" />
      {/* Muzzle */}
      <ellipse cx="70" cy="56" rx="14" ry="9" fill="#D4A574" />
      {/* Nostrils */}
      <circle cx="65" cy="56" r="2" fill="#5C3A1E" />
      <circle cx="75" cy="56" r="2" fill="#5C3A1E" />
      {/* Eyes */}
      <circle cx="60" cy="44" r="3.5" fill="white" />
      <circle cx="60" cy="44" r="2" fill="#333" />
      <circle cx="80" cy="44" r="3.5" fill="white" />
      <circle cx="80" cy="44" r="2" fill="#333" />
      {/* Horns */}
      <path d="M52 36 Q48 22 55 28" fill="none" stroke="#D4A574" strokeWidth="3" strokeLinecap="round" />
      <path d="M88 36 Q92 22 85 28" fill="none" stroke="#D4A574" strokeWidth="3" strokeLinecap="round" />
      {/* Ears */}
      <ellipse cx="48" cy="40" rx="8" ry="5" fill="#8B5E3C" transform="rotate(-20 48 40)" />
      <ellipse cx="92" cy="40" rx="8" ry="5" fill="#8B5E3C" transform="rotate(20 92 40)" />
      {/* Tail */}
      <path d="M108 80 Q120 70 115 60" fill="none" stroke="#6B4226" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="115" cy="59" r="3" fill="#8B5E3C" />
    </svg>
  ),
  dog: (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {/* Body */}
      <ellipse cx="70" cy="88" rx="35" ry="24" fill="#C68642" />
      {/* Legs */}
      <rect x="44" y="105" width="10" height="20" rx="4" fill="#A0522D" />
      <rect x="58" y="107" width="10" height="18" rx="4" fill="#A0522D" />
      <rect x="74" y="107" width="10" height="18" rx="4" fill="#A0522D" />
      <rect x="86" y="105" width="10" height="20" rx="4" fill="#A0522D" />
      {/* Head */}
      <circle cx="70" cy="48" r="22" fill="#C68642" />
      {/* Muzzle */}
      <ellipse cx="70" cy="56" rx="12" ry="8" fill="#DEB887" />
      {/* Nose */}
      <ellipse cx="70" cy="52" rx="5" ry="3.5" fill="#333" />
      {/* Eyes */}
      <circle cx="60" cy="42" r="4" fill="white" />
      <circle cx="60" cy="42" r="2.5" fill="#333" />
      <circle cx="80" cy="42" r="4" fill="white" />
      <circle cx="80" cy="42" r="2.5" fill="#333" />
      {/* Floppy ears */}
      <ellipse cx="46" cy="44" rx="10" ry="16" fill="#A0522D" transform="rotate(-10 46 44)" />
      <ellipse cx="94" cy="44" rx="10" ry="16" fill="#A0522D" transform="rotate(10 94 44)" />
      {/* Mouth */}
      <path d="M65 58 Q70 63 75 58" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      {/* Tongue */}
      <ellipse cx="70" cy="63" rx="4" ry="5" fill="#FF6B8A" />
      {/* Tail */}
      <path d="M105 82 Q118 68 112 58" fill="none" stroke="#A0522D" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  cat: (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {/* Body */}
      <ellipse cx="70" cy="90" rx="30" ry="24" fill="#F4A460" />
      {/* Legs */}
      <rect x="48" y="108" width="9" height="18" rx="4" fill="#E8943A" />
      <rect x="62" y="109" width="9" height="17" rx="4" fill="#E8943A" />
      <rect x="76" y="109" width="9" height="17" rx="4" fill="#E8943A" />
      <rect x="86" y="108" width="9" height="18" rx="4" fill="#E8943A" />
      {/* Head */}
      <circle cx="70" cy="50" r="22" fill="#F4A460" />
      {/* Ears (pointed) */}
      <polygon points="50,35 42,14 58,30" fill="#F4A460" />
      <polygon points="52,33 46,18 56,30" fill="#FFB6C1" />
      <polygon points="90,35 98,14 82,30" fill="#F4A460" />
      <polygon points="88,33 94,18 84,30" fill="#FFB6C1" />
      {/* Eyes */}
      <ellipse cx="60" cy="46" rx="5" ry="5.5" fill="#90EE90" />
      <ellipse cx="60" cy="46" rx="2" ry="5" fill="#333" />
      <ellipse cx="80" cy="46" rx="5" ry="5.5" fill="#90EE90" />
      <ellipse cx="80" cy="46" rx="2" ry="5" fill="#333" />
      {/* Nose */}
      <polygon points="70,52 67,56 73,56" fill="#FF8C8C" />
      {/* Mouth */}
      <path d="M67 57 Q70 60 73 57" fill="none" stroke="#333" strokeWidth="1.2" />
      {/* Whiskers */}
      <line x1="30" y1="52" x2="56" y2="54" stroke="#888" strokeWidth="1" />
      <line x1="30" y1="57" x2="56" y2="56" stroke="#888" strokeWidth="1" />
      <line x1="84" y1="54" x2="110" y2="52" stroke="#888" strokeWidth="1" />
      <line x1="84" y1="56" x2="110" y2="57" stroke="#888" strokeWidth="1" />
      {/* Tail */}
      <path d="M100 88 Q120 70 115 50" fill="none" stroke="#E8943A" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  sparrow: (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {/* Body */}
      <ellipse cx="70" cy="80" rx="28" ry="20" fill="#A0785A" />
      {/* Belly */}
      <ellipse cx="70" cy="85" rx="18" ry="14" fill="#DEB887" />
      {/* Head */}
      <circle cx="70" cy="52" r="18" fill="#8B6E4E" />
      {/* Eye */}
      <circle cx="78" cy="48" r="4" fill="white" />
      <circle cx="79" cy="48" r="2" fill="#333" />
      {/* Beak */}
      <polygon points="88,52 100,50 88,55" fill="#F4A460" />
      {/* Wing */}
      <ellipse cx="55" cy="75" rx="20" ry="12" fill="#7B5B3A" transform="rotate(-10 55 75)" />
      <ellipse cx="55" cy="75" rx="15" ry="8" fill="#8B6E4E" transform="rotate(-10 55 75)" />
      {/* Tail feathers */}
      <polygon points="42,82 28,72 30,88" fill="#7B5B3A" />
      <polygon points="42,85 26,80 30,92" fill="#8B6E4E" />
      {/* Legs */}
      <line x1="62" y1="98" x2="60" y2="118" stroke="#D4A574" strokeWidth="2" />
      <line x1="78" y1="98" x2="80" y2="118" stroke="#D4A574" strokeWidth="2" />
      {/* Feet */}
      <path d="M55 118 L60 118 L65 118" fill="none" stroke="#D4A574" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M75 118 L80 118 L85 118" fill="none" stroke="#D4A574" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  fish: (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {/* Body */}
      <ellipse cx="70" cy="70" rx="35" ry="22" fill="#5DADE2" />
      {/* Tail */}
      <polygon points="34,70 15,52 15,88" fill="#3498DB" />
      {/* Dorsal fin */}
      <path d="M60 48 Q70 30 80 48" fill="#3498DB" />
      {/* Belly */}
      <ellipse cx="72" cy="76" rx="24" ry="10" fill="#85C1E9" />
      {/* Eye */}
      <circle cx="88" cy="65" r="6" fill="white" />
      <circle cx="90" cy="65" r="3" fill="#333" />
      {/* Mouth */}
      <path d="M104 72 Q108 70 104 68" fill="none" stroke="#2471A3" strokeWidth="2" strokeLinecap="round" />
      {/* Scales */}
      <path d="M55 65 Q60 60 65 65" fill="none" stroke="#3498DB" strokeWidth="1" />
      <path d="M65 65 Q70 60 75 65" fill="none" stroke="#3498DB" strokeWidth="1" />
      <path d="M60 75 Q65 70 70 75" fill="none" stroke="#3498DB" strokeWidth="1" />
      {/* Bubbles */}
      <circle cx="112" cy="58" r="3" fill="none" stroke="#AED6F1" strokeWidth="1" />
      <circle cx="118" cy="50" r="2" fill="none" stroke="#AED6F1" strokeWidth="1" />
    </svg>
  ),
  elephant: (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {/* Body */}
      <ellipse cx="70" cy="82" rx="36" ry="28" fill="#9E9E9E" />
      {/* Legs */}
      <rect x="42" y="103" width="12" height="22" rx="5" fill="#8E8E8E" />
      <rect x="58" y="105" width="12" height="20" rx="5" fill="#8E8E8E" />
      <rect x="72" y="105" width="12" height="20" rx="5" fill="#8E8E8E" />
      <rect x="86" y="103" width="12" height="22" rx="5" fill="#8E8E8E" />
      {/* Head */}
      <circle cx="70" cy="44" r="24" fill="#BDBDBD" />
      {/* Ears */}
      <ellipse cx="42" cy="40" rx="14" ry="18" fill="#BDBDBD" />
      <ellipse cx="42" cy="40" rx="9" ry="12" fill="#E8A0BF" />
      <ellipse cx="98" cy="40" rx="14" ry="18" fill="#BDBDBD" />
      <ellipse cx="98" cy="40" rx="9" ry="12" fill="#E8A0BF" />
      {/* Eyes */}
      <circle cx="60" cy="38" r="3.5" fill="white" />
      <circle cx="60" cy="38" r="2" fill="#333" />
      <circle cx="80" cy="38" r="3.5" fill="white" />
      <circle cx="80" cy="38" r="2" fill="#333" />
      {/* Trunk */}
      <path d="M70 55 Q72 70 65 82 Q62 88 68 90" fill="none" stroke="#9E9E9E" strokeWidth="7" strokeLinecap="round" />
      {/* Tail */}
      <path d="M106 78 Q115 70 112 62" fill="none" stroke="#8E8E8E" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  rain: (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {/* Cloud */}
      <ellipse cx="70" cy="42" rx="36" ry="18" fill="#B0BEC5" />
      <ellipse cx="48" cy="45" rx="22" ry="16" fill="#B0BEC5" />
      <ellipse cx="92" cy="45" rx="22" ry="16" fill="#B0BEC5" />
      <ellipse cx="70" cy="50" rx="40" ry="14" fill="#90A4AE" />
      {/* Rain drops */}
      <line x1="40" y1="68" x2="38" y2="82" stroke="#64B5F6" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="52" y1="72" x2="50" y2="86" stroke="#64B5F6" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="64" y1="68" x2="62" y2="82" stroke="#64B5F6" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="76" y1="74" x2="74" y2="88" stroke="#64B5F6" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="88" y1="68" x2="86" y2="82" stroke="#64B5F6" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="100" y1="72" x2="98" y2="86" stroke="#64B5F6" strokeWidth="2.5" strokeLinecap="round" />
      {/* More drops */}
      <line x1="46" y1="90" x2="44" y2="104" stroke="#64B5F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="58" y1="94" x2="56" y2="108" stroke="#64B5F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="90" x2="68" y2="104" stroke="#64B5F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="82" y1="94" x2="80" y2="108" stroke="#64B5F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="94" y1="90" x2="92" y2="104" stroke="#64B5F6" strokeWidth="2" strokeLinecap="round" />
      {/* Splashes on ground */}
      <path d="M36 118 Q38 114 40 118" fill="none" stroke="#64B5F6" strokeWidth="1.5" />
      <path d="M66 120 Q68 116 70 120" fill="none" stroke="#64B5F6" strokeWidth="1.5" />
      <path d="M96 118 Q98 114 100 118" fill="none" stroke="#64B5F6" strokeWidth="1.5" />
    </svg>
  ),
  drum: (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {/* Drum body */}
      <ellipse cx="70" cy="100" rx="38" ry="10" fill="#8B4513" />
      <rect x="32" y="50" width="76" height="50" fill="#CD853F" />
      <ellipse cx="70" cy="50" rx="38" ry="10" fill="#DEB887" />
      {/* Drum decorations */}
      <rect x="32" y="62" width="76" height="4" fill="#8B4513" />
      <rect x="32" y="78" width="76" height="4" fill="#8B4513" />
      {/* Zigzag pattern */}
      <path d="M36 68 L44 74 L52 68 L60 74 L68 68 L76 74 L84 68 L92 74 L100 68 L104 72"
        fill="none" stroke="#8B4513" strokeWidth="1.5" />
      {/* Drum sticks */}
      <line x1="30" y1="30" x2="58" y2="50" stroke="#A0522D" strokeWidth="3" strokeLinecap="round" />
      <circle cx="28" cy="28" r="4" fill="#DEB887" />
      <line x1="110" y1="30" x2="82" y2="50" stroke="#A0522D" strokeWidth="3" strokeLinecap="round" />
      <circle cx="112" cy="28" r="4" fill="#DEB887" />
      {/* Top membrane shine */}
      <ellipse cx="62" cy="47" rx="12" ry="4" fill="rgba(255,255,255,0.2)" />
    </svg>
  ),
  river: (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {/* Sky */}
      <rect x="0" y="0" width="140" height="60" fill="#87CEEB" />
      {/* Banks */}
      <rect x="0" y="55" width="35" height="85" fill="#90A955" rx="4" />
      <rect x="105" y="55" width="35" height="85" fill="#90A955" rx="4" />
      {/* River water */}
      <rect x="30" y="55" width="80" height="85" fill="#4FC3F7" />
      {/* Waves */}
      <path d="M30 70 Q45 65 55 70 Q65 75 75 70 Q85 65 95 70 Q105 75 110 70"
        fill="none" stroke="#29B6F6" strokeWidth="2" />
      <path d="M30 85 Q42 80 52 85 Q62 90 72 85 Q82 80 92 85 Q102 90 110 85"
        fill="none" stroke="#29B6F6" strokeWidth="2" />
      <path d="M30 100 Q45 95 55 100 Q65 105 75 100 Q85 95 95 100 Q105 105 110 100"
        fill="none" stroke="#29B6F6" strokeWidth="2" />
      <path d="M30 115 Q42 110 52 115 Q62 120 72 115 Q82 110 92 115 Q102 120 110 115"
        fill="none" stroke="#29B6F6" strokeWidth="2" />
      {/* Small rocks */}
      <ellipse cx="18" cy="90" rx="6" ry="3" fill="#78866B" />
      <ellipse cx="125" cy="80" rx="5" ry="3" fill="#78866B" />
      {/* Grass tufts */}
      <path d="M10 70 Q12 60 14 70" fill="none" stroke="#558B2F" strokeWidth="1.5" />
      <path d="M120 68 Q122 58 124 68" fill="none" stroke="#558B2F" strokeWidth="1.5" />
    </svg>
  ),
  lion: (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {/* Mane */}
      <circle cx="70" cy="50" r="32" fill="#E8943A" />
      {/* Mane spikes */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x = 70 + 34 * Math.cos(rad);
        const y = 50 + 34 * Math.sin(rad);
        return <circle key={angle} cx={x} cy={y} r="8" fill="#D4782A" />;
      })}
      {/* Body */}
      <ellipse cx="70" cy="90" rx="30" ry="22" fill="#F4A460" />
      {/* Head */}
      <circle cx="70" cy="50" r="22" fill="#F4A460" />
      {/* Ears */}
      <circle cx="52" cy="32" r="7" fill="#F4A460" />
      <circle cx="52" cy="32" r="4" fill="#E8943A" />
      <circle cx="88" cy="32" r="7" fill="#F4A460" />
      <circle cx="88" cy="32" r="4" fill="#E8943A" />
      {/* Eyes */}
      <circle cx="60" cy="46" r="4" fill="white" />
      <circle cx="60" cy="46" r="2.5" fill="#333" />
      <circle cx="80" cy="46" r="4" fill="white" />
      <circle cx="80" cy="46" r="2.5" fill="#333" />
      {/* Nose */}
      <ellipse cx="70" cy="55" rx="5" ry="3.5" fill="#A0522D" />
      {/* Mouth */}
      <path d="M65 58 Q70 63 75 58" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      {/* Legs */}
      <rect x="48" y="106" width="10" height="18" rx="4" fill="#E8943A" />
      <rect x="62" y="107" width="10" height="17" rx="4" fill="#E8943A" />
      <rect x="76" y="107" width="10" height="17" rx="4" fill="#E8943A" />
      <rect x="86" y="106" width="10" height="18" rx="4" fill="#E8943A" />
      {/* Tail */}
      <path d="M100 86 Q118 76 114 64" fill="none" stroke="#E8943A" strokeWidth="3" strokeLinecap="round" />
      <circle cx="114" cy="62" r="4" fill="#D4782A" />
    </svg>
  ),
  thunder: (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {/* Dark cloud */}
      <ellipse cx="70" cy="38" rx="40" ry="20" fill="#546E7A" />
      <ellipse cx="45" cy="42" rx="24" ry="18" fill="#546E7A" />
      <ellipse cx="95" cy="42" rx="24" ry="18" fill="#546E7A" />
      <ellipse cx="70" cy="48" rx="44" ry="16" fill="#455A64" />
      {/* Lightning bolt */}
      <polygon points="75,55 60,80 72,80 55,115 90,75 75,75 88,55"
        fill="#FFD54F" stroke="#FFC107" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Lightning glow */}
      <polygon points="75,55 60,80 72,80 55,115 90,75 75,75 88,55"
        fill="#FFD54F" opacity="0.3" transform="scale(1.08) translate(-2.8 -3)" />
      {/* Rain streaks */}
      <line x1="30" y1="60" x2="28" y2="72" stroke="#78909C" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="42" y1="62" x2="40" y2="74" stroke="#78909C" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="100" y1="60" x2="98" y2="72" stroke="#78909C" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="112" y1="62" x2="110" y2="74" stroke="#78909C" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

// Display labels for each option
const LABELS = {
  cow: { en: 'Cow', hi: 'गाय' },
  dog: { en: 'Dog', hi: 'कुत्ता' },
  cat: { en: 'Cat', hi: 'बिल्ली' },
  sparrow: { en: 'Sparrow', hi: 'चिड़िया' },
  fish: { en: 'Fish', hi: 'मछली' },
  elephant: { en: 'Elephant', hi: 'हाथी' },
  rain: { en: 'Rain', hi: 'बारिश' },
  drum: { en: 'Drum', hi: 'ढोल' },
  river: { en: 'River', hi: 'नदी' },
  lion: { en: 'Lion', hi: 'शेर' },
  thunder: { en: 'Thunder', hi: 'बादल गरज' },
};

// Sound synthesis now lives in useSound hook (hooks/useSound.js)

// ---------------------------------------------------------------------------
// Jungle background with tree silhouettes
// ---------------------------------------------------------------------------
function JungleBG() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Gradient sky */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #1B5E20 0%, #2E7D32 30%, #388E3C 60%, #1B3A1B 100%)',
        }}
      />
      {/* Tree silhouettes */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 430 180" preserveAspectRatio="none">
        {/* Back trees */}
        <polygon points="0,180 20,60 40,180" fill="#1B3A1B" opacity="0.6" />
        <polygon points="50,180 80,40 110,180" fill="#1B3A1B" opacity="0.5" />
        <polygon points="120,180 145,50 170,180" fill="#1B3A1B" opacity="0.6" />
        <polygon points="200,180 230,30 260,180" fill="#1B3A1B" opacity="0.5" />
        <polygon points="280,180 305,55 330,180" fill="#1B3A1B" opacity="0.6" />
        <polygon points="350,180 380,45 410,180" fill="#1B3A1B" opacity="0.5" />
        {/* Front trees */}
        <polygon points="30,180 55,70 80,180" fill="#0D2B0D" opacity="0.7" />
        <polygon points="160,180 190,50 220,180" fill="#0D2B0D" opacity="0.7" />
        <polygon points="310,180 340,60 370,180" fill="#0D2B0D" opacity="0.7" />
        {/* Ground */}
        <rect x="0" y="155" width="430" height="25" fill="#1A3A1A" />
        {/* Grass tufts */}
        <path d="M15 155 Q18 140 21 155" fill="none" stroke="#2E7D32" strokeWidth="2" />
        <path d="M85 155 Q88 142 91 155" fill="none" stroke="#2E7D32" strokeWidth="2" />
        <path d="M145 155 Q148 138 151 155" fill="none" stroke="#2E7D32" strokeWidth="2" />
        <path d="M250 155 Q253 140 256 155" fill="none" stroke="#2E7D32" strokeWidth="2" />
        <path d="M390 155 Q393 142 396 155" fill="none" stroke="#2E7D32" strokeWidth="2" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Speaker / play-sound button with pulse + ripple
// ---------------------------------------------------------------------------
function SpeakerButton({ onClick, isPlaying }) {
  return (
    <button
      onClick={onClick}
      className="relative w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
      style={{
        animation: isPlaying ? 'pulse-glow 1.2s infinite' : 'none',
      }}
      aria-label="Play sound"
    >
      {/* Ripple rings when playing */}
      {isPlaying && (
        <>
          <span
            className="absolute inset-0 rounded-full border-2 border-[#FFCB05] opacity-0"
            style={{ animation: 'ripple 1.5s ease-out infinite' }}
          />
          <span
            className="absolute inset-0 rounded-full border-2 border-[#FFCB05] opacity-0"
            style={{ animation: 'ripple 1.5s ease-out infinite 0.5s' }}
          />
        </>
      )}
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path
          d="M11 5L6 9H2v6h4l5 4V5z"
          fill="#FFCB05"
          stroke="#E6B800"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M15.54 8.46a5 5 0 0 1 0 7.07"
          stroke="#FFCB05"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M19.07 4.93a10 10 0 0 1 0 14.14"
          stroke="#FFCB05"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Option card — animal / nature / object in a circular frame
// ---------------------------------------------------------------------------
function OptionCard({ name, language, onClick, state, disabled }) {
  const svg = AnimalSVGs[name];
  const label = LABELS[name]?.[language] || name;

  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const isHighlighted = state === 'highlight';

  let ringColor = 'border-white/60';
  let bgColor = 'bg-white/20';
  if (isCorrect) {
    ringColor = 'border-green-400';
    bgColor = 'bg-green-100/80';
  } else if (isWrong) {
    ringColor = 'border-orange-300';
    bgColor = 'bg-orange-50/60';
  } else if (isHighlighted) {
    ringColor = 'border-green-400';
    bgColor = 'bg-green-100/60';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1.5 transition-all duration-300
        ${disabled && !isCorrect && !isHighlighted ? 'opacity-50 pointer-events-none' : ''}
      `}
      style={{
        animation: isCorrect ? 'dance 0.6s ease-in-out' : 'none',
      }}
    >
      <div
        className={`w-[90px] h-[90px] sm:w-[100px] sm:h-[100px] rounded-full ${bgColor} ${ringColor}
          border-[3px] flex items-center justify-center overflow-hidden shadow-md
          transition-all duration-300 active:scale-95`}
      >
        <div
          className="w-[80px] h-[80px] sm:w-[88px] sm:h-[88px] flex items-center justify-center"
          style={{ transform: isCorrect ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.3s' }}
        >
          {svg || <span className="text-3xl">?</span>}
        </div>
      </div>
      <span className="text-xs sm:text-sm font-bold text-white drop-shadow-md">{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Explorer hat overlay for Guddu during intro
// ---------------------------------------------------------------------------
function ExplorerGuddu({ size = 120 }) {
  return (
    <div className="relative inline-block">
      <Guddu emotion="happy" size={size} animate />
      {/* Explorer hat */}
      <svg
        className="absolute"
        style={{ top: -4, left: '50%', transform: 'translateX(-50%)' }}
        width={size * 0.6}
        height={size * 0.3}
        viewBox="0 0 60 30"
      >
        <ellipse cx="30" cy="26" rx="30" ry="5" fill="#8B6914" />
        <rect x="12" y="10" width="36" height="16" rx="4" fill="#A0782C" />
        <rect x="10" y="22" width="40" height="6" rx="2" fill="#8B6914" />
      </svg>
      {/* Binoculars hint */}
      <svg
        className="absolute"
        style={{ bottom: size * 0.18, right: -6 }}
        width="28"
        height="20"
        viewBox="0 0 28 20"
      >
        <circle cx="8" cy="10" r="7" fill="none" stroke="#333" strokeWidth="2.5" />
        <circle cx="20" cy="10" r="7" fill="none" stroke="#333" strokeWidth="2.5" />
        <line x1="14" y1="10" x2="14" y2="10" stroke="#333" strokeWidth="3" strokeLinecap="round" />
        <circle cx="8" cy="10" r="4" fill="#5DADE2" opacity="0.35" />
        <circle cx="20" cy="10" r="4" fill="#5DADE2" opacity="0.35" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Animal parade for celebration
// ---------------------------------------------------------------------------
function AnimalParade({ animals, language }) {
  return (
    <div className="flex items-end gap-3 overflow-x-auto px-4 py-2 no-scrollbar">
      {animals.map((name, i) => (
        <div
          key={name}
          className="flex-shrink-0 flex flex-col items-center"
          style={{
            animation: `parade-bounce 0.8s ease-in-out infinite ${i * 0.15}s`,
          }}
        >
          <div className="w-16 h-16 flex items-center justify-center">
            {AnimalSVGs[name]}
          </div>
          <span className="text-[10px] font-bold text-white/80 mt-0.5">
            {LABELS[name]?.[language] || name}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main SoundSafari component
// ---------------------------------------------------------------------------
const TOTAL_ROUNDS = 5;

export default function SoundSafari({ onComplete, onBack, language = 'en', childName = '' }) {
  const { speak, stop } = useVoice(language);
  const { success, celebrate, gentle, tap, playCowMoo, playBirdChirp, playRainDrops, playDogBark, playThunder } = useSound();

  const playSynth = useCallback((soundId) => {
    switch (soundId) {
      case 'cow_moo': playCowMoo(); break;
      case 'bird_chirp': playBirdChirp(); break;
      case 'rain_drops': playRainDrops(); break;
      case 'dog_bark': playDogBark(); break;
      case 'thunder': playThunder(); break;
      default: break;
    }
  }, [playCowMoo, playBirdChirp, playRainDrops, playDogBark, playThunder]);

  const [phase, setPhase] = useState('intro'); // intro | playing | feedback | celebration
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [optionStates, setOptionStates] = useState({}); // { optionName: 'correct'|'wrong'|'highlight' }
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFact, setShowFact] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [foundAnimals, setFoundAnimals] = useState([]);

  const timerRef = useRef(null);

  const currentRound = soundsData[round] || soundsData[0];

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stop]);

  // --- Intro phase ---
  useEffect(() => {
    if (phase === 'intro') {
      speak(
        childName
          ? `${childName}, let's go on a Sound Safari! Listen carefully and find the animal!`
          : "Let's go on a Sound Safari! Listen carefully and find the animal!",
        childName
          ? `${childName}, चलो Sound Safari पर चलते हैं! ध्यान से सुनो और जानवर ढूंढो!`
          : "चलो Sound Safari पर चलते हैं! ध्यान से सुनो और जानवर ढूंढो!",
      );
    }
  }, [phase, speak, childName]);

  // --- Auto-play sound when entering a new round ---
  useEffect(() => {
    if (phase === 'playing') {
      const t = setTimeout(() => {
        handlePlaySound();
        speak(
          childName ? `${childName}, who made that sound?` : 'Who made that sound?',
          childName ? `${childName}, यह आवाज़ किसकी है?` : 'यह आवाज़ किसकी है?',
        );
      }, 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round]);

  // --- Play the synthesised sound ---
  const handlePlaySound = useCallback(() => {
    setIsPlaying(true);
    playSynth(currentRound.sound);
    // Reset playing state after sound duration
    const durMap = { thunder: 2500, cow_moo: 2000, rain_drops: 2500, dog_bark: 1200, bird_chirp: 1000 };
    const dur = durMap[currentRound.sound] || 1000;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsPlaying(false), dur);
  }, [playSynth, currentRound]);

  // --- Start game from intro ---
  const handleStart = useCallback(() => {
    stop();
    tap();
    setPhase('playing');
  }, [stop, tap]);

  // --- Handle option selection ---
  const handleSelect = useCallback(
    (optionName) => {
      if (selected) return; // already answered
      setSelected(optionName);
      tap();

      if (optionName === currentRound.correct) {
        // Correct!
        success();
        setOptionStates({ [optionName]: 'correct' });
        setFoundAnimals((prev) => [...prev, currentRound.correct]);
        setPhase('feedback');
        setShowFact(true);

        const fact = language === 'hi' ? currentRound.fact_hi : currentRound.fact_en;
        const prefix = childName ? `Yes ${childName}! That's right! ` : '';
        const prefixHi = childName ? `हाँ ${childName}! बिल्कुल सही! ` : '';
        setTimeout(() => speak(prefix + fact, prefixHi + currentRound.fact_hi), 300);

        // Auto-advance after showing fact
        timerRef.current = setTimeout(() => {
          if (round + 1 < TOTAL_ROUNDS) {
            setRound((r) => r + 1);
            setSelected(null);
            setOptionStates({});
            setShowFact(false);
            setPhase('playing');
          } else {
            setPhase('celebration');
          }
        }, 4500);
      } else {
        // Incorrect
        gentle();
        setOptionStates({
          [optionName]: 'wrong',
          [currentRound.correct]: 'highlight',
        });

        speak(
          childName ? `Not quite, ${childName}. Let's listen again!` : "Let's listen again!",
          childName ? `${childName}, चलो फिर से सुनते हैं!` : 'चलो फिर से सुनते हैं!',
        );

        // Replay sound and reset after delay
        timerRef.current = setTimeout(() => {
          handlePlaySound();
        }, 1500);

        // Allow retry after correction feedback
        setTimeout(() => {
          setSelected(null);
          setOptionStates({});
        }, 3000);
      }
    },
    [selected, currentRound, round, language, success, gentle, speak, tap, handlePlaySound, childName],
  );

  // --- Celebration phase ---
  useEffect(() => {
    if (phase === 'celebration') {
      celebrate();
      setShowCelebration(true);
      speak(
        childName
          ? `${childName}, you found all the sounds! Amazing explorer!`
          : 'You found all the sounds! Amazing explorer!',
        childName
          ? `${childName}, तुमने सारी आवाज़ें ढूंढ लीं! शाबाश!`
          : 'तुमने सारी आवाज़ें ढूंढ लीं! शाबाश!',
      );

      // Play each animal's sound in sequence for the parade
      foundAnimals.forEach((animal, i) => {
        const soundEntry = soundsData.find((s) => s.correct === animal);
        if (soundEntry) {
          setTimeout(() => playSynth(soundEntry.sound), 1200 + i * 800);
        }
      });

      timerRef.current = setTimeout(() => {
        if (onComplete) onComplete();
      }, 8000);
    }
  }, [phase, celebrate, speak, foundAnimals, playSynth, onComplete, childName]);

  // =========================================================================
  // Render
  // =========================================================================

  // --- INTRO ---
  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={language === 'hi' ? 'साउंड सफ़ारी' : 'Sound Safari'} bg="bg-transparent">
        <div className="relative flex-1 flex flex-col">
          <JungleBG />
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
            <ExplorerGuddu size={140} />

            <div className="bg-white/90 rounded-2xl px-5 py-4 shadow-lg max-w-xs">
              <p className="text-base font-bold text-gray-700 leading-snug">
                {language === 'hi'
                  ? `${childName ? `${childName}, ` : ''}चलो Sound Safari पर चलते हैं! ध्यान से सुनो और जानवर ढूंढो!`
                  : `${childName ? `${childName}, l` : 'L'}et's go on a Sound Safari! Listen carefully and find the animal!`}
              </p>
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-4 rounded-2xl bg-[#FFCB05] text-gray-800 font-bold text-lg shadow-lg
                active:scale-95 transition-transform animate-pulse-glow"
            >
              {language === 'hi' ? 'शुरू करो!' : "Let's Go!"}
            </button>
          </div>
        </div>
      </GameShell>
    );
  }

  // --- CELEBRATION ---
  if (phase === 'celebration') {
    return (
      <GameShell onBack={onBack} title={language === 'hi' ? 'साउंड सफ़ारी' : 'Sound Safari'} bg="bg-transparent">
        <div className="relative flex-1 flex flex-col">
          <JungleBG />
          <Celebration active={showCelebration} type="confetti" />
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 gap-4">
            <Guddu emotion="celebrating" size={120} animate />

            <div className="bg-white/90 rounded-2xl px-5 py-4 shadow-lg max-w-xs text-center">
              <p className="text-lg font-bold text-gray-700">
                {language === 'hi'
                  ? `${childName ? `${childName}, ` : ''}तुमने सारी आवाज़ें ढूंढ लीं!`
                  : `${childName ? `${childName}, y` : 'Y'}ou found all the sounds!`}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {language === 'hi'
                  ? `शाबाश${childName ? ` ${childName}` : ''}, छोटे खोजकर्ता!`
                  : `Amazing explorer${childName ? `, ${childName}` : ''}!`}
              </p>
            </div>

            <AnimalParade animals={foundAnimals} language={language} />

            <ParentTip
              language={language}
              tipEn="Go on a real sound safari! Walk around your home or park and ask: 'What can you hear?' This builds listening skills crucial for language and empathy."
              tipHi="असली साउंड सफ़ारी पर जाएं! अपने घर या पार्क में घूमें और पूछें: 'तुम्हें क्या सुनाई दे रहा है?' इससे सुनने की क्षमता बढ़ती है जो भाषा और सहानुभूति के लिए ज़रूरी है।"
            />
          </div>
        </div>
      </GameShell>
    );
  }

  // --- PLAYING / FEEDBACK ---
  const fact = language === 'hi' ? currentRound.fact_hi : currentRound.fact_en;

  return (
    <GameShell
      onBack={onBack}
      title={language === 'hi' ? 'साउंड सफ़ारी' : 'Sound Safari'}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      bg="bg-transparent"
    >
      <div className="relative flex-1 flex flex-col">
        <JungleBG />

        <div className="relative z-10 flex-1 flex flex-col items-center px-4 pt-2 pb-4 gap-4">
          {/* Guddu — small, in the corner */}
          <div className="self-start">
            <Guddu
              emotion={showFact ? 'happy' : 'surprised'}
              size={64}
              animate
            />
          </div>

          {/* Prompt text */}
          <div className="bg-white/85 rounded-xl px-4 py-2.5 shadow text-center max-w-xs">
            <p className="text-sm font-bold text-gray-700">
              {showFact
                ? fact
                : language === 'hi'
                  ? 'यह आवाज़ किसकी है?'
                  : 'Who made that sound?'}
            </p>
          </div>

          {/* Speaker button */}
          <SpeakerButton onClick={handlePlaySound} isPlaying={isPlaying} />

          {/* Options */}
          <div className="flex justify-center gap-5 flex-wrap mt-auto mb-4">
            {currentRound.options.map((opt) => (
              <OptionCard
                key={opt}
                name={opt}
                language={language}
                state={optionStates[opt] || null}
                disabled={!!selected && optionStates[opt] !== 'correct' && optionStates[opt] !== 'highlight'}
                onClick={() => handleSelect(opt)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Inject component-scoped keyframes */}
      <style>{`
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes dance {
          0% { transform: scale(1) rotate(0deg); }
          20% { transform: scale(1.2) rotate(-8deg); }
          40% { transform: scale(1.15) rotate(8deg); }
          60% { transform: scale(1.2) rotate(-5deg); }
          80% { transform: scale(1.15) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes parade-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </GameShell>
  );
}
