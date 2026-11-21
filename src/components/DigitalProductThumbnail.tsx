'use client';

import React from 'react';
import { BRAND_LOGOS, type BrandLogoAsset } from '@/lib/brand-logos';
import { ProductItem } from '@/lib/products';
import { Sparkles, ShieldCheck } from 'lucide-react';

// =========================================================================
// Real Official Scalable Brand Vector Logos for Digital Products & Apps
// =========================================================================

export function SteamLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
    </svg>
  );
}

export function PlayStationLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8.984 2.596v17.547l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.18.76.814.76 1.505v5.875c2.441 1.193 4.362-.002 4.362-3.152 0-3.237-1.126-4.675-4.438-5.827-1.307-.448-3.728-1.186-5.39-1.502zm4.656 16.241l6.296-2.275c.715-.258.826-.625.246-.818-.586-.192-1.637-.139-2.357.123l-4.205 1.5V14.98l.24-.085s1.201-.42 2.913-.615c1.696-.18 3.785.03 5.437.661 1.848.601 2.04 1.472 1.576 2.072-.465.6-1.622 1.036-1.622 1.036l-8.544 3.107V18.86zM1.807 18.6c-1.9-.545-2.214-1.668-1.352-2.32.801-.586 2.16-1.052 2.16-1.052l5.615-2.013v2.313L4.205 17c-.705.271-.825.632-.239.826.586.195 1.637.15 2.343-.12L8.247 17v2.074c-.12.03-.256.044-.39.073-1.939.331-3.996.196-6.038-.479z" />
    </svg>
  );
}

export function NintendoLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 36" fill="none" className={className}>
      <rect x="2" y="2" width="96" height="32" rx="16" stroke="#E60012" strokeWidth="3.5" />
      <text x="50" y="23" fill="#E60012" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
        Nintendo
      </text>
    </svg>
  );
}

export function AmazonLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 603 182" fill="none" className={className}>
      <path d="M 348.49744,20.06598 V 6.38079 c 0,-2.07113 1.57301,-3.46062 3.46062,-3.46062 h 61.26875 c 1.96628,0 3.53929,1.41571 3.53929,3.46062 v 11.71893 c -0.0262,1.96626 -1.67788,4.53551 -4.61418,8.59912 l -31.74859,45.32893 c 11.79759,-0.28837 24.25059,1.46814 34.94706,7.49802 2.41195,1.36327 3.06737,3.35575 3.25089,5.32203 V 99.4506 c 0,1.99248 -2.20222,4.32576 -4.5093,3.1198 -18.84992,-9.88376 -43.887,-10.95865 -64.72939,0.10487 -2.12356,1.15354 -4.35199,-1.15354 -4.35199,-3.14602 V 85.66054 c 0,-2.22843 0.0262,-6.02989 2.25463,-9.41186 l 36.78224,-52.74829 h -32.01076 c -1.96626,0 -3.53927,-1.38948 -3.53927,-3.43441" fill="#141920" />
      <path d="m 124.99883,105.45424 h -18.64017 c -1.78273,-0.13107 -3.19845,-1.46813 -3.32954,-3.17224 V 6.61676 c 0,-1.91383 1.59923,-3.43442 3.59171,-3.43442 h 17.38176 c 1.80898,0.0786 3.25089,1.46814 3.38199,3.19845 v 12.50545 h 0.34082 c 4.53551,-12.08598 13.05597,-17.7226 24.53896,-17.7226 11.66649,0 18.95477,5.63662 24.19814,17.7226 4.5093,-12.08598 14.76008,-17.7226 25.74495,-17.7226 7.81262,0 16.35931,3.22467 21.57646,10.46052 5.89879,8.04857 4.69281,19.74128 4.69281,29.99208 l -0.0262,60.37739 c 0,1.91383 -1.59923,3.46061 -3.59171,3.46061 h -18.61397 c -1.86138,-0.13107 -3.35574,-1.62543 -3.35574,-3.46061 V 51.29025 c 0,-4.03739 0.36702,-14.10466 -0.52434,-17.93233 -1.38949,-6.42311 -5.55797,-8.23209 -10.95865,-8.23209 -4.5093,0 -9.22833,3.01494 -11.14216,7.83885 -1.91383,4.8239 -1.73031,12.89867 -1.73031,18.32557 v 50.70338 c 0,1.91383 -1.59923,3.46061 -3.59171,3.46061 h -18.61395 c -1.88761,-0.13107 -3.35576,-1.62543 -3.35576,-3.46061 L 152.946,51.29025 c 0,-10.67025 1.75651,-26.37415 -11.48298,-26.37415 -13.39682,0 -12.87248,15.31063 -12.87248,26.37415 v 50.70338 c 0,1.91383 -1.59923,3.46061 -3.59171,3.46061" fill="#141920" />
      <path d="m 469.51439,1.16364 c 27.65877,0 42.62858,23.75246 42.62858,53.95427 0,29.17934 -16.54284,52.32881 -42.62858,52.32881 -27.16066,0 -41.94697,-23.75246 -41.94697,-53.35127 0,-29.78234 14.96983,-52.93181 41.94697,-52.93181 m 0.15729,19.53156 c -13.73761,0 -14.60278,18.71881 -14.60278,30.38532 0,11.69271 -0.18352,36.65114 14.44549,36.65114 14.44548,0 15.12712,-20.13452 15.12712,-32.40403 0,-8.07477 -0.34082,-17.72257 -2.779,-25.3779 -2.09735,-6.65906 -6.26581,-9.25453 -12.19083,-9.25453" fill="#141920" />
      <path d="M 548.00762,105.45424 H 529.4461 c -1.86141,-0.13107 -3.35577,-1.62543 -3.35577,-3.46061 l -0.0262,-95.69149 c 0.1573,-1.75653 1.7041,-3.1198 3.59171,-3.1198 h 17.27691 c 1.62543,0.0786 2.96249,1.17976 3.32954,2.67412 v 14.62899 h 0.3408 c 5.21717,-13.0822 12.53165,-19.32181 25.40412,-19.32181 8.36317,0 16.51662,3.01494 21.75999,11.27324 4.87633,7.65532 4.87633,20.5278 4.87633,29.78233 v 60.22011 c -0.20973,1.67786 -1.75653,3.01492 -3.59169,3.01492 h -18.69262 c -1.70411,-0.13107 -3.11982,-1.38948 -3.30332,-3.01492 V 50.47753 c 0,-10.46052 1.20597,-25.77117 -11.66651,-25.77117 -4.5355,0 -8.70399,3.04117 -10.77512,7.65532 -2.62167,5.84637 -2.96249,11.66651 -2.96249,18.11585 v 51.5161 c -0.0262,1.91383 -1.65166,3.46061 -3.64414,3.46061" fill="#141920" />
      <path d="M 55.288261,59.75829 V 55.7209 c -13.475471,0 -27.711211,2.88385 -27.711211,18.77125 0,8.04857 4.16847,13.50169 11.32567,13.50169 5.24337,0 9.93618,-3.22467 12.8987,-8.46805 3.670341,-6.44935 3.486841,-12.50544 3.486841,-19.7675 m 18.79747,45.43378 c -1.23219,1.10111 -3.01495,1.17976 -4.40444,0.4457 -6.18716,-5.1385 -7.28828,-7.52423 -10.69647,-12.42678 -10.224571,10.4343 -17.460401,13.55409 -30.726141,13.55409 -15.67768,0 -27.89471,-9.67401 -27.89471,-29.04824 0,-15.12713 8.20587,-25.43035 19.87236,-30.46398 10.1197,-4.45688 24.25058,-5.24337 35.051931,-6.47556 v -2.41195 c 0,-4.43066 0.34082,-9.67403 -2.25465,-13.50167 -2.280881,-3.43442 -6.632861,-4.85013 -10.460531,-4.85013 -7.10475,0 -13.44924,3.64414 -14.99603,11.19459 -0.31461,1.67789 -1.5468,3.32955 -3.22467,3.4082 L 6.26276,32.67628 C 4.74218,32.33548 3.0643,31.10327 3.48377,28.76999 7.65225,6.85271 27.44596,0.24605 45.16856,0.24605 c 9.071011,0 20.921021,2.41195 28.078221,9.28076 9.07104,8.46804 8.20587,19.7675 8.20587,32.06321 v 29.04826 c 0,8.73022 3.61794,12.55786 7.02613,17.27691 1.20597,1.67786 1.46814,3.69656 -0.05244,4.95497 -3.80144,3.17225 -10.56538,9.07104 -14.28819,12.37436 l -0.05242,-0.0525" fill="#141920" />
      <g transform="translate(244.36719)">
        <path d="M 55.288261,59.75829 V 55.7209 c -13.475471,0 -27.711211,2.88385 -27.711211,18.77125 0,8.04857 4.16847,13.50169 11.32567,13.50169 5.24337,0 9.93618,-3.22467 12.8987,-8.46805 3.670341,-6.44935 3.486841,-12.50544 3.486841,-19.7675 m 18.79747,45.43378 c -1.23219,1.10111 -3.01495,1.17976 -4.40444,0.4457 -6.18716,-5.1385 -7.28828,-7.52423 -10.69647,-12.42678 -10.224571,10.4343 -17.460401,13.55409 -30.726141,13.55409 -15.67768,0 -27.89471,-9.67401 -27.89471,-29.04824 0,-15.12713 8.20587,-25.43035 19.87236,-30.46398 10.1197,-4.45688 24.25058,-5.24337 35.051931,-6.47556 v -2.41195 c 0,-4.43066 0.34082,-9.67403 -2.25465,-13.50167 -2.280881,-3.43442 -6.632861,-4.85013 -10.460531,-4.85013 -7.10475,0 -13.44924,3.64414 -14.99603,11.19459 -0.31461,1.67789 -1.5468,3.32955 -3.22467,3.4082 L 6.26276,32.67628 C 4.74218,32.33548 3.0643,31.10327 3.48377,28.76999 7.65225,6.85271 27.44596,0.24605 45.16856,0.24605 c 9.071011,0 20.921021,2.41195 28.078221,9.28076 9.07104,8.46804 8.20587,19.7675 8.20587,32.06321 v 29.04826 c 0,8.73022 3.61794,12.55786 7.02613,17.27691 1.20597,1.67786 1.46814,3.69656 -0.05244,4.95497 -3.80144,3.17225 -10.56538,9.07104 -14.28819,12.37436 l -0.05242,-0.0525" fill="#141920" />
      </g>
      <path d="m 374.00642,142.18404 c -34.99948,25.79739 -85.72909,39.56123 -129.40634,39.56123 -61.24255,0 -116.37656,-22.65135 -158.08757,-60.32496 -3.2771,-2.96252 -0.34083,-6.9999 3.59171,-4.69283 45.01431,26.19064 100.67269,41.94697 158.16623,41.94697 38.774689,0 81.4295,-8.02237 120.6499,-24.67006 5.92501,-2.51683 10.87999,3.88009 5.08607,8.17965" fill="#ff9900" />
      <path d="m 388.55678,125.53635 c -4.45688,-5.71527 -29.57261,-2.70033 -40.84585,-1.36327 -3.43442,0.41947 -3.95874,-2.56925 -0.86517,-4.71905 20.00346,-14.07844 52.82696,-10.01483 56.65462,-5.2958 3.82764,4.74526 -0.99624,37.64741 -19.79373,53.35128 -2.88385,2.41195 -5.63662,1.12734 -4.35198,-2.07113 4.2209,-10.53917 13.68519,-34.16054 9.20211,-39.90203" fill="#ff9900" />
    </svg>
  );
}

export function AppleLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.56.65-.96 1.71-.83 2.73 1 .08 2.03-.51 2.53-1.23z" />
    </svg>
  );
}

export function AppleMusicLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FA233B] to-[#FB5C74] flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
        <svg viewBox="0 0 24 24" fill="#FFFFFF" className="w-4 h-4">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      </div>
      <div className="flex items-center gap-1 text-black">
        <AppleLogo className="w-5 h-5 text-black" />
        <span className="font-sans font-semibold text-lg text-black tracking-tight">Music</span>
      </div>
    </div>
  );
}

export function PrimeVideoLogo({ className = 'h-6 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="relative flex flex-col items-center">
        <div className="flex items-baseline">
          <span className="font-sans font-black text-xl text-[#00A8E1] tracking-tight">prime</span>
          <span className="font-sans font-bold text-lg text-zinc-900 ml-1 tracking-tight">video</span>
        </div>
        <svg viewBox="0 0 100 24" fill="none" className="w-16 h-3 -mt-1 text-[#00A8E1]">
          <path
            d="M 5 6 C 30 18 70 18 95 6"
            stroke="#00A8E1"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path d="M 90 4 L 97 6 L 93 11 Z" fill="#00A8E1" />
        </svg>
      </div>
    </div>
  );
}

export function FortniteLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" fill="#111111" className="w-6 h-6 shrink-0">
        <path d="m15.767 14.171.097-5.05H12.4V5.197h3.99L16.872 0H7.128v24l5.271-.985V14.17z" />
      </svg>
      <span className="font-sans font-black text-xl tracking-wider text-black italic uppercase font-stretch-condensed">
        FORTNITE
      </span>
    </div>
  );
}

export function ClashOfClansLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#F59E0B] to-[#B45309] border border-amber-300 p-0.5 shadow-sm flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" fill="#FFFFFF" className="w-5 h-5">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v4.66c0 3.79-2.55 7.34-6 8.35-3.45-1.01-6-4.56-6-8.35V6.43l6-2.25zM11 7v5.59l-2.29-2.3-1.42 1.42L11 15.41V17h2v-1.59l3.71-3.7-1.42-1.42L13 12.59V7h-2z" />
        </svg>
      </div>
      <span className="font-sans font-black text-sm tracking-tight text-amber-950 uppercase">
        CLASH <span className="text-zinc-500 font-bold text-xs">OF</span> CLANS
      </span>
    </div>
  );
}

export function ClashRoyaleLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] border border-blue-300 flex items-center justify-center shadow-sm shrink-0">
        <svg viewBox="0 0 24 24" fill="#FBBF24" className="w-5 h-5">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z" />
        </svg>
      </div>
      <span className="font-sans font-black text-sm tracking-tight text-blue-950 uppercase">
        CLASH ROYALE
      </span>
    </div>
  );
}

export function BrawlStarsLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-7 h-7 rounded-full bg-[#FACC15] border-2 border-black flex items-center justify-center shadow-sm shrink-0">
        <svg viewBox="0 0 24 24" fill="#000000" className="w-4 h-4">
          <path d="M12 2l2.6 6.3 6.8.5-5.2 4.4 1.6 6.6L12 16.3l-5.8 3.5 1.6-6.6L2.6 8.8l6.8-.5L12 2zm-2 9a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2zm-2 4c1.1 0 2-.4 2-1h-4c0 .6.9 1 2 1z" />
        </svg>
      </div>
      <span className="font-sans font-black text-sm tracking-tight text-amber-950 uppercase">
        BRAWL STARS
      </span>
    </div>
  );
}

export function FreeFireLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF512F] to-[#DD2476] flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
        <svg viewBox="0 0 24 24" fill="#FFFFFF" className="w-4 h-4">
          <path d="M12 23c-4.97 0-9-4.03-9-9 0-4.12 3.28-7.79 5.6-9.87.58-.52 1.48-.12 1.48.66v2.17c0 .48.33.89.8.97 2.19.38 4.25-1.02 4.79-3.14.09-.37.49-.6.85-.49 2.5 1.69 4.48 4.75 4.48 8.7 0 4.97-4.03 9-9 9zm0-15.5c-2.12 2.05-4 4.54-4 6.5 0 2.21 1.79 4 4 4s4-1.79 4-4c0-1.75-1.58-4.03-4-6.5z" />
        </svg>
      </div>
      <span className="font-sans font-black text-lg tracking-wider text-black italic uppercase">
        FREE FIRE
      </span>
    </div>
  );
}

export function PubgMobileLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-black border border-amber-500/40 flex items-center justify-center shadow-sm shrink-0">
        <svg viewBox="0 0 24 24" fill="#F59E0B" className="w-4 h-4">
          <path d="M12 2C6.48 2 2 6.48 2 12v3c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4v-3c0-5.52-4.48-10-10-10zm-6 9h12v3H6v-3z" />
        </svg>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-sans font-black text-lg tracking-tight text-black">PUBG</span>
        <span className="font-sans font-bold text-xs tracking-wider text-amber-600 uppercase">MOBILE</span>
      </div>
    </div>
  );
}

export function LeagueOfLegendsLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" fill="#C28F2C" className="w-6 h-6 shrink-0">
        <path d="m1.912 0 1.212 2.474v19.053L1.912 24h14.73l1.337-4.682H8.33V0ZM12 1.516c-.913 0-1.798.112-2.648.312v1.74a9.738 9.738 0 0 1 2.648-.368c5.267 0 9.536 4.184 9.536 9.348a9.203 9.203 0 0 1-2.3 6.086l-.273.954-.602 2.112c2.952-1.993 4.89-5.335 4.89-9.122C23.25 6.468 18.213 1.516 12 1.516Zm0 2.673c-.808 0-1.595.076-2.348.217v1.815a7.859 7.859 0 0 1 2.348-.362c4.321 0 7.822 3.435 7.822 7.674 0 2.222-.94 4.227-2.453 5.67l-.462 1.62h-3.691l-.872 3.053h7.683c1.233-1.636 1.968-3.666 1.968-5.867 0-5.32-4.403-9.638-9.832-9.638Z" />
      </svg>
      <span className="font-sans font-black text-sm tracking-wider text-[#A87922] uppercase">
        LEAGUE <span className="text-xs font-bold text-zinc-500">OF</span> LEGENDS
      </span>
    </div>
  );
}

export function AmongUsLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0">
        <rect x="3" y="10" width="5" height="12" rx="2.5" fill="#B91C1C" stroke="#000" strokeWidth="1.5" />
        <path d="M8 12c0-5 3-8 8-8s8 3 8 8v10c0 1-1 2-2 2h-1c-1 0-1-1-1-2v-3h-4v3c0 1 0 2-1 2H9c-1 0-1-1-1-2V12z" fill="#DC2626" stroke="#000" strokeWidth="1.5" />
        <rect x="13" y="8" width="11" height="7" rx="3.5" fill="#38BDF8" stroke="#000" strokeWidth="1.5" />
        <ellipse cx="16" cy="10" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.8" />
      </svg>
      <span className="font-sans font-black text-lg tracking-wider text-black uppercase">
        AMONG US
      </span>
    </div>
  );
}

export function MinecraftLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 16 16" className="w-6 h-6 shrink-0 rounded-xs shadow-xs">
        <rect width="16" height="16" fill="#4AA532" />
        <rect x="2" y="3" width="4" height="4" fill="#1C1C1C" />
        <rect x="10" y="3" width="4" height="4" fill="#1C1C1C" />
        <rect x="5" y="7" width="6" height="6" fill="#1C1C1C" />
        <rect x="4" y="9" width="1" height="6" fill="#1C1C1C" />
        <rect x="11" y="9" width="1" height="6" fill="#1C1C1C" />
      </svg>
      <span className="font-mono font-black text-base tracking-widest text-[#2E7D32] uppercase">
        MINECRAFT
      </span>
    </div>
  );
}

export function CanvaLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00C4CC] via-[#7D2AE8] to-[#FF5757] flex items-center justify-center shadow-sm shrink-0">
        <svg viewBox="0 0 24 24" fill="#FFFFFF" className="w-4 h-4">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12s12-5.373 12-12S18.627 0 12 0m-.39 18.5c-2.95 0-4.86-2.21-4.86-5.56c0-4.32 2.99-7.45 6.36-7.45c2.04 0 3.25 1.03 3.25 2.42s-1.04 2.46-1.93 2.46c-.22 0-.33-.11-.33-.29c0-.4.64-1 .64-2.13c0-.95-.58-1.55-1.53-1.55c-2.04 0-4.36 2.41-4.36 6.58c0 2.46 1.22 4.24 3.19 4.24c1.67 0 2.9-1.12 3.32-2.92c.07-.31.33-.48.62-.43c.31.06.48.33.43.64c-.5 2.12-2.14 3.69-4.37 3.69Z" />
        </svg>
      </div>
      <span className="font-serif italic font-bold text-xl text-[#00C4CC] tracking-tight">
        Canva
      </span>
    </div>
  );
}

export function CapCutLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center shadow-sm shrink-0">
        <svg viewBox="0 0 24 24" fill="#FFFFFF" className="w-4 h-4">
          <path d="M4 6h16l-8 5-8-5zm0 12h16l-8-5-8 5z" />
        </svg>
      </div>
      <span className="font-sans font-black text-lg text-black tracking-tight">
        CapCut
      </span>
    </div>
  );
}

export function TikTokLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" fill="#000000" className="w-6 h-6 shrink-0">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.5.18-1.92 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
      <span className="font-sans font-bold text-lg text-black tracking-tight">
        TikTok
      </span>
    </div>
  );
}

export function DisneyPlusLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="font-serif italic font-black text-xl text-[#0B1E64] tracking-tight">
        Disney
      </span>
      <span className="font-sans font-black text-2xl text-[#113CCF] leading-none -mt-1">
        +
      </span>
    </div>
  );
}

export function HboMaxLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" fill="#002BE7" className="w-7 h-5 shrink-0">
        <path d="M7.042 16.896H4.414v-3.754H2.708v3.754H.01L0 7.22h2.708v3.6h1.706v-3.6h2.628zm12.043.046C21.795 16.94 24 14.689 24 11.978a4.89 4.89 0 0 0-4.915-4.92c-2.707-.002-4.09 1.991-4.432 2.795.003-1.026.002-2.633.002-2.633h-2.66v9.646h2.66v-3.79c0-1.57.99-2.52 2.308-2.52 1.353 0 2.215.996 2.215 2.45v3.86zm-8.835-.046V7.22h2.66v9.676z" />
      </svg>
      <span className="font-sans font-black text-xl text-[#002BE7] tracking-tighter">
        max
      </span>
    </div>
  );
}

export function ParamountPlusLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="w-6 h-6 rounded-full bg-[#0064FF] flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" fill="#FFFFFF" className="w-3.5 h-3.5">
          <path d="M12 2L4 18h16L12 2zm0 4.5l4.5 9h-9l4.5-9z" />
        </svg>
      </div>
      <span className="font-serif italic font-bold text-lg text-[#0064FF] tracking-tight">
        Paramount<span className="font-sans font-black text-xl not-italic text-[#0064FF]">+</span>
      </span>
    </div>
  );
}

export function PokemonGoLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-6 h-6 rounded-full border-2 border-black relative overflow-hidden bg-white shrink-0">
        <div className="absolute top-0 inset-x-0 h-1/2 bg-[#EE1515]" />
        <div className="absolute inset-x-0 top-1/2 -mt-0.5 h-1 bg-black" />
        <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-white border-2 border-black" />
      </div>
      <div className="flex items-baseline">
        <span className="font-sans font-bold text-base text-zinc-900">Pokémon</span>
        <span className="font-sans font-black text-base text-[#3B82F6] ml-1">GO</span>
      </div>
    </div>
  );
}

export function StumbleGuysLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00B4D8] to-[#90E0EF] flex items-center justify-center shadow-sm shrink-0">
        <svg viewBox="0 0 24 24" fill="#FFB703" className="w-4 h-4">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
      <span className="font-sans font-black text-base text-sky-900 tracking-tight uppercase">
        STUMBLE GUYS
      </span>
    </div>
  );
}

export function GooglePlayLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M3.6 1.8L13.8 12 3.6 22.2c-.4-.4-.6-1-.6-1.7V3.5c0-.7.2-1.3.6-1.7z" fill="#00E5FF" />
      <path d="M17.2 8.6L13.8 12l3.4 3.4 3.9-2.2c1.1-.6 1.1-1.7 0-2.4l-3.9-2.2z" fill="#FFD600" />
      <path d="M3.6 22.2l10.2-10.2 3.4 3.4-11.8 6.7c-.7.4-1.4.3-1.8.1z" fill="#FF3D00" />
      <path d="M3.6 1.8c.4-.2 1.1-.3 1.8.1l11.8 6.7-3.4 3.4L3.6 1.8z" fill="#00E676" />
    </svg>
  );
}

export function RobloxLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.926 23.998 0 18.892 5.075.002 24 5.108ZM15.348 10.09l-5.282-1.453-1.414 5.273 5.282 1.453z" />
    </svg>
  );
}

export function RiotGamesLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.458.86 0 7.093l3.353 12.761 2.552-.313-.701-8.024.838-.373 1.447 8.202 4.361-.535-.775-8.857.83-.37 1.591 9.025 4.412-.542-.849-9.708.84-.374 1.74 9.87L24 17.318V3.5Zm.316 19.356.222 1.256L24 23.14v-4.18l-10.22 1.256Z" />
    </svg>
  );
}

export function ValorantLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.792 2.152a.252.252 0 0 0-.098.083c-3.384 4.23-6.769 8.46-10.15 12.69-.107.093-.025.288.119.265 2.439.003 4.877 0 7.316.001a.66.66 0 0 0 .552-.25c.774-.967 1.55-1.934 2.324-2.903a.72.72 0 0 0 .144-.49c-.002-3.077 0-6.153-.003-9.23.016-.11-.1-.206-.204-.167zM.077 2.166c-.077.038-.074.132-.076.205.002 3.074.001 6.15.001 9.225a.679.679 0 0 0 .158.463l7.64 9.55c.12.152.308.25.505.247 2.455 0 4.91.003 7.365 0 .142.02.222-.174.116-.265C10.661 15.176 5.526 8.766.4 2.35c-.08-.094-.174-.272-.322-.184z" />
    </svg>
  );
}

export function RazerLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#00FF00" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.8 15.2c-1.3.4-2.5-.2-2.9-1.4-.4-1.2.2-2.5 1.4-2.9 1.2-.4 2.5.2 2.9 1.4.4 1.2-.2 2.5-1.4 2.9zm3.5-3.8c-1.7.5-3.4-.4-3.9-2.1-.5-1.7.4-3.4 2.1-3.9 1.7-.5 3.4.4 3.9 2.1.5 1.7-.4 3.4-2.1 3.9zM8.7 8.6c1.7-.5 3.4.4 3.9 2.1.5 1.7-.4 3.4-2.1 3.9-1.7.5-3.4-.4-3.9-2.1-.5-1.7.4-3.4 2.1-3.9z" />
    </svg>
  );
}

export function SpotifyLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#1ED760" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.58 14.43c-.18.29-.56.38-.85.2-2.34-1.43-5.28-1.75-8.75-.96-.33.08-.66-.13-.74-.46-.08-.33.13-.66.46-.74 3.8-.87 7.05-.5 9.68 1.11.29.18.38.56.2.85zm1.22-2.72c-.23.37-.71.49-1.08.26-2.68-1.65-6.77-2.12-9.94-1.16-.42.13-.86-.11-.99-.53-.13-.42.11-.86.53-.99 3.63-1.1 8.13-.57 11.22 1.34.37.23.49.71.26 1.08zm.11-2.83C14.7 8.84 9.4 8.67 6.34 9.6c-.49.15-1.02-.13-1.17-.62-.15-.49.13-1.02.62-1.17 3.53-1.07 9.38-.87 13.08 1.33.44.26.58.84.32 1.28-.26.44-.84.58-1.28.32z" />
    </svg>
  );
}

export function NetflixLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#E50914" className={className}>
      <path d="M5.398 0v24c1.17-.37 2.37-.7 3.6-.98V0h-3.6zm9.6 0v16.14l-4.8-14.86H6.6l5.7 17.65c.9-.17 1.8-.32 2.7-.44V0h-0.002zm3.6 0v21.57c1.2-.09 2.4-.14 3.6-.17V0h-3.6z" />
    </svg>
  );
}

export function YouTubeLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#FF0000" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function DiscordLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#5865F2" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function TelegramLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#26A5E4" className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export function XboxLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#107C10" className={className}>
      <path d="M4.66 4.75C6.54 2.92 9.15 1.78 12 1.78s5.46 1.14 7.34 2.97c.48.47.78.9.59 1.48-.47 1.4-1.78 3.52-3.19 5.4-1.24 1.65-2.8 3.2-4.08 4.41-.21.2-.42.2-.64 0-1.27-1.2-2.84-2.76-4.08-4.41-1.41-1.88-2.72-4-3.19-5.4-.19-.58.11-1.01.59-1.48zm-1.82 2.6c-.34.69-.58 1.44-.71 2.22-.38 2.37.13 4.93 1.43 7.07.31.51.72.68 1.28.46 1.4-.55 3.32-1.78 5.17-3.37-2.76-1.57-5.32-4.22-7.17-6.38zm18.32 0c-1.85 2.16-4.41 4.81-7.17 6.38 1.85 1.59 3.77 2.82 5.17 3.37.56.22.97.05 1.28-.46 1.3-2.14 1.81-4.7 1.43-7.07-.13-.78-.37-1.53-.71-2.22zm-9.16 8.35c1.47 1.34 3.27 2.68 4.75 3.42.49.25.75.59.57 1.14-.88 2.62-3.38 4.52-6.32 4.52s-5.44-1.9-6.32-4.52c-.18-.55.08-.89.57-1.14 1.48-.74 3.28-2.08 4.75-3.42.54-.49 1.46-.49 2 0z" />
    </svg>
  );
}

export function OpenAiLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#10A37F" className={className}>
      <path d="M22.28 9.38a5.95 5.95 0 0 0-.52-4.91 6.04 6.04 0 0 0-6.51-2.9A6.07 6.07 0 0 0 10.7 0a6.03 6.03 0 0 0-5.77 4.21 6.02 6.02 0 0 0-3.9 2.83 6.05 6.05 0 0 0 .74 7.12 5.96 5.96 0 0 0 .51 4.9 6.05 6.05 0 0 0 6.52 2.9A6.05 6.05 0 0 0 13.3 24a6.04 6.04 0 0 0 5.77-4.21 6.02 6.02 0 0 0 3.9-2.83 6.05 6.05 0 0 0-.69-7.58z" />
    </svg>
  );
}

export function MicrosoftLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
      <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
      <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
    </svg>
  );
}

export function DuolingoLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#58CC02" className={className}>
      <path d="M12.012 0C7.03 0 2.99 4.04 2.99 9.022c0 2.217.801 4.248 2.131 5.823v5.62c0 .942.763 1.705 1.705 1.705h1.705v-2.274h6.96v2.274h1.705c.942 0 1.705-.763 1.705-1.705v-5.62c1.33-1.575 2.131-3.606 2.131-5.823 0-4.982-4.04-9.022-9.02-9.022zm-3.41 7.387c1.256 0 2.274 1.018 2.274 2.274 0 1.256-1.018 2.274-2.274 2.274-1.256 0-2.274-1.018-2.274-2.274 0-1.256 1.018-2.274 2.274-2.274zm6.82 0c1.256 0 2.274 1.018 2.274 2.274 0 1.256-1.018 2.274-2.274 2.274-1.256 0-2.274-1.018-2.274-2.274 0-1.256 1.018-2.274 2.274-2.274z" />
    </svg>
  );
}

export function CrunchyrollLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#F47521" className={className}>
      <path d="M4.095 7.143c0-.129.006-.257.018-.385A10.74 10.74 0 0 0 .546 12c0 5.932 4.808 10.741 10.74 10.741 5.068 0 9.324-3.518 10.457-8.232a9.667 9.667 0 0 1-7.648 3.753c-5.342 0-9.674-4.333-9.674-9.675 0-.49.037-.971.107-1.444h-.433zm16.147-3.92A10.744 10.744 0 0 0 11.286 1.26c-4.887 0-9.027 3.26-10.334 7.698a9.664 9.664 0 0 1 7.42-3.513c5.341 0 9.674 4.333 9.674 9.675 0 .524-.042 1.037-.123 1.54.108.01.218.016.329.016 5.932 0 10.741-4.809 10.741-10.741 0-1.047-.15-2.059-.427-3.013l-.004.004-.002-.004a10.82 10.82 0 0 0-8.342-9.699z" />
    </svg>
  );
}

export function TidalLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 4.032L8.032 8 12 11.968 15.968 8 12 4.032zm-7.968 8L0 16.001l4.032 3.968L8.064 16 4.032 12.032zm7.968 0L8.032 16l3.968 3.968L15.968 16 12 12.032zm7.968 0L15.968 16l3.968 3.968L23.904 16 20 12.032z" />
    </svg>
  );
}

export function EaPlayLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center shadow-sm shrink-0">
        <span className="font-sans font-black text-xs text-white italic tracking-tighter">EA</span>
      </div>
      <span className="font-sans font-bold text-lg text-zinc-900 tracking-tight">EA Play</span>
    </div>
  );
}

export function KasperskyLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-[#00A88E] flex items-center justify-center shadow-sm shrink-0">
        <span className="font-sans font-black text-lg text-white">K</span>
      </div>
      <span className="font-sans font-bold text-lg text-zinc-900 tracking-tight">Kaspersky</span>
    </div>
  );
}

// =========================================================================
// Universal High-Resolution Brand Favicon & Identity Component
// =========================================================================

export function BrandFaviconBadge({
  domain,
  name,
  className = '',
}: {
  domain: string;
  name: string;
  className?: string;
}) {
  const [srcIndex, setSrcIndex] = React.useState(0);
  const sources = [
    `https://unavatar.io/${domain}`,
    `https://icon.horse/icon/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {srcIndex < sources.length ? (
        <img
          key={sources[srcIndex]}
          src={sources[srcIndex]}
          alt={name}
          className="w-7 h-7 rounded-md object-contain shrink-0 shadow-sm"
          onError={() => setSrcIndex((prev) => prev + 1)}
          loading="lazy"
        />
      ) : (
        <div className="w-7 h-7 rounded-md bg-zinc-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <span className="font-sans font-black text-lg tracking-tight text-zinc-900">
        {name}
      </span>
    </div>
  );
}

// =========================================================================
// Brand Theme Configurations
// =========================================================================

interface BrandMeta {
  name: string;
  gradient: string;
  border: string;
  glow: string;
  circuit: string;
  badgeBg: string;
  renderLogo: () => React.ReactNode;
}

function resolveBrandMetaBase(product: Partial<ProductItem>): BrandMeta {
  const brand = (product.brand || '').toLowerCase().trim();
  const id = (product.id || '').toLowerCase();
  const title = (product.title || '').toLowerCase();

  // 1. Steam (Checked early so 'ea' in 'steam' does not false-trigger EA)
  if (id.includes('steam') || brand === 'steam' || brand.includes('valve') || title.includes('steam')) {
    return {
      name: 'STEAM WALLET',
      gradient: 'from-[#0e1622] via-[#090d14] to-[#06080c]',
      border: 'border-[#1a3854]/40 hover:border-[#66c0f4]/60',
      glow: 'rgba(102, 192, 244, 0.25)',
      circuit: 'rgba(102, 192, 244, 0.12)',
      badgeBg: 'bg-[#1b2838] text-[#66c0f4] border-[#66c0f4]/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-[#171a21]">
          <SteamLogo className="w-7 h-7 text-[#171a21]" />
          <span className="font-sans font-black text-xl tracking-tight text-[#171a21]">STEAM</span>
        </div>
      ),
    };
  }

  // 2. Prime Video (Checked before generic Amazon)
  if (id.includes('prime') || title.includes('prime video') || brand.includes('prime video')) {
    return {
      name: 'AMAZON PRIME VIDEO',
      gradient: 'from-[#02182b] via-[#010e1a] to-[#070709]',
      border: 'border-[#00a8e1]/40 hover:border-[#00a8e1]/70',
      glow: 'rgba(0, 168, 225, 0.3)',
      circuit: 'rgba(0, 168, 225, 0.15)',
      badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      renderLogo: () => <PrimeVideoLogo />,
    };
  }

  // 3. Apple Music (Checked before generic Apple)
  if (id.includes('apple-music') || title.includes('apple music') || brand.includes('apple music')) {
    return {
      name: 'APPLE MUSIC',
      gradient: 'from-[#2d050f] via-[#190308] to-[#08080a]',
      border: 'border-[#fa233b]/30 hover:border-[#fa233b]/60',
      glow: 'rgba(250, 35, 59, 0.3)',
      circuit: 'rgba(250, 35, 59, 0.12)',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      renderLogo: () => <AppleMusicLogo />,
    };
  }

  // 4. Clash of Clans
  if (id.includes('clash-of-clans') || title.includes('clash of clans')) {
    return {
      name: 'CLASH OF CLANS',
      gradient: 'from-[#2b1903] via-[#170d01] to-[#08080a]',
      border: 'border-[#f59e0b]/40 hover:border-[#f59e0b]/70',
      glow: 'rgba(245, 158, 11, 0.35)',
      circuit: 'rgba(245, 158, 11, 0.15)',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      renderLogo: () => <ClashOfClansLogo />,
    };
  }

  // 5. Clash Royale
  if (id.includes('clash-royale') || title.includes('clash royale')) {
    return {
      name: 'CLASH ROYALE',
      gradient: 'from-[#061838] via-[#030d1f] to-[#08080a]',
      border: 'border-[#3b82f6]/40 hover:border-[#3b82f6]/70',
      glow: 'rgba(59, 130, 246, 0.35)',
      circuit: 'rgba(59, 130, 246, 0.15)',
      badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      renderLogo: () => <ClashRoyaleLogo />,
    };
  }

  // 6. Brawl Stars
  if (id.includes('brawl-stars') || title.includes('brawl stars')) {
    return {
      name: 'BRAWL STARS',
      gradient: 'from-[#292203] via-[#171301] to-[#08080a]',
      border: 'border-[#facc15]/40 hover:border-[#facc15]/70',
      glow: 'rgba(250, 204, 21, 0.35)',
      circuit: 'rgba(250, 204, 21, 0.15)',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      renderLogo: () => <BrawlStarsLogo />,
    };
  }

  // 7. League of Legends
  if (id.includes('league') || title.includes('league of legends')) {
    return {
      name: 'LEAGUE OF LEGENDS',
      gradient: 'from-[#241a05] via-[#140f03] to-[#08080a]',
      border: 'border-[#c28f2c]/40 hover:border-[#c28f2c]/70',
      glow: 'rgba(194, 143, 44, 0.35)',
      circuit: 'rgba(194, 143, 44, 0.15)',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      renderLogo: () => <LeagueOfLegendsLogo />,
    };
  }

  // 8. Fortnite
  if (id.includes('fortnite') || title.includes('fortnite') || title.includes('v-bucks')) {
    return {
      name: 'FORTNITE V-BUCKS',
      gradient: 'from-[#0f1738] via-[#080c1e] to-[#08080a]',
      border: 'border-[#3b82f6]/40 hover:border-[#3b82f6]/70',
      glow: 'rgba(59, 130, 246, 0.35)',
      circuit: 'rgba(59, 130, 246, 0.15)',
      badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      renderLogo: () => <FortniteLogo />,
    };
  }

  // 9. Free Fire
  if (id.includes('freefire') || title.includes('free fire') || brand.includes('free fire')) {
    return {
      name: 'FREE FIRE DIAMONDS',
      gradient: 'from-[#2e0e02] via-[#180701] to-[#08080a]',
      border: 'border-[#ff512f]/40 hover:border-[#ff512f]/70',
      glow: 'rgba(255, 106, 0, 0.35)',
      circuit: 'rgba(255, 106, 0, 0.15)',
      badgeBg: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      renderLogo: () => <FreeFireLogo />,
    };
  }

  // 10. PUBG Mobile
  if (id.includes('pubg') || title.includes('pubg')) {
    return {
      name: 'PUBG MOBILE UC',
      gradient: 'from-[#261803] via-[#140c01] to-[#08080a]',
      border: 'border-[#f59e0b]/40 hover:border-[#f59e0b]/70',
      glow: 'rgba(245, 158, 11, 0.35)',
      circuit: 'rgba(245, 158, 11, 0.15)',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      renderLogo: () => <PubgMobileLogo />,
    };
  }

  // 11. Among Us
  if (id.includes('among-us') || title.includes('among us')) {
    return {
      name: 'AMONG US STARS',
      gradient: 'from-[#260608] via-[#140304] to-[#08080a]',
      border: 'border-[#dc2626]/40 hover:border-[#dc2626]/70',
      glow: 'rgba(220, 38, 38, 0.35)',
      circuit: 'rgba(220, 38, 38, 0.15)',
      badgeBg: 'bg-red-500/15 text-red-300 border-red-500/30',
      renderLogo: () => <AmongUsLogo />,
    };
  }

  // 12. Minecraft
  if (id.includes('minecraft') || title.includes('minecraft') || brand.includes('mojang')) {
    return {
      name: 'MINECRAFT BEDROCK',
      gradient: 'from-[#0b240e] via-[#061408] to-[#08080a]',
      border: 'border-[#4aa532]/40 hover:border-[#4aa532]/70',
      glow: 'rgba(74, 165, 50, 0.35)',
      circuit: 'rgba(74, 165, 50, 0.15)',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      renderLogo: () => <MinecraftLogo />,
    };
  }

  // 13. Canva
  if (id.includes('canva') || title.includes('canva')) {
    return {
      name: 'CANVA PRO',
      gradient: 'from-[#170529] via-[#0d0317] to-[#070709]',
      border: 'border-[#7d2ae8]/40 hover:border-[#7d2ae8]/70',
      glow: 'rgba(0, 196, 204, 0.3)',
      circuit: 'rgba(125, 42, 232, 0.15)',
      badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      renderLogo: () => <CanvaLogo />,
    };
  }

  // 14. CapCut
  if (id.includes('capcut') || title.includes('capcut')) {
    return {
      name: 'CAPCUT PRO',
      gradient: 'from-[#00171f] via-[#000d14] to-[#070709]',
      border: 'border-cyan-500/40 hover:border-cyan-500/70',
      glow: 'rgba(0, 242, 254, 0.3)',
      circuit: 'rgba(0, 242, 254, 0.15)',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      renderLogo: () => <CapCutLogo />,
    };
  }

  // 15. TikTok
  if (id.includes('tiktok') || title.includes('tiktok')) {
    return {
      name: 'TIKTOK COINS',
      gradient: 'from-[#00171d] via-[#000d10] to-[#08080a]',
      border: 'border-cyan-500/40 hover:border-cyan-500/70',
      glow: 'rgba(37, 244, 238, 0.3)',
      circuit: 'rgba(37, 244, 238, 0.15)',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      renderLogo: () => <TikTokLogo />,
    };
  }

  // 16. Disney+
  if (id.includes('disney') || title.includes('disney')) {
    return {
      name: 'DISNEY+ PREMIUM',
      gradient: 'from-[#031536] via-[#020b1c] to-[#08080a]',
      border: 'border-[#113ccf]/40 hover:border-[#113ccf]/70',
      glow: 'rgba(17, 60, 207, 0.35)',
      circuit: 'rgba(17, 60, 207, 0.15)',
      badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      renderLogo: () => <DisneyPlusLogo />,
    };
  }

  // 17. Max / HBO
  if (id.includes('max') || title.includes('hbo') || brand.includes('hbo')) {
    return {
      name: 'MAX / HBO 4K',
      gradient: 'from-[#070b29] via-[#030614] to-[#08080a]',
      border: 'border-[#002be7]/40 hover:border-[#002be7]/70',
      glow: 'rgba(0, 43, 231, 0.35)',
      circuit: 'rgba(0, 43, 231, 0.15)',
      badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      renderLogo: () => <HboMaxLogo />,
    };
  }

  // 18. Paramount+
  if (id.includes('paramount') || title.includes('paramount')) {
    return {
      name: 'PARAMOUNT+ SHOWTIME',
      gradient: 'from-[#021736] via-[#010c1c] to-[#08080a]',
      border: 'border-[#0064ff]/40 hover:border-[#0064ff]/70',
      glow: 'rgba(0, 100, 255, 0.35)',
      circuit: 'rgba(0, 100, 255, 0.15)',
      badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      renderLogo: () => <ParamountPlusLogo />,
    };
  }

  // 19. Pokémon GO
  if (id.includes('pokemon') || title.includes('pokemon')) {
    return {
      name: 'POKÉMON GO',
      gradient: 'from-[#240608] via-[#120304] to-[#08080a]',
      border: 'border-[#ee1515]/40 hover:border-[#ee1515]/70',
      glow: 'rgba(238, 21, 21, 0.35)',
      circuit: 'rgba(238, 21, 21, 0.15)',
      badgeBg: 'bg-red-500/15 text-red-300 border-red-500/30',
      renderLogo: () => <PokemonGoLogo />,
    };
  }

  // 20. Stumble Guys
  if (id.includes('stumble') || title.includes('stumble guys')) {
    return {
      name: 'STUMBLE GUYS',
      gradient: 'from-[#041d33] via-[#020f1a] to-[#08080a]',
      border: 'border-[#00b4d8]/40 hover:border-[#00b4d8]/70',
      glow: 'rgba(0, 180, 216, 0.35)',
      circuit: 'rgba(0, 180, 216, 0.15)',
      badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      renderLogo: () => <StumbleGuysLogo />,
    };
  }

  // 21. Microsoft 365
  if (id.includes('microsoft') || title.includes('microsoft') || title.includes('office') || title.includes('windows')) {
    return {
      name: 'MICROSOFT 365',
      gradient: 'from-[#031526] via-[#020d18] to-[#070709]',
      border: 'border-[#00a4ef]/30 hover:border-[#00a4ef]/60',
      glow: 'rgba(0, 164, 239, 0.25)',
      circuit: 'rgba(0, 164, 239, 0.12)',
      badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-zinc-900">
          <MicrosoftLogo className="w-6 h-6 shrink-0" />
          <span className="font-sans font-semibold text-base text-zinc-800">Microsoft 365</span>
        </div>
      ),
    };
  }

  // 22. Kaspersky
  if (id.includes('kaspersky') || brand.includes('kaspersky')) {
    return {
      name: 'KASPERSKY TOTAL SECURITY',
      gradient: 'from-[#00241b] via-[#00140f] to-[#08080a]',
      border: 'border-[#00a88e]/40 hover:border-[#00a88e]/70',
      glow: 'rgba(0, 168, 142, 0.35)',
      circuit: 'rgba(0, 168, 142, 0.15)',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      renderLogo: () => <KasperskyLogo />,
    };
  }

  // 23. EA Play
  if (id.includes('ea-play') || title.includes('ea play') || brand === 'ea' || brand.startsWith('ea ')) {
    return {
      name: 'EA PLAY PRO',
      gradient: 'from-[#260810] via-[#140408] to-[#08080a]',
      border: 'border-rose-500/40 hover:border-rose-500/70',
      glow: 'rgba(255, 71, 71, 0.35)',
      circuit: 'rgba(255, 71, 71, 0.15)',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      renderLogo: () => <EaPlayLogo />,
    };
  }

  // 24. Duolingo
  if (id.includes('duolingo') || brand.includes('duolingo')) {
    return {
      name: 'DUOLINGO SUPER',
      gradient: 'from-[#0e2604] via-[#071302] to-[#08080a]',
      border: 'border-[#58cc02]/30 hover:border-[#58cc02]/60',
      glow: 'rgba(88, 204, 2, 0.3)',
      circuit: 'rgba(88, 204, 2, 0.12)',
      badgeBg: 'bg-green-500/15 text-green-300 border-green-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-[#58cc02]">
          <DuolingoLogo className="w-7 h-7 shrink-0" />
          <span className="font-sans font-bold text-lg text-zinc-900">duolingo</span>
        </div>
      ),
    };
  }

  // 25. ChatGPT / OpenAI
  if (id.includes('chatgpt') || id.includes('openai') || brand.includes('openai')) {
    return {
      name: 'OPENAI CHATGPT',
      gradient: 'from-[#021f17] via-[#01140f] to-[#070709]',
      border: 'border-[#10a37f]/30 hover:border-[#10a37f]/60',
      glow: 'rgba(16, 163, 127, 0.25)',
      circuit: 'rgba(16, 163, 127, 0.12)',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-[#10a37f]">
          <OpenAiLogo className="w-7 h-7 shrink-0" />
          <span className="font-sans font-bold text-lg text-[#10a37f]">ChatGPT</span>
        </div>
      ),
    };
  }

  // 26. PlayStation / PSN
  if (id.includes('psn') || brand.includes('playstation') || title.includes('playstation')) {
    return {
      name: 'PLAYSTATION NETWORK',
      gradient: 'from-[#031536] via-[#020b1c] to-[#050811]',
      border: 'border-[#0070d1]/30 hover:border-[#0070d1]/60',
      glow: 'rgba(0, 112, 209, 0.28)',
      circuit: 'rgba(0, 112, 209, 0.15)',
      badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-[#003791]">
          <PlayStationLogo className="w-8 h-6 text-[#003791] shrink-0" />
          <span className="font-sans font-black text-xl tracking-tight text-[#003791]">PlayStation</span>
        </div>
      ),
    };
  }

  // 27. Nintendo
  if (id.includes('nintendo') || brand.includes('nintendo') || title.includes('eshop')) {
    return {
      name: 'NINTENDO eSHOP',
      gradient: 'from-[#290508] via-[#140204] to-[#070709]',
      border: 'border-[#e60012]/30 hover:border-[#e60012]/60',
      glow: 'rgba(230, 0, 18, 0.25)',
      circuit: 'rgba(230, 0, 18, 0.12)',
      badgeBg: 'bg-red-500/15 text-red-300 border-red-500/30',
      renderLogo: () => <NintendoLogo className="w-28 h-8" />,
    };
  }

  // 28. Amazon (Retail Gift Cards)
  if (id.includes('amazon') || brand.includes('amazon') || title.includes('amazon')) {
    return {
      name: 'AMAZON DIGITAL',
      gradient: 'from-[#1c1404] via-[#100b02] to-[#070709]',
      border: 'border-[#ff9900]/30 hover:border-[#ff9900]/60',
      glow: 'rgba(255, 153, 0, 0.25)',
      circuit: 'rgba(255, 153, 0, 0.12)',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      renderLogo: () => (
        <div className="flex items-center justify-center py-0.5">
          <AmazonLogo className="h-6 w-auto max-w-[130px]" />
        </div>
      ),
    };
  }

  // 29. Apple (App Store / iTunes Gift Cards)
  if (id.includes('apple') || brand.includes('apple') || title.includes('itunes')) {
    return {
      name: 'APPLE APP STORE',
      gradient: 'from-[#1c1c22] via-[#101014] to-[#070709]',
      border: 'border-white/20 hover:border-white/40',
      glow: 'rgba(255, 255, 255, 0.18)',
      circuit: 'rgba(255, 255, 255, 0.08)',
      badgeBg: 'bg-white/10 text-white border-white/20',
      renderLogo: () => (
        <div className="flex items-center gap-1.5 text-black">
          <AppleLogo className="w-8 h-8 text-black shrink-0" />
          <span className="font-sans font-semibold text-lg text-black">Apple</span>
        </div>
      ),
    };
  }

  // 30. Google Play
  if (id.includes('google') || brand.includes('google') || title.includes('google play')) {
    return {
      name: 'GOOGLE PLAY STORE',
      gradient: 'from-[#031c16] via-[#02100d] to-[#070709]',
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      glow: 'rgba(0, 230, 118, 0.25)',
      circuit: 'rgba(0, 230, 118, 0.12)',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-zinc-900">
          <GooglePlayLogo className="w-7 h-7 shrink-0" />
          <span className="font-sans font-semibold text-base tracking-tight text-zinc-800">Google Play</span>
        </div>
      ),
    };
  }

  // 31. Razer Gold
  if (id.includes('razer') || brand.includes('razer') || title.includes('razer')) {
    return {
      name: 'RAZER GOLD PIN',
      gradient: 'from-[#002409] via-[#001305] to-[#08080a]',
      border: 'border-[#00ff00]/30 hover:border-[#00ff00]/60',
      glow: 'rgba(0, 255, 0, 0.25)',
      circuit: 'rgba(0, 255, 0, 0.12)',
      badgeBg: 'bg-green-500/15 text-green-300 border-green-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-[#000000]">
          <RazerLogo className="w-7 h-7 text-[#00c800] shrink-0" />
          <span className="font-sans font-black text-xl tracking-tight text-black">RAZER</span>
        </div>
      ),
    };
  }

  // 32. Valorant
  if (id.includes('valorant') || brand.includes('valorant')) {
    return {
      name: 'VALORANT POINTS',
      gradient: 'from-[#24080e] via-[#140407] to-[#08080a]',
      border: 'border-[#ff4655]/30 hover:border-[#ff4655]/60',
      glow: 'rgba(255, 70, 85, 0.3)',
      circuit: 'rgba(255, 70, 85, 0.12)',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-[#ff4655]">
          <ValorantLogo className="w-7 h-7 text-[#ff4655] shrink-0" />
          <span className="font-sans font-black text-xl tracking-tight text-[#ff4655]">VALORANT</span>
        </div>
      ),
    };
  }

  // 33. Roblox
  if (id.includes('roblox') || brand.includes('roblox') || title.includes('robux')) {
    return {
      name: 'ROBLOX ROBUX',
      gradient: 'from-[#220505] via-[#120202] to-[#08080a]',
      border: 'border-red-500/30 hover:border-red-500/60',
      glow: 'rgba(238, 51, 62, 0.28)',
      circuit: 'rgba(238, 51, 62, 0.12)',
      badgeBg: 'bg-red-500/15 text-red-300 border-red-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-zinc-900">
          <RobloxLogo className="w-7 h-7 text-[#000000] shrink-0" />
          <span className="font-sans font-black text-xl tracking-tight text-black">ROBLOX</span>
        </div>
      ),
    };
  }

  // 34. Xbox
  if (id.includes('xbox') || brand.includes('xbox')) {
    return {
      name: 'XBOX GAME PASS',
      gradient: 'from-[#032008] via-[#021305] to-[#070709]',
      border: 'border-[#107c10]/30 hover:border-[#107c10]/60',
      glow: 'rgba(16, 124, 16, 0.28)',
      circuit: 'rgba(16, 124, 16, 0.12)',
      badgeBg: 'bg-green-500/15 text-green-300 border-green-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-[#107c10]">
          <XboxLogo className="w-7 h-7 shrink-0" />
          <span className="font-sans font-black text-xl tracking-tight text-[#107c10]">XBOX</span>
        </div>
      ),
    };
  }

  // 35. Spotify
  if (id.includes('spotify') || brand.includes('spotify')) {
    return {
      name: 'SPOTIFY PREMIUM',
      gradient: 'from-[#03220e] via-[#021408] to-[#070709]',
      border: 'border-[#1ed760]/30 hover:border-[#1ed760]/60',
      glow: 'rgba(30, 215, 96, 0.25)',
      circuit: 'rgba(30, 215, 96, 0.12)',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-black">
          <SpotifyLogo className="w-7 h-7 shrink-0" />
          <span className="font-sans font-bold text-lg tracking-tight text-black">Spotify</span>
        </div>
      ),
    };
  }

  // 36. Netflix
  if (id.includes('netflix') || brand.includes('netflix')) {
    return {
      name: 'NETFLIX CINEMA',
      gradient: 'from-[#290306] via-[#140103] to-[#070709]',
      border: 'border-[#e50914]/30 hover:border-[#e50914]/60',
      glow: 'rgba(229, 9, 20, 0.28)',
      circuit: 'rgba(229, 9, 20, 0.12)',
      badgeBg: 'bg-red-500/15 text-red-300 border-red-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-1.5 text-[#e50914]">
          <NetflixLogo className="w-7 h-7 shrink-0" />
          <span className="font-sans font-black text-xl tracking-wider text-[#e50914]">NETFLIX</span>
        </div>
      ),
    };
  }

  // 37. YouTube
  if (id.includes('youtube') || brand.includes('youtube')) {
    return {
      name: 'YOUTUBE PREMIUM',
      gradient: 'from-[#290407] via-[#140203] to-[#08080a]',
      border: 'border-[#ff0000]/30 hover:border-[#ff0000]/60',
      glow: 'rgba(255, 0, 0, 0.3)',
      circuit: 'rgba(255, 0, 0, 0.12)',
      badgeBg: 'bg-red-500/15 text-red-300 border-red-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-zinc-900">
          <YouTubeLogo className="w-7 h-7 text-[#ff0000] shrink-0" />
          <span className="font-sans font-bold text-lg tracking-tight text-zinc-900">YouTube</span>
        </div>
      ),
    };
  }

  // 38. Discord
  if (id.includes('discord') || brand.includes('discord')) {
    return {
      name: 'DISCORD NITRO',
      gradient: 'from-[#0e1030] via-[#08091c] to-[#070709]',
      border: 'border-[#5865f2]/30 hover:border-[#5865f2]/60',
      glow: 'rgba(88, 101, 242, 0.28)',
      circuit: 'rgba(88, 101, 242, 0.15)',
      badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-[#5865f2]">
          <DiscordLogo className="w-8 h-8 shrink-0" />
          <span className="font-sans font-bold text-lg text-[#5865f2]">Discord</span>
        </div>
      ),
    };
  }

  // 39. Telegram
  if (id.includes('telegram') || brand.includes('telegram')) {
    return {
      name: 'TELEGRAM PREMIUM',
      gradient: 'from-[#041a29] via-[#020e17] to-[#08080a]',
      border: 'border-[#26a5e4]/30 hover:border-[#26a5e4]/60',
      glow: 'rgba(38, 165, 228, 0.3)',
      circuit: 'rgba(38, 165, 228, 0.12)',
      badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-[#26a5e4]">
          <TelegramLogo className="w-7 h-7 shrink-0" />
          <span className="font-sans font-bold text-lg text-zinc-900">Telegram</span>
        </div>
      ),
    };
  }

  // 40. Crunchyroll
  if (id.includes('crunchyroll') || brand.includes('crunchyroll')) {
    return {
      name: 'CRUNCHYROLL UHD',
      gradient: 'from-[#291302] via-[#140901] to-[#08080a]',
      border: 'border-[#f47521]/30 hover:border-[#f47521]/60',
      glow: 'rgba(244, 117, 33, 0.3)',
      circuit: 'rgba(244, 117, 33, 0.12)',
      badgeBg: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-[#f47521]">
          <CrunchyrollLogo className="w-7 h-7 shrink-0" />
          <span className="font-sans font-bold text-lg text-zinc-900">Crunchyroll</span>
        </div>
      ),
    };
  }

  // 41. Tidal
  if (id.includes('tidal') || brand.includes('tidal')) {
    return {
      name: 'TIDAL HIFI PLUS',
      gradient: 'from-[#141419] via-[#0b0b0e] to-[#08080a]',
      border: 'border-white/20 hover:border-white/40',
      glow: 'rgba(255, 255, 255, 0.2)',
      circuit: 'rgba(255, 255, 255, 0.08)',
      badgeBg: 'bg-white/10 text-white border-white/20',
      renderLogo: () => (
        <div className="flex items-center gap-2 text-black">
          <TidalLogo className="w-7 h-7 shrink-0" />
          <span className="font-sans font-black text-lg tracking-widest text-black">TIDAL</span>
        </div>
      ),
    };
  }

  // Default Universal Fallback
  const cleanBrandSlug = (product.brand || 'fibez').toLowerCase().replace(/[^a-z0-9]/g, '');
  const fallbackDomain = `${cleanBrandSlug}.com`;
  const displayName = product.brand || 'Digital Pass';

  return {
    name: displayName.toUpperCase(),
    gradient: 'from-[#14141c] via-[#0e0e14] to-[#070709]',
    border: 'border-white/10 hover:border-white/30',
    glow: 'rgba(58, 211, 137, 0.18)',
    circuit: 'rgba(255, 255, 255, 0.08)',
    badgeBg: 'bg-white/10 text-white border-white/15',
    renderLogo: () => (
      <BrandFaviconBadge
        domain={fallbackDomain}
        name={displayName}
      />
    ),
  };
}

/** The real logo file (see /public/brands) when we have one, else the drawn fallback above. */
function BrandLogoImage({ asset }: { asset: BrandLogoAsset }) {
  if (asset.kind === 'full') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={asset.src} alt="" draggable={false} className="h-9 w-auto max-w-[170px] object-contain" />
    );
  }
  return (
    <div className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset.src} alt="" draggable={false} className="h-8 w-auto max-w-[44px] object-contain rounded-md" />
      <span className="font-sans font-extrabold text-xl tracking-tight leading-none" style={{ color: asset.color }}>
        {asset.label}
      </span>
    </div>
  );
}

export function resolveBrandMeta(product: Partial<ProductItem>): BrandMeta {
  const meta = resolveBrandMetaBase(product);
  const asset = BRAND_LOGOS[meta.name];
  return asset ? { ...meta, renderLogo: () => <BrandLogoImage asset={asset} /> } : meta;
}

export default function DigitalProductThumbnail({
  product,
  className = '',
}: {
  product: ProductItem;
  className?: string;
}) {
  const meta = resolveBrandMeta(product);

  const categoryLabelMap: Record<string, string> = {
    giftcard: 'GIFT CARD',
    subscription: 'SUBSCRIPTION',
    gaming: 'GAME TOP-UP',
    software: 'SOFTWARE KEY',
  };

  const categoryText = categoryLabelMap[product.category] || 'DIGITAL ASSET';

  return (
    <div
      className={`w-full h-40 rounded-2xl bg-gradient-to-br ${meta.gradient} border ${meta.border} relative overflow-hidden flex flex-col justify-between p-3.5 group/thumb select-none shadow-xl transition-all duration-300 mb-4 ${className}`}
    >
      {/* 1. Ambient Brand Glow Orbs */}
      <div
        className="absolute -right-8 -top-8 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover/thumb:scale-125"
        style={{ backgroundColor: meta.glow }}
      />
      <div
        className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover/thumb:scale-110"
        style={{ backgroundColor: meta.glow }}
      />

      {/* 2. Geometric Grid Overlay (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`grid-prod-${product.id}`}
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 22 0 L 0 0 0 22"
              fill="none"
              stroke={meta.circuit}
              strokeWidth="0.75"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-prod-${product.id})`} />
      </svg>

      {/* 3. Top Row: Category Tag & Region */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389] animate-pulse" />
          <span className="text-[9px] font-mono tracking-wider font-semibold text-zinc-300 uppercase">
            {categoryText}
          </span>
        </div>

        {product.region && (
          <div className="px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[9px] font-mono text-zinc-400 backdrop-blur-md">
            <span>{product.region}</span>
          </div>
        )}
      </div>

      {/* 4. Center Hero: LARGE, PROMINENT OFFICIAL BRAND SHOWCASE */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-1">
        <div className="px-6 py-2.5 rounded-2xl bg-white border border-white/40 shadow-xl flex items-center justify-center backdrop-blur-md transition-transform duration-300 group-hover/thumb:scale-105 min-h-[46px]">
          {meta.renderLogo()}
        </div>

        <div className="mt-1.5 text-center">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold">
            {meta.name}
          </span>
        </div>
      </div>

      {/* 5. Bottom Technical Strip: Delivery & Stock Guarantee */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-white/10 backdrop-blur-xs">
        <div>
          {product.badge ? (
            <span className="font-bold text-white px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 text-[9px]">
              <Sparkles className="w-3 h-3" />
              <span>{product.badge}</span>
            </span>
          ) : (
            <span className="text-zinc-400 font-semibold px-2 py-0.5 rounded bg-black/50 border border-white/10 text-[9px]">
              AUTHENTIC CODE
            </span>
          )}
        </div>

        <div className="text-zinc-300 font-mono flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[9px]">
          <ShieldCheck className="w-3 h-3 text-[#3ad389]" />
          <span>INSTANT KEY VAULT</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Brand Logo Pill / Badge for Tables, Lists & Product Selectors
 */
export function ProductBrandBadge({
  product,
  size = 'md',
  className = '',
}: {
  product: Partial<ProductItem>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const meta = resolveBrandMeta(product);
  const sizeClasses = {
    sm: 'h-7 px-2.5 min-w-[70px]',
    md: 'h-9 px-3 min-w-[90px]',
    lg: 'h-11 px-4 min-w-[110px]',
  }[size];

  const logoScale = {
    sm: 'scale-[0.70]',
    md: 'scale-[0.82]',
    lg: 'scale-100',
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-white border border-white/50 shadow-sm shrink-0 overflow-hidden ${sizeClasses} ${className}`}
    >
      <div className={`${logoScale} origin-center flex items-center justify-center transition-transform`}>
        {meta.renderLogo()}
      </div>
    </div>
  );
}
