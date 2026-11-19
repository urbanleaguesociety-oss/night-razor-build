// tslint:disable
/* eslint-disable */
import {getConfig} from './constants';

declare global {
  interface Window {
    __STAGE1_BGM_INSTANCE__?: HTMLAudioElement;
    bgm?: HTMLAudioElement;
  }
}
function resolveLocalSound(candidates: string[]): string {
  const cleanName = decodeURIComponent(candidates[0]);
  return `./assets/Sounds/${cleanName}`;
}


export const LOCAL_BGM_FALLBACK = resolveLocalSound(['Beat em up game.mp3']);

export const BGM_TRACKS = {
  cutscene: resolveLocalSound(['The threat.mp3']),
  stage1: resolveLocalSound(['Beat em up game.mp3']),
  stage2: resolveLocalSound(['Miami Electro Break.mp3']),
  stage3: resolveLocalSound(['Club Sub-Zero.mp3']),
  stage4: resolveLocalSound(['Arcade Sub Boom (Remix) 3.mp3']),
  stage5: resolveLocalSound(['Arcade Sub Boom (Remix) Take 2.mp3']),
  stage6: resolveLocalSound(['Arcade Sub Boom (Remix) 2.mp3']),
  stage7: resolveLocalSound(['Final Showdown (Take 2).mp3']),
  stage8: resolveLocalSound(['Final Showdown.mp3']),
  boss: resolveLocalSound(['Boss fight.mp3', 'Boss fight (1).mp3']),
} as const;

export const STORY_CUTSCENE_URL = BGM_TRACKS.cutscene;

export const STAGE_BGM_MAP: Record<number, string> = {
  1: BGM_TRACKS.stage1,
  2: BGM_TRACKS.stage2,
  3: BGM_TRACKS.stage3,
  4: BGM_TRACKS.stage4,
  5: BGM_TRACKS.stage5,
  6: BGM_TRACKS.stage6,
  7: BGM_TRACKS.stage7,
  8: BGM_TRACKS.stage8,
};

export const MUSIC_URLS = {
  stage: BGM_TRACKS.stage1,
  boss: BGM_TRACKS.boss,
  cutscene: BGM_TRACKS.cutscene,
  stage1: BGM_TRACKS.stage1,
  stage2: BGM_TRACKS.stage2,
  stage3: BGM_TRACKS.stage3,
  stage4: BGM_TRACKS.stage4,
  stage5: BGM_TRACKS.stage5,
  stage6: BGM_TRACKS.stage6,
  stage7: BGM_TRACKS.stage7,
  stage8: BGM_TRACKS.stage8,
} as const;

export function isValidMusicUrl(url?: string): boolean {
  return Boolean(url && url.trim().length > 0);
}

export type MusicTrackType =

  | 'stage_1' | 'stage_2' | 'stage_3' | 'stage_4'
  | 'stage_5' | 'stage_6' | 'stage_7' | 'stage_8'
  | 'stage' | 'boss' | 'cutscene';
export class MusicManager {
  private bgmPlayer: HTMLAudioElement | null = null;
  private currentTrack: string | null = null;
  private musicMuted = false;
  private musicVolume = (getConfig('defaultMusicVolume') as number) ?? 0.81;
  private fadeInterval: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') this.getBgmPlayer();
  }

  getBgmPlayer(): HTMLAudioElement {
    if (!this.bgmPlayer && typeof window !== 'undefined') {
      const player = new Audio();
      player.loop = true;
      player.preload = 'none';
      player.volume = 0.81;
      player.muted = false;
      this.bgmPlayer = player;
      window.bgm = player;
      window.__STAGE1_BGM_INSTANCE__ = player;
    }
    return this.bgmPlayer!;
  }

  getCurrentAudio(): HTMLAudioElement | null { return this.bgmPlayer; }
  getCurrentTrack(): string | null { return this.currentTrack; }

  stopMusic(): void {
    if (this.fadeInterval !== null) { clearInterval(this.fadeInterval); this.fadeInterval = null; }
    if (this.bgmPlayer) { try { this.bgmPlayer.pause(); this.bgmPlayer.currentTime = 0; } catch (_) {} }
    this.currentTrack = null;
  }

  fadeMusicOut(duration = 0.8): void {
    if (this.fadeInterval !== null) { clearInterval(this.fadeInterval); this.fadeInterval = null; }
    const player = this.bgmPlayer;
    if (!player || player.paused) { this.stopMusic(); return; }
    const startVolume = this.musicMuted ? 0 : player.volume;
    const steps = 20;
    const stepTime = (Math.max(0.05, duration) * 1000) / steps;
    let stepCount = 0;
    this.fadeInterval = window.setInterval(() => {
      stepCount++;
      const factor = Math.max(0, 1 - stepCount / steps);
      if (this.bgmPlayer && !this.musicMuted) {
        try { this.bgmPlayer.volume = Math.max(0, startVolume * factor); } catch (_) {}
      }
      if (stepCount >= steps) {
        if (this.fadeInterval !== null) { clearInterval(this.fadeInterval); this.fadeInterval = null; }
        this.stopMusic();
        if (this.bgmPlayer && !this.musicMuted) {
          try { this.bgmPlayer.volume = this.musicVolume; } catch (_) {}
        }
      }
    }, stepTime);
  }

  playBgmTrack(url: string, trackType?: string): void {
    if (!url || typeof window === 'undefined') return;
    const player = this.getBgmPlayer();
    if (!player || this.musicMuted) return;
    const targetTrack = trackType ?? url;
    if ((player.src === url || player.src === encodeURI(url) || this.currentTrack === targetTrack) && !player.paused) {
      this.currentTrack = targetTrack;
      return;
    }
    if (this.fadeInterval !== null) { clearInterval(this.fadeInterval); this.fadeInterval = null; }
    try {
      player.pause();
      player.currentTime = 0;
      player.src = url;
      player.loop = true;
      player.volume = this.musicMuted ? 0 : this.musicVolume;
      player.muted = this.musicMuted;
      this.currentTrack = targetTrack;
      player.load();
      player.play().catch(() => {});
    } catch (_) {}
  }

  switchTrack(url: string, trackType: string): void { this.playBgmTrack(url, trackType); }
  playStageMusic(stage = 1): void { this.playBgmTrack(STAGE_BGM_MAP[stage] || BGM_TRACKS.stage1, `stage_${stage}`); }
  playBossMusic(): void { this.playBgmTrack(BGM_TRACKS.boss, 'boss'); }
  playCutsceneMusic(): void { this.playBgmTrack(BGM_TRACKS.cutscene, 'cutscene'); }
  pauseMusic(): void {
    if (this.fadeInterval !== null) { clearInterval(this.fadeInterval); this.fadeInterval = null; }
    if (this.bgmPlayer) { try { this.bgmPlayer.pause(); } catch (_) {} }
  }
  resumeMusic(): void {
    if (this.musicMuted || !this.bgmPlayer) return;
    try {
      this.bgmPlayer.volume = this.musicVolume;
      this.bgmPlayer.muted = false;
      this.bgmPlayer.play().catch(() => {});
    } catch (_) {}
  }
  setMusicMuted(muted: boolean): void {
    this.musicMuted = muted;
    if (this.bgmPlayer) { this.bgmPlayer.muted = muted; this.bgmPlayer.volume = muted ? 0 : this.musicVolume; }
  }
  isMusicMuted(): boolean { return this.musicMuted; }
  setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmPlayer && !this.musicMuted) this.bgmPlayer.volume = this.musicVolume;
  }
  getMusicVolume(): number { return this.musicVolume; }
}

export const musicManager = new MusicManager();
export function playBgmTrack(url: string) { musicManager.playBgmTrack(url); }
export const BACKGROUND_MUSIC_URL = BGM_TRACKS.stage1;
export const STREET_Y_MIN = 360;
export const STREET_Y_MAX = 570;
export const RIDE_OUT_BLINK_INTERVAL = 0.45;
export const RIDE_OUT_BLINK_VISIBLE_DURATION = 0.28;
export const STAGE_INTRO_DURATION = 1.8;
export type AudioEffectKey =

  | 'multishot' | 'swoosh' | 'punch' | 'kick' | 'jump' | 'defeat'
  | 'playerDamage' | 'breakProp' | 'itemPickup' | 'stageClear'
  | 'nrDamage' | 'breakCrate' | 'waveClear' | 'gameOver'
  | 'gunShot' | 'actionKickPress' | 'punchContact' | 'kickKneeContact'
  | 'jumpLand' | 'enemyFallLose';

export const CUSTOM_SFX_FILES: Record<string, string[]> = {
  multishot: ['multishot.mp3', 'multishot (1).mp3'],
  swoosh: ['SWOOSH.mp3', 'Swoosh.mp3'],
  punch: ['PUNCH.mp3', 'Punch.mp3'],
  kick: ['Kick.mp3', 'KICK.mp3'],
  jump: ['JUMP.mp3', 'Jump.mp3', 'Jump .mp3'],
  defeat: ['Defeat.mp3', 'FALL.mp3'],
  gameOver: ['eerie-game-over-music-sting-gfx-sounds-1-00-06.mp3', 'game over.mp3'],
  nrDamage: ['NR damage.mp3', 'NR_damage.mp3'],
  breakCrate: ['Broke Crates.mp3', 'Broke_Crates.mp3'],
  itemPickup: ['alexis_gaming_cam-item-collected-1-367087.mp3'],
  waveClear: ['Register WAVE CLEAR.mp3'],
};

const SFX_KEY_MAP: Record<string, string> = {
  multishot: 'multishot', gunShot: 'multishot',
  swoosh: 'swoosh', actionKickPress: 'swoosh',
  punch: 'punch', punchContact: 'punch',
  kick: 'kick', kickKneeContact: 'kick',
  jump: 'jump', jumpLand: 'jump',
  defeat: 'defeat', enemyFallLose: 'defeat',
  playerDamage: 'nrDamage', nrDamage: 'nrDamage',
  breakProp: 'breakCrate', breakCrate: 'breakCrate',
  itemPickup: 'itemPickup',
  stageClear: 'waveClear', waveClear: 'waveClear',
  gameOver: 'gameOver',
};

export const AUDIO_SOURCES: Record<string, string> = Object.fromEntries(
  Object.entries(SFX_KEY_MAP).map(([alias, key]) => [alias, resolveLocalSound(CUSTOM_SFX_FILES[key])])
);

export const AUDIO_FALLBACKS: Partial<Record<AudioEffectKey, string>> = {};
export const sfxBuffers: Record<string, AudioBuffer> = {};
export const SFX_MASTER_VOLUME = 0.35;
export const SFX_VOLUME = 0.35;

let sharedAudioCtx: AudioContext | null = null;
export let sfxGainNode: GainNode | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function getSfxGainNode(): GainNode | null {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (!sfxGainNode) {
    sfxGainNode = ctx.createGain();
    sfxGainNode.gain.value = 0.35;
    sfxGainNode.connect(ctx.destination);
  }
  return sfxGainNode;
}
export async function decodeAudioDataSafe(ctx: AudioContext, arrayBuffer: ArrayBuffer): Promise<AudioBuffer | null> {
  try {
    return await new Promise<AudioBuffer>((resolve, reject) => {
      let settled = false;
      const ok = (buf: AudioBuffer) => { if (!settled) { settled = true; resolve(buf); } };
      const fail = (err: any) => { if (!settled) { settled = true; reject(err); } };
      try {
        const p = ctx.decodeAudioData(arrayBuffer, ok, fail);
        if (p && typeof p.then === 'function') p.then(ok).catch(fail);
      } catch (err) { fail(err); }
    });
  } catch (_) { return null; }
}

export async function loadAndDecodeSfx(key: string, candidates: string[]): Promise<AudioBuffer | null> {
  if (typeof window === 'undefined' || sfxBuffers[key]) return sfxBuffers[key] || null;
  const ctx = getAudioContext();
  if (!ctx) return null;
  try {
    const res = await fetch(resolveLocalSound(candidates));
    if (!res.ok) return null;
    const decoded = await decodeAudioDataSafe(ctx, await res.arrayBuffer());
    if (decoded) {
      sfxBuffers[key] = decoded;
      Object.entries(SFX_KEY_MAP).forEach(([alias, canonical]) => {
        if (canonical === key) sfxBuffers[alias] = decoded;
      });
      return decoded;
    }
  } catch (_) {}
  return null;
}

export interface SfxPool { nodes: [HTMLAudioElement, HTMLAudioElement]; index: number; }
export const sfxPool: Record<string, SfxPool> = {};
export const SFX_CACHE: Record<string, HTMLAudioElement> = {};

function createSfxPool(candidates: string[]): SfxPool {
  const make = () => { const a = new Audio(); a.preload = 'auto'; a.src = resolveLocalSound(candidates); a.load(); return a; };
  return { nodes: [make(), make()], index: 0 };
}

export const GAME_OVER_SFX_URL = resolveLocalSound(CUSTOM_SFX_FILES.gameOver);
export const GAME_OVER_SFX_RAW_URL = GAME_OVER_SFX_URL;
let gameOverAudio: HTMLAudioElement | null = null;

export function getGameOverAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!gameOverAudio) { gameOverAudio = new Audio(); gameOverAudio.preload = 'auto'; gameOverAudio.src = GAME_OVER_SFX_URL; gameOverAudio.load(); }
  return gameOverAudio;
}

let isPreloadingBuffers = false;
export function preloadSfxBuffers(): void {
  if (typeof window === 'undefined') return;
  getAudioContext();
  getSfxGainNode();
  if (!isPreloadingBuffers) {
    isPreloadingBuffers = true;
    for (const [key, candidates] of Object.entries(CUSTOM_SFX_FILES)) {
      if (!sfxBuffers[key]) loadAndDecodeSfx(key, candidates).catch(() => {});
    }
  }
  for (const [key, candidates] of Object.entries(CUSTOM_SFX_FILES)) {
    if (!sfxPool[key]) { const pool = createSfxPool(candidates); sfxPool[key] = pool; SFX_CACHE[key] = pool.nodes; }
  }
  getGameOverAudio();
}

export const initSfxAudio = preloadSfxBuffers;
export function unlockAllAudio(): void {
  preloadSfxBuffers();
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}
if (typeof window !== 'undefined') setTimeout(preloadSfxBuffers, 150);

export function playGameOverSound(): void { playSFX('gameOver'); }
export function stopGameOverSound(): void {
  if (gameOverAudio) { try { gameOverAudio.pause(); gameOverAudio.currentTime = 0; } catch (_) {} }
}
export function playGameOverSting(): void { playGameOverSound(); }

export class AudioManager {
  private sfxMuted = false;
  private sfxVolume = 1.0;
  constructor() { if (typeof window !== 'undefined') initSfxAudio(); }
  getBgm() { return musicManager.getCurrentAudio(); }
  preload() { initSfxAudio(); }
  onUserInteraction(isPlaying = false) { unlockAllAudio(); if (isPlaying && !musicManager.isMusicMuted()) musicManager.resumeMusic(); }
  playBgmFromStart(volume?: number, isMuted = false, stage = 1) {
    if (volume !== undefined) musicManager.setMusicVolume(volume);
    musicManager.setMusicMuted(isMuted);
    musicManager.playStageMusic(stage);
  }
  pauseBgm() { musicManager.pauseMusic(); }
  pauseAndResetBgm() { musicManager.stopMusic(); }
  resumeBgm() { musicManager.resumeMusic(); }
  setSfxMuted(m: boolean) { this.sfxMuted = m; if (sfxGainNode) sfxGainNode.gain.value = m ? 0 : 0.35 * this.sfxVolume; if (m) stopSFX(); }
  setMusicMuted(m: boolean) { musicManager.setMusicMuted(m); }
  setMuted(m: boolean) { this.setSfxMuted(m); this.setMusicMuted(m); }
  getMuted() { return this.sfxMuted && musicManager.isMusicMuted(); }
  isSfxMuted() { return this.sfxMuted; }
  isMusicMuted() { return musicManager.isMusicMuted(); }
  setMusicVolume(v: number) { musicManager.setMusicVolume(v); }
  setSfxVolume(v: number) { this.sfxVolume = Math.max(0, Math.min(1, v)); if (sfxGainNode && !this.sfxMuted) sfxGainNode.gain.value = 0.35 * this.sfxVolume; }
  getSfxVolume() { return this.sfxVolume; }
}
export const audioManager = new AudioManager();

export function stopSFX(name?: AudioEffectKey | string): void {
  const list = name ? [sfxPool[SFX_KEY_MAP[name] || name] || sfxPool[name]].filter(Boolean) : Object.values(sfxPool);
  for (const pool of list) for (const node of pool.nodes) { try { node.pause(); node.currentTime = 0; } catch (_) {} }
  if (!name) stopGameOverSound();
}

export function playSFX(name: AudioEffectKey | string): void {
  if (audioManager.isSfxMuted() || typeof window === 'undefined') return;
  const key = SFX_KEY_MAP[name] || name;
  const buffer = sfxBuffers[key] || sfxBuffers[name];
  const ctx = getAudioContext();
  if (buffer && ctx) {
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = 0.35;
      src.connect(g);
      g.connect(ctx.destination);
      src.start(0);
      return;
    } catch (_) {}
  }
  const pool = sfxPool[key] || sfxPool[name];
  if (!pool) return;
  const player = pool.nodes[pool.index];
  pool.index = (pool.index + 1) % pool.nodes.length;
  try { player.volume = Math.max(0, Math.min(1, 0.35 * (audioManager.getSfxVolume() ?? 1))); player.currentTime = 0; player.play().catch(() => {}); } catch (_) {}
}

export const playSfx = playSFX;
export const playSound = playSFX;
export function playStageGoBeep(): void {}

export function playRideOutChime(): void {
  if (audioManager.isSfxMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch (_) {}
}

export function playStageClearFanfare(): void { playSFX('stageClear'); }

export const bgmController = {
  getAudio() { return musicManager.getCurrentAudio(); },
  playFromStart(vol = (getConfig('defaultMusicVolume') as number) ?? 0.81, muted = false, stage = 1) {
    musicManager.setMusicVolume(vol); musicManager.setMusicMuted(muted); musicManager.playStageMusic(stage);
  },
  pauseAndReset() { musicManager.stopMusic(); },
  pause() { musicManager.pauseMusic(); },
  resume() { musicManager.resumeMusic(); },
  setVolume(vol: number) { musicManager.setMusicVolume(vol); },
  setMuted(muted: boolean) { musicManager.setMusicMuted(muted); },
};
