/** Shared by the root layout (server) and the client motion helpers. No 'use client': the layout needs the plain string. */
export const MOTION_STORAGE_KEY = 'fibez_motion';

/** Inline <head> script: applies the remembered animation level before first paint (no flash of heavy effects). */
export const MOTION_BOOT_SCRIPT = `try{var m=localStorage.getItem('${MOTION_STORAGE_KEY}');if(m==='full'||m==='lite'||m==='off')document.documentElement.dataset.motion=m;if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.motion='off'}catch(e){}`;
