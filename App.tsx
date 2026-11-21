// tslint:disable
/* eslint-disable */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Play,
  RotateCw,
  Volume2,
  VolumeX,
  HelpCircle,
  Menu,
  X,
  Zap,
  Gamepad,
} from 'lucide-react';
import {
  ARCADE_CONTROLS_SPRITE_URL,
  BONE_HEAD_URLS,
  COVER_ART_URLS,
  CUTSCENE_URLS,
  getConfig,
  HELL_KAGE_URLS,
  INTERMISSION_CONFIGS,
  INTERMISSION_URLS,
  type IntermissionCutsceneConfig,
  LEON_URLS,
  NIGHT_RAZOR_ATTACK_URLS,
  STAGE2_BREAKABLE_URLS,
  STAGE2_FOREGROUND_URLS,
  STAGE3_URLS,
  STAGE4_URLS,
  STAGE5_URLS,
  STAGE6_URLS,
  STAGE7_URLS,
  STAGE8_URLS,
  STAGE_NAMES,
  VICTOR_URLS,
} from './constants';
import {
  createFixedStepper,
  formatTime,
  GameState,
  MenuOverlay,
  Overlay,
  prepareCanvas,
  useAssets,
  useAutoFocus,
  useInput,
  useIsMobile,
  useOverlayFocusNavigation,
} from './utils/helper';
import {
  usePlayground,
  usePlaygroundGameLifecycle,
  usePlaygroundResume,
  useRpc,
} from './utils/usePlayground';
import {
  SpriteActionConfig,
  SpriteAnimationState,
  SpriteRenderer,
} from './SpriteRenderer';

import {
  type AudioEffectKey,
  AudioManager,
  AUDIO_FALLBACKS,
  AUDIO_SOURCES,
  audioManager,
  BACKGROUND_MUSIC_URL,
  bgmController,
  BGM_TRACKS,
  decodeAudioDataSafe,
  getAudioContext,
  initSfxAudio,
  isValidMusicUrl,
  LOCAL_BGM_FALLBACK,
  MusicManager,
  musicManager,
  type MusicTrackType,
  MUSIC_URLS,
  playBgmTrack,
  preloadSfxBuffers,
  playGameOverSound,
  playGameOverSting,
  stopGameOverSound,
  playRideOutChime,
  playSFX,
  playSfx,
  playSound,
  playStageClearFanfare,
  playStageGoBeep,
  RIDE_OUT_BLINK_INTERVAL,
  RIDE_OUT_BLINK_VISIBLE_DURATION,
  sfxBuffers,
  sfxGainNode,
  getSfxGainNode,
  SFX_MASTER_VOLUME,
  SFX_VOLUME,
  STAGE_BGM_MAP,
  STAGE_INTRO_DURATION,
  stopSFX,
  STORY_CUTSCENE_URL,
  STREET_Y_MIN,
  STREET_Y_MAX,
  unlockAllAudio,
} from './audio';

export {
  type AudioEffectKey,
  AudioManager,
  AUDIO_FALLBACKS,
  AUDIO_SOURCES,
  audioManager,
  BACKGROUND_MUSIC_URL,
  bgmController,
  BGM_TRACKS,
  decodeAudioDataSafe,
  getAudioContext,
  initSfxAudio,
  isValidMusicUrl,
  LOCAL_BGM_FALLBACK,
  MusicManager,
  musicManager,
  type MusicTrackType,
  MUSIC_URLS,
  playBgmTrack,
  preloadSfxBuffers,
  playGameOverSound,
  playGameOverSting,
  stopGameOverSound,
  playRideOutChime,
  playSFX,
  playSfx,
  playSound,
  playStageClearFanfare,
  playStageGoBeep,
  RIDE_OUT_BLINK_INTERVAL,
  RIDE_OUT_BLINK_VISIBLE_DURATION,
  sfxBuffers,
  sfxGainNode,
  getSfxGainNode,
  SFX_MASTER_VOLUME,
  SFX_VOLUME,
  STAGE_BGM_MAP,
  STAGE_INTRO_DURATION,
  stopSFX,
  STORY_CUTSCENE_URL,
  STREET_Y_MIN,
  STREET_Y_MAX,
  unlockAllAudio,
};

interface CustomWindow extends Window {
  canHandleBackKey?: boolean;
}

// Stage 1 External Single-Frame Image URLs
const EXTERNAL_ASSET_DEFS: Record<string, { url: string; chromaKey: boolean }> = {
  // Custom 4:3 Screen Artwork Covers
  title_cover: { url: COVER_ART_URLS.title_cover, chromaKey: false },
  game_over_screen: { url: COVER_ART_URLS.game_over_screen, chromaKey: false },

  // Custom 4:3 Comic Cutscene Slides (Pre-Stage 1 Intro & Post-Victor Outro)
  intro_slide_1: { url: CUTSCENE_URLS.intro_slide_1, chromaKey: false },
  intro_slide_2: { url: CUTSCENE_URLS.intro_slide_2, chromaKey: false },
  intro_slide_3: { url: CUTSCENE_URLS.intro_slide_3, chromaKey: false },
  outro_slide_1: { url: CUTSCENE_URLS.outro_slide_1, chromaKey: false },
  outro_slide_2: { url: CUTSCENE_URLS.outro_slide_2, chromaKey: false },
  outro_slide_3: { url: CUTSCENE_URLS.outro_slide_3, chromaKey: false },

  // 1. Stage 1 Background (3-layer parallax)
  stage1_sky: { url: 'https://i.postimg.cc/XYm3079C/sky.jpg', chromaKey: false },
  stage1_buildings: { url: './assets/Stages/Stage  (1)/building 1.jpg', chromaKey: true },
  buildingSection1: { url: './assets/Stages/Stage  (1)/building 1.jpg', chromaKey: true },
  buildingSection2: { url: 'https://i.postimg.cc/y6v37dqW/image0-(3).jpg', chromaKey: true },
  stage1_street: { url: 'https://i.postimg.cc/WztMBnMQ/Arcade-game-asphalt-street-asset-a922a66e.jpg', chromaKey: true },

  // 2. Player (Night Razor) single frames
  hero_idle_1: { url: 'https://i.postimg.cc/g0hpcFKx/hero-idle.jpg', chromaKey: true },
  hero_idle_2: { url: 'https://i.postimg.cc/132PZ5D8/hero-idle2.jpg', chromaKey: true },
  hero_walk_1: { url: 'https://i.postimg.cc/xTj9vZ0V/hero-walk1.jpg', chromaKey: true },
  hero_walk_2: { url: 'https://i.postimg.cc/bwW8jN1z/hero-walk4.jpg', chromaKey: true },
  hero_walk_3: { url: 'https://i.postimg.cc/hGmn4W0G/hero-walk3.jpg', chromaKey: true },
  hero_walk_4: { url: 'https://i.postimg.cc/bwW8jN1z/hero-walk4.jpg', chromaKey: true },
  hero_punch_1: { url: 'https://i.postimg.cc/5NPbnm02/hero-punch1.jpg', chromaKey: true },
  hero_punch_2: { url: 'https://i.postimg.cc/ZKf4VLRq/hero-punch2.jpg', chromaKey: true },
  hero_kick_1: { url: 'https://i.postimg.cc/SxJq5z2M/hero-kick2.jpg', chromaKey: true },
  hero_kick_2: { url: 'https://i.postimg.cc/zXDqCQJr/hero-kick.jpg', chromaKey: true },
  hero_damage: { url: 'https://i.postimg.cc/7PnxT4rp/hero-damage.jpg', chromaKey: true },
  hero_damage_midfall: { url: 'https://i.postimg.cc/X7NnfPV7/hero-damage-midfall.jpg', chromaKey: true },
  hero_lose: { url: 'https://i.postimg.cc/g2QdPk3n/hero-lose.jpg', chromaKey: true },
  hero_jump: { url: 'https://i.postimg.cc/qMBpsFk0/hero-jump.jpg', chromaKey: true },
  hero_jumppunch: { url: 'https://i.postimg.cc/wBNzx8k7/hero-jumppunch.jpg', chromaKey: true },
  hero_jumpkick: { url: 'https://i.postimg.cc/ht6gqPVz/hero-jumpkick.jpg', chromaKey: true },
  hero_grab: { url: 'https://i.postimg.cc/jd8tZh5L/hero-grab.jpg', chromaKey: true },
  hero_knee: { url: 'https://i.postimg.cc/X724QgJJ/hero-knee.jpg', chromaKey: true },
  hero_throw: { url: 'https://i.postimg.cc/N0XtGqxF/hero-throw.jpg', chromaKey: true },

  // Night Razor Multi-frame Attack Tween Sprites
  hero_punch_smear: { url: NIGHT_RAZOR_ATTACK_URLS.hero_punch_smear, chromaKey: true },
  hero_punch1_follow: { url: NIGHT_RAZOR_ATTACK_URLS.hero_punch1_follow, chromaKey: true },
  hero_load: { url: NIGHT_RAZOR_ATTACK_URLS.hero_load, chromaKey: true },
  hero_pull: { url: NIGHT_RAZOR_ATTACK_URLS.hero_pull, chromaKey: true },
  hero_punch2_smear: { url: NIGHT_RAZOR_ATTACK_URLS.hero_punch2_smear, chromaKey: true },
  hero_punch2_follow: { url: NIGHT_RAZOR_ATTACK_URLS.hero_punch2_follow, chromaKey: true },
  hero_kick_kneel: { url: NIGHT_RAZOR_ATTACK_URLS.hero_kick_kneel, chromaKey: true },
  hero_kick_spring: { url: NIGHT_RAZOR_ATTACK_URLS.hero_kick_spring, chromaKey: true },
  hero_kick_smear: { url: NIGHT_RAZOR_ATTACK_URLS.hero_kick_smear, chromaKey: true },

// 3. Enemy 1 (Street Punk / Grunt) single frames
  enemy_idle: { url: 'https://i.postimg.cc/tg6bRQz1/enemy-idle.jpg', chromaKey: true },
  enemy_walk_1: { url: 'https://i.postimg.cc/k5SCM3yM/enemy-walk1.jpg', chromaKey: true },
  enemy_walk_2: { url: 'https://i.postimg.cc/mgJRG27s/enemy-walk2.jpg', chromaKey: true },
  enemy_walk_3: { url: 'https://i.postimg.cc/vHPb3vBt/enemy-walk3.jpg', chromaKey: true },
  enemy_walk_4: { url: 'https://i.postimg.cc/YCZkwqQw/enemy-walk4.jpg', chromaKey: true },
  enemy_punch: { url: 'https://i.postimg.cc/Sx3qpNcm/enemy-punch.jpg', chromaKey: true },
  enemy_damage: { url: 'https://i.postimg.cc/W4ZVpL7F/enemy-damage.jpg', chromaKey: true },
  enemy_lose: { url: 'https://i.postimg.cc/0yFxq2DF/enemy-lose.jpg', chromaKey: true },
  enemy1_idle: { url: 'https://i.postimg.cc/tg6bRQz1/enemy-idle.jpg', chromaKey: true },
  enemy1_walk1: { url: 'https://i.postimg.cc/k5SCM3yM/enemy-walk1.jpg', chromaKey: true },
  enemy1_walk2: { url: 'https://i.postimg.cc/mgJRG27s/enemy-walk2.jpg', chromaKey: true },
  enemy1_walk3: { url: 'https://i.postimg.cc/vHPb3vBt/enemy-walk3.jpg', chromaKey: true },
  enemy1_walk4: { url: 'https://i.postimg.cc/YCZkwqQw/enemy-walk4.jpg', chromaKey: true },
  enemy1_punch: { url: 'https://i.postimg.cc/Sx3qpNcm/enemy-punch.jpg', chromaKey: true },
  enemy1_damage: { url: 'https://i.postimg.cc/W4ZVpL7F/enemy-damage.jpg', chromaKey: true },
  enemy1_lose: { url: 'https://i.postimg.cc/0yFxq2DF/enemy-lose.jpg', chromaKey: true },

  // Enemy 2 Sprites
  enemy2_idle: { url: 'https://i.postimg.cc/V6yZL8hT/Sprite-on-green-background-10e418bb.jpg', chromaKey: true },
  enemy2_walk1: { url: 'https://i.postimg.cc/Tw8NY6Sd/Clean-sprite-on-green-background-26078ad5.jpg', chromaKey: true },
  enemy2_walk2: { url: 'https://i.postimg.cc/rm6ZFkby/Clean-sprite-on-green-background-171ffd5a.jpg', chromaKey: true },
  enemy2_walk3: { url: 'https://i.postimg.cc/tThSscQy/Sprite-isolated-on-green-background-a3e73a99.jpg', chromaKey: true },
  enemy2_walk4: { url: 'https://i.postimg.cc/rm6ZFkby/Clean-sprite-on-green-background-171ffd5a.jpg', chromaKey: true },
  enemy2_punch: { url: 'https://i.postimg.cc/rm0dg6F0/Sprite-isolated-on-green-background-42471e8d.jpg', chromaKey: true },
  enemy2_damage: { url: 'https://i.postimg.cc/4dzLY0k4/Clean-sprite-on-green-background-63e91cc1.jpg', chromaKey: true },
  enemy2_lose: { url: 'https://i.postimg.cc/ZRksKSgK/Clean-sprite-on-green-background-68e82b91.jpg', chromaKey: true },

  // Enemy 3 Sprites
  enemy3_idle: { url: 'https://i.postimg.cc/zBntyQZY/Clean-sprite-on-green-background-680f9f37.jpg', chromaKey: true },
  enemy3_walk1: { url: 'https://i.postimg.cc/63dj8PJp/Character-on-green-background-9e4e26bd.jpg', chromaKey: true },
  enemy3_walk2: { url: 'https://i.postimg.cc/50w7Xrdy/Character-sprite-on-green-backgr-c58ba2d1.jpg', chromaKey: true },
  enemy3_walk3: { url: 'https://i.postimg.cc/gJvSx7FJ/Sprite-isolated-on-green-background-5dd9e813.jpg', chromaKey: true },
  enemy3_walk4: { url: 'https://i.postimg.cc/50w7Xrdy/Character-sprite-on-green-backgr-c58ba2d1.jpg', chromaKey: true },
  enemy3_punch: { url: 'https://i.postimg.cc/fLx2VPnJ/Sprite-on-green-background-816aae06.jpg', chromaKey: true },
  enemy3_damage: { url: 'https://i.postimg.cc/Twr7KsM6/Character-on-green-background-c34b6e8e.jpg', chromaKey: true },
  enemy3_lose: { url: 'https://i.postimg.cc/d18HhfPq/Clean-sprite-on-green-background-766634b5.jpg', chromaKey: true },

  // 4. Progression Cue Banner ("RIDE OUT >>>")
  ride_out_banner: { url: 'https://i.postimg.cc/65cbD40L/image0.jpg', chromaKey: true },
  ride_out_prompt: { url: 'https://i.postimg.cc/65cbD40L/image0.jpg', chromaKey: true },

  // 5. Stage 1 Intro Banner ("LET'S GET IT")
  stage1_intro_banner: { url: 'https://i.postimg.cc/7YMkppk0/IMG-7227.jpg', chromaKey: true },

  // 6. Hero Portrait (Night Razor Face)
  hero_portrait: {
    url: 'https://i.postimg.cc/6pCPGFf6/IMG-7260.jpg',
    chromaKey: true,
  },

  // 7. Custom Item Pickup and 3-Shot Gun Burst Sprites
  pickupSprite: { url: 'https://i.postimg.cc/YSG4tp8L/hero-pickup.jpg', chromaKey: true },
  gunPose1Sprite: { url: 'https://i.postimg.cc/x8YqGLQr/Clean-sprite-on-green-background-e8a8ee17.jpg', chromaKey: true },
  gunPose2Sprite: { url: 'https://i.postimg.cc/NMR5rp3G/Character-isolated-on-green-back-d0703e23.jpg', chromaKey: true },
  gunPose3Sprite: { url: 'https://i.postimg.cc/tJy7dFbZ/Sprite-on-green-background-355892eb.jpg', chromaKey: true },
  bulletProjectileSprite: { url: 'https://i.postimg.cc/YC3cjgnR/image0-(1).jpg', chromaKey: true },

  // 8. Custom Breakable Street Props
  trash_can: { url: 'https://i.postimg.cc/15g3dDcm/Steel-wire-mesh-trash-can-sprite-fee0e20e.jpg', chromaKey: true },
  breakableSoda: { url: 'https://i.postimg.cc/vTJC9y1h/Vending-machine-game-sprite-cutout-00044a95.jpg', chromaKey: true },
  breakablePhoneBooth: { url: 'https://i.postimg.cc/hjV38cpB/IMG-7257.jpg', chromaKey: true },
  breakableHydrant: { url: 'https://i.postimg.cc/3N4PdNwj/Red-fire-hydrant-game-sprite-2e5d24d9.jpg', chromaKey: true },

  // 9. Foreground Depth Overlay Assets (1.15x Parallax)
  fgPole: { url: 'https://i.postimg.cc/KvK8WtrM/Light-pole-game-asset-overlay-505af093.jpg', chromaKey: true },
  fgFence1: { url: 'https://i.postimg.cc/Fs2HX1DS/Chain-link-fence-game-asset-14e22b0c.jpg', chromaKey: true },
  fgFence2: { url: 'https://i.postimg.cc/gjdtNQTc/IMG-7249.jpg', chromaKey: true },
  fgFence3: { url: 'https://i.postimg.cc/1XP7J2j9/IMG-7250.jpg', chromaKey: true },
  fgCrowd1: { url: 'https://i.postimg.cc/HsJkNb4g/Bystanders-watching-street-fight-6aacaef2.jpg', chromaKey: true },
  fgCrowd2: { url: 'https://i.postimg.cc/XJ9DK4QG/IMG-7252.jpg', chromaKey: true },
  fgCrowd3: { url: 'https://i.postimg.cc/9MyNPCJ4/IMG-7251.jpg', chromaKey: true },
  fgDumpster1: { url: 'https://i.postimg.cc/CLZx2bHY/Dumpster-overflowing-with-trash-421d310b.jpg', chromaKey: true },
  fgDumpster2: { url: 'https://i.postimg.cc/zBTPw80J/IMG-7253.jpg', chromaKey: true },
  fgCar: { url: 'https://i.postimg.cc/vB5S7b3F/IMG-7254.jpg', chromaKey: true },
  fgFence: { url: 'https://i.postimg.cc/Fs2HX1DS/Chain-link-fence-game-asset-14e22b0c.jpg', chromaKey: true },
  fgDumpster: { url: 'https://i.postimg.cc/CLZx2bHY/Dumpster-overflowing-with-trash-421d310b.jpg', chromaKey: true },
  fgCrowd: { url: 'https://i.postimg.cc/HsJkNb4g/Bystanders-watching-street-fight-6aacaef2.jpg', chromaKey: true },

  // 10. Stage 2 (Nightclub Dancefloor) Assets
  clubBg: { url: 'https://i.postimg.cc/W1B8rJLk/Nightclub-video-game-background-c8c4a540.jpg', chromaKey: false },
  clubBg1: { url: 'https://i.postimg.cc/W1B8rJLk/Nightclub-video-game-background-c8c4a540.jpg', chromaKey: false },
  clubBg2: { url: 'https://i.postimg.cc/nLYQSX5G/Continuing-club-scene-platform-d-691f951b.jpg', chromaKey: false },
  clubFloor: { url: 'https://i.postimg.cc/Jn1hdPCC/Adjusting-light-and-clothing-3019476a.jpg', chromaKey: true },
  clubFgRails: { url: 'https://i.postimg.cc/9fMS82R0/Edit-image-to-keep-guardrails-b99e8d77.jpg', chromaKey: true },

  // 11. Stage 2 (Nightclub Dancefloor) Breakables - Direct URLs with green screen chroma key
  clubStool: { url: STAGE2_BREAKABLE_URLS.clubStool, chromaKey: true },
  clubSpeaker: { url: STAGE2_BREAKABLE_URLS.clubSpeaker, chromaKey: true },
  clubTable: { url: STAGE2_BREAKABLE_URLS.clubTable, chromaKey: true },

  // 12. Stage 2 (Nightclub Dancefloor) Foreground Depth Overlays (1.15x Parallax)
  clubBeam1: { url: STAGE2_FOREGROUND_URLS.clubBeam1, chromaKey: true },
  clubBeam2: { url: STAGE2_FOREGROUND_URLS.clubBeam2, chromaKey: true },
  clubCouple1: { url: STAGE2_FOREGROUND_URLS.clubCouple1, chromaKey: true },
  clubCouple2: { url: STAGE2_FOREGROUND_URLS.clubCouple2, chromaKey: true },

  // 13. Stage 3 (Underground Parking Garage) Assets
  garageBg1: { url: STAGE3_URLS.garageBg1, chromaKey: true },
  garageBg2: { url: STAGE3_URLS.garageBg2, chromaKey: true },
  garageFloor: { url: STAGE3_URLS.garageFloor, chromaKey: true },
  garageBeam: { url: STAGE3_URLS.garageBeam, chromaKey: true },
  garageBeam1: { url: STAGE3_URLS.garageBeam1, chromaKey: true },
  garageBeam2: { url: STAGE3_URLS.garageBeam2, chromaKey: true },
  garageCar: { url: STAGE3_URLS.garageCar, chromaKey: true },
  garageCar1: { url: STAGE3_URLS.garageCar1, chromaKey: true },
  garageCar2: { url: STAGE3_URLS.garageCar2, chromaKey: true },

  // 14. Stage 3 (Underground Parking Garage) Breakables
  garageTire: { url: STAGE3_URLS.garageTire, chromaKey: true },
  garageDrum: { url: STAGE3_URLS.garageDrum, chromaKey: true },
  garageCone: { url: STAGE3_URLS.garageCone, chromaKey: true },

   // 15. Stage 4 (Downtown Street Race) Assets
  stage4_skyline: { url: './assets/Stages/Stage  (4)/stage4_skyline.jpg', chromaKey: false },
  stage4_bldA: { url: './assets/Stages/Stage  (4)/stage4_bldA.jpg', chromaKey: true },
  stage4_bldB: { url: './assets/Stages/Stage  (4)/stage4_bldB.jpg', chromaKey: true },

  stage4_floor: { url: STAGE4_URLS.floor, chromaKey: true },
  stage4_guy1: { url: STAGE4_URLS.guy1, chromaKey: true },
  stage4_guy2: { url: STAGE4_URLS.guy2, chromaKey: true },
  stage4_guy3: { url: STAGE4_URLS.guy3, chromaKey: true },
  stage4_guy4: { url: STAGE4_URLS.guy4, chromaKey: true },
  stage4_fence: { url: STAGE4_URLS.fence, chromaKey: true },

  // 16. Stage 5 (The Casino) Assets
  casinoBgA: { url: STAGE5_URLS.casinoBgA, chromaKey: false },
  casinoBgB: { url: STAGE5_URLS.casinoBgB, chromaKey: false },
  casinoFloorA: { url: STAGE5_URLS.casinoFloorA, chromaKey: true },
  casinoVelvetRope: { url: STAGE5_URLS.casinoVelvetRope, chromaKey: true },
  casinoSlotFg: { url: STAGE5_URLS.casinoSlotFg, chromaKey: true },
  casinoStanchion: { url: STAGE5_URLS.casinoStanchion, chromaKey: true },
  casinoStool: { url: STAGE5_URLS.casinoStool, chromaKey: true },
  casinoTable: { url: STAGE5_URLS.casinoTable, chromaKey: true },

  // 17. Stage 6 (Police Precinct) Assets
  precinctWindowBg: { url: STAGE6_URLS.precinctWindowBg, chromaKey: false },
  precinctRoomA: { url: STAGE6_URLS.precinctRoomA, chromaKey: false },
  precinctRoomB: { url: STAGE6_URLS.precinctRoomB, chromaKey: false },
  precinctSeamPillar: { url: STAGE6_URLS.precinctSeamPillar, chromaKey: true },
  precinctArchway: { url: STAGE6_URLS.precinctArchway, chromaKey: true },
  precinctDeskCop1: { url: STAGE6_URLS.precinctDeskCop1, chromaKey: true },
  precinctDeskCop2: { url: STAGE6_URLS.precinctDeskCop2, chromaKey: true },
  precinctRiotCops: { url: STAGE6_URLS.precinctRiotCops, chromaKey: true },
  precinctWaterCooler: { url: STAGE6_URLS.precinctWaterCooler, chromaKey: true },
  precinctTrashCan: { url: STAGE6_URLS.precinctTrashCan, chromaKey: true },
  precinctChair: { url: STAGE6_URLS.precinctChair, chromaKey: true },

  // 18. Stage 7 (Executive Penthouse) Assets
  penthouseSkyline: { url: STAGE7_URLS.skyline, chromaKey: false },
  penthouseRoomA: { url: STAGE7_URLS.roomA, chromaKey: false },
  penthouseRoomB: { url: STAGE7_URLS.roomB, chromaKey: false },
  penthouseSeamDivider: { url: STAGE7_URLS.seamDivider, chromaKey: true },
  penthousePalmPlant: { url: STAGE7_URLS.palmPlant, chromaKey: true },
  penthouseRibbonStatue: { url: STAGE7_URLS.ribbonStatue, chromaKey: true },
  penthouseBreakableStatue: { url: STAGE7_URLS.breakableStatue, chromaKey: true },
  penthouseBreakablePlant: { url: STAGE7_URLS.breakablePlant, chromaKey: true },
  penthouseBreakableChair: { url: STAGE7_URLS.breakableChair, chromaKey: true },

  // 19. Stage 8 (Skyscraper Rooftop) Assets
  rooftopSkyline: { url: STAGE8_URLS.rooftopSkyline, chromaKey: false },
  rooftopSectionA: { url: STAGE8_URLS.rooftopSectionA, chromaKey: true },
  rooftopSectionB: { url: STAGE8_URLS.rooftopSectionB, chromaKey: true },
  rooftopForegroundLedge: { url: STAGE8_URLS.rooftopForegroundLedge, chromaKey: true },
  rooftopTrashCan: { url: STAGE8_URLS.rooftopTrashCan, chromaKey: true },
  rooftopWoodenCrate: { url: STAGE8_URLS.rooftopWoodenCrate, chromaKey: true },

  // 20. Leon (Stage 2 Nightclub Boss) Single-Frame Sprites
  leon_idle_1: { url: LEON_URLS.leon_idle_1, chromaKey: true },
  leon_idle_2: { url: LEON_URLS.leon_idle_2, chromaKey: true },
  leon_walk_1: { url: LEON_URLS.leon_walk_1, chromaKey: true },
  leon_walk_2: { url: LEON_URLS.leon_walk_2, chromaKey: true },
  leon_walk_3: { url: LEON_URLS.leon_walk_3, chromaKey: true },
  leon_walk_4: { url: LEON_URLS.leon_walk_4, chromaKey: true },
  leon_punch: { url: LEON_URLS.leon_punch, chromaKey: true },
  leon_hurt: { url: LEON_URLS.leon_hurt, chromaKey: true },
  leon_knockdown: { url: LEON_URLS.leon_knockdown, chromaKey: true },

  // 21. Hell Kage (Stage 4 Downtown Street Race Boss) Single-Frame Sprites
  hellkage_idle_1: { url: HELL_KAGE_URLS.hellkage_idle_1, chromaKey: true },
  hellkage_idle_2: { url: HELL_KAGE_URLS.hellkage_idle_2, chromaKey: true },
  hellkage_walk_1: { url: HELL_KAGE_URLS.hellkage_walk_1, chromaKey: true },
  hellkage_walk_2: { url: HELL_KAGE_URLS.hellkage_walk_2, chromaKey: true },
  hellkage_walk_3: { url: HELL_KAGE_URLS.hellkage_walk_3, chromaKey: true },
  hellkage_walk_4: { url: HELL_KAGE_URLS.hellkage_walk_4, chromaKey: true },
  hellkage_punch: { url: HELL_KAGE_URLS.hellkage_punch, chromaKey: true },
  hellkage_hurt: { url: HELL_KAGE_URLS.hellkage_hurt, chromaKey: true },
  hellkage_knockdown: { url: HELL_KAGE_URLS.hellkage_knockdown, chromaKey: true },

  // 22. Bone Head (Stage 6 Police Precinct Boss) Single-Frame Sprites
  bonehead_idle_1: { url: BONE_HEAD_URLS.bonehead_idle_1, chromaKey: true },
  bonehead_idle_2: { url: BONE_HEAD_URLS.bonehead_idle_2, chromaKey: true },
  bonehead_walk_1: { url: BONE_HEAD_URLS.bonehead_walk_1, chromaKey: true },
  bonehead_walk_2: { url: BONE_HEAD_URLS.bonehead_walk_2, chromaKey: true },
  bonehead_walk_3: { url: BONE_HEAD_URLS.bonehead_walk_3, chromaKey: true },
  bonehead_walk_4: { url: BONE_HEAD_URLS.bonehead_walk_4, chromaKey: true },
  bonehead_punch: { url: BONE_HEAD_URLS.bonehead_punch, chromaKey: true },
  bonehead_hurt: { url: BONE_HEAD_URLS.bonehead_hurt, chromaKey: true },
  bonehead_knockdown: { url: BONE_HEAD_URLS.bonehead_knockdown, chromaKey: true },

  // 23. Victor (Stage 8 Skyscraper Rooftop Boss) Single-Frame Sprites
  victor_idle_1: { url: VICTOR_URLS.victor_idle_1, chromaKey: true },
  victor_idle_2: { url: VICTOR_URLS.victor_idle_2, chromaKey: true },
  victor_walk_1: { url: VICTOR_URLS.victor_walk_1, chromaKey: true },
  victor_walk_2: { url: VICTOR_URLS.victor_walk_2, chromaKey: true },
  victor_walk_3: { url: VICTOR_URLS.victor_walk_3, chromaKey: true },
  victor_walk_4: { url: VICTOR_URLS.victor_walk_4, chromaKey: true },
  victor_punch: { url: VICTOR_URLS.victor_punch, chromaKey: true },
  victor_hurt: { url: VICTOR_URLS.victor_hurt, chromaKey: true },
  victor_knockdown: { url: VICTOR_URLS.victor_knockdown, chromaKey: true },
};

/**
 * Maps Postimages page URLs to their exact direct image URLs.
 */
export const POSTIMAGE_PAGE_MAP: Record<string, string> = {
  'https://postimg.cc/FkSyJxVh': 'https://i.postimg.cc/7hsmdsCJ/Bar-stool-game-asset-5cc81bbe.jpg',
  'https://postimg.cc/6T4LS9JV': 'https://i.postimg.cc/sfw6MXTL/DJ-club-speaker-street-prop-ca2a06ac.jpg',
  'https://postimg.cc/30GXDZFN': 'https://i.postimg.cc/qqbjSbts/Club-dining-table-sprite-asset-c4524b47.jpg',
  'https://postimg.cc/kRSQtyFH': 'https://i.postimg.cc/kRSQtyFH/Metal-truss-beam.jpg',
  'https://postimg.cc/bSnx2R9f': 'https://i.postimg.cc/bSnx2R9f/Brick-column.jpg',
  'https://postimg.cc/8fvRrbmG': 'https://i.postimg.cc/8fvRrbmG/Vip-couple-1.jpg',
  'https://postimg.cc/m19YFSyB': 'https://i.postimg.cc/m19YFSyB/Vip-couple-2.jpg',
  'https://postimg.cc/xXNyPC1F': 'https://i.postimg.cc/HkBZd8DH/Editing-parking-garage-game-back-22e4859a.jpg',
  'https://postimg.cc/dhZm91VN': 'https://i.postimg.cc/sgw6sGdz/Change-pillar-signs-and-cars-60058e9b-(1).jpg',
  'https://postimg.cc/sgw6sGdz': 'https://i.postimg.cc/sgw6sGdz/Change-pillar-signs-and-cars-60058e9b-(1).jpg',
  'https://postimg.cc/YLgQvTvZ': 'https://i.postimg.cc/J0wf0Z9V/remove-the-water-puddle-dde2b343-2K.jpg',
  'https://postimg.cc/vgznrGPB': 'https://i.postimg.cc/J0wf0Z9V/remove-the-water-puddle-dde2b343-2K.jpg',
  'https://postimg.cc/VJ0BF6kh': 'https://i.postimg.cc/J0wf0Z9V/remove-the-water-puddle-dde2b343-2K.jpg',
  'https://postimg.cc/qhLbZhJj': 'https://i.postimg.cc/J0wf0Z9V/remove-the-water-puddle-dde2b343-2K.jpg',
  'https://postimg.cc/LJgBVX8C': 'https://i.postimg.cc/t42SpnQj/Concrete-pillar-with-security-ca-e9c7f336.jpg',
  'https://postimg.cc/VJ0BF6k7': 'https://i.postimg.cc/sgw6sGdR/Parked-car-foreground-prop-overlay-5e535a0e.jpg',
  'https://postimg.cc/hXQb0jtr': 'https://i.postimg.cc/6pYjt4sD/Sedan-foreground-prop-overlay-762f3a1c-(1).jpg',
};

/**
 * Resolves any Postimages URL (direct or page) to the direct raw image URL.
 */
const EXACT_LOCAL_PATHS: Record<string, string> = {
  // COVER ART, OVERLAYS & CUTSCENES
  'Removing-text-and-logos-d8eb9d68.jpg': './assets/COVER ART/Removing_text_and_logos_d8eb9d68.jpg',
  'Removing-text-and-logos-7f7a402a.jpg': './assets/COVER ART/Removing_text_and_logos_7f7a402a.jpg',
  'Create-cartoon-hero-portrait-5e59aeb9.jpg': './assets/Overlays/Create_cartoon_hero_portrait_5e59aeb9.jpg',
  'Replace-kneeling-character-with-182f4b15.jpg': './assets/cutscenes/Replace_kneeling_character_with_…_182f4b15.jpg',
  'Edit-button-letters-and-backgrounds-7fb7a3ca.jpg': './assets/Breakables/Edit_button_letters_and_backgrounds_7fb7a3ca.jpg',
  'image0.jpg': './assets/Overlays/image0.jpeg',
  'image0-(1).jpg': './assets/Overlays/image0 (1).jpeg',
  'Syndicate-takes-over-Pearl-City-2b59f0d7.jpg': './assets/cutscenes/Syndicate_takes_over_Pearl_City_2b59f0d7.jpg',
  'Add-story-text-to-box-ca1c0f5b.jpg': './assets/cutscenes/Add_story_text_to_box_ca1c0f5b.jpg',
  'Change-words-on-box-34545edb.jpg': './assets/cutscenes/Change_words_on_box_34545edb.jpg',
  'Change-words-on-box-f8275ce0.jpg': './assets/cutscenes/Change_words_on_box_f8275ce0.jpg',
  'Change-text-on-box-8e3fbfe9.jpg': './assets/cutscenes/Change_text_on_box_8e3fbfe9.jpg',
  'Adding-copyright-and-text-details-666d04ea.jpg': './assets/cutscenes/Adding_copyright_and_text_details_666d04ea.jpg',
  'IMG-7604.jpg': './assets/cutscenes/IMG_7604.JPG',
  'IMG-7605.jpg': './assets/cutscenes/IMG_7605.JPG',
  'IMG-7606.jpg': './assets/cutscenes/IMG_7606.JPG',
  'IMG-7607.jpg': './assets/cutscenes/IMG_7607.JPG',

  // STAGE 1 & BREAKABLES ALIASES
  'sky.jpg': './assets/Stages/Stage  (4)/Isolate_distant_night_sky_skyscr…_63246386.jpg',
  'buildings.jpg': './assets/Stages/Stage  (1)/building 1.jpg',
  'image0-(3).jpg': './assets/Stages/Stage  (1)/image0 (3).jpeg',
  'Arcade-game-asphalt-street-asset-a922a66e.jpg': './assets/Stages/Stage  (1)/Arcade_game_asphalt_street_asset_a922a66e.jpg',
  'IMG-7249.jpg': './assets/Stages/Stage  (1)/IMG_7249.JPG',
  'IMG-7250.jpg': './assets/Stages/Stage  (1)/IMG_7250.JPG',
  'IMG-7342.jpg': './assets/Stages/Stage  (8)/IMG_7342.JPG',
  'IMG-7251.jpg': './assets/Breakables/IMG_7251.JPG',
  'IMG-7252.jpg': './assets/Breakables/IMG_7252.JPG',
  'IMG-7253.jpg': './assets/Breakables/IMG_7253.JPG',
  'IMG-7254.jpg': './assets/Breakables/IMG_7254.JPG',
  'IMG-7257.jpg': './assets/Breakables/IMG_7257.JPG',
  'IMG-7343.jpg': './assets/Breakables/IMG_7343.JPG',
  'IMG-7345.jpg': './assets/Breakables/IMG_7345.JPG',

  // NIGHT RAZOR & ENEMY 1
  'hero-idle.jpg': './assets/SPRITES/NightRazor/hero-idle.jpg',
  'hero-idle2.jpg': './assets/SPRITES/NightRazor/hero-idle2.jpg',
  'hero-walk1.jpg': './assets/SPRITES/NightRazor/hero-walk1.jpg',
  'hero-walk3.jpg': './assets/SPRITES/NightRazor/hero-walk3.jpg',
  'hero-walk4.jpg': './assets/SPRITES/NightRazor/hero-walk4.jpg',
  'hero-punch1.jpg': './assets/SPRITES/NightRazor/hero-punch1.jpg',
  'hero-punch2.jpg': './assets/SPRITES/NightRazor/hero-punch2.jpg',
  'hero-kick.jpg': './assets/SPRITES/NightRazor/hero-kick.jpg',
  'hero-kick2.jpg': './assets/SPRITES/NightRazor/hero-kick2.jpg',
  'hero-damage.jpg': './assets/SPRITES/NightRazor/hero-damage.jpg',
  'hero-damage-midfall.jpg': './assets/SPRITES/NightRazor/hero-damage-midfall.jpg',
  'hero-lose.jpg': './assets/SPRITES/NightRazor/hero-lose.jpg',
  'hero-jump.jpg': './assets/SPRITES/NightRazor/hero-jump.jpg',
  'hero-jumppunch.jpg': './assets/SPRITES/NightRazor/hero-jumppunch.jpg',
  'hero-jumpkick.jpg': './assets/SPRITES/NightRazor/hero-jumpkick.jpg',
  'hero-grab.jpg': './assets/SPRITES/NightRazor/hero-grab.jpg',
  'hero-knee.jpg': './assets/SPRITES/NightRazor/hero-knee.jpg',
  'hero-throw.jpg': './assets/SPRITES/NightRazor/hero-throw.jpg',
  'hero-pickup.jpg': './assets/SPRITES/NightRazor/hero-pickup.jpg',
  'pull.jpg': './assets/SPRITES/NightRazor/pull.jpg',
  'load.jpg': './assets/SPRITES/NightRazor/load.jpg',
  'enemy-idle.jpg': './assets/SPRITES/Enemy1/enemy-idle.jpg',
  'enemy-walk1.jpg': './assets/SPRITES/Enemy1/enemy-walk1.jpg',
  'enemy-walk2.jpg': './assets/SPRITES/Enemy1/enemy-walk2.jpg',
  'enemy-walk3.jpg': './assets/SPRITES/Enemy1/enemy-walk3.jpg',
  'enemy-walk4.jpg': './assets/SPRITES/Enemy1/enemy-walk4.jpg',
  'enemy-punch.jpg': './assets/SPRITES/Enemy1/enemy-punch.jpg',
  'enemy-damage.jpg': './assets/SPRITES/Enemy1/enemy-damage.jpg',
  'enemy-lose.jpg': './assets/SPRITES/Enemy1/enemy-lose.jpg',
};
const HASH_PATH_MAP: Record<string, string> = {
  // Cutscenes & NightRazor long names
  '182f4b15': './assets/cutscenes/Replace_kneeling_character_with_…_182f4b15.jpg',
  '536fc7d5': './assets/SPRITES/NightRazor/Posing-character-like-second-cha-536fc7d5.jpg',
  '51da999a': './assets/SPRITES/NightRazor/Clean_sprite_sheet_character_iso…_51da999a.jpg',
  'd0703e23': './assets/SPRITES/NightRazor/Character-isolated-on-green-back-d0703e23.jpg',
  'cd98e2bf': './assets/SPRITES/BoneHead/Character_isolated_on_green_back…_cd98e2bf.jpg',
  'c58ba2d1': './assets/SPRITES/Enemy3/Character_sprite_on_green_backgr…_c58ba2d1.jpg',
  '1d7e0039': './assets/SPRITES/Victor/Character_sprite_on_green_backgr…_1d7e0039.jpg',
  // Stage (1)
  '9d4f7831': './assets/Stages/Stage  (1)/Slice_layered_parallax_backgroun…_9d4f7831.jpg',
  '14e22b0c': './assets/Stages/Stage  (1)/Chain-link_fence_game_asset_14e22b0c.jpg',
  'b2ca9802': './assets/Stages/Stage  (1)/Spectators_watching_street_fight_b2ca9802.jpg',
  '50f286f2': './assets/Stages/Stage  (1)/Render_photo_in_game_style_50f286f2.jpg',
  '0d6c6a5f': './assets/Stages/Stage  (1)/Transform_photo_into_game_art_0d6c6a5f.jpg',
  '98cfcf42': './assets/Stages/Stage  (1)/Spectators_watching_street_fight_98cfcf42.jpg',
  '1561141a': './assets/Stages/Stage  (1)/Create_green_chroma_key_background_1561141a.jpg',
  '421d310b': './assets/Stages/Stage  (1)/Dumpster_overflowing_with_trash_…_421d310b.jpg',
  '505af093': './assets/Stages/Stage  (1)/Light_pole_game_asset_overlay_505af093.jpg',
  'b0db260c': './assets/Stages/Stage  (1)/Nightclub_exterior_video_game_ba…_b0db260c.jpg',
  'e7ea56db': './assets/Stages/Stage  (1)/Stylize_photo_in_game_art_e7ea56db.jpg',
  '6aacaef2': './assets/Stages/Stage  (1)/Bystanders_watching_street_fight_6aacaef2.jpg',
  '20c5d46a': './assets/Stages/Stage  (1)/Utility_light_pole_foreground_ov…_20c5d46a.jpg',
  '7baae13c': './assets/Stages/Stage  (1)/Chain-link_fence_game_asset_7baae13c.jpg',
  '0e99e532': './assets/Stages/Stage  (1)/Dumpster_overflowing_with_trash_…_0e99e532.jpg',
  '895000bc': './assets/Stages/Stage  (1)/Modern_urban_street_light_asset_895000bc.jpg',
  // Stage (2)
  'c8c4a540': './assets/Stages/Stage  (2)/Nightclub_video_game_background_…_c8c4a540.jpg',
  'aaaac71a': './assets/Stages/Stage  (2)/Extract_rails_from_photo_aaaac71a.jpg',
  'ca2a06ac': './assets/Stages/Stage  (2)/DJ_club_speaker_street_prop_ca2a06ac.jpg',
  'e3824f36': './assets/Stages/Stage  (2)/Couple_watching_street_fight_e3824f36.jpg',
  '3019476a': './assets/Stages/Stage  (2)/Adjusting_light_and_clothing_3019476a.jpg',
  '5d632021': './assets/Stages/Stage  (2)/Editing_dancefloor_image_with_gr…_5d632021.jpg',
  '0f6a93d0': './assets/Stages/Stage  (2)/Extract_brick_beam_0f6a93d0.jpg',
  'f8b592dd': './assets/Stages/Stage  (2)/Render_photo_in_game_style_f8b592dd.jpg',
  '691f951b': './assets/Stages/Stage  (2)/Continuing_club_scene_platform_d…_691f951b.jpg',
  'deca456a': './assets/Stages/Stage  (2)/Couple_watching_street_fight_ove…_deca456a.jpg',
  // Stage (3)
  '5e535a0e': './assets/Stages/Stage  (3)/Parked_car_foreground_prop_overlay_5e535a0e.jpg',
  'e9c7f336': './assets/Stages/Stage  (3)/Concrete_pillar_with_security_ca…_e9c7f336.jpg',
  '762f3a1c': './assets/Stages/Stage  (3)/Sedan_foreground_prop_overlay_762f3a1c.jpg',
  '22e4859a': './assets/Stages/Stage  (3)/Editing_parking_garage_game_back…_22e4859a.jpg',
  '21736438': './assets/Stages/Stage  (3)/Parked_car_video_game_overlay_21736438.jpg',
  '8002b460': './assets/Stages/Stage  (3)/Render_photo_in_game_style_8002b460.jpg',
  '5c973b19': './assets/Stages/Stage  (3)/Keep_horizontal_lines_remove_others_5c973b19.jpg',
  '60058e9b': './assets/Stages/Stage  (3)/Change_pillar_signs_and_cars_60058e9b.jpg',
  '271f6f6b': './assets/Stages/Stage  (3)/Parking_garage_game_background_271f6f6b.jpg',
  '6c9be296': './assets/Stages/Stage  (3)/Remove_trash_and_debris_6c9be296.jpg',
  // Stage (4)
  '33e0980c': './assets/Stages/Stage  (4)/Isolate_street_elements_and_gree…_33e0980c.jpg',
  '1a99e6e2': './assets/Stages/Stage  (4)/Turning_subject_to_face_away_1a99e6e2.jpg',
  'eee6bf61': './assets/Stages/Stage  (4)/Isolate_image_elements_and_green…_eee6bf61.jpg',
  'b14c248e': './assets/Stages/Stage  (4)/Styling_photo_like_game_art_b14c248e.jpg',
  '984de273': './assets/Stages/Stage  (4)/Connect_road_edges_seamlessly_984de273.jpg',
  'e7979c8f': './assets/Stages/Stage  (4)/Turning_subject_to_face_away_e7979c8f.jpg',
  '486b9c99': './assets/Stages/Stage  (4)/Adjust_building_designs_and_back…_486b9c99.jpg',
  'c8d7c6f1': './assets/Stages/Stage  (4)/remove_the_red_light_spill_c8d7c6f1.jpg',
  '3d39464d': './assets/Stages/Stage  (4)/Turning_character_around_3d39464d.jpg',
  '2ee1164f': './assets/Stages/Stage  (4)/Creating_green_background_for_st…_2ee1164f.jpg',
  'fc4adc25': './assets/Stages/Stage  (4)/Isolating_wet_asphalt_street_floor_fc4adc25.jpg',
  '1d547a75': './assets/Stages/Stage  (4)/Chain-link_fence_and_tires_overlay_1d547a75.jpg',
  '7adb5b0b': './assets/Stages/Stage  (4)/Remove_neon_building_signage_7adb5b0b.jpg',
  '7c4c5d85': './assets/Stages/Stage  (4)/Crouching_man_with_orange_bandana_7c4c5d85.jpg',
  '05166412': './assets/Stages/Stage  (4)/Turn_person_around_rear_view_05166412.jpg',
  '0b92f958': './assets/Stages/Stage  (4)/Muscular_man_pointing_forward_0b92f958.jpg',
  'd6118638': './assets/Stages/Stage  (4)/Turning_subject_to_face_away_d6118638.jpg',
  '63246386': './assets/Stages/Stage  (4)/Isolate_distant_night_sky_skyscr…_63246386.jpg',
  // Stage (5)
  'ad00a1e4': './assets/Stages/Stage  (5)/Isolating_floor_structure_in_image_ad00a1e4.jpg',
  '19ecd789': './assets/Stages/Stage  (5)/Velvet_rope_barrier_game_sprite_19ecd789.jpg',
  '096bd1d8': './assets/Stages/Stage  (5)/Generating_casino_background_art…_096bd1d8.jpg',
  'fa624ecb': './assets/Stages/Stage  (5)/Isolating_casino_background_art_…_fa624ecb.jpg',
  '8adf76a3': './assets/Stages/Stage  (5)/Generate_casino_floor_section_de…_8adf76a3.jpg',
  'cfd64389': './assets/Stages/Stage  (5)/Creating_retro_casino_slot_machine_cfd64389.jpg',
  '597f3fc1': './assets/Stages/Stage  (5)/Change_background_to_neon_green_597f3fc1.jpg',
  // Stage (6)
  'fd029a6b': './assets/Stages/Stage  (6)/Creating_city_street_scene_comic_fd029a6b.jpg',
  'b22b746b': './assets/Stages/Stage  (6)/Isolate_vertical_dividing_wall_s…_b22b746b.jpg',
  'a8483b4a': './assets/Stages/Stage  (6)/Police_officer_at_desk_a8483b4a.jpg',
  'b710dcd0': './assets/Stages/Stage  (6)/Make_the_police_officers_b710dcd0.jpg',
  '0e5364b0': './assets/Stages/Stage  (6)/Detective_seated_at_precinct_desk_0e5364b0.jpg',
  '3852295f': './assets/Stages/Stage  (6)/Isolate_vertical_dividing_wall_s…_3852295f.jpg',
  '7a46febc': './assets/Stages/Stage  (6)/Police_officer_at_desk_7a46febc.jpg',
  'feb614a9': './assets/Stages/Stage  (6)/Generating_police_room_art_prompt_feb614a9.jpg',
  '93dd3ebc': './assets/Stages/Stage  (6)/Edit_police_precinct_room_image_93dd3ebc.jpg',
  '350b350f': './assets/Stages/Stage  (6)/Creating_city_street_scene_comic_350b350f.jpg',
  // Stage (7)
  '8f0c2a34': './assets/Stages/Stage  (7)/Convert_photo_to_game_art_8f0c2a34.jpg',
  'e1965f94': './assets/Stages/Stage  (7)/Isolate_interior_penthouse_room_…_e1965f94.jpg',
  'ca39f97c': './assets/Stages/Stage  (7)/Edit_penthouse_image_interior_ca39f97c.jpg',
  'c46f24f9': './assets/Stages/Stage  (7)/Isolate_vertical_dividing_wall_s…_c46f24f9.jpg',
  '673561f1': './assets/Stages/Stage  (7)/Corporate_office_interior_video_…_673561f1.jpg',
  'a1d8173c': './assets/Stages/Stage  (7)/Render_photo_in_game_style_a1d8173c.jpg',
  'dec786ab': './assets/Stages/Stage  (7)/Isolate_purple_twilight_city_sky…_dec786ab.jpg',
  // Stage (8)
  '060ba11a': './assets/Stages/Stage  (8)/Generate_connecting_rooftop_sect…_060ba11a.jpg',
  '8d7d7e1b': './assets/Stages/Stage  (8)/4_3_aspect._same_green_background_8d7d7e1b.jpg',
  'bfffec69': './assets/Stages/Stage  (8)/Rooftop_video_game_combat_stage_bfffec69.jpg',
  '6524cce1': './assets/Stages/Stage  (8)/Isolate_city_skyline_and_sky_6524cce1.jpg',
  'ce26035a': './assets/Stages/Stage  (8)/4_3_aspect._same_green_background_ce26035a.jpg',
  '036ce8f7': './assets/Stages/Stage  (8)/Isolating_rooftop_elements_and_g…_036ce8f7.jpg',
  'bef4c8dc': './assets/Stages/Stage  (8)/Styling_photo_as_game_art_bef4c8dc.jpg',
  'c8eed737': './assets/Stages/Stage  (8)/4_3_aspect_c8eed737.jpg',
  'f3efd927': './assets/Stages/Change_blue_to_green_background_f3efd927.jpg',
};
  const SUBFOLDER_MAP: Record<string, string> = {
  // Enemy2
  'Clean_sprite_on_green_background_63e91cc1.jpg': 'Enemy2', 'Sprite_isolated_on_green_background_c22e9344.jpg': 'Enemy2',
  'Sprite_on_green_background_10e418bb.jpg': 'Enemy2', 'Clean_sprite_on_green_background_68e82b91.jpg': 'Enemy2',
  'Clean_sprite_on_green_background_171ffd5a.jpg': 'Enemy2', 'Sprite_isolated_on_green_background_a3e73a99.jpg': 'Enemy2',
  'Clean_sprite_on_green_background_26078ad5.jpg': 'Enemy2', 'Sprite_isolated_on_green_background_42471e8d.jpg': 'Enemy2',
  // Enemy3
  'Clean_sprite_on_green_background_766634b5.jpg': 'Enemy3', 'Sprite_isolated_on_green_background_bf2241d6.jpg': 'Enemy3',
  'Sprite_isolated_on_green_background_5dd9e813.jpg': 'Enemy3', 'Sprite_isolated_on_green_background_a1763897.jpg': 'Enemy3',
  'Clean_sprite_on_green_background_680f9f37.jpg': 'Enemy3', 'Character_on_green_background_c34b6e8e.jpg': 'Enemy3',
  'Character_on_green_background_9e4e26bd.jpg': 'Enemy3', 'Sprite_on_green_background_816aae06.jpg': 'Enemy3',
  // Leon
  'Pose_character_in_walk_position_93f373f5.jpg': 'Leon', 'Modify_idle_pose_variation_4bc4f118.jpg': 'Leon',
  'Pose_first_character_like_second_d84e1d8f.jpg': 'Leon', 'Create_character_in_art_style_fe36df12.jpg': 'Leon',
  'Pose_first_character_like_second_ebc458dc.jpg': 'Leon', 'Pose_character_in_straight_leg_a184e734.jpg': 'Leon',
  'Pose_first_character_like_second_a96dd3e0.jpg': 'Leon', 'Pose_character_like_character_two_beb09d56.jpg': 'Leon',
  'Pose_character_in_walk_position_79997a61.jpg': 'Leon',
  // HellKage
  'Sprite_on_green_background_a9eb2bd5.jpg': 'HellKage', 'Modify_idle_pose_variation_11b2f711.jpg': 'HellKage',
  'Center_my_character_81fd139b.jpg': 'HellKage', 'Character_on_green_background_f6e6a8ce.jpg': 'HellKage',
  'Center_my_character_28150019.jpg': 'HellKage', 'Center_my_character_f97a9c90.jpg': 'HellKage',
  'Sprite_on_green_background_64c3477d.jpg': 'HellKage', 'Sprite_on_green_background_a45a050b.jpg': 'HellKage',
  'Modify_idle_pose_variation_c42db279.jpg': 'HellKage', 'Sprite_on_green_background_6408b256.jpg': 'HellKage',
  'Sprite_isolated_on_green_background_f15c4732.jpg': 'HellKage',
  // BoneHead
  'IMG_7036.jpeg_2439db95.jpg': 'BoneHead', 'Sprite_isolated_on_green_background_ac35246e.jpg': 'BoneHead',
  'IMG_7035.jpeg_dad94256.jpg': 'BoneHead', 'Sprite_isolated_on_green_background_02a68f56.jpg': 'BoneHead',
  'Sprite_on_green_background_428c5a20.jpg': 'BoneHead', 'IMG_7033.jpeg_19bf83cf.jpg': 'BoneHead',
  'IMG_7032.jpeg_cdbdfb0a.jpg': 'BoneHead', 'IMG_7034.jpeg_adeee187.jpg': 'BoneHead',
  'Clean_sprite_on_green_background_012a84e9.jpg': 'BoneHead', 'Adjusting_idle_pose_variation_d57ad18e.jpg': 'BoneHead',
  'Character_on_green_background_85ed9460.jpg': 'BoneHead',
  // Victor
  'Clean_sprite_on_green_background_b8aff8c3.jpg': 'Victor', 'IMG_7042.jpeg_4f173f25.jpg': 'Victor',
  'Clean_sprite_on_green_background_84e99382.jpg': 'Victor', 'IMG_7040.jpeg_4d3a7930.jpg': 'Victor',
  'Character_on_green_background_2bbbfa2b.jpg': 'Victor', 'IMG_7038.jpeg_66c7af57.jpg': 'Victor',
  'IMG_7037.jpeg_d067130d.jpg': 'Victor', 'Clean_sprite_on_green_background_6b8a6c5a.jpg': 'Victor',
  'IMG_7043.jpeg_d410474c.jpg': 'Victor', 'Modify_idle_pose_variation_8942ce81.jpg': 'Victor',
  'Clean_sprite_on_green_background_bf996538.jpg': 'Victor', 'IMG_7039.jpeg_b750a4e6.jpg': 'Victor',
  'IMG_7041.jpeg_23c2cbac.jpg': 'Victor', 'Varying_idle_pose_c9f35a67.jpg': 'Victor',
  'IMG_7044.jpeg_fc058555.jpg': 'Victor', 'Varying_idle_pose_aa6cb499.jpg': 'Victor',
};
export function resolveDirectImageUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('./assets/') && !url.startsWith('http')) return encodeURI(url);

  const trimmed = url.trim();
  const mappedUrl = POSTIMAGE_PAGE_MAP[trimmed] || trimmed;
  const rawFilename = decodeURIComponent(mappedUrl.split('/').pop() || '').trim();

  if (EXACT_LOCAL_PATHS[rawFilename]) return encodeURI(EXACT_LOCAL_PATHS[rawFilename]);

  const hexMatch = rawFilename.match(/([a-f0-9]{8})\.(jpg|jpeg|png)$/i);
  if (hexMatch && HASH_PATH_MAP[hexMatch.at(1)!.toLowerCase()]) {
    return encodeURI(HASH_PATH_MAP[hexMatch.at(1)!.toLowerCase()]);
  }

  const underscoreName = rawFilename.replace(/-/g, '_');
  if (SUBFOLDER_MAP[underscoreName]) {
    return encodeURI(`./assets/SPRITES/${SUBFOLDER_MAP[underscoreName]}/${underscoreName}`);
  }

  const lower = underscoreName.toLowerCase();
  if (lower.includes('crate') || lower.includes('trash') || lower.includes('bin') || lower.includes('barrel') || lower.includes('vending') || lower.includes('hydrant') || lower.includes('stool') || lower.includes('speaker') || lower.includes('table') || lower.includes('tire') || lower.includes('drum') || lower.includes('stanchion') || lower.includes('cooler') || lower.includes('chair') || lower.includes('sculpture') || lower.includes('potted') || lower.includes('helicopter') || lower.includes('puddle')) {
    return encodeURI(`./assets/Breakables/${underscoreName}`);
  }

  return encodeURI(`./assets/SPRITES/NightRazor/${rawFilename}`);
}



// On-demand image cache for mid-game intermission cutscenes (zero extra RAM at boot)
export const intermissionImageCache: Record<string, HTMLImageElement | HTMLCanvasElement> = {};

export function loadIntermissionImage(url: string): Promise<HTMLImageElement | HTMLCanvasElement> {
  const directUrl = resolveDirectImageUrl(url);
  if (intermissionImageCache[directUrl]) {
    return Promise.resolve(intermissionImageCache[directUrl]);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;
      if (origW > 1024) {
        const scale = 1024 / origW;
        const targetW = 1024;
        const targetH = Math.max(1, Math.round(origH * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetW, targetH);
          (canvas as any).naturalWidth = targetW;
          (canvas as any).naturalHeight = targetH;
          intermissionImageCache[directUrl] = canvas;
          img.onload = null;
          img.onerror = null;
          img.src = '';
          resolve(canvas);
          return;
        }
      }
      intermissionImageCache[directUrl] = img;
      resolve(img);
    };
    img.onerror = () => {
      const retryImg = new Image();
      retryImg.onload = () => {
        const origW = retryImg.naturalWidth || retryImg.width;
        const origH = retryImg.naturalHeight || retryImg.height;
        if (origW > 1024) {
          const scale = 1024 / origW;
          const targetW = 1024;
          const targetH = Math.max(1, Math.round(origH * scale));
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(retryImg, 0, 0, targetW, targetH);
            (canvas as any).naturalWidth = targetW;
            (canvas as any).naturalHeight = targetH;
            intermissionImageCache[directUrl] = canvas;
            retryImg.onload = null;
            retryImg.onerror = null;
            retryImg.src = '';
            resolve(canvas);
            return;
          }
        }
        intermissionImageCache[directUrl] = retryImg;
        resolve(retryImg);
      };
      retryImg.onerror = () => {
        intermissionImageCache[directUrl] = img;
        resolve(img);
      };
      retryImg.src = directUrl;
    };
    img.src = directUrl;
  });
}

export function preloadIntermissionSet(set: 'stage2' | 'stage4' | 'stage6') {
  const cfg = INTERMISSION_CONFIGS[set];
  if (cfg) {
    loadIntermissionImage(cfg.slide1Url);
    loadIntermissionImage(cfg.slide2Url);
  }
}

// Local manifests for props and Bruiser Boss (kept intact)
const LOCAL_ASSETS_MANIFEST: Record<string, string> = {
  combat_hud_badge: './assets/Pickups/combat_hud_badge.png',
  wooden_crate: './assets/Pickups/wooden_crate.png',
  energy_snack: './assets/Pickups/energy_snack.png',
  iron_pipe: './assets/Pickups/iron_pipe.png',

  
  boss_idle: 'assets/images/bruiser_boss_idle.png',
  boss_walk: 'assets/images/bruiser_boss_walk.png',
  boss_attack: 'assets/images/bruiser_boss_attack.png',
  boss_kick: 'assets/images/bruiser_boss_kick.png',
  boss_hurt: 'assets/images/bruiser_boss_hurt.png',
  boss_death: 'assets/images/bruiser_boss_death.png',
  stage1_sky: 'assets/images/pearl_city_skyline.png',
  stage1_street: 'assets/images/pearl_city_street.png',
};

// Bruiser Boss (Sector 3 Boss): 512x512, 16 frames
const BOSS_SPRITE_CONFIGS: Record<string, SpriteActionConfig> = {
  IDLE: { imageUrl: 'boss_idle', totalFrames: 16, frameWidth: 512, frameHeight: 512, fps: 8, loop: true },
  WALK: { imageUrl: 'boss_walk', totalFrames: 16, frameWidth: 512, frameHeight: 512, fps: 8, loop: true },
  ATTACK: { imageUrl: 'boss_attack', totalFrames: 16, frameWidth: 512, frameHeight: 512, fps: 14, loop: false },
  KICK: { imageUrl: 'boss_kick', totalFrames: 16, frameWidth: 512, frameHeight: 512, fps: 14, loop: false },
  HURT: { imageUrl: 'boss_hurt', totalFrames: 16, frameWidth: 512, frameHeight: 512, fps: 10, loop: false },
  DEATH: { imageUrl: 'boss_death', totalFrames: 16, frameWidth: 512, frameHeight: 512, fps: 8, loop: false },
};

type RenderableImage = any;

/**
 * Filters out green-screen background (#00FF00 / chroma key:
 * if g > 150 and g > r * 1.35 and g > b * 1.35, set alpha to 0).
 * Handles CORS errors gracefully.
 */
function processChromaKey(
  sourceImg: RenderableImage,
  greenThreshold = 135,
  ratio = 1.25
): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let hasGreenScreen = false;
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (g > greenThreshold && g > r * ratio && g > b * ratio) {
        hasGreenScreen = true;
        break;
      }
    }

    if (!hasGreenScreen) {
      return sourceImg;
    }

    let firstSolidY = height;
    let lastSolidY = 0;

    for (let y = 0; y < height; y++) {
      let rowHasSolid = false;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > greenThreshold && g > r * ratio && g > b * ratio) {
          data[i + 3] = 0;
        } else if (g > 105 && g > r * 1.15 && g > b * 1.15) {
          data[i + 3] = Math.max(0, data[i + 3] - 180);
          data[i + 1] = Math.min(g, Math.round((r + b) / 2));
        }

        if (data[i + 3] > 60) {
          rowHasSolid = true;
        }
      }
      if (rowHasSolid) {
        if (firstSolidY === height) {
          firstSolidY = y;
        }
        lastSolidY = y;
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    (offscreen as any)._firstSolidY = firstSolidY;
    (offscreen as any)._lastSolidY = lastSolidY;
    return offscreen;
  } catch (err) {
    console.warn('[ChromaKey] Falling back to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Chroma-Key & Stance-Anchor processor for Night Razor:
 * - Strips #00FF00 neon green background: (g > 140 && g > r * 1.25 && g > b * 1.25)
 * - 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b)
 * - Detects visible character head (_firstSolidY), foot line (_lastSolidY), character height (_charH),
 *   and stance center X (_stanceCenterX) from the bottom 30% feet/leg slice for rock-solid planted stance.
 */
function processHeroChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const isCutout = new Uint8Array(width * height);
    let firstSolidY = height;
    let lastSolidY = 0;
    let minX = width;
    let maxX = 0;

    for (let y = 0; y < height; y++) {
      let rowSolidCount = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Strip #00FF00 neon green background
        const isNeonGreen =
          (g > 140 && g > r * 1.25 && g > b * 1.25) ||
          (g > 115 && g > r * 1.20 && g > b * 1.20 && r < 135 && b < 135);

        if (isNeonGreen) {
          data[i + 3] = 0;
          isCutout[y * width + x] = 1;
        } else if (g > r && g > b && g > 65) {
          data[i + 1] = Math.min(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 65);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }

        if (data[i + 3] > 40) {
          rowSolidCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
      if (rowSolidCount > 4) {
        if (firstSolidY === height) {
          firstSolidY = y;
        }
        lastSolidY = y;
      }
    }

    // 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const i = idx * 4;
        if (data[i + 3] === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > r && g > b) {
          let nearTrans = false;
          checkRadius: for (let dy = -3; dy <= 3; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -3; dx <= 3; dx++) {
              if (dx * dx + dy * dy > 9) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (data[(ny * width + nx) * 4 + 3] === 0 || isCutout[ny * width + nx]) {
                nearTrans = true;
                break checkRadius;
              }
            }
          }
          if (nearTrans) {
            data[i + 1] = Math.max(r, b);
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // Scan visible bounding box of non-transparent pixels (alpha > 10)
    let bMinX = width;
    let bMinY = height;
    let bMaxX = -1;
    let bMaxY = -1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 10) {
          if (x < bMinX) bMinX = x;
          if (x > bMaxX) bMaxX = x;
          if (y < bMinY) bMinY = y;
          if (y > bMaxY) bMaxY = y;
        }
      }
    }

    const cropX = bMaxX >= bMinX ? bMinX : 0;
    const cropY = bMaxY >= bMinY ? bMinY : 0;
    const cropW = bMaxX >= bMinX ? bMaxX - bMinX + 1 : width;
    const cropH = bMaxY >= bMinY ? bMaxY - bMinY + 1 : height;

    // Calculate stance center X from bottom 25% foot/leg slice
    const footSliceTop = Math.floor(cropY + cropH * 0.75);
    let footMinX = width;
    let footMaxX = -1;
    for (let y = footSliceTop; y <= cropY + cropH - 1; y++) {
      for (let x = cropX; x < cropX + cropW; x++) {
        if (data[(y * width + x) * 4 + 3] > 10) {
          if (x < footMinX) footMinX = x;
          if (x > footMaxX) footMaxX = x;
        }
      }
    }
    const stanceCenterX = (footMaxX >= footMinX) ? (footMinX + footMaxX) / 2 : (cropX + cropW / 2);

    (offscreen as any).naturalWidth = width;
    (offscreen as any).naturalHeight = height;
    (offscreen as any)._cropX = cropX;
    (offscreen as any)._cropY = cropY;
    (offscreen as any)._cropW = cropW;
    (offscreen as any)._cropH = cropH;
    (offscreen as any)._firstSolidY = cropY;
    (offscreen as any)._lastSolidY = cropY + cropH - 1;
    (offscreen as any)._charH = cropH;
    (offscreen as any)._stanceCenterX = stanceCenterX;
    (offscreen as any)._footAnchorRatioX = stanceCenterX / width;
    (offscreen as any)._footAnchorRatioY = (cropY + cropH - 1) / height;
    return offscreen;
  } catch (err) {
    console.warn('[HeroChromaKey] Fallback to raw image:', err);
    const w = sourceImg.naturalWidth || sourceImg.width || 100;
    const h = sourceImg.naturalHeight || sourceImg.height || 100;
    (sourceImg as any).naturalWidth = w;
    (sourceImg as any).naturalHeight = h;
    (sourceImg as any)._cropX = 0;
    (sourceImg as any)._cropY = 0;
    (sourceImg as any)._cropW = w;
    (sourceImg as any)._cropH = h;
    (sourceImg as any)._firstSolidY = 0;
    (sourceImg as any)._lastSolidY = h - 1;
    (sourceImg as any)._charH = h;
    (sourceImg as any)._stanceCenterX = w / 2;
    return sourceImg;
  }
}

/**
 * Dedicated Chroma-Key Filter for Leon (Club Stage Boss):
 * - Strips #00FF00 neon green: (g > 150 && g > r * 1.3 && g > b * 1.3)
 * - 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b)
 * - Detects true bottom foot line (_lastSolidY) for bottom-center anchoring (footY = y).
 */
function processLeonChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const isCutout = new Uint8Array(width * height);
    let firstSolidY = height;
    let lastSolidY = 0;

    for (let y = 0; y < height; y++) {
      let rowSolidCount = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Strip #00FF00 neon green background: g > 150 && g > r * 1.3 && g > b * 1.3
        const isNeonGreen =
          (g > 150 && g > r * 1.3 && g > b * 1.3) ||
          (g > 120 && g > r * 1.25 && g > b * 1.25 && r < 130 && b < 130);

        if (isNeonGreen) {
          data[i + 3] = 0;
          isCutout[y * width + x] = 1;
        } else if (g > r && g > b && g > 65) {
          data[i + 1] = Math.min(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 65);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }

        if (data[i + 3] > 40) {
          rowSolidCount++;
        }
      }
      if (rowSolidCount > 4) {
        if (firstSolidY === height) {
          firstSolidY = y;
        }
        lastSolidY = y;
      }
    }

    // Clear top border dark pixels in the top rows
    for (let y = 0; y < Math.min(6, height); y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (data[i] < 85 && data[i + 1] < 85 && data[i + 2] < 85) {
          data[i + 3] = 0;
          isCutout[y * width + x] = 1;
        }
      }
    }

    // 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const i = idx * 4;
        if (data[i + 3] === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > r && g > b) {
          let nearTrans = false;
          checkRadius: for (let dy = -3; dy <= 3; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -3; dx <= 3; dx++) {
              if (dx * dx + dy * dy > 9) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (data[(ny * width + nx) * 4 + 3] === 0 || isCutout[ny * width + nx]) {
                nearTrans = true;
                break checkRadius;
              }
            }
          }
          if (nearTrans) {
            data[i + 1] = Math.max(r, b);
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    (offscreen as any)._firstSolidY = firstSolidY;
    (offscreen as any)._lastSolidY = lastSolidY;
    return offscreen;
  } catch (err) {
    console.warn('[LeonChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Chroma-Key Filter & Top-Artifact Stripper for Victor (Stage 8 Rooftop Boss):
 * - Strips #00FF00 neon green background: (g > 150 && g > r * 1.3 && g > b * 1.3)
 * - 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b)
 * - Detects and clears dark/black border lines along top rows (y < 8 if r < 85 && g < 85 && b < 85)
 * - Detects isolated top edge artifacts: if there is an empty/green space between top pixels and the head,
 *   all rows above the true character head are cleared to alpha = 0.
 * - Detects true character head (_firstSolidY) and bottom foot line (_lastSolidY) for bottom-center anchoring.
 * - Guarantees zero floating pixels above the character head so walk animation displays seamlessly.
 */
function processVictorChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const isCutout = new Uint8Array(width * height);

    // Pass 1: Chroma-key neon green background
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Strip #00FF00 neon green background
        const isNeonGreen =
          (g > 150 && g > r * 1.3 && g > b * 1.3) ||
          (g > 120 && g > r * 1.25 && g > b * 1.25 && r < 130 && b < 130);

        if (isNeonGreen) {
          data[i + 3] = 0;
          isCutout[y * width + x] = 1;
        } else if (g > r && g > b && g > 65) {
          data[i + 1] = Math.min(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 65);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }
    }

    // Pass 2: Clear top border rows (e.g. y = 0..7) of dark/black border lines or JPEG compression noise
    const topRowLimit = Math.min(10, height);
    for (let y = 0; y < topRowLimit; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Dark or black border pixels in the top rows
        const isDarkBorder = (r < 85 && g < 85 && b < 85) || (y < 5 && r < 100 && g < 100 && b < 100);
        if (isDarkBorder) {
          data[i + 3] = 0;
          isCutout[y * width + x] = 1;
        }
      }
    }

    // Pass 3: Detect true character head & clear any isolated floating artifacts above it
    // Count remaining non-transparent pixels per row
    const rowSolidCount = new Int32Array(height);
    for (let y = 0; y < height; y++) {
      let count = 0;
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 40) {
          count++;
        }
      }
      rowSolidCount[y] = count;
    }

    // Find the true character head: scan downward to find the start of the sustained character body
    // (a block of rows with significant solid width without empty gaps below it)
    let bodyStartY = 0;
    for (let y = 0; y < height - 10; y++) {
      if (rowSolidCount[y] >= 8) {
        // Check if there is an empty gap (rowSolidCount <= 2) within the next 10 rows
        let hasGapBelow = false;
        for (let nextY = y + 1; nextY <= Math.min(y + 10, height - 1); nextY++) {
          if (rowSolidCount[nextY] <= 2) {
            hasGapBelow = true;
            break;
          }
        }
        if (!hasGapBelow) {
          bodyStartY = y;
          break;
        }
      }
    }

    // If there were any isolated pixels or floating border lines above the body, wipe them completely
    if (bodyStartY > 0) {
      for (let y = 0; y < bodyStartY; y++) {
        for (let x = 0; x < width; x++) {
          data[(y * width + x) * 4 + 3] = 0;
          isCutout[y * width + x] = 1;
        }
      }
    }

    // Pass 4: 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const i = idx * 4;
        if (data[i + 3] === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > r && g > b) {
          let nearTrans = false;
          checkRadius: for (let dy = -3; dy <= 3; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -3; dx <= 3; dx++) {
              if (dx * dx + dy * dy > 9) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (data[(ny * width + nx) * 4 + 3] === 0 || isCutout[ny * width + nx]) {
                nearTrans = true;
                break checkRadius;
              }
            }
          }
          if (nearTrans) {
            data[i + 1] = Math.max(r, b);
          }
        }
      }
    }

    // Determine clean firstSolidY and lastSolidY
    let firstSolidY = height;
    let lastSolidY = 0;
    for (let y = 0; y < height; y++) {
      let count = 0;
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 40) {
          count++;
        }
      }
      if (count > 4) {
        if (firstSolidY === height) {
          firstSolidY = y;
        }
        lastSolidY = y;
      }
    }

    // Strict safety check: ensure all pixels above firstSolidY are 100% alpha = 0
    if (firstSolidY < height) {
      for (let y = 0; y < firstSolidY; y++) {
        for (let x = 0; x < width; x++) {
          data[(y * width + x) * 4 + 3] = 0;
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    (offscreen as any)._firstSolidY = firstSolidY;
    (offscreen as any)._lastSolidY = lastSolidY;
    return offscreen;
  } catch (err) {
    console.warn('[VictorChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Chroma-Key Filter & Bounding-Box Trimmer for Bone Head (Stage 6 Precinct Boss):
 * - Strips #00FF00 neon green background: (g > 150 && g > r * 1.3 && g > b * 1.3)
 * - 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b)
 * - Scans non-transparent pixels (alpha > 10) to find tight visible bounding box (ignoring empty margins)
 * - Computes torsoCenterX strictly from the vertical band between 20% and 60% from the top of his visible bounding box
 */
function processBoneHeadChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const isCutout = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Strip solid #00FF00 neon green background
        const isNeonGreen =
          (g > 145 && g > r * 1.28 && g > b * 1.28) ||
          (g > 115 && g > r * 1.22 && g > b * 1.22 && r < 135 && b < 135);

        if (isNeonGreen) {
          data[i + 3] = 0;
          isCutout[y * width + x] = 1;
        } else if (g > r && g > b && g > 65) {
          data[i + 1] = Math.min(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 65);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }
    }

    // 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const i = idx * 4;
        if (data[i + 3] === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > r && g > b) {
          let nearTrans = false;
          checkRadius: for (let dy = -3; dy <= 3; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -3; dx <= 3; dx++) {
              if (dx * dx + dy * dy > 9) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (data[(ny * width + nx) * 4 + 3] === 0 || isCutout[ny * width + nx]) {
                nearTrans = true;
                break checkRadius;
              }
            }
          }
          if (nearTrans) {
            data[i + 1] = Math.max(r, b);
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // Scan non-transparent pixels (alpha > 10) to find tight visible bounding box
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Crop to the exact non-transparent pixel bounding box
    if (maxX >= minX && maxY >= minY) {
      const cropX = minX;
      const cropY = minY;
      const cropW = maxX - minX + 1;
      const cropH = maxY - minY + 1;

      // Core torso horizontal center: vertical band between 20% and 60% from the top of visible trimmed bounding box
      const torsoTopY = cropY + cropH * 0.20;
      const torsoBottomY = cropY + cropH * 0.60;
      let torsoMinX = width;
      let torsoMaxX = -1;

      for (let y = Math.floor(torsoTopY); y <= Math.ceil(torsoBottomY); y++) {
        for (let x = cropX; x <= cropX + cropW - 1; x++) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha > 10) {
            if (x < torsoMinX) torsoMinX = x;
            if (x > torsoMaxX) torsoMaxX = x;
          }
        }
      }

      let torsoAnchorRatioX = 0.5;
      if (torsoMaxX >= torsoMinX && cropW > 0) {
        const torsoCenterX = (torsoMinX + torsoMaxX) / 2;
        torsoAnchorRatioX = (torsoCenterX - cropX) / cropW;
      }

      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = cropW;
      trimmedCanvas.height = cropH;
      const trimmedCtx = trimmedCanvas.getContext('2d');
      if (trimmedCtx) {
        trimmedCtx.drawImage(offscreen, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        (trimmedCanvas as any)._cropX = cropX;
        (trimmedCanvas as any)._cropY = cropY;
        (trimmedCanvas as any)._cropW = cropW;
        (trimmedCanvas as any)._cropH = cropH;
        (trimmedCanvas as any)._torsoAnchorRatioX = torsoAnchorRatioX;
        (trimmedCanvas as any)._footAnchorRatioX = torsoAnchorRatioX;
        offscreen.width = 0;
        offscreen.height = 0;
        return trimmedCanvas;
      }
    }

    (offscreen as any)._cropX = 0;
    (offscreen as any)._cropY = 0;
    (offscreen as any)._cropW = width;
    (offscreen as any)._cropH = height;
    (offscreen as any)._torsoAnchorRatioX = 0.5;
    (offscreen as any)._footAnchorRatioX = 0.5;
    return offscreen;
  } catch (err) {
    console.warn('[BoneHeadChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Chroma-Key Filter & Bounding-Box Trimmer for Hell Kage (Stage 4 Race Boss):
 * - Strips #00FF00 neon green background: (g > 150 && g > r * 1.3 && g > b * 1.3).
 * - 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b).
 * - Scans non-transparent pixels (alpha > 10) to calculate tight visible bounding box (ignoring empty margins).
 * - Crops and returns a trimmed canvas with dimensions matching the character art exactly.
 */
function processHellKageChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const isCutout = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Strip #00FF00 neon green background: g > 150 && g > r * 1.3 && g > b * 1.3
        const isNeonGreen =
          (g > 150 && g > r * 1.3 && g > b * 1.3) ||
          (g > 120 && g > r * 1.25 && g > b * 1.25 && r < 130 && b < 130);

        if (isNeonGreen) {
          data[i + 3] = 0;
          isCutout[y * width + x] = 1;
        } else if (g > r && g > b && g > 65) {
          data[i + 1] = Math.min(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 65);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }
    }

    // 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const i = idx * 4;
        if (data[i + 3] === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > r && g > b) {
          let nearTrans = false;
          checkRadius: for (let dy = -3; dy <= 3; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -3; dx <= 3; dx++) {
              if (dx * dx + dy * dy > 9) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (data[(ny * width + nx) * 4 + 3] === 0 || isCutout[ny * width + nx]) {
                nearTrans = true;
                break checkRadius;
              }
            }
          }
          if (nearTrans) {
            data[i + 1] = Math.max(r, b);
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // Scan non-transparent pixels (alpha > 10) to find tight visible bounding box
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Crop to the exact non-transparent pixel bounding box
    if (maxX >= minX && maxY >= minY) {
      const cropX = minX;
      const cropY = minY;
      const cropW = maxX - minX + 1;
      const cropH = maxY - minY + 1;

      // Calculate horizontal bounds of visible pixels strictly within bottom 20% slice (feet/legs)
      const stanceCutoffY = minY + cropH * 0.8;
      let stanceMinX = width;
      let stanceMaxX = -1;

      for (let y = Math.floor(stanceCutoffY); y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha > 10) {
            if (x < stanceMinX) stanceMinX = x;
            if (x > stanceMaxX) stanceMaxX = x;
          }
        }
      }

      let footAnchorRatioX = 0.5;
      if (stanceMaxX >= stanceMinX && cropW > 0) {
        const stanceCenterX = (stanceMinX + stanceMaxX) / 2;
        footAnchorRatioX = (stanceCenterX - cropX) / cropW;
      }

      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = cropW;
      trimmedCanvas.height = cropH;
      const trimmedCtx = trimmedCanvas.getContext('2d');
      if (trimmedCtx) {
        trimmedCtx.drawImage(offscreen, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        (trimmedCanvas as any)._cropX = cropX;
        (trimmedCanvas as any)._cropY = cropY;
        (trimmedCanvas as any)._cropW = cropW;
        (trimmedCanvas as any)._cropH = cropH;
        (trimmedCanvas as any)._footAnchorRatioX = footAnchorRatioX;
        offscreen.width = 0;
        offscreen.height = 0;
        return trimmedCanvas;
      }
    }

    (offscreen as any)._cropX = 0;
    (offscreen as any)._cropY = 0;
    (offscreen as any)._cropW = width;
    (offscreen as any)._cropH = height;
    (offscreen as any)._footAnchorRatioX = 0.5;
    return offscreen;
  } catch (err) {
    console.warn('[HellKageChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Chroma-Key & Desaturation processor for Stage 1 Intro Banner ("LET'S GET IT").
 * - Green dominant threshold: g > 110 && g > r * 1.25 && g > b * 1.25 -> alpha = 0.
 * - Semi-green edge pixels: g = Math.min(r, b) with smooth alpha reduction to strip JPEG green fringing.
 * - CORS fallback safety with try / catch.
 */
/**
 * Dedicated Chroma-Key & Bounding Box Trimmer for "Ride Out" Progression Graphic:
 * - Strips #00FF00 neon green background: (g > 120 && g > r * 1.25 && g > b * 1.25)
 * - Desaturates green edge fringing cleanly.
 * - Trims to solid pixel bounding box.
 * - Explicitly cleans up temporary scratch canvas per mobile memory rules:
 *   tempCanvas.width = 0; tempCanvas.height = 0;
 */
function processRideOutChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tempCtx) return sourceImg;

    tempCtx.drawImage(sourceImg, 0, 0);
    const imgData = tempCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let hasSolid = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green-dominant chroma key: strip #00FF00 green screen background
        const isGreen =
          (g > 115 && g > r * 1.22 && g > b * 1.22) ||
          (g > 145 && g > r * 1.28 && g > b * 1.28);

        if (isGreen) {
          data[i + 3] = 0;
        } else if (g > r && g > b && g > 60) {
          data[i + 1] = Math.min(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 80);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }

        if (data[i + 3] > 40) {
          hasSolid = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    tempCtx.putImageData(imgData, 0, 0);

    if (hasSolid && minX <= maxX && minY <= maxY) {
      const cropW = Math.max(1, maxX - minX + 1);
      const cropH = Math.max(1, maxY - minY + 1);
      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = cropW;
      trimmedCanvas.height = cropH;
      const trimmedCtx = trimmedCanvas.getContext('2d');
      if (trimmedCtx) {
        trimmedCtx.drawImage(tempCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
        // Mobile memory cleanup rule: destroy scratch canvas
        tempCanvas.width = 0;
        tempCanvas.height = 0;
        return trimmedCanvas;
      }
    }

    return tempCanvas;
  } catch (err) {
    console.warn('[RideOutChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Chroma-Key & Desaturation processor for JPEG/PNG images with neon-green backgrounds.
 * - Green dominant threshold: g > 110 && g > r * 1.25 && g > b * 1.25 -> alpha = 0.
 * - Semi-green edge pixels: g = Math.min(r, b) with smooth alpha reduction to strip JPEG green fringing cleanly.
 * - CORS fallback safety with try / catch.
 */
function processGreenScreenChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let firstSolidY = height;
    let lastSolidY = 0;

    for (let y = 0; y < height; y++) {
      let rowHasSolid = false;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green-dominant background pixels: g > 110 && g > r * 1.25 && g > b * 1.25
        if (g > 110 && g > r * 1.25 && g > b * 1.25) {
          data[i + 3] = 0;
        } else if (g > r && g > b) {
          // Semi-green edge pixels: desaturate green channel and reduce alpha smoothly
          data[i + 1] = Math.min(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 80);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }

        if (data[i + 3] > 60) {
          rowHasSolid = true;
        }
      }
      if (rowHasSolid) {
        if (firstSolidY === height) {
          firstSolidY = y;
        }
        lastSolidY = y;
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    (offscreen as any)._firstSolidY = firstSolidY;
    (offscreen as any)._lastSolidY = lastSolidY;
    return offscreen;
  } catch (err) {
    console.warn('[ChromaKey] Falling back to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Stage 3 Chroma-Key Transparency Filter:
 * - Green dominant threshold: g > 95 && g > r * 1.15 && g > b * 1.15 -> alpha = 0.
 * - Desaturates any edge fringing cleanly.
 * - For garageFloor: strips the bright neon green top half by trimming cleanly down to the concrete floor.
 */
function processGarageChromaKey(
  sourceImg: RenderableImage,
  isFloor = false
): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let firstSolidY = height;
    let lastSolidY = 0;

    for (let y = 0; y < height; y++) {
      let rowSolidCount = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green-dominant background pixels: #00FF00 green top and chroma key
        const isGreen =
          (g > 90 && g > r * 1.15 && g > b * 1.15) ||
          (g > 140 && g > r * 1.25 && g > b * 1.25) ||
          (g > 150 && r < 130 && b < 130);
        if (isGreen) {
          data[i + 3] = 0;
        } else if (g > r && g > b && g > 65) {
          // Desaturate edge fringing
          data[i + 1] = Math.min(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 60);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }

        if (data[i + 3] > 60) {
          rowSolidCount++;
        }
      }
      if (rowSolidCount > 10) {
        if (firstSolidY === height) {
          firstSolidY = y;
        }
        lastSolidY = y;
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // If garageFloor has green top half, trim it cleanly down to the concrete floor
    if (isFloor && firstSolidY > 0 && firstSolidY < height && lastSolidY >= firstSolidY) {
      const safeFirstY = Math.min(lastSolidY, firstSolidY + 1);
      const solidH = lastSolidY - safeFirstY + 1;
      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = width;
      trimmedCanvas.height = solidH;
      const trimmedCtx = trimmedCanvas.getContext('2d');
      if (trimmedCtx) {
        trimmedCtx.drawImage(offscreen, 0, safeFirstY, width, solidH, 0, 0, width, solidH);
        (trimmedCanvas as any)._firstSolidY = 0;
        (trimmedCanvas as any)._lastSolidY = solidH;
        offscreen.width = 0;
        offscreen.height = 0;
        return trimmedCanvas;
      }
    }

    (offscreen as any)._firstSolidY = firstSolidY;
    (offscreen as any)._lastSolidY = lastSolidY;
    return offscreen;
  } catch (err) {
    console.warn('[GarageChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Stage 4 Chroma-Key Filter:
 * - Scans every pixel and sets alpha to 0 wherever green is dominant:
 *   (g > 180 && g > r * 1.4 && g > b * 1.4) or neon green variants.
 * - Softly feathers edge pixels to eliminate green halos around outlines cleanly.
 */
function processStage4ChromaKey(
  sourceImg: RenderableImage,
  isFloor = false
): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let firstSolidY = height;
    let lastSolidY = 0;

    for (let y = 0; y < height; y++) {
      let rowSolidCount = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green dominant: g > 180 && g > r * 1.4 && g > b * 1.4
        const isGreen =
          (g > 180 && g > r * 1.4 && g > b * 1.4) ||
          (g > 135 && g > r * 1.25 && g > b * 1.25);

        if (isGreen) {
          data[i + 3] = 0;
        } else if (g > r && g > b && g > 65) {
          // Softly feather edge pixels so there are no green halos
          data[i + 1] = Math.min(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 65);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }

        if (data[i + 3] > 60) {
          rowSolidCount++;
        }
      }
      if (rowSolidCount > 8) {
        if (firstSolidY === height) {
          firstSolidY = y;
        }
        lastSolidY = y;
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    (offscreen as any)._firstSolidY = firstSolidY;
    (offscreen as any)._lastSolidY = lastSolidY;
    return offscreen;
  } catch (err) {
    console.warn('[Stage4ChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Stage 5 Casino Chroma-Key Filter:
 * - Scans every pixel and sets alpha to 0 wherever green is dominant:
 *   (g > 180 && g > r * 1.4 && g > b * 1.4)
 * - Softly feathers edge pixels to eliminate green halos around outlines cleanly.
 * - Protects green felt on blackjack / roulette tables (green felt has lower brightness/luminance than neon green #00FF00).
 * - For breakable props: trims bounding box cleanly for precise ground contact.
 */
/**
 * Dedicated Stage 6 Precinct Chroma-Key Filter:
 * - Green dominant threshold: alpha 0 wherever g > 180 && g > r * 1.4 && g > b * 1.4
 * - Load-time edge despill pass: if (g > r && g > b) within 2px of transparency, clamp g = Math.max(r, b)
 * - For breakable props: trims bounding box cleanly for ground contact
 */
function processPrecinctChromaKey(
  sourceImg: RenderableImage,
  isProp = false
): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let hasSolid = false;
    let firstSolidY = height;
    let lastSolidY = 0;

    for (let y = 0; y < height; y++) {
      let rowSolidCount = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green dominant filter: supports neon green and typical greenscreen backdrops
        const isGreen =
          (g > 110 && g > r * 1.25 && g > b * 1.25) ||
          (g > 160 && g > r * 1.35 && g > b * 1.35);

        if (isGreen) {
          data[i + 3] = 0;
        } else if (g > r && g > b && g > 65) {
          // Desaturate and feather edge pixels to strip green halos cleanly
          data[i + 1] = Math.min(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 65);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }

        if (data[i + 3] > 40) {
          hasSolid = true;
          rowSolidCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      if (rowSolidCount > 6) {
        if (firstSolidY === height) {
          firstSolidY = y;
        }
        lastSolidY = y;
      }
    }

    // One-time load-time edge despill pass to eliminate green/dark edge fringe around outlines
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (data[idx + 3] === 0) continue;

        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (g > r && g > b) {
          let adjacentToTransparent = false;
          checkRadius: for (let dy = -2; dy <= 2; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -2; dx <= 2; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (data[(ny * width + nx) * 4 + 3] === 0) {
                adjacentToTransparent = true;
                break checkRadius;
              }
            }
          }
          if (adjacentToTransparent) {
            data[idx + 1] = Math.max(r, b);
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    if (isProp && hasSolid && minX <= maxX && minY <= maxY) {
      const cropW = Math.max(1, maxX - minX + 1);
      const cropH = Math.max(1, maxY - minY + 1);
      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = cropW;
      trimmedCanvas.height = cropH;
      const trimmedCtx = trimmedCanvas.getContext('2d');
      if (trimmedCtx) {
        trimmedCtx.drawImage(offscreen, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
        offscreen.width = 0;
        offscreen.height = 0;
        return trimmedCanvas;
      }
    }

    (offscreen as any)._firstSolidY = firstSolidY;
    (offscreen as any)._lastSolidY = lastSolidY;
    return offscreen;
  } catch (err) {
    console.warn('[PrecinctChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Chroma-Key Filter for Desk Cop 1:
 * Tightened to pure neon green background, with 2px alpha edge erosion and 3px border despill.
 * Leaves the interior glowing green CRT computer monitor screen 100% solid and intact.
 */
function processDeskCop1ChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Step 1: Initial neon green backdrop cutout
    const isInitialTransparent = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Pure neon green backdrop
        if ((g > 220 && r < 55 && b < 55) || (g > 235 && r < 80 && b < 80) || (g > 185 && g > r * 1.45 && g > b * 1.45)) {
          data[i + 3] = 0;
          isInitialTransparent[y * width + x] = 1;
        }
      }
    }

    // Step 2: Erode alpha edges by 2px around transparent pixels
    const toErode = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (isInitialTransparent[idx]) continue;

        let nearTrans = false;
        checkRadius2: for (let dy = -2; dy <= 2; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -2; dx <= 2; dx++) {
            if (dx * dx + dy * dy > 4) continue;
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;
            if (isInitialTransparent[ny * width + nx]) {
              nearTrans = true;
              break checkRadius2;
            }
          }
        }
        if (nearTrans) {
          toErode[idx] = 1;
        }
      }
    }

    for (let idx = 0; idx < width * height; idx++) {
      if (toErode[idx]) {
        data[idx * 4 + 3] = 0;
      }
    }

    // Step 3: 3px border despill (if g > r && g > b within 3px of transparency, set g = Math.max(r, b))
    // The glowing CRT monitor is deep inside the desk (far > 3px from transparency), so it remains solid green
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (data[i + 3] === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > r && g > b) {
          let adjacentToTrans = false;
          checkRadius3: for (let dy = -3; dy <= 3; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -3; dx <= 3; dx++) {
              if (dx * dx + dy * dy > 9) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (data[(ny * width + nx) * 4 + 3] === 0) {
                adjacentToTrans = true;
                break checkRadius3;
              }
            }
          }
          if (adjacentToTrans) {
            data[i + 1] = Math.max(r, b);
          }
        }
      }
    }

    let firstSolidY = height;
    let lastSolidY = 0;
    for (let y = 0; y < height; y++) {
      let rowSolidCount = 0;
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 40) {
          rowSolidCount++;
        }
      }
      if (rowSolidCount > 6) {
        if (firstSolidY === height) {
          firstSolidY = y;
        }
        lastSolidY = y;
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    (offscreen as any)._firstSolidY = firstSolidY;
    (offscreen as any)._lastSolidY = lastSolidY;
    return offscreen;
  } catch (err) {
    console.warn('[DeskCop1ChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Chroma-Key Filter for Doorway Archway Passage:
 * Removes #00FF00 neon green (g > 180 && g > r * 1.4 && g > b * 1.4)
 */
function processArchwayChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Chroma-key out #00FF00 neon green
        if ((g > 180 && g > r * 1.4 && g > b * 1.4) || (g > 225 && r < 60 && b < 60)) {
          data[i + 3] = 0;
        } else if (g > r && g > b && g > 75) {
          // Desaturate green edge fringing cleanly
          data[i + 1] = Math.max(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 65);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    return offscreen;
  } catch (err) {
    console.warn('[ArchwayChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Chroma-Key Filter for Precinct Room Section A & Section B:
 * Restricted to the entire upper window zone (y < image.naturalHeight * 0.45)
 * targeting all bright neon green window pane pixels (g > 170 && g > r * 1.35 && g > b * 1.35 -> alpha = 0)
 * with a 3px border despill (if g > r && g > b within 3px of transparency, clamp g = Math.max(r, b)).
 * Walls, ceiling pipes, and floor stay 100% solid.
 */
function processPrecinctRoomChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const windowMaxY = Math.floor(height * 0.45);
    const isWindowCutout = new Uint8Array(width * height);

    for (let y = 0; y < windowMaxY; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Target all bright neon green window pane pixels
        if (g > 170 && g > r * 1.35 && g > b * 1.35) {
          data[i + 3] = 0;
          isWindowCutout[y * width + x] = 1;
        }
      }
    }

    // 3px border despill around window cutout panes: clamp g = Math.max(r, b)
    const despillMaxY = Math.min(height, windowMaxY + 3);
    for (let y = 0; y < despillMaxY; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const i = idx * 4;
        if (data[i + 3] === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > r && g > b) {
          let nearWindowCutout = false;
          checkRadius: for (let dy = -3; dy <= 3; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -3; dx <= 3; dx++) {
              if (dx * dx + dy * dy > 9) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (data[(ny * width + nx) * 4 + 3] === 0 || isWindowCutout[ny * width + nx]) {
                nearWindowCutout = true;
                break checkRadius;
              }
            }
          }
          if (nearWindowCutout) {
            data[i + 1] = Math.max(r, b);
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    return offscreen;
  } catch (err) {
    console.warn('[PrecinctRoomChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Chroma-Key Filter for Room Seam Cover Pillar Overlay:
 * One-time load-time filter (g > 180 && g > r * 1.4 && g > b * 1.4 -> alpha = 0)
 * plus 3px border despill (clamp g = Math.max(r, b)) for crisp edges with zero green halo.
 */
/**
 * Dedicated Stage 7 Penthouse Chroma-Key Filter:
 * - Sets alpha = 0 wherever neon green is dominant:
 *   (g > 150 && g > r * 1.3 && g > b * 1.3)
 *   making window panes 100% transparent while keeping indoor potted plants solid.
 * - 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b)
 *   so dark steel mullions, statues, and plant edges have crisp outlines with zero green halo.
 * - For breakable props: trims bounding box cleanly for ground contact.
 */
function processPenthouseChromaKey(
  sourceImg: RenderableImage,
  isProp = false
): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let hasSolid = false;
    let firstSolidY = height;
    let lastSolidY = 0;

    const isCutout = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      let rowSolidCount = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green-dominant chroma key: window panes & green backdrop
        const isGreen = g > 150 && g > r * 1.3 && g > b * 1.3;

        if (isGreen) {
          data[i + 3] = 0;
          isCutout[y * width + x] = 1;
        } else {
          if (data[i + 3] > 40) {
            hasSolid = true;
            rowSolidCount++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (rowSolidCount > 6) {
        if (firstSolidY === height) {
          firstSolidY = y;
        }
        lastSolidY = y;
      }
    }

    // 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const i = idx * 4;
        if (data[i + 3] === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > r && g > b) {
          let nearTrans = false;
          checkRadius: for (let dy = -3; dy <= 3; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -3; dx <= 3; dx++) {
              if (dx * dx + dy * dy > 9) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (data[(ny * width + nx) * 4 + 3] === 0 || isCutout[ny * width + nx]) {
                nearTrans = true;
                break checkRadius;
              }
            }
          }
          if (nearTrans) {
            data[i + 1] = Math.max(r, b);
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    if (isProp && hasSolid && minX <= maxX && minY <= maxY) {
      const cropW = Math.max(1, maxX - minX + 1);
      const cropH = Math.max(1, maxY - minY + 1);
      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = cropW;
      trimmedCanvas.height = cropH;
      const trimmedCtx = trimmedCanvas.getContext('2d');
      if (trimmedCtx) {
        trimmedCtx.drawImage(offscreen, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
        offscreen.width = 0;
        offscreen.height = 0;
        return trimmedCanvas;
      }
    }

    (offscreen as any)._firstSolidY = firstSolidY;
    (offscreen as any)._lastSolidY = lastSolidY;
    return offscreen;
  } catch (err) {
    console.warn('[PenthouseChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

function processPrecinctPillarChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const isCutout = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > 180 && g > r * 1.4 && g > b * 1.4) {
          data[i + 3] = 0;
          isCutout[y * width + x] = 1;
        }
      }
    }

    // 3px border despill: clamp g = Math.max(r, b)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const i = idx * 4;
        if (data[i + 3] === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > r && g > b) {
          let nearTrans = false;
          checkRadius: for (let dy = -3; dy <= 3; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -3; dx <= 3; dx++) {
              if (dx * dx + dy * dy > 9) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (isCutout[ny * width + nx]) {
                nearTrans = true;
                break checkRadius;
              }
            }
          }
          if (nearTrans) {
            data[i + 1] = Math.max(r, b);
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    return offscreen;
  } catch (err) {
    console.warn('[PrecinctPillarChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Pre-bakes a Gaussian blur onto a cached offscreen HTML5 canvas once at load time.
 * Includes ~6px padding around the edges so the blur does not clip.
 */
function createPreBlurredCanvas(
  source: RenderableImage,
  blurPx = 2.5,
  padding = 6
): HTMLCanvasElement {
  const width = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const height = 'naturalHeight' in source ? source.naturalHeight : source.height;
  const offscreen = document.createElement('canvas');
  offscreen.width = Math.max(1, width + padding * 2);
  offscreen.height = Math.max(1, height + padding * 2);
  const offCtx = offscreen.getContext('2d');
  if (offCtx) {
    offCtx.filter = `blur(${blurPx}px)`;
    offCtx.drawImage(source, padding, padding, width, height);
    offCtx.filter = 'none';
  }
  return offscreen;
}

function processCasinoChromaKey(
  sourceImg: RenderableImage,
  isProp = false
): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let hasSolid = false;
    let firstSolidY = height;
    let lastSolidY = 0;

    for (let y = 0; y < height; y++) {
      let rowSolidCount = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green dominant neon green filter: g > 180 && g > r * 1.4 && g > b * 1.4
        const isNeonGreen = g > 180 && g > r * 1.4 && g > b * 1.4;

        if (isNeonGreen) {
          data[i + 3] = 0;
        } else if (g > 140 && g > r * 1.25 && g > b * 1.25) {
          // Softly feather edge pixels so there are no green halos
          data[i + 1] = Math.min(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 60);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }

        if (data[i + 3] > 40) {
          hasSolid = true;
          rowSolidCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      if (rowSolidCount > 6) {
        if (firstSolidY === height) {
          firstSolidY = y;
        }
        lastSolidY = y;
      }
    }

    // One-time load-time color despill pass on edge pixels (removes neon-green spill around brass railings without affecting interior felt)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (data[idx + 3] === 0) continue; // Only process remaining opaque pixels

        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Wherever green exceeds both red and blue and pixel is adjacent to a transparent pixel (within a 2-pixel radius)
        if (g > r && g > b) {
          let adjacentToTransparent = false;
          checkRadius: for (let dy = -2; dy <= 2; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -2; dx <= 2; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;

              const neighborIdx = (ny * width + nx) * 4;
              if (data[neighborIdx + 3] === 0) {
                adjacentToTransparent = true;
                break checkRadius;
              }
            }
          }

          if (adjacentToTransparent) {
            data[idx + 1] = Math.max(r, b);
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    if (isProp && hasSolid && minX <= maxX && minY <= maxY) {
      const cropW = Math.max(1, maxX - minX + 1);
      const cropH = Math.max(1, maxY - minY + 1);
      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = cropW;
      trimmedCanvas.height = cropH;
      const trimmedCtx = trimmedCanvas.getContext('2d');
      if (trimmedCtx) {
        trimmedCtx.drawImage(offscreen, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
        offscreen.width = 0;
        offscreen.height = 0;
        return trimmedCanvas;
      }
    }

    (offscreen as any)._firstSolidY = firstSolidY;
    (offscreen as any)._lastSolidY = lastSolidY;
    return offscreen;
  } catch (err) {
    console.warn('[CasinoChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Stage 8 Skyscraper Rooftop Chroma-Key Filter:
 * - Scans every pixel and sets alpha to 0 wherever green is dominant:
 *   (g > 120 && g > r * 1.25 && g > b * 1.25) or neon green variants.
 * - Softly feathers edge pixels and desaturates green channel to eliminate halos around outlines cleanly.
 */
function processRooftopChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let firstSolidY = height;
    let lastSolidY = 0;
    const isCutout = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      let rowSolidCount = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const isGreen =
          (g > 150 && g > r * 1.3 && g > b * 1.3) ||
          (g > 120 && g > r * 1.25 && g > b * 1.25) ||
          (g > 180 && g > r * 1.35 && g > b * 1.35);

        if (isGreen) {
          data[i + 3] = 0;
          isCutout[y * width + x] = 1;
        } else if (g > r && g > b && g > 65) {
          data[i + 1] = Math.min(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 65);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }

        if (data[i + 3] > 60) {
          rowSolidCount++;
        }
      }
      if (rowSolidCount > 6) {
        if (firstSolidY === height) {
          firstSolidY = y;
        }
        lastSolidY = y;
      }
    }

    // 3px border despill pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const i = idx * 4;
        if (data[i + 3] === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > r && g > b) {
          let nearTrans = false;
          checkRadius: for (let dy = -3; dy <= 3; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -3; dx <= 3; dx++) {
              if (dx * dx + dy * dy > 9) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (data[(ny * width + nx) * 4 + 3] === 0 || isCutout[ny * width + nx]) {
                nearTrans = true;
                break checkRadius;
              }
            }
          }
          if (nearTrans) {
            data[i + 1] = Math.max(r, b);
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    (offscreen as any)._firstSolidY = firstSolidY;
    (offscreen as any)._lastSolidY = lastSolidY;
    return offscreen;
  } catch (err) {
    console.warn('[RooftopChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Stage 8 Rooftop Breakable Prop Chroma-Key Filter:
 * - Strips neon-green background: (g > 150 && g > r * 1.3 && g > b * 1.3 -> alpha = 0)
 * - 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b)
 * - Trims to solid pixel bounding box so bottom edge anchors cleanly to ground with zero padding.
 */
function processRooftopPropChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let hasSolid = false;
    const isCutout = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green-dominant chroma key: g > 150 && g > r * 1.3 && g > b * 1.3
        const isGreen = g > 150 && g > r * 1.3 && g > b * 1.3;

        if (isGreen) {
          data[i + 3] = 0;
          isCutout[y * width + x] = 1;
        } else {
          if (data[i + 3] > 40) {
            hasSolid = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
    }

    // 3px border despill pass: if (g > r && g > b) within 3px of transparency, clamp g = Math.max(r, b)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const i = idx * 4;
        if (data[i + 3] === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > r && g > b) {
          let nearTrans = false;
          checkRadius: for (let dy = -3; dy <= 3; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -3; dx <= 3; dx++) {
              if (dx * dx + dy * dy > 9) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (data[(ny * width + nx) * 4 + 3] === 0 || isCutout[ny * width + nx]) {
                nearTrans = true;
                break checkRadius;
              }
            }
          }
          if (nearTrans) {
            data[i + 1] = Math.max(r, b);
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    if (hasSolid && minX <= maxX && minY <= maxY) {
      const cropW = Math.max(1, maxX - minX + 1);
      const cropH = Math.max(1, maxY - minY + 1);
      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = cropW;
      trimmedCanvas.height = cropH;
      const trimmedCtx = trimmedCanvas.getContext('2d');
      if (trimmedCtx) {
        trimmedCtx.drawImage(offscreen, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
        offscreen.width = 0;
        offscreen.height = 0;
        return trimmedCanvas;
      }
    }

    return offscreen;
  } catch (err) {
    console.warn('[RooftopPropChromaKey] Fallback to raw image:', err);
    return sourceImg;
  }
}

/**
 * Dedicated Chroma-Key & Bounding Box Trimmer for Breakable Street Props:
 * Strips green background AND trims any transparent gutter/padding around the sprite
 * so the bottom pixel of the resulting canvas corresponds directly to the prop's true bottom edge.
 */
function processPropChromaKey(sourceImg: RenderableImage): RenderableImage {
  try {
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    if (!width || !height) return sourceImg;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return sourceImg;

    offCtx.drawImage(sourceImg, 0, 0);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let hasSolid = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green-dominant background pixels: g > 110 && g > r * 1.25 && g > b * 1.25
        if (g > 110 && g > r * 1.25 && g > b * 1.25) {
          data[i + 3] = 0;
        } else if (g > r && g > b) {
          data[i + 1] = Math.min(r, b);
          const greenExcess = g - Math.max(r, b);
          const alphaFactor = Math.max(0, 1 - greenExcess / 80);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }

        // Detect solid pixels for accurate bottom pixel edge anchoring (zero bottom padding)
        if (data[i + 3] > 40) {
          hasSolid = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    if (!hasSolid || minX > maxX || minY > maxY) {
      return offscreen;
    }

    // Crop to the exact solid pixel bounding box
    const cropW = Math.max(1, maxX - minX + 1);
    const cropH = Math.max(1, maxY - minY + 1);
    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = cropW;
    trimmedCanvas.height = cropH;
    const trimmedCtx = trimmedCanvas.getContext('2d');
    if (trimmedCtx) {
      trimmedCtx.drawImage(offscreen, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
      offscreen.width = 0;
      offscreen.height = 0;
      return trimmedCanvas;
    }

    return offscreen;
  } catch (err) {
    console.warn('[PropChromaKey] Falling back to raw image:', err);
    return sourceImg;
  }
}

const processBannerChromaKey = processGreenScreenChromaKey;

/**
 * Component to display Night Razor's face portrait inside the HUD emblem frame.
 * Scales and centers the face cleanly with circular clipping.
 */
function PortraitDisplay({ asset }: { asset: RenderableImage | null | undefined }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !asset) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const srcW = 'naturalWidth' in asset ? asset.naturalWidth : asset.width;
    const srcH = 'naturalHeight' in asset ? asset.naturalHeight : asset.height;
    if (!srcW || !srcH) return;

    const scale = Math.max(canvas.width / srcW, canvas.height / srcH);
    const nw = srcW * scale;
    const nh = srcH * scale;
    const dx = (canvas.width - nw) / 2;
    // Position slightly higher if height is taller than frame to focus on the face
    const dy = nh > canvas.height ? (canvas.height - nh) * 0.35 : (canvas.height - nh) / 2;

    ctx.save();
    ctx.drawImage(asset, dx, dy, nw, nh);
    ctx.restore();
  }, [asset]);

  if (!asset) {
    return (
      <div className="w-full h-full bg-cyan-950 flex items-center justify-center font-black text-xs text-cyan-400">
        NR
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={96}
      height={96}
      className="w-full h-full object-cover block"
    />
  );
}

export type EnemyVariant = 'enemy1' | 'enemy2' | 'enemy3';
export const ENEMY_VARIANTS: EnemyVariant[] = ['enemy1', 'enemy2', 'enemy3'];
export function getRandomEnemyVariant(): EnemyVariant {
  return ENEMY_VARIANTS[Math.floor(Math.random() * ENEMY_VARIANTS.length)];
}

/**
 * Returns randomized enemy type variant weighted by stage difficulty & theme:
 * - Stages 1–2: predominantly Types 1 & 2 (Street Brawlers & Rushers) with occasional Type 3.
 * - Stages 3–5: balanced tri-mix (Types 1, 2, and 3).
 * - Stage 6 (Precinct): heavily weighted toward Type 3 (Heavy Bruisers) with Type 2 support.
 * - Stages 7–8: tough randomized combinations of Types 2 & 3 with hardened Brawlers.
 */
export function getRandomVariantForStage(stage: number): EnemyVariant {
  const rand = Math.random();
  if (stage <= 2) {
    if (rand < 0.52) return 'enemy1';
    if (rand < 0.90) return 'enemy2';
    return 'enemy3';
  }
  if (stage >= 3 && stage <= 5) {
    if (rand < 0.34) return 'enemy1';
    if (rand < 0.67) return 'enemy2';
    return 'enemy3';
  }
  if (stage === 6) {
    if (rand < 0.75) return 'enemy3';
    return 'enemy2';
  }
  // Stages 7-8
  if (rand < 0.45) return 'enemy2';
  if (rand < 0.90) return 'enemy3';
  return 'enemy1';
}

/**
 * Regular enemy HP tripled (3x current regular enemy HP) so every enemy gets knocked down
 * and stands back up 3 times as often (surviving roughly 4–6 full combos/knockdowns before 0 HP):
 * - Type 1 (Street Brawler): base ~210 HP.
 * - Type 2 (Fast Punk / Rusher): base ~180 HP.
 * - Type 3 (Heavy Bruiser): base ~300 HP.
 */
export function getBaseHpForVariant(variant: EnemyVariant, stage: number): number {
  const stageScale = 1 + (stage - 1) * 0.035;
  if (variant === 'enemy1') return Math.round(210 * stageScale);
  if (variant === 'enemy2') return Math.round(180 * stageScale);
  return Math.round(300 * stageScale);
}

interface Fighter {
  id: string;
  type: 'player' | 'punk' | 'boss';
  enemyVariant?: EnemyVariant;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingRight: boolean;
  health: number;
  hp?: number;
  maxHealth: number;
  animState: SpriteAnimationState;
  animTimer: number;
  stateTimer: number;
  stateName:
    | 'idle'
    | 'walk'
    | 'attack'
    | 'kick'
    | 'special'
    | 'hurt'
    | 'knockdown'
    | 'dead'
    | 'jump'
    | 'jump_punch'
    | 'jump_kick'
    | 'grab'
    | 'grab_knee'
    | 'throw'
    | 'grabbed';
  comboStep: number;
  comboWindowTimer?: number;
  attackMove?: 'punch1' | 'punch2' | 'kick2' | 'kick1';
  attackElapsed?: number;
  bufferedInput?: 'punch' | 'kick' | null;
  hasHitCurrentAttack: boolean;
  hasHitThisSwing?: boolean;
  invulnTimer: number;
  windupTimer: number;
  hasPipe?: boolean;
  defeatTimer?: number;
  defeatSoundPlayed?: boolean;
  hasPlayedFallSound?: boolean;

  // 2.5D Jump mechanics
  jumpZ?: number;
  jumpVz?: number;

  // Grapple mechanics
  grabbedEnemy?: Fighter | null;
  grabKneeCount?: number;
  grabTimer?: number;
  isGrabbed?: boolean;
  state?: string;

  // Flying projectile enemy (when thrown)
  isFlyingProjectile?: boolean;
  flyingVx?: number;
  flyingVy?: number;
  flyingZ?: number;
  flyingVz?: number;
  rotation?: number;
  hitEnemiesIds?: string[];

  // Item pickup animation and Gun Special burst mechanics
  pickupTimer?: number;
  specialCooldown?: number;
  specialElapsed?: number;
  specialShotFired?: boolean[];

  // Streets of Rage Melee AI & Spawn Stagger properties
  isEntering?: boolean;
  entryDelay?: number;
  targetEntryX?: number;
  spawnSide?: 'left' | 'right';
  hasAttackToken?: boolean;
  cooldownTimer?: number;
  flankSide?: 'left' | 'right';
  retreatTimer?: number;
  retreatVx?: number;
  zLaneJitter?: number;
  armorActive?: boolean;
  isBerserk?: boolean;
}

interface Bullet {
  id: string;
  x: number;
  y: number;
  visualY: number;
  vx: number;
  facingRight: boolean;
  shotNumber: 1 | 2 | 3;
}

export type BreakablePropType =
  | 'trash_can'
  | 'soda_machine'
  | 'phone_booth'
  | 'fire_hydrant'
  | 'clubStool'
  | 'clubSpeaker'
  | 'clubTable'
  | 'garageTire'
  | 'garageDrum'
  | 'garageCone'
  | 'casinoStanchion'
  | 'casinoStool'
  | 'casinoTable'
  | 'precinctWaterCooler'
  | 'precinctTrashCan'
  | 'precinctChair'
  | 'penthouseBreakableStatue'
  | 'penthouseBreakablePlant'
  | 'penthouseBreakableChair'
  | 'rooftopTrashCan'
  | 'rooftopMetalBin'
  | 'rooftopWoodenCrate';

export const PROP_ASSET_KEYS: Record<BreakablePropType, string> = {
  trash_can: 'trash_can',
  soda_machine: 'breakableSoda',
  phone_booth: 'breakablePhoneBooth',
  fire_hydrant: 'breakableHydrant',
  clubStool: 'clubStool',
  clubSpeaker: 'clubSpeaker',
  clubTable: 'clubTable',
  garageTire: 'garageTire',
  garageDrum: 'garageDrum',
  garageCone: 'garageCone',
  casinoStanchion: 'casinoStanchion',
  casinoStool: 'casinoStool',
  casinoTable: 'casinoTable',
  precinctWaterCooler: 'precinctWaterCooler',
  precinctTrashCan: 'precinctTrashCan',
  precinctChair: 'precinctChair',
  penthouseBreakableStatue: 'penthouseBreakableStatue',
  penthouseBreakablePlant: 'penthouseBreakablePlant',
  penthouseBreakableChair: 'penthouseBreakableChair',
  rooftopTrashCan: 'rooftopTrashCan',
  rooftopMetalBin: 'rooftopTrashCan',
  rooftopWoodenCrate: 'rooftopWoodenCrate',
};

// Proportional heights relative to Night Razor (~110px base height)
export const PROP_BASE_HEIGHTS: Record<BreakablePropType, number> = {
  trash_can: Math.round(54 * 1.6),     // Scaled up +60% (~86px height)
  fire_hydrant: Math.round(52 * 1.6),  // Scaled up +60% (~83px height)
  soda_machine: 120,
  phone_booth: 135,
  clubStool: 114,
  clubTable: 149,
  clubSpeaker: 183,
  garageCone: Math.round(58 * 1.5),
  garageTire: Math.round(66 * 1.5),
  garageDrum: Math.round(74 * 1.5),
  casinoStanchion: 92,
  casinoStool: 112,
  casinoTable: 118,
  precinctWaterCooler: 168, // Water Cooler dispenser (112 * 1.5 = 168px height)
  precinctTrashCan: 86,     // Metal Precinct Trash Can (~86px height, untouched)
  precinctChair: 123,       // Wooden Precinct Chair (82 * 1.5 = 123px height)
  penthouseBreakableStatue: 130, // Modern Penthouse Metallic Ribbon Statue
  penthouseBreakablePlant: 105,  // Ceramic Potted Penthouse Plant
  penthouseBreakableChair: 180,  // Leather Executive Office Chair (50% enlarged: 120 * 1.5 = 180px)
  rooftopTrashCan: 92,
  rooftopMetalBin: 92,
  rooftopWoodenCrate: 96,
};

export const STAGE_1_TOTAL_WIDTH = 7200;
export const SECTOR_WIDTH = 1200;
export const TOTAL_SECTORS = 6;

// Stage 2 (Nightclub Dancefloor) Constants
export const STAGE_2_TOTAL_WIDTH = 3600;
export const STAGE_2_SECTOR_WIDTH = 1800;
export const STAGE_2_TOTAL_WAVES = 3;
export const STAGE_2_Y_MIN = 390;
export const STAGE_2_Y_MAX = 570;

// Stage 2 Exclusive: Pulsing Dance Floor Light Pools (depth = -5, 120 BPM beat)
export interface Stage2FloorLightPool {
  x: number;
  y: number;
  rx: number;
  ry: number;
  color: 'cyan' | 'magenta' | 'blue';
  phase: number;
}

export const STAGE2_FLOOR_LIGHT_POOLS: Stage2FloorLightPool[] = [
  // Sector 1 (0 to 1800)
  { x: 180, y: 440, rx: 100, ry: 44, color: 'cyan', phase: 0 },
  { x: 380, y: 520, rx: 110, ry: 48, color: 'magenta', phase: 1.0 },
  { x: 580, y: 450, rx: 105, ry: 45, color: 'blue', phase: 2.1 },
  { x: 780, y: 535, rx: 115, ry: 50, color: 'cyan', phase: 3.2 },
  { x: 980, y: 435, rx: 95, ry: 42, color: 'magenta', phase: 4.3 },
  { x: 1180, y: 515, rx: 105, ry: 46, color: 'blue', phase: 0.5 },
  { x: 1380, y: 460, rx: 110, ry: 48, color: 'cyan', phase: 1.6 },
  { x: 1580, y: 540, rx: 100, ry: 44, color: 'magenta', phase: 2.7 },
  { x: 1780, y: 440, rx: 115, ry: 50, color: 'blue', phase: 3.8 },
  // Sector 2 (1800 to 3600)
  { x: 1980, y: 525, rx: 100, ry: 44, color: 'cyan', phase: 0.2 },
  { x: 2180, y: 445, rx: 105, ry: 46, color: 'magenta', phase: 1.3 },
  { x: 2380, y: 535, rx: 110, ry: 48, color: 'blue', phase: 2.4 },
  { x: 2580, y: 455, rx: 95, ry: 42, color: 'cyan', phase: 3.5 },
  { x: 2780, y: 515, rx: 115, ry: 50, color: 'magenta', phase: 4.6 },
  { x: 2980, y: 435, rx: 105, ry: 46, color: 'blue', phase: 0.8 },
  { x: 3180, y: 530, rx: 110, ry: 48, color: 'cyan', phase: 1.9 },
  { x: 3380, y: 450, rx: 100, ry: 44, color: 'magenta', phase: 3.0 },
  { x: 3520, y: 520, rx: 105, ry: 46, color: 'blue', phase: 4.1 },
];

export const STAGE2_POOL_COLORS: Record<'cyan' | 'magenta' | 'blue', { r: number; g: number; b: number; baseAlpha: number }> = {
  cyan: { r: 0, g: 240, b: 255, baseAlpha: 0.32 },
  magenta: { r: 255, g: 0, b: 170, baseAlpha: 0.34 },
  blue: { r: 0, g: 85, b: 255, baseAlpha: 0.38 },
};

// Stage 2 Exclusive: Sweeping Overhead Spotlights (Electric Cyan, Hot Magenta, Neon Purple)
export const STAGE2_SPOTLIGHTS = [
  {
    rgb: [0, 240, 255],
    originXRatio: 0.18,
    sweepSpeed: 0.95,
    sweepAmp: 150,
    baseTargetRatio: 0.22,
    phase: 0.0,
    topW: 20,
    bottomW: 175,
    opacity: 0.14,
  },
  {
    rgb: [255, 0, 170],
    originXRatio: 0.42,
    sweepSpeed: 1.25,
    sweepAmp: 170,
    baseTargetRatio: 0.45,
    phase: 1.8,
    topW: 24,
    bottomW: 195,
    opacity: 0.16,
  },
  {
    rgb: [138, 43, 226],
    originXRatio: 0.68,
    sweepSpeed: 0.85,
    sweepAmp: 160,
    baseTargetRatio: 0.66,
    phase: 3.4,
    topW: 22,
    bottomW: 185,
    opacity: 0.17,
  },
  {
    rgb: [0, 240, 255],
    originXRatio: 0.88,
    sweepSpeed: 1.10,
    sweepAmp: 140,
    baseTargetRatio: 0.84,
    phase: 4.9,
    topW: 20,
    bottomW: 170,
    opacity: 0.13,
  },
];

// Stage 3 (Underground Parking Garage) Constants
export const STAGE_3_TOTAL_WIDTH = 3600;
export const STAGE_3_SECTOR_WIDTH = 1800;
export const STAGE_3_TOTAL_WAVES = 3;
export const STAGE_3_Y_MIN = 390;
export const STAGE_3_Y_MAX = 570;

// Stage 4 (Downtown Street Race) Constants
export const STAGE_4_TOTAL_WIDTH = 3600;
export const STAGE_4_SECTOR_WIDTH = 1800;
export const STAGE_4_TOTAL_WAVES = 3;
export const STAGE_4_Y_MIN = 390;
export const STAGE_4_Y_MAX = 570;

// Stage 5 (The Casino) Constants
export const STAGE_5_TOTAL_WIDTH = 3600;
export const STAGE_5_SECTOR_WIDTH = 1800;
export const STAGE_5_TOTAL_WAVES = 3;
export const STAGE_5_Y_MIN = 390;
export const STAGE_5_Y_MAX = 564;

// Stage 6 (Police Precinct) Constants
export const STAGE_6_TOTAL_WIDTH = 4800;
export const STAGE_6_SECTOR_WIDTH = 1200;
export const STAGE_6_TOTAL_WAVES = 4;
export const STAGE_6_Y_MIN = Math.round(600 * 0.68); // 408 (68% screen height)
export const STAGE_6_Y_MAX = Math.round(600 * 0.94); // 564 (94% screen height)

// Stage 7 (Executive Penthouse) Constants
export const STAGE_7_TOTAL_WIDTH = 3200; // 4 x 4:3 rooms of 800px each (A -> B -> A -> B)
export const STAGE_7_SECTOR_WIDTH = 800;
export const STAGE_7_TOTAL_WAVES = 3;
export const STAGE_7_Y_MIN = Math.round(600 * 0.65); // 390 (65% screen height)
export const STAGE_7_Y_MAX = Math.round(600 * 0.94); // 564 (94% screen height)

// Stage 8 (Skyscraper Rooftop) Constants: Exactly 2 4:3 screens wide
export const STAGE_8_SECTOR_WIDTH = 1280; // canvas.width of each 4:3 panel
export const STAGE_8_TOTAL_WIDTH = 2560; // 2 * STAGE_8_SECTOR_WIDTH (stops cleanly at right edge of Panel 2)
export const STAGE_8_TOTAL_WAVES = 3; // Wave 1 (screen 1), Wave 2 (advancing onto screen 2), Boss Wave (Panel 2 arena)
export const STAGE_8_Y_MIN = Math.round(600 * 0.47); // 282 (expanded by 50% vertically)
export const STAGE_8_Y_MAX = Math.round(600 * 0.92); // 552 (92% screen height)

export function getStageWalkableYBounds(stage: number): { minY: number; maxY: number } {
  if (stage === 8) {
    return { minY: STAGE_8_Y_MIN, maxY: STAGE_8_Y_MAX };
  }
  if (stage === 7) {
    return { minY: STAGE_7_Y_MIN, maxY: STAGE_7_Y_MAX };
  }
  if (stage === 6) {
    return { minY: STAGE_6_Y_MIN, maxY: STAGE_6_Y_MAX };
  }
  if (stage === 5) {
    return { minY: STAGE_5_Y_MIN, maxY: STAGE_5_Y_MAX };
  }
  if (stage === 4) {
    return { minY: STAGE_4_Y_MIN, maxY: STAGE_4_Y_MAX };
  }
  if (stage === 3) {
    return { minY: STAGE_3_Y_MIN, maxY: STAGE_3_Y_MAX };
  }
  if (stage === 2) {
    return { minY: STAGE_2_Y_MIN, maxY: STAGE_2_Y_MAX };
  }
  return { minY: STREET_Y_MIN, maxY: STREET_Y_MAX };
}

export function createStage6Breakables(): BreakableProp[] {
  const clampY = (y: number) => Math.max(STAGE_6_Y_MIN, Math.min(STAGE_6_Y_MAX, y));
  return [
    { id: 's6_prop_1_chair', type: 'precinctChair', x: 260, y: clampY(430), health: 1, maxHealth: 1, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_2_cooler', type: 'precinctWaterCooler', x: 480, y: clampY(510), health: 2, maxHealth: 2, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_3_can', type: 'precinctTrashCan', x: 760, y: clampY(440), health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_4_chair', type: 'precinctChair', x: 990, y: clampY(520), health: 1, maxHealth: 1, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_5_cooler', type: 'precinctWaterCooler', x: 1450, y: clampY(430), health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_6_chair', type: 'precinctChair', x: 1700, y: clampY(510), health: 1, maxHealth: 1, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_7_can', type: 'precinctTrashCan', x: 1950, y: clampY(440), health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_8_cooler', type: 'precinctWaterCooler', x: 2200, y: clampY(520), health: 2, maxHealth: 2, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_9_chair', type: 'precinctChair', x: 2650, y: clampY(430), health: 1, maxHealth: 1, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_10_can', type: 'precinctTrashCan', x: 2900, y: clampY(510), health: 2, maxHealth: 2, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_11_cooler', type: 'precinctWaterCooler', x: 3150, y: clampY(440), health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_12_chair', type: 'precinctChair', x: 3400, y: clampY(520), health: 1, maxHealth: 1, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_13_cooler', type: 'precinctWaterCooler', x: 3850, y: clampY(430), health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_14_can', type: 'precinctTrashCan', x: 4100, y: clampY(510), health: 2, maxHealth: 2, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_15_chair', type: 'precinctChair', x: 4350, y: clampY(440), health: 1, maxHealth: 1, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's6_prop_16_cooler', type: 'precinctWaterCooler', x: 4600, y: clampY(520), health: 2, maxHealth: 2, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
  ];
}

export const STAGE6_FOREGROUND_PROPS = [
  { key: 'precinctDeskCop1', x: 0, baseH: 260, yRatio: 1.0 },
  { key: 'precinctRiotCops', x: 650, baseH: 270, yRatio: 1.0 },
  { key: 'precinctDeskCop2', x: 1850, baseH: 260, yRatio: 0.82 },
  { key: 'precinctRiotCops', x: 3050, baseH: 270, yRatio: 1.0 },
] as const;

export function createStage7Breakables(): BreakableProp[] {
  const clampY = (y: number) => Math.max(STAGE_7_Y_MIN, Math.min(STAGE_7_Y_MAX, y));
  return [
    // Section 0 (Lounge): x: 0..800
    { id: 's7_prop_1_plant', type: 'penthouseBreakablePlant', x: 260, y: clampY(430), health: 1, maxHealth: 1, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's7_prop_2_chair', type: 'penthouseBreakableChair', x: 480, y: clampY(510), health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's7_prop_3_statue', type: 'penthouseBreakableStatue', x: 720, y: clampY(440), health: 2, maxHealth: 2, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },

    // Section 1 (Boardroom): x: 800..1600
    { id: 's7_prop_4_chair', type: 'penthouseBreakableChair', x: 1020, y: clampY(520), health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's7_prop_5_plant', type: 'penthouseBreakablePlant', x: 1260, y: clampY(430), health: 1, maxHealth: 1, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's7_prop_6_statue', type: 'penthouseBreakableStatue', x: 1500, y: clampY(515), health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },

    // Section 2 (Gallery): x: 1600..2400
    { id: 's7_prop_7_plant', type: 'penthouseBreakablePlant', x: 1820, y: clampY(435), health: 1, maxHealth: 1, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's7_prop_8_chair', type: 'penthouseBreakableChair', x: 2060, y: clampY(510), health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's7_prop_9_statue', type: 'penthouseBreakableStatue', x: 2300, y: clampY(445), health: 2, maxHealth: 2, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },

    // Section 3 (CEO Penthouse Suite / Boss Arena): x: 2400..3200
    { id: 's7_prop_10_chair', type: 'penthouseBreakableChair', x: 2620, y: clampY(525), health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's7_prop_11_plant', type: 'penthouseBreakablePlant', x: 2860, y: clampY(435), health: 1, maxHealth: 1, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's7_prop_12_statue', type: 'penthouseBreakableStatue', x: 3100, y: clampY(510), health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
  ];
}

export const STAGE7_FOREGROUND_PROPS = [
  { key: 'penthousePalmPlant', x: 220, baseH: 280 },
  { key: 'penthouseRibbonStatue', x: 740, baseH: 280 },
  { key: 'penthousePalmPlant', x: 1260, baseH: 280 },
  { key: 'penthouseRibbonStatue', x: 1780, baseH: 280 },
  { key: 'penthousePalmPlant', x: 2300, baseH: 280 },
  { key: 'penthouseRibbonStatue', x: 2820, baseH: 280 },
  { key: 'penthousePalmPlant', x: 3340, baseH: 280 },
] as const;

export function createStage8Breakables(): BreakableProp[] {
  const clampY = (y: number) => Math.max(STAGE_8_Y_MIN, Math.min(STAGE_8_Y_MAX, y));
  return [
    // Panel 1 (Helipad/HVAC section):
    {
      id: 's8_prop_1_crate',
      type: 'rooftopWoodenCrate',
      x: 520,
      y: clampY(Math.round(600 * 0.58)),
      health: 2,
      maxHealth: 2,
      drop: 'food',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 's8_prop_2_trash',
      type: 'rooftopTrashCan',
      x: 880,
      y: clampY(Math.round(600 * 0.72)),
      health: 1,
      maxHealth: 1,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    // Panel 2 (Access Shed / Water Tower section):
    {
      id: 's8_prop_3_bin',
      type: 'rooftopMetalBin',
      x: 1450,
      y: clampY(Math.round(600 * 0.60)),
      health: 2,
      maxHealth: 2,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 's8_prop_4_crate',
      type: 'rooftopWoodenCrate',
      x: 1820,
      y: clampY(Math.round(600 * 0.76)),
      health: 2,
      maxHealth: 2,
      drop: 'food',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 's8_prop_5_trash',
      type: 'rooftopTrashCan',
      x: 2180,
      y: clampY(Math.round(600 * 0.64)),
      health: 1,
      maxHealth: 1,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
  ];
}

export const STAGE8_FOREGROUND_PROPS = [
  { x: 220, baseH: 190 },
  { x: 760, baseH: 190 },
  { x: 1300, baseH: 190 },
  { x: 1840, baseH: 190 },
  { x: 2380, baseH: 190 },
] as const;

export const STAGE8_BEACON_LIGHTS = [
  { x: 240, y: 140, phase: 0.0 },
  { x: 780, y: 110, phase: 0.6 },
  { x: 1450, y: 130, phase: 1.2 },
  { x: 1980, y: 105, phase: 1.8 },
];

// Ceiling recessed warm amber spotlight anchors across 4 penthouse rooms (1.0x scroll speed)
export const STAGE7_SPOTLIGHT_ANCHORS = [
  // Room 0 (x: 0..800)
  { originX: 180, angleRad: 0.12, widthTop: 24, widthBottom: 170 },
  { originX: 420, angleRad: -0.08, widthTop: 26, widthBottom: 180 },
  { originX: 660, angleRad: 0.14, widthTop: 24, widthBottom: 175 },
  // Room 1 (x: 800..1600)
  { originX: 980, angleRad: -0.10, widthTop: 24, widthBottom: 170 },
  { originX: 1220, angleRad: 0.09, widthTop: 26, widthBottom: 180 },
  { originX: 1460, angleRad: -0.12, widthTop: 24, widthBottom: 175 },
  // Room 2 (x: 1600..2400)
  { originX: 1780, angleRad: 0.11, widthTop: 24, widthBottom: 170 },
  { originX: 2020, angleRad: -0.08, widthTop: 26, widthBottom: 180 },
  { originX: 2260, angleRad: 0.13, widthTop: 24, widthBottom: 175 },
  // Room 3 (x: 2400..3200)
  { originX: 2580, angleRad: -0.11, widthTop: 24, widthBottom: 170 },
  { originX: 2820, angleRad: 0.08, widthTop: 26, widthBottom: 180 },
  { originX: 3060, angleRad: -0.13, widthTop: 24, widthBottom: 175 },
];

export function createStage5Breakables(): BreakableProp[] {
  return [
    { id: 's5_prop_1_stanchion', type: 'casinoStanchion', x: 280, y: 430, health: 1, maxHealth: 1, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's5_prop_2_stool', type: 'casinoStool', x: 440, y: 520, health: 2, maxHealth: 2, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's5_prop_3_table', type: 'casinoTable', x: 740, y: 440, health: 1, maxHealth: 1, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's5_prop_4_stanchion', type: 'casinoStanchion', x: 960, y: 510, health: 1, maxHealth: 1, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's5_prop_5_stool', type: 'casinoStool', x: 1280, y: 425, health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's5_prop_6_table', type: 'casinoTable', x: 1580, y: 530, health: 1, maxHealth: 1, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's5_prop_7_stanchion', type: 'casinoStanchion', x: 1850, y: 435, health: 1, maxHealth: 1, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's5_prop_8_stool', type: 'casinoStool', x: 2180, y: 515, health: 2, maxHealth: 2, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's5_prop_9_table', type: 'casinoTable', x: 2520, y: 445, health: 1, maxHealth: 1, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's5_prop_10_stanchion', type: 'casinoStanchion', x: 2860, y: 535, health: 1, maxHealth: 1, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's5_prop_11_stool', type: 'casinoStool', x: 3180, y: 450, health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's5_prop_12_table', type: 'casinoTable', x: 3460, y: 510, health: 1, maxHealth: 1, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
  ];
}

export const STAGE5_FOREGROUND_SLOTS = [
  { x: 180, h: 260 },
  { x: 880, h: 260 },
  { x: 1680, h: 260 },
  { x: 2480, h: 260 },
  { x: 3340, h: 260 },
] as const;

export const STAGE5_FOREGROUND_ROPES = [
  { x: 530 },
  { x: 1280 },
  { x: 2080 },
  { x: 2910 },
] as const;

export function createStage4Breakables(): BreakableProp[] {
  return [
    { id: 's4_prop_1_hydrant', type: 'fire_hydrant', x: 320, y: 410, health: 25, maxHealth: 25, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's4_prop_2_tire', type: 'garageTire', x: 680, y: 520, health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's4_prop_3_can', type: 'trash_can', x: 1050, y: 440, health: 25, maxHealth: 25, drop: 'pipe', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's4_prop_4_drum', type: 'garageDrum', x: 1420, y: 530, health: 2, maxHealth: 2, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's4_prop_5_hydrant', type: 'fire_hydrant', x: 1750, y: 420, health: 25, maxHealth: 25, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's4_prop_6_tire', type: 'garageTire', x: 2150, y: 510, health: 2, maxHealth: 2, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's4_prop_7_can', type: 'trash_can', x: 2550, y: 450, health: 25, maxHealth: 25, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's4_prop_8_drum', type: 'garageDrum', x: 2950, y: 525, health: 2, maxHealth: 2, drop: 'food', hitFlashTimer: 0, wobbleTimer: 0 },
    { id: 's4_prop_9_tire', type: 'garageTire', x: 3400, y: 470, health: 2, maxHealth: 2, drop: 'score', hitFlashTimer: 0, wobbleTimer: 0 },
  ];
}

export const STAGE4_FOREGROUND_SPECTATORS = [
  { key: 'stage4_guy1', x: 260, baseH: 315 },
  { key: 'stage4_guy2', x: 420, baseH: 300 },
  { key: 'stage4_guy3', x: 1260, baseH: 308 },
  { key: 'stage4_guy4', x: 1420, baseH: 323 },
  { key: 'stage4_guy1', x: 2150, baseH: 315 },
  { key: 'stage4_guy2', x: 2310, baseH: 300 },
  { key: 'stage4_guy3', x: 3100, baseH: 308 },
  { key: 'stage4_guy4', x: 3260, baseH: 323 },
] as const;

export const STAGE4_FOREGROUND_FENCES = [
  { x: 120, h: 405 }, // Scaled up 50% (270 * 1.5 = 405)
  { x: 750, h: 405 },
  { x: 1650, h: 405 },
  { x: 2500, h: 405 },
  { x: 3350, h: 405 },
] as const;

/**
 * Spawns interactive breakable objects across Stage 3 Parking Garage (0 to 3600px):
 * - Tires, Oil Drums, and Road Cones placed across walkable Y-axis area (Y: 435 to 535)
 * - Near concrete pillars, parking stalls, and lighting zones
 * - Road Cones: 1 HP (break in 1 hit)
 * - Tires & Oil Drums: 2 HP (take 2 hits, flash white and wobble on hit 1)
 */
export function createStage3Breakables(): BreakableProp[] {
  return [
    {
      id: 'garage_prop_1_cone',
      type: 'garageCone',
      x: 350,
      y: 440,
      health: 1,
      maxHealth: 1,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'garage_prop_2_tire',
      type: 'garageTire',
      x: 620,
      y: 520,
      health: 2,
      maxHealth: 2,
      drop: 'food',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'garage_prop_3_drum',
      type: 'garageDrum',
      x: 920,
      y: 450,
      health: 2,
      maxHealth: 2,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'garage_prop_4_cone',
      type: 'garageCone',
      x: 1350,
      y: 435,
      health: 1,
      maxHealth: 1,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'garage_prop_5_drum',
      type: 'garageDrum',
      x: 1620,
      y: 530,
      health: 2,
      maxHealth: 2,
      drop: 'food',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'garage_prop_6_tire',
      type: 'garageTire',
      x: 1880,
      y: 460,
      health: 2,
      maxHealth: 2,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'garage_prop_7_cone',
      type: 'garageCone',
      x: 2300,
      y: 445,
      health: 1,
      maxHealth: 1,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'garage_prop_8_tire',
      type: 'garageTire',
      x: 2650,
      y: 525,
      health: 2,
      maxHealth: 2,
      drop: 'food',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'garage_prop_9_drum',
      type: 'garageDrum',
      x: 3000,
      y: 450,
      health: 2,
      maxHealth: 2,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'garage_prop_10_cone',
      type: 'garageCone',
      x: 3350,
      y: 535,
      health: 1,
      maxHealth: 1,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'garage_prop_11_tire',
      type: 'garageTire',
      x: 3520,
      y: 470,
      health: 2,
      maxHealth: 2,
      drop: 'food',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
  ];
}

/**
 * Spawns interactive nightclub breakable props spaced generously across Stage 2 dancefloor (0 to 3600px):
 * - Spaced 600px–800px apart so no more than 1 or 2 appear on screen at once
 * - Alternating sequence with no identical prop back-to-back:
 *   Bar Stool -> Club Dinner Table -> DJ Speaker -> Bar Stool -> Club Dinner Table -> DJ Speaker
 * - Bar Stool (20 HP), Club Dinner Table (20 HP), heavy DJ Speaker (30 HP)
 * - Alternating drops: food (+25 HP) or score bonus (+250 SCORE)
 */
export function createStage2Breakables(): BreakableProp[] {
  return [
    {
      id: 'club_prop_1_stool',
      type: 'clubStool',
      x: 150,
      y: 430,
      health: 20,
      maxHealth: 20,
      drop: 'food',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'club_prop_2_table',
      type: 'clubTable',
      x: 490,
      y: 500,
      health: 20,
      maxHealth: 20,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'club_prop_3_speaker',
      type: 'clubSpeaker',
      x: 830,
      y: 425,
      health: 30,
      maxHealth: 30,
      drop: 'food',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'club_prop_4_stool',
      type: 'clubStool',
      x: 1180,
      y: 520,
      health: 20,
      maxHealth: 20,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'club_prop_5_table',
      type: 'clubTable',
      x: 1530,
      y: 440,
      health: 20,
      maxHealth: 20,
      drop: 'food',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'club_prop_6_speaker',
      type: 'clubSpeaker',
      x: 1870,
      y: 505,
      health: 30,
      maxHealth: 30,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'club_prop_7_stool',
      type: 'clubStool',
      x: 2210,
      y: 415,
      health: 20,
      maxHealth: 20,
      drop: 'food',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'club_prop_8_table',
      type: 'clubTable',
      x: 2560,
      y: 535,
      health: 20,
      maxHealth: 20,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'club_prop_9_speaker',
      type: 'clubSpeaker',
      x: 2900,
      y: 445,
      health: 30,
      maxHealth: 30,
      drop: 'food',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'club_prop_10_stool',
      type: 'clubStool',
      x: 3240,
      y: 515,
      health: 20,
      maxHealth: 20,
      drop: 'score',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
    {
      id: 'club_prop_11_table',
      type: 'clubTable',
      x: 3550,
      y: 460,
      health: 20,
      maxHealth: 20,
      drop: 'food',
      hitFlashTimer: 0,
      wobbleTimer: 0,
    },
  ];
}

/**
 * Spawns breakable street props across doubled Stage 1 (0 to 7200 px):
 * - Road breakable pool for waist-height Wire-Mesh Trash Cans (~86px) and Fire Hydrants (~83px).
 * - Fire hydrants are strictly constrained to the sidewalk curb line (Y: 370 - 395, never out on the road).
 * - Trash cans appear randomly across the entire playable Y-depth range (Y: 370 - 520, both sidewalk and asphalt street).
 */
export function createStage1Breakables(fromSector = 1): TrashCanProp[] {
  const minX = (fromSector - 1) * SECTOR_WIDTH;
  const props: TrashCanProp[] = [];

  // Road breakable pool across all 6 sectors of doubled Stage 1
  const roadSpawns: { x: number; y: number; drop: 'food' | 'score' | 'pipe' }[] = [
    // Sector 1 (x: 200..1150)
    { x: 350, y: 440, drop: 'food' },
    { x: 670, y: 380, drop: 'score' },
    { x: 1020, y: 505, drop: 'pipe' },
    // Sector 2 (x: 1300..2350)
    { x: 1560, y: 465, drop: 'food' },
    { x: 1880, y: 385, drop: 'score' },
    { x: 2220, y: 500, drop: 'food' },
    // Sector 3 (x: 2500..3550)
    { x: 2600, y: 430, drop: 'score' },
    { x: 3100, y: 375, drop: 'food' },
    { x: 3380, y: 490, drop: 'score' },
    // Sector 4 (x: 3700..4750) - Second half begins (Building Sector 2)
    { x: 3850, y: 450, drop: 'food' },
    { x: 4220, y: 380, drop: 'score' },
    { x: 4580, y: 510, drop: 'pipe' },
    // Sector 5 (x: 4900..5950)
    { x: 5120, y: 460, drop: 'food' },
    { x: 5450, y: 385, drop: 'score' },
    { x: 5800, y: 495, drop: 'food' },
    // Sector 6 (x: 6100..7100) - Boss battle zone
    { x: 6250, y: 430, drop: 'score' },
    { x: 6600, y: 380, drop: 'food' },
    { x: 6920, y: 490, drop: 'score' },
  ];

  roadSpawns.forEach((spawn, idx) => {
    if (spawn.x >= minX) {
      // Each road breakable spawns as either a wire-mesh trash can or a fire hydrant variant
      const isHydrant = Math.random() < 0.5;
      const type: BreakablePropType = isHydrant ? 'fire_hydrant' : 'trash_can';
      const jitterX = (Math.random() - 0.5) * 30;
      const jitterY = (Math.random() - 0.5) * 20;
      const finalX = Math.round(spawn.x + jitterX);

      // Hydrant strictly restricted to the concrete sidewalk / curb edge (Y: 370 - 395)
      // Trash can allowed across full playable Y-depth range (Y: 370 - 520, sidewalk + asphalt)
      const finalY = isHydrant
        ? Math.round(370 + Math.random() * (395 - 370))
        : Math.round(Math.max(370, Math.min(520, spawn.y + jitterY)));

      props.push({
        id: `road_prop_${idx}_${type}`,
        type,
        x: finalX,
        y: finalY,
        health: 25,
        maxHealth: 25,
        drop: spawn.drop,
        hitFlashTimer: 0,
        wobbleTimer: 0,
      });
    }
  });

  return props;
}

export const STAGE_1_BREAKABLES: Omit<BreakableProp, 'hitFlashTimer' | 'wobbleTimer'>[] = [
  // First Half (Sector 1 - 3)
  { id: 'stage1_road_1', type: 'trash_can', x: 350, y: 440, health: 25, maxHealth: 25, drop: 'food' },
  { id: 'stage1_road_2', type: 'fire_hydrant', x: 670, y: 385, health: 25, maxHealth: 25, drop: 'score' },
  { id: 'stage1_road_3', type: 'trash_can', x: 1020, y: 380, health: 25, maxHealth: 25, drop: 'pipe' },
  { id: 'stage1_road_4', type: 'fire_hydrant', x: 1560, y: 375, health: 25, maxHealth: 25, drop: 'food' },
  { id: 'stage1_road_5', type: 'trash_can', x: 1880, y: 410, health: 25, maxHealth: 25, drop: 'score' },
  { id: 'stage1_road_6', type: 'fire_hydrant', x: 2220, y: 390, health: 25, maxHealth: 25, drop: 'food' },
  { id: 'stage1_road_7', type: 'trash_can', x: 2600, y: 430, health: 25, maxHealth: 25, drop: 'score' },
  { id: 'stage1_road_8', type: 'fire_hydrant', x: 3100, y: 380, health: 25, maxHealth: 25, drop: 'food' },
  { id: 'stage1_road_9', type: 'trash_can', x: 3380, y: 490, health: 25, maxHealth: 25, drop: 'score' },
  // Second Half (Sector 4 - 6)
  { id: 'stage1_road_10', type: 'trash_can', x: 3850, y: 450, health: 25, maxHealth: 25, drop: 'food' },
  { id: 'stage1_road_11', type: 'fire_hydrant', x: 4220, y: 385, health: 25, maxHealth: 25, drop: 'score' },
  { id: 'stage1_road_12', type: 'trash_can', x: 4580, y: 510, health: 25, maxHealth: 25, drop: 'pipe' },
  { id: 'stage1_road_13', type: 'fire_hydrant', x: 5120, y: 380, health: 25, maxHealth: 25, drop: 'food' },
  { id: 'stage1_road_14', type: 'trash_can', x: 5450, y: 385, health: 25, maxHealth: 25, drop: 'score' },
  { id: 'stage1_road_15', type: 'fire_hydrant', x: 5800, y: 390, health: 25, maxHealth: 25, drop: 'food' },
  { id: 'stage1_road_16', type: 'trash_can', x: 6250, y: 430, health: 25, maxHealth: 25, drop: 'score' },
  { id: 'stage1_road_17', type: 'fire_hydrant', x: 6600, y: 380, health: 25, maxHealth: 25, drop: 'food' },
  { id: 'stage1_road_18', type: 'trash_can', x: 6920, y: 490, health: 25, maxHealth: 25, drop: 'score' },
];

export interface BreakableProp {
  id: string;
  type: BreakablePropType;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  drop: 'food' | 'score' | 'snack' | 'pipe';
  hitFlashTimer: number;
  wobbleTimer: number;
}

export interface FlyingDebrisProp {
  id: string;
  type: BreakablePropType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number;
  vz: number;
  rotation: number;
  vRot: number;
  timer: number;
  maxTimer: number;
}

export type TrashCanProp = BreakableProp;

interface DebrisParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  vRot: number;
  color: string;
  timer: number;
  maxTimer: number;
  type?: 'debris' | 'glass' | 'water' | 'can';
}

interface DropItem {
  id: string;
  type: 'food' | 'score' | 'snack' | 'pipe';
  x: number;
  y: number;
}

interface HitVfx {
  x: number;
  y: number;
  text?: string;
  color: string;
  timer: number;
  maxTimer: number;
}

interface CombatCallout {
  text: string;
  isKo: boolean;
  fontSize: number;
  timer: number;
  maxTimer: number;
}

interface ImpactBurst {
  x: number;
  y: number;
  timer: number;
  maxTimer: number;
  isFinisher: boolean;
  angle: number;
  spikes: number;
  radius: number;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  timer: number;
  maxTimer: number;
  size: number;
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  timer: number;
  maxTimer: number;
  color: string;
}

interface ForegroundProp {
  assetKey:
    | 'fgPole'
    | 'fgFence1'
    | 'fgFence2'
    | 'fgFence3'
    | 'fgCrowd1'
    | 'fgCrowd2'
    | 'fgCrowd3'
    | 'fgDumpster1'
    | 'fgDumpster2'
    | 'fgCar'
    | 'fgFence'
    | 'fgDumpster'
    | 'fgCrowd';
  x: number;
  h: number;
  y?: number;
  bottomOffset?: number;
  w?: number;
}

const FOREGROUND_PROPS: ForegroundProp[] = [
  // First Half (Sector 1 - 3, 0 to 3600 px)
  { assetKey: 'fgPole', x: 160, h: 620, y: -10 },
  { assetKey: 'fgFence1', x: 520, h: 215, bottomOffset: 215 * 0.5 },
  { assetKey: 'fgCrowd1', x: 900, h: 213, bottomOffset: 0 },
  { assetKey: 'fgDumpster1', x: 1280, h: 304, bottomOffset: 304 * 0.5 },
  { assetKey: 'fgFence2', x: 1650, h: 215, bottomOffset: 215 * 0.5 },
  { assetKey: 'fgCrowd2', x: 2020, h: 213, bottomOffset: 0 },
  { assetKey: 'fgFence3', x: 2780, h: 215, bottomOffset: 215 * 0.5 },
  { assetKey: 'fgCrowd3', x: 3150, h: 213, bottomOffset: 0 },
  { assetKey: 'fgDumpster2', x: 3500, h: 304, bottomOffset: 304 * 0.5 },

  // Second Half (Sector 4 - 6, 3600 to 7200 px)
  { assetKey: 'fgPole', x: 3850, h: 620, y: -10 },
  { assetKey: 'fgFence1', x: 4200, h: 215, bottomOffset: 215 * 0.5 },
  { assetKey: 'fgCrowd1', x: 4580, h: 213, bottomOffset: 0 },
  { assetKey: 'fgDumpster1', x: 4950, h: 304, bottomOffset: 304 * 0.5 },
  { assetKey: 'fgFence2', x: 5350, h: 215, bottomOffset: 215 * 0.5 },
  { assetKey: 'fgCrowd2', x: 5720, h: 213, bottomOffset: 0 },
  { assetKey: 'fgPole', x: 6100, h: 620, y: -10 },
  { assetKey: 'fgFence3', x: 6450, h: 215, bottomOffset: 215 * 0.5 },
  { assetKey: 'fgCrowd3', x: 6800, h: 213, bottomOffset: 0 },
  { assetKey: 'fgDumpster2', x: 7050, h: 304, bottomOffset: 304 * 0.5 },
];

export interface Stage2ForegroundOverlay {
  assetKey: 'clubBeam1' | 'clubBeam2' | 'clubCouple1' | 'clubCouple2';
  type: 'beam' | 'couple';
  x: number;
}

const STAGE2_FOREGROUND_PROPS: Stage2ForegroundOverlay[] = [
  { assetKey: 'clubBeam1', type: 'beam', x: 240 },
  { assetKey: 'clubCouple1', type: 'couple', x: 760 },
  { assetKey: 'clubBeam2', type: 'beam', x: 1320 },
  { assetKey: 'clubCouple2', type: 'couple', x: 1850 },
  { assetKey: 'clubBeam1', type: 'beam', x: 2280 },
];

export interface Stage3ForegroundOverlay {
  assetKey: 'garageBeam' | 'garageCar' | 'garageBeam1' | 'garageBeam2' | 'garageCar1' | 'garageCar2';
  type: 'beam' | 'car';
  x: number;
}

const STAGE3_FOREGROUND_PROPS: Stage3ForegroundOverlay[] = [
  { assetKey: 'garageBeam', type: 'beam', x: 260 },
  { assetKey: 'garageCar1', type: 'car', x: 850 },
  { assetKey: 'garageBeam', type: 'beam', x: 1650 },
  { assetKey: 'garageCar2', type: 'car', x: 1950 },
];

export interface BossHudState {
  active: boolean;
  bossId: string;
  bossName: string;
  bossAssetKey: string;
  health: number;
  maxHealth: number;
  displayHealth: number;
  ghostHealth: number;
  alpha: number;
}

export interface CroppedArcadeControls {
  baseRingUrl: string;
  stickKnobUrl: string;
  btnPUrl: string;
  btnSUrl: string;
  btnJUrl: string;
  btnKUrl: string;
}

// Module-level cached arcade controls
let cachedArcadeControlsResult: CroppedArcadeControls | null = null;

/**
 * Dedicated Chroma-Key & Crop Processor for 8-Way Red Arcade Joystick and 4 Metallic Arcade Buttons:
 * 1. Loads sprite image with crossOrigin = 'anonymous'.
 * 2. Strips out solid #00FF00 neon green background using chroma-key transparency and edge despill.
 * 3. Crops the left controller section:
 *    - The outer ring of 8 gold directional arrows (stationary base).
 *    - The center red ball-top sphere (draggable inner thumb stick).
 * 4. Crops the right controller section into the 4 circular metallic buttons:
 *    - P (Blue Button) -> PUNCH
 *    - S (Purple Button) -> SPECIAL / BURST
 *    - J (Red Button) -> JUMP
 *    - K (Yellow Button) -> KICK
 * 5. Caches the 5 sliced offscreen canvases strictly ONCE at startup.
 */
export function processArcadeControlsChromaKey(
  sourceImg: HTMLImageElement
): CroppedArcadeControls | null {
  if (cachedArcadeControlsResult) {
    return cachedArcadeControlsResult;
  }

  try {
    const rawW = sourceImg.naturalWidth || sourceImg.width;
    const rawH = sourceImg.naturalHeight || sourceImg.height;
    if (!rawW || !rawH) return null;

    // Downscale raw image onto a smaller canvas (maxWidth = 640px, preserving aspect ratio)
    // before running chroma key to prevent iOS Safari memory crashes
    const maxWidth = 640;
    const scale = rawW > maxWidth ? maxWidth / rawW : 1.0;
    const width = Math.max(1, Math.round(rawW * scale));
    const height = Math.max(1, Math.round(rawH * scale));

    const scratch = document.createElement('canvas');
    scratch.width = width;
    scratch.height = height;
    const ctx = scratch.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(sourceImg, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Pass 1: Chroma-key neon green background (#00FF00)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const isGreen =
        (g > 140 && g > r * 1.25 && g > b * 1.25) ||
        (g > 115 && g > r * 1.20 && g > b * 1.20 && r < 140 && b < 140) ||
        (g > 180 && r < 125 && b < 125);

      if (isGreen) {
        data[i + 3] = 0;
      } else if (g > r && g > b && g > 65) {
        data[i + 1] = Math.min(r, b);
        const greenExcess = g - Math.max(r, b);
        const alphaFactor = Math.max(0, 1 - greenExcess / 65);
        data[i + 3] = Math.round(data[i + 3] * alphaFactor);
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Pass 2: Left controller section (x < width * 0.48)
    const halfW = Math.floor(width * 0.48);
    let leftMinX = width;
    let leftMaxX = 0;
    let leftMinY = height;
    let leftMaxY = 0;
    let redMinX = width;
    let redMaxX = 0;
    let redMinY = height;
    let redMaxY = 0;
    let hasLeft = false;
    let hasRed = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < halfW; x++) {
        const idx = (y * width + x) * 4;
        if (data[idx + 3] > 30) {
          hasLeft = true;
          if (x < leftMinX) leftMinX = x;
          if (x > leftMaxX) leftMaxX = x;
          if (y < leftMinY) leftMinY = y;
          if (y > leftMaxY) leftMaxY = y;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          // Red ball top sphere: prominent red channel
          if (r > 120 && r > g * 1.35 && r > b * 1.35) {
            hasRed = true;
            if (x < redMinX) redMinX = x;
            if (x > redMaxX) redMaxX = x;
            if (y < redMinY) redMinY = y;
            if (y > redMaxY) redMaxY = y;
          }
        }
      }
    }

    if (!hasLeft) {
      scratch.width = 0;
      scratch.height = 0;
      return null;
    }

    const redW = redMaxX - redMinX + 1;
    const redH = redMaxY - redMinY + 1;
    const redSize = Math.max(redW, redH);
    const redRadius = redSize / 2;
    const redCx = (redMinX + redMaxX) / 2;
    const redCy = (redMinY + redMaxY) / 2;

    // Crop center red ball-top sphere (draggable inner thumb stick)
    const knobCanvas = document.createElement('canvas');
    knobCanvas.width = Math.max(1, redSize);
    knobCanvas.height = Math.max(1, redSize);
    const knobCtx = knobCanvas.getContext('2d');
    if (knobCtx && hasRed) {
      knobCtx.drawImage(
        scratch,
        Math.round(redCx - redSize / 2),
        Math.round(redCy - redSize / 2),
        redSize,
        redSize,
        0,
        0,
        redSize,
        redSize
      );
    }

    // Crop outer ring of 8 gold directional arrows (stationary base)
    const leftW = leftMaxX - leftMinX + 1;
    const leftH = leftMaxY - leftMinY + 1;
    const baseSize = Math.max(leftW, leftH);
    const leftCx = (leftMinX + leftMaxX) / 2;
    const leftCy = (leftMinY + leftMaxY) / 2;

    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = Math.max(1, baseSize);
    baseCanvas.height = Math.max(1, baseSize);
    const baseCtx = baseCanvas.getContext('2d');
    if (baseCtx) {
      const destX = Math.round(baseSize / 2 - (leftCx - leftMinX));
      const destY = Math.round(baseSize / 2 - (leftCy - leftMinY));
      baseCtx.drawImage(scratch, leftMinX, leftMinY, leftW, leftH, destX, destY, leftW, leftH);

      // Clear the red ball from the stationary base ring and create dark central recessed well
      if (hasRed) {
        const ballLocalX = destX + (redCx - leftMinX);
        const ballLocalY = destY + (redCy - leftMinY);
        baseCtx.save();
        baseCtx.globalCompositeOperation = 'destination-out';
        baseCtx.beginPath();
        baseCtx.arc(ballLocalX, ballLocalY, redRadius * 0.9, 0, Math.PI * 2);
        baseCtx.fill();
        baseCtx.restore();

        baseCtx.save();
        const wellGrad = baseCtx.createRadialGradient(
          ballLocalX,
          ballLocalY,
          0,
          ballLocalX,
          ballLocalY,
          redRadius * 0.9
        );
        wellGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
        wellGrad.addColorStop(0.75, 'rgba(30, 41, 59, 0.85)');
        wellGrad.addColorStop(1, 'rgba(15, 23, 42, 0.3)');
        baseCtx.fillStyle = wellGrad;
        baseCtx.beginPath();
        baseCtx.arc(ballLocalX, ballLocalY, redRadius * 0.9, 0, Math.PI * 2);
        baseCtx.fill();
        baseCtx.strokeStyle = 'rgba(234, 179, 8, 0.7)';
        baseCtx.lineWidth = 2.5;
        baseCtx.stroke();
        baseCtx.restore();
      }
    }

    // Pass 3: Right controller section (x >= width * 0.48) for the 4 circular metallic buttons
    const startX = Math.floor(width * 0.48);
    const rightW = width - startX;
    const visited = new Uint8Array(rightW * height);
    const components: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
      count: number;
      sumR: number;
      sumG: number;
      sumB: number;
    }[] = [];

    for (let y = 0; y < height; y += 2) {
      for (let rx = 0; rx < rightW; rx += 2) {
        const vIdx = y * rightW + rx;
        if (visited[vIdx]) continue;
        const globalX = startX + rx;
        const pIdx = (y * width + globalX) * 4;
        if (data[pIdx + 3] <= 35) continue;

        let cMinX = globalX;
        let cMaxX = globalX;
        let cMinY = y;
        let cMaxY = y;
        let count = 0;
        let sR = 0;
        let sG = 0;
        let sB = 0;
        const q = [rx, y];
        visited[vIdx] = 1;
        let qHead = 0;

        while (qHead < q.length) {
          const qx = q[qHead++];
          const qy = q[qHead++];
          const gX = startX + qx;
          const gIdx = (qy * width + gX) * 4;

          cMinX = Math.min(cMinX, gX);
          cMaxX = Math.max(cMaxX, gX);
          cMinY = Math.min(cMinY, qy);
          cMaxY = Math.max(cMaxY, qy);
          count++;
          sR += data[gIdx];
          sG += data[gIdx + 1];
          sB += data[gIdx + 2];

          const nbs = [
            [qx - 2, qy],
            [qx + 2, qy],
            [qx, qy - 2],
            [qx, qy + 2],
          ];
          for (const [nx, ny] of nbs) {
            if (nx >= 0 && nx < rightW && ny >= 0 && ny < height) {
              const nvIdx = ny * rightW + nx;
              if (!visited[nvIdx]) {
                visited[nvIdx] = 1;
                const npIdx = (ny * width + (startX + nx)) * 4;
                if (data[npIdx + 3] > 35) {
                  q.push(nx, ny);
                }
              }
            }
          }
        }

        if (count > 35) {
          components.push({
            minX: cMinX,
            maxX: cMaxX,
            minY: cMinY,
            maxY: cMaxY,
            count,
            sumR: sR,
            sumG: sG,
            sumB: sB,
          });
        }
      }
    }

    // Merge components within 14px
    let merged = true;
    while (merged) {
      merged = false;
      for (let i = 0; i < components.length; i++) {
        for (let j = i + 1; j < components.length; j++) {
          const c1 = components[i];
          const c2 = components[j];
          const margin = 14;
          if (
            c1.minX - margin <= c2.maxX &&
            c1.maxX + margin >= c2.minX &&
            c1.minY - margin <= c2.maxY &&
            c1.maxY + margin >= c2.minY
          ) {
            c1.minX = Math.min(c1.minX, c2.minX);
            c1.maxX = Math.max(c1.maxX, c2.maxX);
            c1.minY = Math.min(c1.minY, c2.minY);
            c1.maxY = Math.max(c1.maxY, c2.maxY);
            c1.count += c2.count;
            c1.sumR += c2.sumR;
            c1.sumG += c2.sumG;
            c1.sumB += c2.sumB;
            components.splice(j, 1);
            merged = true;
            break;
          }
        }
        if (merged) break;
      }
    }

    components.sort((a, b) => b.count - a.count);

    // Square crop helper
    const cropSquare = (comp: { minX: number; maxX: number; minY: number; maxY: number }) => {
      const cw = Math.max(1, comp.maxX - comp.minX + 1);
      const ch = Math.max(1, comp.maxY - comp.minY + 1);
      const sz = Math.max(cw, ch);
      const can = document.createElement('canvas');
      can.width = Math.max(1, sz);
      can.height = Math.max(1, sz);
      const cCtx = can.getContext('2d');
      if (cCtx) {
        const destX = Math.round((sz - cw) / 2);
        const destY = Math.round((sz - ch) / 2);
        cCtx.drawImage(scratch, comp.minX, comp.minY, cw, ch, destX, destY, cw, ch);
      }
      return can;
    };

    // Calculate cluster bounding box in right half for geometric crops if needed
    let rMinX = width;
    let rMaxX = startX;
    let rMinY = height;
    let rMaxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = startX; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 30) {
          rMinX = Math.min(rMinX, x);
          rMaxX = Math.max(rMaxX, x);
          rMinY = Math.min(rMinY, y);
          rMaxY = Math.max(rMaxY, y);
        }
      }
    }
    const rW = Math.max(20, rMaxX - rMinX + 1);
    const rH = Math.max(20, rMaxY - rMinY + 1);
    const rMidX = (rMinX + rMaxX) / 2;
    const rMidY = (rMinY + rMaxY) / 2;
    const btnW = rW * 0.45;
    const btnH = rH * 0.45;

    // Collect candidate button crops
    const candidateCrops = (components.length >= 4 ? components.slice(0, 4) : [
      { minX: rMidX - btnW / 2, maxX: rMidX + btnW / 2, minY: rMinY, maxY: rMinY + btnH }, // Top (S)
      { minX: rMaxX - btnW, maxX: rMaxX, minY: rMidY - btnH / 2, maxY: rMidY + btnH / 2 }, // Right (P)
      { minX: rMinX, maxX: rMinX + btnW, minY: rMidY - btnH / 2, maxY: rMidY + btnH / 2 }, // Left (J)
      { minX: rMidX - btnW / 2, maxX: rMidX + btnW / 2, minY: rMaxY - btnH, maxY: rMaxY }, // Bottom (K)
    ]).map((c) => ({
      comp: c,
      canvas: cropSquare(c),
    }));

    // Score candidates by RGB channels to map exact button color to letter
    const scoredCandidates = candidateCrops.map(({ comp, canvas }) => {
      const cCtx = canvas.getContext('2d');
      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      if (cCtx) {
        const pData = cCtx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < pData.length; i += 4) {
          if (pData[i + 3] > 40) {
            sumR += pData[i];
            sumG += pData[i + 1];
            sumB += pData[i + 2];
            count++;
          }
        }
      }
      const avgR = sumR / Math.max(1, count);
      const avgG = sumG / Math.max(1, count);
      const avgB = sumB / Math.max(1, count);

      return {
        comp,
        canvas,
        avgR,
        avgG,
        avgB,
        // Blue button (P): dominant Blue
        P: avgB * 2 - avgR - avgG,
        // Purple button (S): high Red and high Blue, low Green
        S: (avgR + avgB) * 1.5 - avgG * 3,
        // Red button (J): dominant Red, low Green and Blue
        J: avgR * 2 - avgG - avgB,
        // Yellow button (K): high Red and high Green, low Blue
        K: (avgR + avgG) * 1.5 - avgB * 3,
      };
    });

    type ButtonKey = 'P' | 'S' | 'J' | 'K';
    const buttonCanvases: Record<ButtonKey, HTMLCanvasElement> = {
      P: candidateCrops[1]?.canvas || cropSquare({ minX: rMaxX - btnW, maxX: rMaxX, minY: rMidY - btnH / 2, maxY: rMidY + btnH / 2 }),
      S: candidateCrops[0]?.canvas || cropSquare({ minX: rMidX - btnW / 2, maxX: rMidX + btnW / 2, minY: rMinY, maxY: rMinY + btnH }),
      J: candidateCrops[2]?.canvas || cropSquare({ minX: rMinX, maxX: rMinX + btnW, minY: rMidY - btnH / 2, maxY: rMidY + btnH / 2 }),
      K: candidateCrops[3]?.canvas || cropSquare({ minX: rMidX - btnW / 2, maxX: rMidX + btnW / 2, minY: rMaxY - btnH, maxY: rMaxY }),
    };

    const assigned = new Set<number>();
    const btnTypes: ButtonKey[] = ['S', 'P', 'J', 'K'];

    btnTypes.forEach((btnType) => {
      let bestIdx = -1;
      let bestScore = -Infinity;
      scoredCandidates.forEach((s, idx) => {
        if (!assigned.has(idx) && s[btnType] > bestScore) {
          bestScore = s[btnType];
          bestIdx = idx;
        }
      });
      if (bestIdx !== -1) {
        assigned.add(bestIdx);
        buttonCanvases[btnType] = scoredCandidates[bestIdx].canvas;
      }
    });

    // Verification check: ensure btnJ is strictly Red (Jump) and btnK is strictly Yellow (Kick)
    const jCand = scoredCandidates.find((s) => s.canvas === buttonCanvases.J);
    const kCand = scoredCandidates.find((s) => s.canvas === buttonCanvases.K);
    if (jCand && kCand) {
      // Yellow has prominent green channel (avgG > 90 and avgG > avgB * 1.3)
      // Red has prominent red channel with low green (avgR > avgG * 1.25)
      // If btnJ has more yellow characteristics than btnK, swap them
      if (jCand.avgG > kCand.avgG || jCand.K > jCand.J || kCand.J > kCand.K) {
        const temp = buttonCanvases.J;
        buttonCanvases.J = buttonCanvases.K;
        buttonCanvases.K = temp;
      }
    }

    const baseRing = baseCanvas;
    const stickKnob = knobCanvas;
    const btnP = buttonCanvases.P;
    const btnS = buttonCanvases.S;
    const btnJ = buttonCanvases.J;
    const btnK = buttonCanvases.K;

    const result: CroppedArcadeControls = {
      baseRingUrl: baseRing.toDataURL('image/png'),
      stickKnobUrl: stickKnob.toDataURL('image/png'),
      btnPUrl: btnP.toDataURL('image/png'),
      btnSUrl: btnS.toDataURL('image/png'),
      btnJUrl: btnJ.toDataURL('image/png'),
      btnKUrl: btnK.toDataURL('image/png'),
    };

    // Cache the result in module scope so it is NEVER recalculated
    cachedArcadeControlsResult = result;

    // Discard temporary scratch canvas
    scratch.width = 0;
    scratch.height = 0;

    return result;
  } catch (err) {
    console.warn('[ArcadeControls] Error processing arcade controls sprite:', err);
    return null;
  }
}

/**
 * Fallback Base Ring: Geometric SVG representation of 8 gold directional arrows
 * in an outer ring with dark central well.
 */
function FallbackBaseRing() {
  return (
    <svg viewBox="0 0 160 160" className="w-full h-full pointer-events-none select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
      <defs>
        <radialGradient id="baseRimGrad" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#1e293b" />
          <stop offset="90%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <radialGradient id="wellGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="85%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>
      {/* Outer metallic plate */}
      <circle cx="80" cy="80" r="76" fill="url(#baseRimGrad)" stroke="#d97706" strokeWidth="3" />
      <circle cx="80" cy="80" r="70" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 2" />

      {/* 8 Gold Directional Arrows (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 80 80)`}>
          <polygon
            points="80,14 73,28 77,28 77,36 83,36 83,28 87,28"
            fill="#facc15"
            stroke="#b45309"
            strokeWidth="1.2"
          />
        </g>
      ))}

      {/* Recessed center well */}
      <circle cx="80" cy="80" r="32" fill="url(#wellGrad)" stroke="#b45309" strokeWidth="2" />
    </svg>
  );
}

/**
 * Fallback Red Ball-Top Knob: 3D glossy red arcade ball-top sphere.
 */
function FallbackRedBall() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none select-none">
      <defs>
        <radialGradient id="redBallSphere" cx="36%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#ff9999" />
          <stop offset="20%" stopColor="#ef4444" />
          <stop offset="65%" stopColor="#b91c1c" />
          <stop offset="90%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>
      </defs>
      {/* 3D red arcade ball */}
      <circle cx="50" cy="50" r="46" fill="url(#redBallSphere)" stroke="#7f1d1d" strokeWidth="2.5" />
      {/* Specular curved white shine */}
      <ellipse cx="38" cy="30" rx="14" ry="7" fill="white" opacity="0.65" transform="rotate(-25 38 30)" />
    </svg>
  );
}

/**
 * Interactive 360° Analog Joystick with 8-Way Continuous Direction Driving:
 * - Renders the 8-arrow ring in the bottom-left control area.
 * - Draggable red ball-top sphere follows player's finger within the radius of 8 gold arrows.
 * - Snaps cleanly back to center on release.
 * - Drives moveLeft, moveRight, moveUp, moveDown continuous 8-way movement.
 */
export interface ArcadeJoystickProps {
  controls: CroppedArcadeControls | null;
  touchActionsRef: React.MutableRefObject<{
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    punch: boolean;
    kick: boolean;
    jump: boolean;
    special: boolean;
  }>;
  onUserInteraction: () => void;
}

export function ArcadeJoystick({
  controls,
  touchActionsRef,
  onUserInteraction,
}: ArcadeJoystickProps) {
  const [nubPos, setNubPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const baseRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);

  const updateJoystick = useCallback(
    (clientX: number, clientY: number) => {
      if (!baseRef.current) return;
      const rect = baseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = Math.round(rect.width * 0.28); // Stays within gold arrow boundary

      let clampedX = dx;
      let clampedY = dy;
      if (dist > maxRadius) {
        clampedX = (dx / dist) * maxRadius;
        clampedY = (dy / dist) * maxRadius;
      }

      setNubPos({ x: clampedX, y: clampedY });

      // Continuous 360° / 8-directional mapping (45° sectors) with deadzone
      const deadzone = 8;
      if (dist < deadzone) {
        touchActionsRef.current.right = false;
        touchActionsRef.current.left = false;
        touchActionsRef.current.down = false;
        touchActionsRef.current.up = false;
      } else {
        const angle = Math.atan2(dy, dx);
        const deg = ((angle * 180) / Math.PI + 360) % 360;

        touchActionsRef.current.right = deg >= 292.5 || deg <= 67.5;
        touchActionsRef.current.left = deg >= 112.5 && deg <= 247.5;
        touchActionsRef.current.down = deg >= 22.5 && deg <= 157.5;
        touchActionsRef.current.up = deg >= 202.5 && deg <= 337.5;
      }
    },
    [touchActionsRef],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onUserInteraction();
    activePointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    activePointerIdRef.current = null;
    setIsDragging(false);
    setNubPos({ x: 0, y: 0 });
    touchActionsRef.current.right = false;
    touchActionsRef.current.left = false;
    touchActionsRef.current.down = false;
    touchActionsRef.current.up = false;
  };

  return (
    <div
      ref={baseRef}
      className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center pointer-events-auto touch-none select-none shrink-0 ml-1 sm:ml-2 mb-1 sm:mb-2"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      style={{ touchAction: 'none' }}
      aria-label="Arcade 8-Way Joystick">
      {/* Outer stationary ring of 8 gold directional arrows */}
      {controls?.baseRingUrl ? (
        <img
          src={controls.baseRingUrl}
          alt="8-Way Directional Base Ring"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
          draggable={false}
        />
      ) : (
        <FallbackBaseRing />
      )}

      {/* Draggable center red ball-top sphere */}
      <div
        className="absolute w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center pointer-events-none select-none"
        style={{
          transform: `translate(${nubPos.x}px, ${nubPos.y}px) ${isDragging ? 'scale(1.06)' : 'scale(1)'}`,
          transition: isDragging ? 'none' : 'transform 0.14s cubic-bezier(0.18, 0.89, 0.32, 1.25)',
          filter: isDragging
            ? 'drop-shadow(0 0 14px rgba(255, 60, 60, 0.85)) brightness(1.2)'
            : 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))',
        }}>
        {controls?.stickKnobUrl ? (
          <img
            src={controls.stickKnobUrl}
            alt="Arcade Red Ball-Top Joystick"
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
        ) : (
          <FallbackRedBall />
        )}
      </div>
    </div>
  );
}

/**
 * Individual Metallic Arcade Button with responsive press feedback.
 */
function ArcadeButton({
  label,
  keyLetter,
  imgUrl,
  accentColor,
  positionClass,
  onActionStart,
  onActionEnd,
}: {
  label: string;
  keyLetter: string;
  imgUrl?: string;
  accentColor: string;
  positionClass: string;
  onActionStart: () => void;
  onActionEnd: () => void;
}) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsPressed(true);
    onActionStart();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsPressed(false);
    onActionEnd();
  };

  const handlePointerCancel = () => {
    setIsPressed(false);
    onActionEnd();
  };

  return (
    <div className={`absolute ${positionClass} w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center pointer-events-auto`}>
      <button
        type="button"
        aria-label={`${keyLetter} (${label})`}
        onPointerDown={handlePointerDown}
        onPointerMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        style={{
          touchAction: 'none',
          transform: isPressed ? 'scale(0.91)' : 'scale(1)',
          filter: isPressed
            ? `brightness(1.25) drop-shadow(0 0 10px ${accentColor})`
            : 'drop-shadow(0 3px 6px rgba(0,0,0,0.65))',
          transition: 'transform 0.08s cubic-bezier(0.2, 0.8, 0.4, 1), filter 0.08s ease',
        }}
        className="w-full h-full rounded-full flex flex-col items-center justify-center p-0.5 select-none touch-none">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={`Arcade Button ${keyLetter}`}
            className="w-full h-full object-contain pointer-events-none select-none rounded-full"
            draggable={false}
          />
        ) : (
          <div
            className="w-full h-full rounded-full border-2 flex flex-col items-center justify-center shadow-lg"
            style={{
              borderColor: accentColor,
              backgroundColor: `${accentColor}33`,
            }}>
            <span className="text-base sm:text-lg font-black leading-none font-mono" style={{ color: accentColor }}>
              {keyLetter}
            </span>
            <span className="text-[7px] font-mono text-white/90 leading-tight">
              {label}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}

/**
 * 4 Metallic Arcade Buttons Arranged in Diamond Layout (Bottom-Right):
 * - S (Purple): Top -> SPECIAL / BURST (triggers C special attack)
 * - J (Red): Left -> JUMP (triggers Jump)
 * - P (Blue): Right -> PUNCH (triggers Z attack)
 * - K (Yellow): Bottom -> KICK (triggers X attack)
 */
export interface ArcadeDiamondButtonsProps {
  controls: CroppedArcadeControls | null;
  touchActionsRef: React.MutableRefObject<{
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    punch: boolean;
    kick: boolean;
    jump: boolean;
    special: boolean;
  }>;
  onUserInteraction: () => void;
}

export function ArcadeDiamondButtons({
  controls,
  touchActionsRef,
  onUserInteraction,
}: ArcadeDiamondButtonsProps) {
  return (
    <div className="relative w-40 h-40 sm:w-44 sm:h-44 pointer-events-auto select-none touch-none shrink-0 mr-1 sm:mr-2 mb-1 sm:mb-2">
      {/* S (Purple Button) - Top -> SPECIAL / BURST (triggers C) */}
      <ArcadeButton
        label="BURST"
        keyLetter="S"
        imgUrl={controls?.btnSUrl}
        accentColor="#a855f7"
        positionClass="top-0 left-1/2 -translate-x-1/2"
        onActionStart={() => {
          touchActionsRef.current.special = true;
          onUserInteraction();
        }}
        onActionEnd={() => {
          touchActionsRef.current.special = false;
        }}
      />

      {/* J (Red Button) - Left -> JUMP (triggers Space / Jump) */}
      <ArcadeButton
        label="JUMP"
        keyLetter="J"
        imgUrl={controls?.btnJUrl}
        accentColor="#ef4444"
        positionClass="left-0 top-1/2 -translate-y-1/2"
        onActionStart={() => {
          touchActionsRef.current.jump = true;
          onUserInteraction();
        }}
        onActionEnd={() => {
          touchActionsRef.current.jump = false;
        }}
      />

      {/* P (Blue Button) - Right -> PUNCH (triggers Z attack) */}
      <ArcadeButton
        label="PUNCH"
        keyLetter="P"
        imgUrl={controls?.btnPUrl}
        accentColor="#00f0ff"
        positionClass="right-0 top-1/2 -translate-y-1/2"
        onActionStart={() => {
          touchActionsRef.current.punch = true;
          onUserInteraction();
        }}
        onActionEnd={() => {
          touchActionsRef.current.punch = false;
        }}
      />

      {/* K (Yellow Button) - Bottom -> KICK (triggers X attack) */}
      <ArcadeButton
        label="KICK"
        keyLetter="K"
        imgUrl={controls?.btnKUrl}
        accentColor="#facc15"
        positionClass="bottom-0 left-1/2 -translate-x-1/2"
        onActionStart={() => {
          touchActionsRef.current.kick = true;
          onUserInteraction();
        }}
        onActionEnd={() => {
          touchActionsRef.current.kick = false;
        }}
      />
    </div>
  );
}

export const BACKGROUND_ASSET_KEYS = new Set<string>([
  'title_cover',
  'game_over_screen',
  'intro_slide_1',
  'intro_slide_2',
  'intro_slide_3',
  'outro_slide_1',
  'outro_slide_2',
  'outro_slide_3',
  'stage1_sky',
  'stage1_buildings',
  'buildingSection1',
  'buildingSection2',
  'stage1_street',
  'clubBg',
  'clubBg1',
  'clubBg2',
  'clubFloor',
  'clubFgRails',
  'garageBg1',
  'garageBg2',
  'garageFloor',
  'stage4_skyline',
  'stage4_bldA',
  'stage4_bldB',
  'stage4_floor',
  'casinoBgA',
  'casinoBgB',
  'casinoFloorA',
  'precinctWindowBg',
  'precinctRoomA',
  'precinctRoomB',
  'penthouseSkyline',
  'penthouseRoomA',
  'penthouseRoomB',
  'rooftopSkyline',
  'rooftopSectionA',
  'rooftopSectionB',
]);

/**
 * Downscales oversized images on load to prevent iOS Safari memory crashes:
 * - maxWidth = 960px for backgrounds (preserving aspect ratio)
 * - maxHeight = 360px for character/enemy/boss/prop sprites (preserving aspect ratio)
 */
export function prepareDownscaledImage(
  img: HTMLImageElement,
  isBackground: boolean
): { element: HTMLImageElement | HTMLCanvasElement; wasDownscaled: boolean } {
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;
  if (!origW || !origH) {
    return { element: img, wasDownscaled: false };
  }

  let scale = 1.0;
  if (isBackground) {
    const maxW = 960;
    if (origW > maxW) {
      scale = maxW / origW;
    }
  } else {
    // Character / enemy / boss / prop sprites capped at maxHeight = 360px
    const maxH = 360;
    if (origH > maxH) {
      scale = maxH / origH;
    }
  }

  if (scale >= 1.0) {
    return { element: img, wasDownscaled: false };
  }

  const targetW = Math.max(1, Math.round(origW * scale));
  const targetH = Math.max(1, Math.round(origH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { element: img, wasDownscaled: false };
  }
  ctx.drawImage(img, 0, 0, targetW, targetH);
  (canvas as any).naturalWidth = targetW;
  (canvas as any).naturalHeight = targetH;
  return { element: canvas, wasDownscaled: true };
}

// Pre-cached offscreen canvases & gradients for zero per-frame runtime allocations in Safari
const CACHED_POOL_CANVASES: Record<string, HTMLCanvasElement> = {};
function getCachedPoolCanvas(color: 'cyan' | 'magenta' | 'blue'): HTMLCanvasElement {
  if (!CACHED_POOL_CANVASES[color]) {
    const can = document.createElement('canvas');
    can.width = 128;
    can.height = 128;
    const cctx = can.getContext('2d');
    if (cctx) {
      const cfg = STAGE2_POOL_COLORS[color];
      const grad = cctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, `rgba(${cfg.r}, ${cfg.g}, ${cfg.b}, 1)`);
      grad.addColorStop(0.45, `rgba(${cfg.r}, ${cfg.g}, ${cfg.b}, 0.55)`);
      grad.addColorStop(1, `rgba(${cfg.r}, ${cfg.g}, ${cfg.b}, 0)`);
      cctx.fillStyle = grad;
      cctx.fillRect(0, 0, 128, 128);
    }
    CACHED_POOL_CANVASES[color] = can;
  }
  return CACHED_POOL_CANVASES[color];
}

const CACHED_COLOR_GLOWS: Record<string, HTMLCanvasElement> = {};
function getColorGlowCanvas(r: number, g: number, b: number): HTMLCanvasElement {
  const key = `${r},${g},${b}`;
  if (!CACHED_COLOR_GLOWS[key]) {
    const can = document.createElement('canvas');
    can.width = 128;
    can.height = 128;
    const cctx = can.getContext('2d');
    if (cctx) {
      const grad = cctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
      grad.addColorStop(0.48, `rgba(${r}, ${g}, ${b}, 0.52)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      cctx.fillStyle = grad;
      cctx.fillRect(0, 0, 128, 128);
    }
    CACHED_COLOR_GLOWS[key] = can;
  }
  return CACHED_COLOR_GLOWS[key];
}

let cachedBossBgGrad: CanvasGradient | null = null;
let cachedBossGhostGrad: CanvasGradient | null = null;
let cachedBossFillGrad: CanvasGradient | null = null;
let cachedBossTextGrad: CanvasGradient | null = null;
let cachedCalloutKoGrad: CanvasGradient | null = null;
let cachedCalloutHitGrad: CanvasGradient | null = null;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepperRef = useRef<ReturnType<typeof createFixedStepper>>();
  const isMobile = useIsMobile();

  // Audio mute states
  const [sfxMuted, setSfxMuted] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);

  // Overlays
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const startOverlayRef = useRef<HTMLDivElement>(null);
  const gameOverOverlayRef = useRef<HTMLDivElement>(null);
  const isGameMenuOpenRef = useRef(isGameMenuOpen);
  isGameMenuOpenRef.current = isGameMenuOpen;

  // Ref forward declaration for gameState to allow early access in callbacks
  const gameStateRef = useRef<GameState>({
    status: 'START',
    score: 0,
    level: 1,
    lives: getConfig('startingLives') as number,
  });

  // Toggle mute for both music and sound effects ('M' key or HUD toggle)
  const toggleAudioMute = useCallback(() => {
    setMusicMuted((prevMusic) => {
      const next = !prevMusic;
      setSfxMuted(next);
      audioManager.setMuted(next);
      if (!next && gameStateRef.current.status === 'PLAYING' && !isGameMenuOpenRef.current) {
        audioManager.resumeBgm();
      }
      return next;
    });
  }, []);

  // Listen to host playground-mute events
  useEffect(() => {
    const onPlaygroundMute = (e: Event) => {
      const customEvent = e as CustomEvent<{muted: boolean}>;
      const muted = customEvent.detail.muted;
      setSfxMuted(muted);
      setMusicMuted(muted);
      audioManager.setMuted(muted);
    };
    window.addEventListener('playground-mute', onPlaygroundMute);
    return () => window.removeEventListener('playground-mute', onPlaygroundMute);
  }, []);

  // Synchronize audio manager states whenever musicMuted or sfxMuted changes
  useEffect(() => {
    audioManager.setMusicMuted(musicMuted);
  }, [musicMuted]);

  useEffect(() => {
    audioManager.setSfxMuted(sfxMuted);
  }, [sfxMuted]);

  // Unlock Audio on First Input & User Gestures
  useEffect(() => {
    const handleUnlockAudio = () => {
      unlockAllAudio();
      audioManager.onUserInteraction(gameStateRef.current.status === 'PLAYING');
    };
    window.addEventListener('keydown', handleUnlockAudio, { passive: true });
    window.addEventListener('pointerdown', handleUnlockAudio, { passive: true });
    window.addEventListener('touchstart', handleUnlockAudio, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleUnlockAudio);
      window.removeEventListener('pointerdown', handleUnlockAudio);
      window.removeEventListener('touchstart', handleUnlockAudio);
    };
  }, []);

  // Global pause cancel tracking
  const lastCancelRef = useRef(false);

  // Playground SDK Integration
  const {sdk, isReady} = usePlayground();
  const [exitChat] = useRpc<Record<string, unknown>, void>('ExitChat');

  // Preload local assets (boss, crate, items, hud badge)
  const {assets: localAssets, isReady: localAssetsReady} = useAssets(LOCAL_ASSETS_MANIFEST);

  // Preload, chroma-key, and crop custom 8-way arcade joystick and 4 metallic buttons ONCE on startup
  const [arcadeControls, setArcadeControls] = useState<CroppedArcadeControls | null>(() => cachedArcadeControlsResult);

  useEffect(() => {
    if (cachedArcadeControlsResult) {
      setArcadeControls(cachedArcadeControlsResult);
      return;
    }

    let active = true;
    let img: HTMLImageElement | null = new Image();
    img.crossOrigin = 'anonymous';

    const cleanupImage = (imageEl: HTMLImageElement | null) => {
      if (!imageEl) return;
      imageEl.onload = null;
      imageEl.onerror = null;
      imageEl.src = '';
    };

    const handleLoad = () => {
      if (!active || !img) return;
      const cropped = processArcadeControlsChromaKey(img);
      cleanupImage(img);
      img = null;
      if (cropped && active) {
        setArcadeControls(cropped);
      }
    };

    img.onload = handleLoad;
    img.onerror = () => {
      cleanupImage(img);
      img = null;
      // Retry once without crossorigin if CORS had an issue
      let retryImg: HTMLImageElement | null = new Image();
      retryImg.onload = () => {
        if (!active || !retryImg) return;
        const cropped = processArcadeControlsChromaKey(retryImg);
        cleanupImage(retryImg);
        retryImg = null;
        if (cropped && active) setArcadeControls(cropped);
      };
      retryImg.onerror = () => {
        cleanupImage(retryImg);
        retryImg = null;
      };
      retryImg.src = ARCADE_CONTROLS_SPRITE_URL;
    };

    img.src = ARCADE_CONTROLS_SPRITE_URL;

    return () => {
      active = false;
      cleanupImage(img);
      img = null;
    };
  }, []);

  // Helper to load assets in small sequential batches of 5 to eliminate iPhone Safari memory spikes
  async function loadBatch<T>(
    items: T[],
    fn: (item: T) => Promise<any>,
    batchSize = 5
  ): Promise<void> {
    for (let i = 0; i < items.length; i += batchSize) {
      await Promise.all(items.slice(i, i + batchSize).map(fn));
    }
  }

  // Preload & Chroma-key external single-frame images with sequential batching and automatic CORS fallback retry
  const [externalAssets, setExternalAssets] = useState<Record<string, RenderableImage | null>>({});
  const [externalAssetsReady, setExternalAssetsReady] = useState(false);

  useEffect(() => {
    let active = true;
    const entries = Object.entries(EXTERNAL_ASSET_DEFS);
    const loaded: Record<string, RenderableImage | null> = {};

    const loadSingleAsset = (key: string, def: { url: string; chromaKey: boolean }): Promise<void> => {
      return new Promise<void>((resolve) => {
        if (!active) {
          resolve();
          return;
        }

        const primaryUrl = resolveDirectImageUrl(def.url);
        const candidates: string[] = [primaryUrl];
        if (def.url && !candidates.includes(def.url)) {
          candidates.push(def.url);
        }
        const postMatch = def.url.match(/postimg\.cc\/([A-Za-z0-9_-]+)/);
        if (postMatch) {
          const alt1 = `https://i.postimg.cc/${postMatch[1]}/image.jpg`;
          if (!candidates.includes(alt1)) candidates.push(alt1);
          const alt2 = `https://i.postimg.cc/${postMatch[1]}/image.png`;
          if (!candidates.includes(alt2)) candidates.push(alt2);
        }

        let candidateIdx = 0;
        const loadAsset = (stage: 'cors' | 'direct') => {
          const img = new Image();
          const currentSrc = candidates[candidateIdx] || primaryUrl;

          if (stage === 'cors') {
            img.crossOrigin = 'anonymous';
          } else {
            img.crossOrigin = null;
          }

          img.onload = () => {
            const isBackground = BACKGROUND_ASSET_KEYS.has(key);
            const downscaled = prepareDownscaledImage(img, isBackground);
            const sourceElement = downscaled.element;
            let processed: RenderableImage = sourceElement;
            try {
              if (
                key.startsWith('breakable') ||
                key === 'trash_can' ||
                key === 'clubStool' ||
                key === 'clubSpeaker' ||
                key === 'clubTable' ||
                key === 'garageTire' ||
                key === 'garageDrum' ||
                key === 'garageCone' ||
                key.startsWith('clubBeam') ||
                key.startsWith('clubCouple') ||
                key.startsWith('garageBeam') ||
                key.startsWith('garageCar')
              ) {
                processed = processPropChromaKey(sourceElement);
              } else if (key.startsWith('casinoBg')) {
                processed = sourceElement;
              } else if (key === 'casinoStanchion' || key === 'casinoStool' || key === 'casinoTable') {
                processed = processCasinoChromaKey(sourceElement, true);
              } else if (key.startsWith('casino')) {
                processed = processCasinoChromaKey(sourceElement, false);
              } else if (key === 'garageFloor') {
                processed = processGarageChromaKey(sourceElement, false);
              } else if (key === 'garageBg1' || key === 'garageBg2' || key === 'stage4_skyline') {
                processed = sourceElement;
              } else if (key === 'stage4_floor') {
                processed = processStage4ChromaKey(sourceElement, true);
              } else if (key.startsWith('stage4_')) {
                processed = processStage4ChromaKey(sourceElement);
              } else if (key === 'precinctWindowBg') {
                processed = sourceElement;
              } else if (key === 'precinctRoomA' || key === 'precinctRoomB') {
                processed = processPrecinctRoomChromaKey(sourceElement);
              } else if (key === 'precinctSeamPillar') {
                processed = processPrecinctPillarChromaKey(sourceElement);
              } else if (key === 'precinctDeskCop1') {
                processed = processDeskCop1ChromaKey(sourceElement);
              } else if (key === 'precinctArchway') {
                processed = processArchwayChromaKey(sourceElement);
              } else if (key === 'precinctChair' || key === 'precinctWaterCooler' || key === 'precinctTrashCan') {
                processed = processPrecinctChromaKey(sourceElement, true);
              } else if (key.startsWith('precinct')) {
                processed = processPrecinctChromaKey(sourceElement, false);
              } else if (key === 'penthouseSkyline') {
                processed = sourceElement;
              } else if (key.startsWith('penthouseBreakable')) {
                processed = processPenthouseChromaKey(sourceElement, true);
              } else if (key.startsWith('penthouse')) {
                processed = processPenthouseChromaKey(sourceElement, false);
              } else if (key === 'rooftopSkyline') {
                processed = sourceElement;
              } else if (key === 'rooftopTrashCan' || key === 'rooftopWoodenCrate') {
                processed = processRooftopPropChromaKey(sourceElement);
              } else if (key.startsWith('rooftop')) {
                processed = processRooftopChromaKey(sourceElement);
              } else if (key.startsWith('leon_')) {
                processed = processLeonChromaKey(sourceElement);
              } else if (key.startsWith('victor_')) {
                processed = processVictorChromaKey(sourceElement);
              } else if (key.startsWith('bonehead_')) {
                processed = processBoneHeadChromaKey(sourceElement);
              } else if (key.startsWith('hellkage_')) {
                processed = processHellKageChromaKey(sourceElement);
              } else if (key.startsWith('hero_') && key !== 'hero_portrait') {
                processed = processHeroChromaKey(sourceElement);
              } else if (
                key === 'ride_out_banner' ||
                key === 'ride_out_prompt'
              ) {
                processed = processRideOutChromaKey(sourceElement);
              } else if (
                key.startsWith('fg') ||
                key.startsWith('enemy') ||
                key === 'clubFloor' ||
                key === 'clubFgRails' ||
                key === 'stage1_intro_banner' ||
                key === 'hero_portrait' ||
                key === 'pickupSprite' ||
                key === 'gunPose1Sprite' ||
                key === 'gunPose2Sprite' ||
                key === 'gunPose3Sprite' ||
                key === 'bulletProjectileSprite'
              ) {
                processed = processGreenScreenChromaKey(sourceElement);
              } else if (def.chromaKey) {
                processed = processChromaKey(sourceElement);
              }
            } catch (err) {
              console.warn(`[ChromaKey] Fallback to raw image for ${key}:`, err);
              processed = sourceElement;
            }

            // If intermediate downscaled canvas was used and a new canvas was produced, discard intermediate canvas
            if (
              downscaled.wasDownscaled &&
              downscaled.element instanceof HTMLCanvasElement &&
              downscaled.element !== processed
            ) {
              downscaled.element.width = 0;
              downscaled.element.height = 0;
            }

            // Nullify/discard raw full-size image if processed is not the raw image to free iOS Safari memory
            if (processed !== img) {
              img.onload = null;
              img.onerror = null;
              img.src = '';
            }

            loaded[key] = processed;

            // Pre-bake blur once at load time for Stage 5 foreground overlays
            if (key === 'casinoVelvetRope') {
              try {
                loaded['casinoVelvetRopeBlurred'] = createPreBlurredCanvas(processed, 2.5, 6);
              } catch (err) {
                console.warn('[PreBlur] Error pre-blurring casinoVelvetRope:', err);
                loaded['casinoVelvetRopeBlurred'] = processed;
              }
            } else if (key === 'casinoSlotFg') {
              try {
                loaded['casinoSlotFgBlurred'] = createPreBlurredCanvas(processed, 2.5, 6);
              } catch (err) {
                console.warn('[PreBlur] Error pre-blurring casinoSlotFg:', err);
                loaded['casinoSlotFgBlurred'] = processed;
              }
            }

            resolve();
          };

          img.onerror = () => {
            if (stage === 'cors') {
              loadAsset('direct');
              return;
            }
            if (candidateIdx + 1 < candidates.length) {
              candidateIdx++;
              loadAsset('cors');
              return;
            }
            console.warn(`[ExternalAssets] Could not load ${key} from candidate URLs`);
            loaded[key] = null;
            if (key === 'casinoVelvetRope') {
              loaded['casinoVelvetRopeBlurred'] = null;
            } else if (key === 'casinoSlotFg') {
              loaded['casinoSlotFgBlurred'] = null;
            }
            resolve();
          };

          img.src = currentSrc;
        };

        loadAsset('cors');
      });
    };

    const runBatchLoader = async () => {
      await loadBatch(entries, ([key, def]) => loadSingleAsset(key, def), 5);
      if (active) {
        setExternalAssets(loaded);
        setExternalAssetsReady(true);
      }
    };

    runBatchLoader();

    return () => {
      active = false;
    };
  }, []);

  const allAssetsReady = localAssetsReady && externalAssetsReady;

  const canvasWidth = getConfig('baseCanvasWidth') as number;
  const canvasHeight = getConfig('baseCanvasHeight') as number;

  if (!stepperRef.current) {
    const stepMs = getConfig('stepMs');
    const maxSubSteps = getConfig('maxSubSteps');
    stepperRef.current = createFixedStepper(stepMs, maxSubSteps);
  }

  // Playground save/resume
  const {initialLevel, initialScore, persistenceEnabled, autoStartPending} =
    usePlaygroundResume({
      isReady,
      assetsReady: allAssetsReady,
      onAutoStart: () => {
        if (gameStateRef.current.status === 'START') {
          initGame();
        }
      },
    });

  const startLevel = Math.min(initialLevel, 8);
  const startScore = initialScore;
  const levelStartScoreRef = useRef(startScore);
  const prevLevelRef = useRef(startLevel);
  const runWonRef = useRef(false);

  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    score: startScore,
    level: startLevel,
    lives: getConfig('startingLives') as number,
  });

  gameStateRef.current = gameState;

  // Arcade 3-Continue System
  const [continues, setContinues] = useState(3);
  const continuesRef = useRef(3);
  continuesRef.current = continues;
  const [showContinueModal, setShowContinueModal] = useState(false);
  const showContinueModalRef = useRef(false);
  showContinueModalRef.current = showContinueModal;

  // Comic cutscenes state
  const [cutsceneSlide, setCutsceneSlide] = useState(0);
  const cutsceneSlideRef = useRef(0);
  cutsceneSlideRef.current = cutsceneSlide;

  // 2-Slide Mid-Game Intermission Cutscenes (Stage 2 -> 3, Stage 4 -> 5, Stage 6 -> 7)
  const [intermissionCutscene, setIntermissionCutscene] = useState<IntermissionCutsceneState | null>(null);
  const intermissionCutsceneRef = useRef<IntermissionCutsceneState | null>(null);
  intermissionCutsceneRef.current = intermissionCutscene;

  // Cinematic Fade-to-Black Transition System
  interface FadeTransitionConfig {
    fadeOutDuration: number;
    fadeInDuration: number;
    fadeOutBgm?: boolean;
    onMidpoint?: () => void;
    onComplete?: () => void;
  }

  interface FadeTransitionState {
    active: boolean;
    phase: 'idle' | 'fade_out' | 'fade_in';
    duration: number;
    fadeInDuration: number;
    elapsed: number;
    alpha: number;
    fadeOutBgm?: boolean;
    bgmStartVolume?: number;
    onMidpoint?: () => void;
    onComplete?: () => void;
  }

  const transitionRef = useRef<FadeTransitionState>({
    active: false,
    phase: 'idle',
    duration: 0,
    fadeInDuration: 0,
    elapsed: 0,
    alpha: 0,
  });

  const [blackOverlayAlpha, setBlackOverlayAlpha] = useState(0);
  const blackOverlayAlphaRef = useRef(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);
  const fadeOverlayRef = useRef<HTMLDivElement>(null);
  const victorDefeatedTransitionRef = useRef<{ pending: boolean; timer: number }>({
    pending: false,
    timer: 0,
  });

  const startTransition = useCallback((config: FadeTransitionConfig) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);

    musicManager.fadeMusicOut(config.fadeOutDuration || 0.8);

    transitionRef.current = {
      active: true,
      phase: 'fade_out',
      duration: Math.max(0.01, config.fadeOutDuration),
      fadeInDuration: Math.max(0.01, config.fadeInDuration),
      elapsed: 0,
      alpha: 0,
      fadeOutBgm: config.fadeOutBgm,
      onMidpoint: config.onMidpoint,
      onComplete: config.onComplete,
    };
  }, []);

  const updateTransition = useCallback((dt: number) => {
    const tr = transitionRef.current;
    if (!tr.active) return;

    tr.elapsed += dt;

    if (tr.phase === 'fade_out') {
      const p = Math.min(1, tr.elapsed / tr.duration);
      tr.alpha = p;

      if (tr.elapsed >= tr.duration) {
        tr.alpha = 1;
        musicManager.stopMusic();
        const midpointCb = tr.onMidpoint;
        tr.onMidpoint = undefined;
        midpointCb?.();

        tr.phase = 'fade_in';
        tr.duration = tr.fadeInDuration;
        tr.elapsed = 0;
      }
    } else if (tr.phase === 'fade_in') {
      const p = Math.min(1, tr.elapsed / tr.duration);
      tr.alpha = 1 - p;

      if (tr.elapsed >= tr.duration) {
        tr.alpha = 0;
        tr.active = false;
        tr.phase = 'idle';
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        const completeCb = tr.onComplete;
        tr.onComplete = undefined;
        completeCb?.();
      }
    }

    const currentAlpha = tr.alpha;
    blackOverlayAlphaRef.current = currentAlpha;
    setBlackOverlayAlpha(currentAlpha);

    if (fadeOverlayRef.current) {
      fadeOverlayRef.current.style.opacity = String(currentAlpha);
      fadeOverlayRef.current.style.pointerEvents = tr.active ? 'auto' : 'none';
      fadeOverlayRef.current.style.display = currentAlpha > 0 || tr.active ? 'block' : 'none';
    }
  }, []);

  const updateTransitionRef = useRef(updateTransition);
  updateTransitionRef.current = updateTransition;

  useOverlayFocusNavigation(startOverlayRef, gameState.status === 'START' && !autoStartPending && allAssetsReady);
  useOverlayFocusNavigation(gameOverOverlayRef, gameState.status === 'GAME_OVER');

  // Pause background music immediately when game is paused, resume when unpaused
  useEffect(() => {
    if (gameState.status !== 'PLAYING') return;

    if (isGameMenuOpen) {
      musicManager.pauseMusic();
    } else {
      if (!musicMuted) {
        musicManager.resumeMusic();
      }
    }
  }, [isGameMenuOpen, gameState.status, musicMuted]);

  useEffect(() => {
    if (gameState.level !== prevLevelRef.current) {
      prevLevelRef.current = gameState.level;
      levelStartScoreRef.current = gameStateRef.current.score;
    }
  }, [gameState.level]);

  useEffect(() => {
    if (gameState.status === 'VICTORY') {
      runWonRef.current = true;
      musicManager.stopMusic();
      stopGameOverSound();
    } else if (gameState.status === 'GAME_OVER') {
      musicManager.stopMusic();
      playGameOverSound();
    } else if (gameState.status === 'START') {
      musicManager.stopMusic();
      stopGameOverSound();
    }
  }, [gameState.status]);

  useEffect(() => {
    const canHandleBackKey = gameState.status !== 'START';
    (window as CustomWindow).canHandleBackKey = canHandleBackKey;
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'PLAYGROUND_CAN_HANDLE_BACK_KEY',
          value: canHandleBackKey,
        },
        '*',
      );
    }
  }, [gameState.status]);

  const inputRef = useInput(canvasRef, true, {
    width: canvasWidth,
    height: canvasHeight,
  });

  // Touch virtual actions state
  const touchActionsRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    punch: false,
    kick: false,
    jump: false,
    special: false,
  });

  // Gamepad / USB Joystick State & Notification Tracking
  const [gamepadNotification, setGamepadNotification] = useState<string | null>(null);
  const gamepadNoticeTimerRef = useRef<number | null>(null);
  const knownGamepadsRef = useRef<Set<string>>(new Set());
  const prevGamepadButtonsRef = useRef<Record<number, boolean>>({});

  const showGamepadNotification = useCallback((message: string) => {
    setGamepadNotification(message);
    if (gamepadNoticeTimerRef.current) {
      clearTimeout(gamepadNoticeTimerRef.current);
    }
    gamepadNoticeTimerRef.current = window.setTimeout(() => {
      setGamepadNotification(null);
    }, 3200);
  }, []);

  interface GamepadSnapshot {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    punch: boolean;
    kick: boolean;
    jump: boolean;
    special: boolean;
    start: boolean;
    select: boolean;
    confirm: boolean;
    punchPressed: boolean;
    kickPressed: boolean;
    jumpPressed: boolean;
    specialPressed: boolean;
    startPressed: boolean;
    confirmPressed: boolean;
    selectPressed: boolean;
  }

  const emptyGamepadSnapshot = (): GamepadSnapshot => ({
    up: false,
    down: false,
    left: false,
    right: false,
    punch: false,
    kick: false,
    jump: false,
    special: false,
    start: false,
    select: false,
    confirm: false,
    punchPressed: false,
    kickPressed: false,
    jumpPressed: false,
    specialPressed: false,
    startPressed: false,
    confirmPressed: false,
    selectPressed: false,
  });

  const currentGamepadRef = useRef<GamepadSnapshot>(emptyGamepadSnapshot());
  const prevGamepadRef = useRef<GamepadSnapshot>(emptyGamepadSnapshot());

  const pollGamepads = useCallback((): GamepadSnapshot => {
    const currentButtons: Record<number, boolean> = {};
    const prevButtons = prevGamepadButtonsRef.current;
    let axisH = 0;
    let axisV = 0;

    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      let gamepads: (globalThis.Gamepad | null)[] = [];
      try {
        gamepads = Array.from(navigator.getGamepads());
      } catch {
        gamepads = [];
      }

      const currentConnectedIds = new Set<string>();

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (!gp || !gp.connected) continue;

        currentConnectedIds.add(gp.id);

        // Auto-detect new gamepad connection
        if (!knownGamepadsRef.current.has(gp.id)) {
          knownGamepadsRef.current.add(gp.id);
          const cleanName = gp.id
            .replace(/\s*\(STANDARD GAMEPAD.*?\)/i, '')
            .replace(/\s*vendor:.*$/i, '')
            .trim()
            .slice(0, 28) || 'USB Gamepad';
          showGamepadNotification(`🎮 Controller Connected: ${cleanName}`);
        }

        // Stick axes
        const h = gp.axes[0] ?? 0;
        const v = gp.axes[1] ?? 0;
        if (Math.abs(h) > Math.abs(axisH)) axisH = h;
        if (Math.abs(v) > Math.abs(axisV)) axisV = v;

        // Collect all pressed buttons
        for (let b = 0; b < gp.buttons.length; b++) {
          const btn = gp.buttons[b];
          const pressed = btn ? (typeof btn === 'object' ? (btn.pressed || btn.value > 0.5) : btn > 0.5) : false;
          if (pressed) {
            currentButtons[b] = true;
          }
        }
      }

      // Check for disconnected controllers
      for (const prevId of Array.from(knownGamepadsRef.current)) {
        if (!currentConnectedIds.has(prevId)) {
          knownGamepadsRef.current.delete(prevId);
          const cleanName = prevId
            .replace(/\s*\(STANDARD GAMEPAD.*?\)/i, '')
            .replace(/\s*vendor:.*$/i, '')
            .trim()
            .slice(0, 28) || 'USB Gamepad';
          showGamepadNotification(`Controller Disconnected: ${cleanName}`);
        }
      }
    }

    const isPressed = (idx: number): boolean => Boolean(currentButtons[idx]);
    const isFresh = (idx: number): boolean => Boolean(currentButtons[idx] && !prevButtons[idx]);

    // 0.25 analog deadzone on axes[0] and axes[1], plus D-Pad (12: Up, 13: Down, 14: Left, 15: Right)
    const DEADZONE = 0.25;
    const left = axisH < -DEADZONE || isPressed(14);
    const right = axisH > DEADZONE || isPressed(15);
    const up = axisV < -DEADZONE || isPressed(12);
    const down = axisV > DEADZONE || isPressed(13);

    // Punch: buttons[2] (X / Square) or buttons[4] (LB / L1)
    const punch = isPressed(2) || isPressed(4);
    const punchPressed = isFresh(2) || isFresh(4);

    // Kick: buttons[3] (Y / Triangle) or buttons[7] (RT / R2)
    const kick = isPressed(3) || isPressed(7);
    const kickPressed = isFresh(3) || isFresh(7);

    // Jump: buttons[0] (A / Cross)
    const jump = isPressed(0);
    const jumpPressed = isFresh(0);

    // Special / Burst: buttons[1] (B / Circle) or buttons[5] (RB / R1)
    const special = isPressed(1) || isPressed(5);
    const specialPressed = isFresh(1) || isFresh(5);

    // System: Start -> buttons[9]
    const start = isPressed(9);
    const startPressed = isFresh(9);

    // Confirm: Face Button Bottom / Left -> buttons[0] or buttons[2]
    const confirm = isPressed(0) || isPressed(2);
    const confirmPressed = isFresh(0) || isFresh(2);

    // System: Select / Share -> buttons[8]
    const select = isPressed(8);
    const selectPressed = isFresh(8);

    prevGamepadButtonsRef.current = currentButtons;

    return {
      up,
      down,
      left,
      right,
      punch,
      kick,
      jump,
      special,
      start,
      select,
      confirm,
      punchPressed,
      kickPressed,
      jumpPressed,
      specialPressed,
      startPressed,
      confirmPressed,
      selectPressed,
    };
  }, [showGamepadNotification]);

  const pollGamepadsRef = useRef(pollGamepads);
  pollGamepadsRef.current = pollGamepads;

  // Window gamepad connection listeners
  useEffect(() => {
    const handleConnected = (e: GamepadEvent) => {
      if (e.gamepad) {
        knownGamepadsRef.current.add(e.gamepad.id);
        const cleanName = e.gamepad.id
          .replace(/\s*\(STANDARD GAMEPAD.*?\)/i, '')
          .replace(/\s*vendor:.*$/i, '')
          .trim()
          .slice(0, 28) || 'USB Joystick';
        showGamepadNotification(`🎮 Controller Connected: ${cleanName}`);
      }
    };

    const handleDisconnected = (e: GamepadEvent) => {
      if (e.gamepad) {
        knownGamepadsRef.current.delete(e.gamepad.id);
        const cleanName = e.gamepad.id
          .replace(/\s*\(STANDARD GAMEPAD.*?\)/i, '')
          .replace(/\s*vendor:.*$/i, '')
          .trim()
          .slice(0, 28) || 'USB Joystick';
        showGamepadNotification(`Controller Disconnected: ${cleanName}`);
      }
    };

    window.addEventListener('gamepadconnected', handleConnected);
    window.addEventListener('gamepaddisconnected', handleDisconnected);
    return () => {
      window.removeEventListener('gamepadconnected', handleConnected);
      window.removeEventListener('gamepaddisconnected', handleDisconnected);
      if (gamepadNoticeTimerRef.current) {
        clearTimeout(gamepadNoticeTimerRef.current);
      }
    };
  }, [showGamepadNotification]);

  // Boss Sprite Renderer (Boss spritesheet preserved)
  const bossRendererRef = useRef(new SpriteRenderer(BOSS_SPRITE_CONFIGS));

  const bossHudRef = useRef<BossHudState>({
    active: false,
    bossId: '',
    bossName: '',
    bossAssetKey: '',
    health: 0,
    maxHealth: 1,
    displayHealth: 0,
    ghostHealth: 0,
    alpha: 0,
  });

  // Track isGrounded for Night Razor jump & land detection
  const isGroundedRef = useRef(true);

  // Simulation State Refs
  const playerRef = useRef<Fighter>({
    id: 'hero',
    type: 'player',
    x: 200,
    y: 490,
    vx: 0,
    vy: 0,
    facingRight: true,
    health: getConfig('playerMaxHealth') as number,
    maxHealth: getConfig('playerMaxHealth') as number,
    animState: { currentAction: 'IDLE', currentFrame: 0, timer: 0 },
    animTimer: 0,
    stateTimer: 0,
    stateName: 'idle',
    comboStep: 0,
    comboWindowTimer: 0,
    attackMove: undefined,
    attackElapsed: 0,
    bufferedInput: null,
    hasHitCurrentAttack: false,
    hasHitThisSwing: false,
    invulnTimer: 0,
    windupTimer: 0,
    hasPipe: false,
    jumpZ: 0,
    jumpVz: 0,
    grabbedEnemy: null,
    grabKneeCount: 0,
    grabTimer: 0,
  });

  const enemiesRef = useRef<Fighter[]>([]);
  const pendingEnemiesRef = useRef<any[]>([]);
  const reinforcementTimerRef = useRef(0);
  const trashCansRef = useRef<TrashCanProp[]>([]);
  const flyingDebrisPropsRef = useRef<FlyingDebrisProp[]>([]);
  const debrisParticlesRef = useRef<DebrisParticle[]>([]);
  const dropsRef = useRef<DropItem[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const hitVfxRef = useRef<HitVfx[]>([]);

  // Procedural Comic-Book Impact FX Refs
  const impactBurstsRef = useRef<ImpactBurst[]>([]);
  const sparksRef = useRef<SparkParticle[]>([]);
  const shockwavesRef = useRef<ShockwaveRing[]>([]);
  const hitStopTimerRef = useRef(0);
  const combatCalloutRef = useRef<CombatCallout | null>(null);

  // Camera & Arena Sector Progress
  const [selectedStage, setSelectedStage] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1);
  const selectedStageRef = useRef<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1);
  selectedStageRef.current = selectedStage;
  const currentStageRef = useRef(1); // 1 to 8
  const stage1WaveRef = useRef(1);   // 1, 2, 3, 4
  const stage2WaveRef = useRef(1);   // 1, 2, 3, 4 (Boss)
  const stage3WaveRef = useRef(1);   // 1, 2, 3 (3 waves)
  const stage4WaveRef = useRef(1);   // 1, 2, 3, 4 (Boss)
  const stage5WaveRef = useRef(1);   // 1, 2, 3 (3 waves)
  const stage6WaveRef = useRef(1);   // 1, 2, 3, 4 (Boss)
  const stage7WaveRef = useRef(1);   // 1, 2, 3 (3 waves)
  const stage8WaveRef = useRef(1);   // 1, 2, 3 (Boss Victor)
  const stageClearTransitionRef = useRef<{ active: boolean; timer: number; fromStage: 1 | 2 | 3 | 4 | 5 | 6 | 7 }>({
    active: false,
    timer: 0,
    fromStage: 1,
  });
  const cameraXRef = useRef(0);
  const targetCameraXRef = useRef(0);
  const currentSectorRef = useRef(1); // 1, 2, or 3 (Boss)
  const sectorClearedRef = useRef(false);
  const arenaLockedRef = useRef(true);
  const goArrowFlashTimerRef = useRef(0);
  const rideOutActiveRef = useRef(false);
  const rideOutPulseTimerRef = useRef(0);
  const rideOutBlinkCycleRef = useRef(-1);
  const rideOutChimeTimerRef = useRef(0);
  const playerXAtUnlockRef = useRef(0);
  const comboCountRef = useRef(0);
  const comboTimerRef = useRef(0);
  const screenShakeRef = useRef(0);
  const stageIntroTimerRef = useRef(0);
  const garageFlickerTimerRef = useRef(0);

  // Key edge detection refs
  const keyStateRef = useRef<Record<string, boolean>>({});
  const lastPunchKeyRef = useRef(false);
  const lastKickKeyRef = useRef(false);
  const lastJumpKeyRef = useRef(false);
  const lastSpecialKeyRef = useRef(false);

  // Keyboard listener for action keys Z, X, C, Mute (M), and movement
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'm') {
        toggleAudioMute();
        return;
      }
      if (gameStateRef.current.status === 'START') {
        // Keep selectedStage on Stage 1 for standard game start
        selectedStageRef.current = 1;
      }

      if (showContinueModalRef.current) {
        if (k === ' ' || k === 'space' || k === 'enter' || k === 'z') {
          e.preventDefault();
          useContinueRef.current();
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          quitFromContinueRef.current();
          return;
        }
      }

      if (gameStateRef.current.status === 'INTERMISSION_CUTSCENE') {
        if ([' ', 'space', 'enter', 'z', 'x'].includes(k)) {
          e.preventDefault();
          advanceIntermissionCutsceneRef.current();
          return;
        }
      }

      if (
        gameStateRef.current.status === 'INTRO_CUTSCENE' ||
        gameStateRef.current.status === 'OUTRO_CUTSCENE'
      ) {
        if ([' ', 'space', 'enter', 'z', 'x'].includes(k)) {
          e.preventDefault();
          advanceCutsceneRef.current();
          return;
        }
      }

      keyStateRef.current[k] = true;
      if (e.code) keyStateRef.current[e.code.toLowerCase()] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 's', 'a', 'd'].includes(k)) {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        if (gameStateRef.current.status === 'PLAYING') {
          setIsGameMenuOpen((prev) => !prev);
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keyStateRef.current[k] = false;
      if (e.code) keyStateRef.current[e.code.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [toggleAudioMute]);

  // Streets of Rage Staggered Wave Spawn Factory
  const createStaggeredEnemies = useCallback(
    (
      configs: {
        id: string;
        type: 'punk' | 'boss';
        enemyVariant?: EnemyVariant;
        targetY: number;
        health: number;
        spawnSide: 'left' | 'right';
        entryDelay: number;
      }[],
      camX: number
    ): Fighter[] => {
      return configs.map((cfg) => {
        const isLeft = cfg.spawnSide === 'left';
        const startX = isLeft ? camX - 70 : camX + canvasWidth + 70;
        const targetEntryX = isLeft
          ? camX + 90 + Math.random() * 70
          : camX + canvasWidth - 110 - Math.random() * 70;

        return {
          id: cfg.id,
          type: cfg.type,
          enemyVariant: cfg.enemyVariant || 'enemy1',
          x: startX,
          y: cfg.targetY,
          vx: 0,
          vy: 0,
          facingRight: isLeft,
          health: cfg.health,
          maxHealth: cfg.health,
          animState: { currentAction: 'IDLE', currentFrame: 0, timer: 0 },
          animTimer: 0,
          stateTimer: 0,
          stateName: 'idle',
          comboStep: 0,
          hasHitCurrentAttack: false,
          invulnTimer: 0,
          windupTimer: 0,
          isEntering: true,
          entryDelay: cfg.entryDelay,
          targetEntryX,
          spawnSide: cfg.spawnSide,
          cooldownTimer: 0,
          retreatTimer: 0,
          zLaneJitter: (Math.random() - 0.5) * 8,
        };
      });
    },
    [canvasWidth]
  );

  // Helper to spawn a wave with stage-weighted randomized enemy types and staggering
  const createStageWaveConfigs = useCallback(
    (
      stage: number,
      wave: number,
      count: number,
      bossCfg?: { id: string; health: number; targetY?: number }
    ) => {
      const bounds = getStageWalkableYBounds(stage);
      const ySpan = Math.max(30, bounds.maxY - bounds.minY - 50);
      const configs: {
        id: string;
        type: 'punk' | 'boss';
        enemyVariant?: EnemyVariant;
        targetY: number;
        health: number;
        spawnSide: 'left' | 'right';
        entryDelay: number;
      }[] = [];

      if (bossCfg) {
        configs.push({
          id: bossCfg.id,
          type: 'boss',
          targetY: bossCfg.targetY ?? Math.round((bounds.minY + bounds.maxY) / 2),
          health: bossCfg.health,
          spawnSide: 'right',
          entryDelay: 0.1,
        });
      }

      const regularCount = bossCfg ? count - 1 : count;
      for (let idx = 0; idx < regularCount; idx++) {
        const variant = getRandomVariantForStage(stage);
        const health = getBaseHpForVariant(variant, stage);
        const targetY = Math.round(bounds.minY + 25 + ((idx * 45 + Math.random() * 20) % ySpan));
        const spawnSide = (idx % 2 === 0 ? 'right' : 'left') as 'left' | 'right';
        const entryDelay = 0.15 + idx * 0.32;
        configs.push({
          id: `s${stage}_w${wave}_${idx}_${variant}`,
          type: 'punk',
          enemyVariant: variant,
          targetY,
          health,
          spawnSide,
          entryDelay,
        });
      }

      return configs;
    },
    []
  );

  // Reinforcement Trickle Spawn Initializer: Caps simultaneous active enemies on-screen at 4 (or 5 for Boss waves).
  // Remaining wave quota enemies are enqueued into pendingEnemiesRef and smoothly trickled in as active enemies are defeated.
  const spawnWaveWithCap = useCallback(
    (configs: any[], lockX: number) => {
      // Classic Streets of Rage crowd-control: Max 4 enemies on screen at once
      const maxOnScreen = 4;
      const initialConfigs = configs.slice(0, maxOnScreen);
      const remainingConfigs = configs.slice(maxOnScreen);
      pendingEnemiesRef.current = remainingConfigs;
      reinforcementTimerRef.current = 0.6;
      enemiesRef.current = createStaggeredEnemies(initialConfigs, lockX);
    },
    [createStaggeredEnemies]
  );

  // Stage 1 (City Streets) Wave Spawner: 4 structured combat waves (Roster reduced by 10%: 5 + 6 + 6 + 7)
  const initStage1Wave = useCallback(
    (wave: number) => {
      stage1WaveRef.current = wave;
      sectorClearedRef.current = false;
      arenaLockedRef.current = true;
      goArrowFlashTimerRef.current = 0;
      rideOutActiveRef.current = false;
      rideOutPulseTimerRef.current = 0;
      rideOutBlinkCycleRef.current = -1;

      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 900,
        3: 1800,
        4: 2700,
      };
      const lockX = waveLockPositions[wave] || 0;
      cameraXRef.current = lockX;
      targetCameraXRef.current = lockX;

      if (!trashCansRef.current || trashCansRef.current.length === 0) {
        trashCansRef.current = createStage1Breakables(1);
      }

      musicManager.playStageMusic(1);
      const waveCounts: Record<number, number> = { 1: 5, 2: 6, 3: 6, 4: 7 };
      const count = waveCounts[wave] || 6;
      const configs = createStageWaveConfigs(1, wave, count);
      spawnWaveWithCap(configs, lockX);
    },
    [createStageWaveConfigs, spawnWaveWithCap]
  );

  // Stage 2 (Nightclub Dancefloor) Wave Spawner: 4 structured combat waves (Roster reduced by 10%: 6 + 6 + 6 + 6 [Boss Leon 600 HP + 5 escorts])
  const initStage2Wave = useCallback(
    (wave: number) => {
      stage2WaveRef.current = wave;
      sectorClearedRef.current = false;
      arenaLockedRef.current = true;
      goArrowFlashTimerRef.current = 0;
      rideOutActiveRef.current = false;
      rideOutPulseTimerRef.current = 0;
      rideOutBlinkCycleRef.current = -1;

      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 900,
        3: 1800,
        4: 2700,
      };
      const lockX = waveLockPositions[wave] || 0;
      cameraXRef.current = lockX;
      targetCameraXRef.current = lockX;

      if (!trashCansRef.current || trashCansRef.current.length === 0) {
        trashCansRef.current = createStage2Breakables();
      }

      if (wave === 4) {
        // Wave 4: Boss Leon (600 HP) + 5 escorts (6 enemies total)
        musicManager.playBossMusic();
        const configs = createStageWaveConfigs(2, wave, 6, {
          id: 'stage2_club_boss',
          health: 600,
          targetY: 470,
        });
        spawnWaveWithCap(configs, lockX);
      } else {
        musicManager.playStageMusic(2);
        const configs = createStageWaveConfigs(2, wave, 6);
        spawnWaveWithCap(configs, lockX);
      }
    },
    [createStageWaveConfigs, spawnWaveWithCap]
  );

  // Stage 3 (Underground Parking Garage) Wave Spawner: 3 waves (Roster reduced by 10%: 7 + 8 + 9)
  const initStage3Wave = useCallback(
    (wave: number) => {
      stage3WaveRef.current = wave;
      sectorClearedRef.current = false;
      arenaLockedRef.current = true;
      goArrowFlashTimerRef.current = 0;
      rideOutActiveRef.current = false;
      rideOutPulseTimerRef.current = 0;
      rideOutBlinkCycleRef.current = -1;

      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 900,
        3: 1800,
      };
      const lockX = waveLockPositions[wave] || 0;
      cameraXRef.current = lockX;
      targetCameraXRef.current = lockX;

      if (!trashCansRef.current || trashCansRef.current.length === 0) {
        trashCansRef.current = createStage3Breakables();
      }

      musicManager.playStageMusic(3);
      const waveCounts: Record<number, number> = { 1: 7, 2: 8, 3: 9 };
      const count = waveCounts[wave] || 8;
      const configs = createStageWaveConfigs(3, wave, count);
      spawnWaveWithCap(configs, lockX);
    },
    [createStageWaveConfigs, spawnWaveWithCap]
  );

  // Stage 4 (Downtown Street Race) Wave Spawner: 4 structured combat waves (Roster reduced by 10%: 6 + 6 + 6 + 6 [Boss Hell Kage 825 HP + 5 escorts])
  const initStage4Wave = useCallback(
    (wave: number) => {
      stage4WaveRef.current = wave;
      sectorClearedRef.current = false;
      arenaLockedRef.current = true;
      goArrowFlashTimerRef.current = 0;
      rideOutActiveRef.current = false;
      rideOutPulseTimerRef.current = 0;
      rideOutBlinkCycleRef.current = -1;

      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 900,
        3: 1800,
        4: 2700,
      };
      const lockX = waveLockPositions[wave] || 0;
      cameraXRef.current = lockX;
      targetCameraXRef.current = lockX;

      if (!trashCansRef.current || trashCansRef.current.length === 0) {
        trashCansRef.current = createStage4Breakables();
      }

      if (wave === 4) {
        // Wave 4: Boss Hell Kage (825 HP) + 5 escorts (6 enemies total)
        musicManager.playBossMusic();
        const configs = createStageWaveConfigs(4, wave, 6, {
          id: 'stage4_race_boss',
          health: 825,
          targetY: 470,
        });
        spawnWaveWithCap(configs, lockX);
      } else {
        musicManager.playStageMusic(4);
        const configs = createStageWaveConfigs(4, wave, 6);
        spawnWaveWithCap(configs, lockX);
      }
    },
    [createStageWaveConfigs, spawnWaveWithCap]
  );

  // Stage 5 (The Casino) Wave Spawner: 3 waves (Roster reduced by 10%: 7 + 8 + 9)
  const initStage5Wave = useCallback(
    (wave: number) => {
      stage5WaveRef.current = wave;
      sectorClearedRef.current = false;
      arenaLockedRef.current = true;
      goArrowFlashTimerRef.current = 0;
      rideOutActiveRef.current = false;
      rideOutPulseTimerRef.current = 0;
      rideOutBlinkCycleRef.current = -1;

      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 900,
        3: 1800,
      };
      const lockX = waveLockPositions[wave] || 0;
      cameraXRef.current = lockX;
      targetCameraXRef.current = lockX;

      if (!trashCansRef.current || trashCansRef.current.length === 0) {
        trashCansRef.current = createStage5Breakables();
      }

      musicManager.playStageMusic(5);
      const waveCounts: Record<number, number> = { 1: 7, 2: 8, 3: 9 };
      const count = waveCounts[wave] || 8;
      const configs = createStageWaveConfigs(5, wave, count);
      spawnWaveWithCap(configs, lockX);
    },
    [createStageWaveConfigs, spawnWaveWithCap]
  );

  // Stage 6 (Police Precinct) Wave Spawner: 4 structured combat waves (Roster reduced by 10%: 6 + 6 + 6 + 6 [Boss Bone Head 1125 HP + 5 escorts], 75% Heavy Bruisers)
  const initStage6Wave = useCallback(
    (wave: number) => {
      stage6WaveRef.current = wave;
      sectorClearedRef.current = false;
      arenaLockedRef.current = true;
      goArrowFlashTimerRef.current = 0;
      rideOutActiveRef.current = false;
      rideOutPulseTimerRef.current = 0;
      rideOutBlinkCycleRef.current = -1;

      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 1200,
        3: 2400,
        4: 4000,
      };
      const lockX = waveLockPositions[wave] || 0;
      cameraXRef.current = lockX;
      targetCameraXRef.current = lockX;

      if (!trashCansRef.current || trashCansRef.current.length === 0) {
        trashCansRef.current = createStage6Breakables();
      }

      if (wave === 4) {
        // Wave 4: Boss Bone Head (1125 HP) + 5 escorts (6 enemies total)
        musicManager.playBossMusic();
        const configs = createStageWaveConfigs(6, wave, 6, {
          id: 'stage6_police_boss',
          health: 1125,
          targetY: 470,
        });
        spawnWaveWithCap(configs, lockX);
      } else {
        musicManager.playStageMusic(6);
        const configs = createStageWaveConfigs(6, wave, 6);
        spawnWaveWithCap(configs, lockX);
      }
    },
    [createStageWaveConfigs, spawnWaveWithCap]
  );

  // Stage 7 (Executive Penthouse) Wave Spawner: 3 waves (Roster reduced by 10%: 7 + 8 + 9)
  const initStage7Wave = useCallback(
    (wave: number) => {
      stage7WaveRef.current = wave;
      sectorClearedRef.current = false;
      arenaLockedRef.current = true;
      goArrowFlashTimerRef.current = 0;
      rideOutActiveRef.current = false;
      rideOutPulseTimerRef.current = 0;
      rideOutBlinkCycleRef.current = -1;

      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 800,
        3: 1600,
      };
      const lockX = waveLockPositions[wave] || 0;
      cameraXRef.current = lockX;
      targetCameraXRef.current = lockX;

      if (!trashCansRef.current || trashCansRef.current.length === 0) {
        trashCansRef.current = createStage7Breakables();
      }

      musicManager.playStageMusic(7);
      const waveCounts: Record<number, number> = { 1: 7, 2: 8, 3: 9 };
      const count = waveCounts[wave] || 8;
      const configs = createStageWaveConfigs(7, wave, count);
      spawnWaveWithCap(configs, lockX);
    },
    [createStageWaveConfigs, spawnWaveWithCap]
  );

  // Stage 8 (Skyscraper Rooftop) Wave Spawner: 3 structured waves (Roster reduced by 10%: 8 + 9 + 8 [Final Boss Victor 1425 HP + 7 escorts])
  const initStage8Wave = useCallback(
    (wave: number) => {
      stage8WaveRef.current = wave;
      sectorClearedRef.current = false;
      arenaLockedRef.current = true;
      goArrowFlashTimerRef.current = 0;
      rideOutActiveRef.current = false;
      rideOutPulseTimerRef.current = 0;
      rideOutBlinkCycleRef.current = -1;

      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 600,
        3: STAGE_8_SECTOR_WIDTH, // 1280
      };
      const lockX = waveLockPositions[wave] || 0;
      cameraXRef.current = lockX;
      targetCameraXRef.current = lockX;

      if (!trashCansRef.current || trashCansRef.current.length === 0) {
        trashCansRef.current = createStage8Breakables();
      }

      if (wave === 3) {
        // Wave 3: Final Boss Victor (1425 HP) + 7 escorts (8 enemies total)
        musicManager.playBossMusic();
        const configs = createStageWaveConfigs(8, wave, 8, {
          id: 'stage8_rooftop_boss',
          health: 1425,
          targetY: 475,
        });
        spawnWaveWithCap(configs, lockX);
      } else {
        musicManager.playStageMusic(8);
        const configs = createStageWaveConfigs(8, wave, wave === 1 ? 8 : 9);
        spawnWaveWithCap(configs, lockX);
      }
    },
    [createStageWaveConfigs, spawnWaveWithCap]
  );

  // Seamless Transition into Stage 7 (Executive Penthouse)
  const transitionToStage7 = useCallback(() => {
    currentStageRef.current = 7;
    stage7WaveRef.current = 1;
    currentSectorRef.current = 1;
    cameraXRef.current = 0;
    targetCameraXRef.current = 0;
    musicManager.playStageMusic(7);

    const p = playerRef.current;
    p.x = 100;
    p.y = 460;
    p.vx = 0;
    p.vy = 0;
    p.jumpZ = 0;
    p.jumpVz = 0;
    p.stateName = 'idle';
    p.grabbedEnemy = null;
    p.hasPipe = false;
    p.invulnTimer = 2.0;

    setGameState((prev) => ({ ...prev, status: 'PLAYING', level: 7 }));
    stageIntroTimerRef.current = STAGE_INTRO_DURATION;

    bulletsRef.current = [];
    dropsRef.current = [];
    hitVfxRef.current = [];
    impactBurstsRef.current = [];
    sparksRef.current = [];
    shockwavesRef.current = [];
    flyingDebrisPropsRef.current = [];
    trashCansRef.current = createStage7Breakables();

    initStage7Wave(1);
  }, [initStage7Wave]);

  // Seamless Transition into Stage 8 (Skyscraper Rooftop)
  const transitionToStage8 = useCallback(() => {
    currentStageRef.current = 8;
    stage8WaveRef.current = 1;
    currentSectorRef.current = 1;
    cameraXRef.current = 0;
    targetCameraXRef.current = 0;
    musicManager.playStageMusic(8);

    const p = playerRef.current;
    p.x = 100;
    p.y = 460;
    p.vx = 0;
    p.vy = 0;
    p.jumpZ = 0;
    p.jumpVz = 0;
    p.stateName = 'idle';
    p.grabbedEnemy = null;
    p.hasPipe = false;
    p.invulnTimer = 2.0;

    setGameState((prev) => ({ ...prev, status: 'PLAYING', level: 8 }));
    stageIntroTimerRef.current = STAGE_INTRO_DURATION;

    bulletsRef.current = [];
    dropsRef.current = [];
    hitVfxRef.current = [];
    impactBurstsRef.current = [];
    sparksRef.current = [];
    shockwavesRef.current = [];
    flyingDebrisPropsRef.current = [];
    trashCansRef.current = createStage8Breakables();

    initStage8Wave(1);
  }, [initStage8Wave]);

  // Seamless Transition into Stage 6 (Police Precinct)
  const transitionToStage6 = useCallback(() => {
    currentStageRef.current = 6;
    stage6WaveRef.current = 1;
    currentSectorRef.current = 1;
    cameraXRef.current = 0;
    targetCameraXRef.current = 0;
    musicManager.playStageMusic(6);

    const p = playerRef.current;
    p.x = 100;
    p.y = 460;
    p.vx = 0;
    p.vy = 0;
    p.jumpZ = 0;
    p.jumpVz = 0;
    p.stateName = 'idle';
    p.grabbedEnemy = null;
    p.hasPipe = false;
    p.invulnTimer = 2.0;

    setGameState((prev) => ({ ...prev, status: 'PLAYING', level: 6 }));
    stageIntroTimerRef.current = STAGE_INTRO_DURATION;

    bulletsRef.current = [];
    dropsRef.current = [];
    hitVfxRef.current = [];
    impactBurstsRef.current = [];
    sparksRef.current = [];
    shockwavesRef.current = [];
    flyingDebrisPropsRef.current = [];
    trashCansRef.current = createStage6Breakables();

    initStage6Wave(1);
  }, [initStage6Wave]);

  // Seamless Transition into Stage 5 (The Casino)
  const transitionToStage5 = useCallback(() => {
    currentStageRef.current = 5;
    stage5WaveRef.current = 1;
    currentSectorRef.current = 1;
    cameraXRef.current = 0;
    targetCameraXRef.current = 0;
    musicManager.playStageMusic(5);

    const p = playerRef.current;
    p.x = 100;
    p.y = 460;
    p.vx = 0;
    p.vy = 0;
    p.jumpZ = 0;
    p.jumpVz = 0;
    p.stateName = 'idle';
    p.grabbedEnemy = null;
    p.hasPipe = false;
    p.invulnTimer = 2.0;

    setGameState((prev) => ({ ...prev, status: 'PLAYING', level: 5 }));
    stageIntroTimerRef.current = STAGE_INTRO_DURATION;

    bulletsRef.current = [];
    dropsRef.current = [];
    hitVfxRef.current = [];
    impactBurstsRef.current = [];
    sparksRef.current = [];
    shockwavesRef.current = [];
    flyingDebrisPropsRef.current = [];
    trashCansRef.current = createStage5Breakables();

    initStage5Wave(1);
  }, [initStage5Wave]);

  // Seamless Transition into Stage 4 (Downtown Street Race)
  const transitionToStage4 = useCallback(() => {
    currentStageRef.current = 4;
    stage4WaveRef.current = 1;
    currentSectorRef.current = 1;
    cameraXRef.current = 0;
    targetCameraXRef.current = 0;
    musicManager.playStageMusic(4);

    const p = playerRef.current;
    p.x = 100;
    p.y = 460;
    p.vx = 0;
    p.vy = 0;
    p.jumpZ = 0;
    p.jumpVz = 0;
    p.stateName = 'idle';
    p.grabbedEnemy = null;
    p.hasPipe = false;
    p.invulnTimer = 2.0;

    setGameState((prev) => ({ ...prev, status: 'PLAYING', level: 4 }));
    stageIntroTimerRef.current = STAGE_INTRO_DURATION;

    bulletsRef.current = [];
    dropsRef.current = [];
    hitVfxRef.current = [];
    impactBurstsRef.current = [];
    sparksRef.current = [];
    shockwavesRef.current = [];
    flyingDebrisPropsRef.current = [];
    trashCansRef.current = createStage4Breakables();

    initStage4Wave(1);
  }, [initStage4Wave]);

  // Seamless Transition into Stage 3 (Underground Parking Garage)
  const transitionToStage3 = useCallback(() => {
    currentStageRef.current = 3;
    stage3WaveRef.current = 1;
    currentSectorRef.current = 1;
    cameraXRef.current = 0;
    targetCameraXRef.current = 0;
    musicManager.playStageMusic(3);

    const p = playerRef.current;
    p.x = 100;
    p.y = 450;
    p.vx = 0;
    p.vy = 0;
    p.jumpZ = 0;
    p.jumpVz = 0;
    p.stateName = 'idle';
    p.grabbedEnemy = null;
    p.hasPipe = false;
    p.invulnTimer = 2.0;

    setGameState((prev) => ({ ...prev, status: 'PLAYING', level: 3 }));
    stageIntroTimerRef.current = STAGE_INTRO_DURATION;

    bulletsRef.current = [];
    dropsRef.current = [];
    hitVfxRef.current = [];
    impactBurstsRef.current = [];
    sparksRef.current = [];
    shockwavesRef.current = [];
    flyingDebrisPropsRef.current = [];
    trashCansRef.current = createStage3Breakables();

    initStage3Wave(1);
  }, [initStage3Wave]);

  // Seamless Transition into Stage 2 (Nightclub Dancefloor)
  const transitionToStage2 = useCallback(() => {
    currentStageRef.current = 2;
    stage2WaveRef.current = 1;
    currentSectorRef.current = 1;
    cameraXRef.current = 0;
    targetCameraXRef.current = 0;
    musicManager.playStageMusic(2);

    // Reset Night Razor to left club entrance, retaining score, lives, and HP
    const p = playerRef.current;
    p.x = 100;
    p.y = 440;
    p.vx = 0;
    p.vy = 0;
    p.jumpZ = 0;
    p.jumpVz = 0;
    p.stateName = 'idle';
    p.grabbedEnemy = null;
    p.hasPipe = false;
    p.invulnTimer = 2.0;

    setGameState((prev) => ({ ...prev, status: 'PLAYING', level: 2 }));
    stageIntroTimerRef.current = STAGE_INTRO_DURATION;

    bulletsRef.current = [];
    dropsRef.current = [];
    hitVfxRef.current = [];
    impactBurstsRef.current = [];
    sparksRef.current = [];
    shockwavesRef.current = [];
    flyingDebrisPropsRef.current = [];
    trashCansRef.current = createStage2Breakables();

    initStage2Wave(1);
  }, [initStage2Wave]);

  // Restarts the current stage cleanly from the beginning
  const restartCurrentStage = useCallback(() => {
    const stage = currentStageRef.current;
    const initialHp = getConfig('playerMaxHealth') as number;
    const p = playerRef.current;
    p.x = stage >= 2 ? 160 : 200;
    const { minY, maxY } = getStageWalkableYBounds(stage);
    p.y = Math.round((minY + maxY) / 2);
    p.vx = 0;
    p.vy = 0;
    p.jumpZ = 0;
    p.jumpVz = 0;
    p.health = initialHp;
    p.hp = initialHp;
    p.maxHealth = initialHp;
    p.stateName = 'idle';
    p.animState = { currentAction: 'IDLE', currentFrame: 0, timer: 0 };
    p.comboStep = 0;
    p.comboWindowTimer = 0;
    p.attackMove = undefined;
    p.attackElapsed = 0;
    p.bufferedInput = null;
    p.hasHitCurrentAttack = false;
    p.hasHitThisSwing = false;
    p.invulnTimer = 2.0;
    p.grabbedEnemy = null;
    p.hasPipe = false;
    isGroundedRef.current = true;

    cameraXRef.current = 0;
    targetCameraXRef.current = 0;
    currentSectorRef.current = 1;
    sectorClearedRef.current = false;
    arenaLockedRef.current = true;
    goArrowFlashTimerRef.current = 0;
    rideOutActiveRef.current = false;
    rideOutPulseTimerRef.current = 0;
    rideOutBlinkCycleRef.current = -1;
    stageIntroTimerRef.current = STAGE_INTRO_DURATION;

    bulletsRef.current = [];
    dropsRef.current = [];
    hitVfxRef.current = [];
    impactBurstsRef.current = [];
    sparksRef.current = [];
    shockwavesRef.current = [];
    flyingDebrisPropsRef.current = [];
    bossHudRef.current = {
      active: false,
      bossId: '',
      bossName: '',
      bossAssetKey: '',
      health: 0,
      maxHealth: 1,
      displayHealth: 0,
      ghostHealth: 0,
      alpha: 0,
    };
    hitStopTimerRef.current = 0;
    combatCalloutRef.current = null;
    pendingEnemiesRef.current = [];
    reinforcementTimerRef.current = 0;

    if (stage === 8) {
      trashCansRef.current = createStage8Breakables();
      initStage8Wave(1);
    } else if (stage === 7) {
      trashCansRef.current = createStage7Breakables();
      initStage7Wave(1);
    } else if (stage === 6) {
      trashCansRef.current = createStage6Breakables();
      initStage6Wave(1);
    } else if (stage === 5) {
      trashCansRef.current = createStage5Breakables();
      initStage5Wave(1);
    } else if (stage === 4) {
      trashCansRef.current = createStage4Breakables();
      initStage4Wave(1);
    } else if (stage === 3) {
      trashCansRef.current = createStage3Breakables();
      initStage3Wave(1);
    } else if (stage === 2) {
      trashCansRef.current = createStage2Breakables();
      initStage2Wave(1);
    } else {
      trashCansRef.current = createStage1Breakables(1);
      initStage1Wave(1);
    }

    musicManager.stopMusic();
    musicManager.playStageMusic(stage);
  }, [
    initStage1Wave,
    initStage2Wave,
    initStage3Wave,
    initStage4Wave,
    initStage5Wave,
    initStage6Wave,
    initStage7Wave,
    initStage8Wave,
  ]);

  const useContinue = useCallback(() => {
    if (continuesRef.current <= 0) return;
    setContinues((prev) => {
      const next = Math.max(0, prev - 1);
      continuesRef.current = next;
      return next;
    });
    setShowContinueModal(false);
    showContinueModalRef.current = false;
    restartCurrentStage();
  }, [restartCurrentStage]);

  const quitFromContinue = useCallback(() => {
    setShowContinueModal(false);
    showContinueModalRef.current = false;
    musicManager.stopMusic();
    stopGameOverSound();
    setContinues(3);
    continuesRef.current = 3;
    setGameState((prev) => ({ ...prev, status: 'START' }));
  }, []);

  const useContinueRef = useRef(useContinue);
  useContinueRef.current = useContinue;
  const quitFromContinueRef = useRef(quitFromContinue);
  quitFromContinueRef.current = quitFromContinue;

  // Starts a run
  const startRun = useCallback(
    (level: number, score: number) => {
      levelStartScoreRef.current = score;
      prevLevelRef.current = level;
      runWonRef.current = false;
      const initialHp = getConfig('playerMaxHealth') as number;
      const startingLives = getConfig('startingLives') as number;

      setGameState({
        status: 'PLAYING',
        level,
        score,
        lives: startingLives,
      });

      currentStageRef.current = level >= 8 ? 8 : level === 7 ? 7 : level === 6 ? 6 : level === 5 ? 5 : level === 4 ? 4 : level === 3 ? 3 : level === 2 ? 2 : 1;
      stage1WaveRef.current = 1;
      stage2WaveRef.current = 1;
      stage3WaveRef.current = 1;
      stage4WaveRef.current = 1;
      stage5WaveRef.current = 1;
      stage6WaveRef.current = 1;
      stage7WaveRef.current = 1;
      stage8WaveRef.current = 1;
      stageClearTransitionRef.current = { active: false, timer: 0, fromStage: 1 };

      // Start stage music with strict single-channel zero-overlap guarantee
      stopGameOverSound();
      musicManager.stopMusic();
      musicManager.setMusicMuted(musicMuted);
      musicManager.playStageMusic(currentStageRef.current);

      playerRef.current = {
        id: 'hero',
        type: 'player',
        x: level >= 2 ? 160 : 200,
        y: level >= 2 ? 460 : 490,
        vx: 0,
        vy: 0,
        facingRight: true,
        health: initialHp,
        maxHealth: initialHp,
        animState: { currentAction: 'IDLE', currentFrame: 0, timer: 0 },
        animTimer: 0,
        stateTimer: 0,
        stateName: 'idle',
        comboStep: 0,
        comboWindowTimer: 0,
        attackMove: undefined,
        attackElapsed: 0,
        bufferedInput: null,
        hasHitCurrentAttack: false,
        hasHitThisSwing: false,
        invulnTimer: 0,
        windupTimer: 0,
        hasPipe: false,
        jumpZ: 0,
        jumpVz: 0,
        grabbedEnemy: null,
        grabKneeCount: 0,
        grabTimer: 0,
        pickupTimer: 0,
        specialCooldown: 0,
        specialElapsed: 0,
        specialShotFired: [false, false, false],
      };

      isGroundedRef.current = true;
      pendingEnemiesRef.current = [];
      reinforcementTimerRef.current = 0;
      cameraXRef.current = 0;
      targetCameraXRef.current = 0;
      comboCountRef.current = 0;
      comboTimerRef.current = 0;
      screenShakeRef.current = 0;
      if (level >= 8) {
        trashCansRef.current = createStage8Breakables();
      } else if (level === 7) {
        trashCansRef.current = createStage7Breakables();
      } else if (level === 6) {
        trashCansRef.current = createStage6Breakables();
      } else if (level === 5) {
        trashCansRef.current = createStage5Breakables();
      } else if (level === 4) {
        trashCansRef.current = createStage4Breakables();
      } else if (level === 3) {
        trashCansRef.current = createStage3Breakables();
      } else if (level === 2) {
        trashCansRef.current = createStage2Breakables();
      } else {
        trashCansRef.current = createStage1Breakables(level);
      }
      debrisParticlesRef.current = [];
      flyingDebrisPropsRef.current = [];
      dropsRef.current = [];
      bulletsRef.current = [];
      hitVfxRef.current = [];
      impactBurstsRef.current = [];
      sparksRef.current = [];
      shockwavesRef.current = [];
      bossHudRef.current = {
        active: false,
        bossId: '',
        bossName: '',
        bossAssetKey: '',
        health: 0,
        maxHealth: 1,
        displayHealth: 0,
        ghostHealth: 0,
        alpha: 0,
      };
      hitStopTimerRef.current = 0;
      combatCalloutRef.current = null;
      rideOutActiveRef.current = false;
      rideOutPulseTimerRef.current = 0;
      rideOutBlinkCycleRef.current = -1;
      stageIntroTimerRef.current = STAGE_INTRO_DURATION;

      if (level >= 8) {
        initStage8Wave(1);
      } else if (level === 7) {
        initStage7Wave(1);
      } else if (level === 6) {
        initStage6Wave(1);
      } else if (level === 5) {
        initStage5Wave(1);
      } else if (level === 4) {
        initStage4Wave(1);
      } else if (level === 3) {
        initStage3Wave(1);
      } else if (level === 2) {
        initStage2Wave(1);
      } else {
        initStage1Wave(1);
      }

      if (sdk) {
        sdk.startGame();
      }
    },
    [
      sdk,
      initStage1Wave,
      initStage2Wave,
      initStage3Wave,
      initStage4Wave,
      initStage5Wave,
      initStage6Wave,
      initStage7Wave,
      initStage8Wave,
      musicMuted,
    ],
  );

  const startIntroCutscene = useCallback(() => {
    setCutsceneSlide(0);
    cutsceneSlideRef.current = 0;
    musicManager.setMusicMuted(musicMuted);
    playBgmTrack(STORY_CUTSCENE_URL);
    setGameState((prev) => ({
      ...prev,
      status: 'INTRO_CUTSCENE',
      level: 1,
      score: 0,
    }));
  }, [musicMuted]);

  const startOutroCutscene = useCallback(() => {
    setCutsceneSlide(0);
    cutsceneSlideRef.current = 0;
    musicManager.setMusicMuted(musicMuted);
    playBgmTrack(STORY_CUTSCENE_URL);
    setGameState((prev) => ({
      ...prev,
      status: 'OUTRO_CUTSCENE',
    }));
  }, [musicMuted]);

  const startIntroToGameTransition = useCallback(() => {
    if (isTransitioningRef.current) return;
    musicManager.fadeMusicOut(0.8);
    startTransition({
      fadeOutDuration: 0.8,
      fadeInDuration: 0.5,
      fadeOutBgm: false,
      onMidpoint: () => {
        startRun(selectedStageRef.current || 1, 0);
      },
    });
  }, [startTransition, startRun]);

  const startVictorToOutroTransition = useCallback(() => {
    if (isTransitioningRef.current) return;
    musicManager.fadeMusicOut(0.8);
    startTransition({
      fadeOutDuration: 0.8,
      fadeInDuration: 0.5,
      fadeOutBgm: false,
      onMidpoint: () => {
        startOutroCutscene();
      },
    });
  }, [startTransition, startOutroCutscene]);

  const advanceCutscene = useCallback(() => {
    if (isTransitioningRef.current) return;
    if (cutsceneSlideRef.current < 2) {
      setCutsceneSlide((prev) => {
        const next = prev + 1;
        cutsceneSlideRef.current = next;
        return next;
      });
      // Rapid taps advance slides cleanly while keeping custom cutscene music playing smoothly
      if (gameStateRef.current.status === 'INTRO_CUTSCENE') {
        playBgmTrack(STORY_CUTSCENE_URL);
      }
    } else {
      if (gameStateRef.current.status === 'INTRO_CUTSCENE') {
        startIntroToGameTransition();
      } else {
        runWonRef.current = true;
        musicManager.stopMusic();
        setGameState((prev) => ({
          ...prev,
          status: 'VICTORY',
        }));
      }
    }
  }, [startIntroToGameTransition]);

  const skipCutscene = useCallback(() => {
    if (isTransitioningRef.current) return;
    if (gameStateRef.current.status === 'INTRO_CUTSCENE') {
      startIntroToGameTransition();
    } else {
      runWonRef.current = true;
      musicManager.stopMusic();
      setGameState((prev) => ({
        ...prev,
        status: 'VICTORY',
      }));
    }
  }, [startIntroToGameTransition]);

  const advanceCutsceneRef = useRef(advanceCutscene);
  advanceCutsceneRef.current = advanceCutscene;
  const skipCutsceneRef = useRef(skipCutscene);
  skipCutsceneRef.current = skipCutscene;

  // 2-Slide Mid-Game Intermission Cutscenes (Stage 2 -> 3, Stage 4 -> 5, Stage 6 -> 7)
  const startIntermissionCutscene = useCallback(
    (set: 'stage2' | 'stage4' | 'stage6') => {
      if (isTransitioningRef.current) return;
      const cfg = INTERMISSION_CONFIGS[set];
      preloadIntermissionSet(set);
      musicManager.fadeMusicOut(0.8);
      startTransition({
        fadeOutDuration: 0.8,
        fadeInDuration: 0.5,
        fadeOutBgm: false,
        onMidpoint: () => {
          const nextState: IntermissionCutsceneState = {
            active: true,
            slideIndex: 0,
            currentSet: set,
            targetStage: cfg.targetStage,
            mapText: cfg.mapText,
          };
          setIntermissionCutscene(nextState);
          intermissionCutsceneRef.current = nextState;
          setGameState((prev) => ({
            ...prev,
            status: 'INTERMISSION_CUTSCENE',
          }));
          playBgmTrack(STORY_CUTSCENE_URL);
        },
      });
    },
    [startTransition],
  );

  const transitionFromIntermissionToStage = useCallback(
    (targetStage: number) => {
      if (isTransitioningRef.current) return;
      musicManager.fadeMusicOut(0.8);
      startTransition({
        fadeOutDuration: 0.8,
        fadeInDuration: 0.5,
        fadeOutBgm: false,
        onMidpoint: () => {
          setIntermissionCutscene(null);
          intermissionCutsceneRef.current = null;
          if (targetStage === 3) {
            transitionToStage3();
          } else if (targetStage === 5) {
            transitionToStage5();
          } else if (targetStage === 7) {
            transitionToStage7();
          } else {
            startRun(targetStage, gameStateRef.current.score);
          }
        },
      });
    },
    [startTransition, transitionToStage3, transitionToStage5, transitionToStage7, startRun],
  );

  const advanceIntermissionCutscene = useCallback(() => {
    if (isTransitioningRef.current) return;
    const cur = intermissionCutsceneRef.current;
    if (!cur) return;

    if (cur.slideIndex === 0) {
      const updated: IntermissionCutsceneState = { ...cur, slideIndex: 1 };
      setIntermissionCutscene(updated);
      intermissionCutsceneRef.current = updated;
      playBgmTrack(STORY_CUTSCENE_URL);
    } else {
      transitionFromIntermissionToStage(cur.targetStage);
    }
  }, [transitionFromIntermissionToStage]);

  const skipIntermissionCutscene = useCallback(() => {
    if (isTransitioningRef.current) return;
    const cur = intermissionCutsceneRef.current;
    if (!cur) return;
    transitionFromIntermissionToStage(cur.targetStage);
  }, [transitionFromIntermissionToStage]);

  const advanceIntermissionCutsceneRef = useRef(advanceIntermissionCutscene);
  advanceIntermissionCutsceneRef.current = advanceIntermissionCutscene;
  const skipIntermissionCutsceneRef = useRef(skipIntermissionCutscene);
  skipIntermissionCutsceneRef.current = skipIntermissionCutscene;

  // START and TRY AGAIN
  const initGame = useCallback(() => {
    stopGameOverSound();
    setShowContinueModal(false);
    showContinueModalRef.current = false;
    if (gameStateRef.current.status === 'START') {
      setContinues(3);
      continuesRef.current = 3;
      if (selectedStageRef.current === 1) {
        startIntroCutscene();
      } else {
        startRun(selectedStageRef.current, 0);
      }
    } else if (persistenceEnabled && !runWonRef.current) {
      startRun(gameStateRef.current.level, levelStartScoreRef.current);
    } else {
      setContinues(3);
      continuesRef.current = 3;
      startRun(selectedStageRef.current, 0);
    }
  }, [startRun, persistenceEnabled, startIntroCutscene]);

  // PLAY AGAIN after VICTORY
  const resetGame = useCallback(() => {
    stopGameOverSound();
    setShowContinueModal(false);
    showContinueModalRef.current = false;
    setContinues(3);
    continuesRef.current = 3;
    startRun(1, 0);
  }, [startRun]);

  // Handle Gamepad UI Navigation, Menus, and Cutscenes with single-press edge-triggering
  const handleGamepadUi = useCallback((gp: GamepadSnapshot) => {
    const confirmOrStart = gp.confirmPressed || gp.startPressed;

    // Any gamepad action unlocks Web Audio cleanly
    if (
      confirmOrStart ||
      gp.selectPressed ||
      gp.punchPressed ||
      gp.kickPressed ||
      gp.jumpPressed ||
      gp.specialPressed
    ) {
      unlockAllAudio();
      audioManager.onUserInteraction(gameStateRef.current.status === 'PLAYING');
    }

    if (showContinueModalRef.current) {
      if (gp.startPressed || gp.confirmPressed || gp.punchPressed) {
        useContinueRef.current();
      } else if (gp.specialPressed || gp.selectPressed) {
        quitFromContinueRef.current();
      }
      return;
    }

    const currentStatus = gameStateRef.current.status;

    if (currentStatus === 'START') {
      // Title Screen: Start or Confirm (Bottom/Left: A/X) triggers START GAME
      if (confirmOrStart) {
        audioManager.preload();
        audioManager.onUserInteraction(false);
        initGame();
      }
    } else if (currentStatus === 'INTRO_CUTSCENE' || currentStatus === 'OUTRO_CUTSCENE') {
      // Cutscene Slides: Start or Confirm advances the 3-slide comic cutscene
      if (confirmOrStart || gp.kickPressed) {
        advanceCutscene();
      } else if (gp.selectPressed) {
        skipCutscene();
      }
    } else if (currentStatus === 'INTERMISSION_CUTSCENE') {
      // 2-Slide Mid-Game Intermission Cutscenes
      if (confirmOrStart || gp.punchPressed || gp.kickPressed) {
        advanceIntermissionCutscene();
      } else if (gp.selectPressed) {
        skipIntermissionCutscene();
      }
    } else if (currentStatus === 'GAME_OVER') {
      // Game Over: Start or Confirm triggers PLAY AGAIN
      if (confirmOrStart) {
        stopGameOverSound();
        audioManager.preload();
        audioManager.onUserInteraction(true);
        initGame();
      } else if (gp.selectPressed) {
        stopGameOverSound();
        musicManager.stopMusic();
        setGameState((prev) => ({ ...prev, status: 'START' }));
      }
    } else if (currentStatus === 'VICTORY') {
      // Victory: Start or Confirm triggers PLAY AGAIN
      if (confirmOrStart) {
        resetGame();
      }
    } else if (currentStatus === 'PLAYING') {
      if (gp.startPressed || gp.selectPressed) {
        setIsGameMenuOpen((prev) => !prev);
      } else if (isGameMenuOpenRef.current) {
        if (confirmOrStart) {
          setIsGameMenuOpen(false);
        }
      }
    }
  }, [initGame, advanceCutscene, skipCutscene, resetGame]);

  const handleGamepadUiRef = useRef(handleGamepadUi);
  handleGamepadUiRef.current = handleGamepadUi;

  // Hook for reporting SDK lifecycle
  usePlaygroundGameLifecycle(gameState, sdk);

  // Auto-start for autoplay param
  const hasAutoplayed = useRef(false);
  useEffect(() => {
    if (
      !hasAutoplayed.current &&
      new URLSearchParams(window.location.search).has('autoplay')
    ) {
      hasAutoplayed.current = true;
      initGame();
    }
  }, [initGame]);

  // Spawns Streets of Rage 4-style procedural comic impact burst, sparks, hit-stop, and shockwaves
  const spawnImpact = useCallback(
    (x: number, y: number, isFinisher: boolean, customShake?: number, hitstopDuration?: number) => {
      const shake = customShake !== undefined ? customShake : (isFinisher ? 7.5 : 3.5);
      if (shake > 0) {
        screenShakeRef.current = Math.max(screenShakeRef.current, shake);
      }
      // Micro-pause (hit-stop): 60ms on Hit 4 finisher; 0ms on hits 1-3
      const freeze = hitstopDuration !== undefined ? hitstopDuration : (isFinisher ? 0.06 : 0.04);
      if (freeze > 0) {
        hitStopTimerRef.current = Math.max(hitStopTimerRef.current, freeze);
      }

      impactBurstsRef.current.push({
        x,
        y,
        timer: 0.12,
        maxTimer: 0.12,
        isFinisher,
        angle: Math.random() * Math.PI * 2,
        spikes: isFinisher ? 16 : 12,
        radius: isFinisher ? 78 : 46,
      });

      const sparkCount = isFinisher ? 14 : Math.floor(8 + Math.random() * 5);
      const sparkColors = ['#FF6600', '#00FFFF', '#FFEE00'];
      for (let i = 0; i < sparkCount; i++) {
        const angle = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
        const speed = (isFinisher ? 350 : 230) + Math.random() * 240;
        sparksRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          timer: 0.2 + Math.random() * 0.1,
          maxTimer: 0.28,
          size: isFinisher ? 3.5 : 2.5,
        });
      }

      if (isFinisher) {
        shockwavesRef.current.push({
          x,
          y,
          radius: 10,
          maxRadius: 100,
          timer: 0.22,
          maxTimer: 0.22,
          color: '#00f0ff',
        });
      }
    },
    [],
  );

    const smashProp = useCallback(
      (prop: BreakableProp, isFinisher: boolean) => {
        prop.health = 0;
        const propH = PROP_BASE_HEIGHTS[prop.type] || 60;
        spawnImpact(prop.x, prop.y - propH * 0.5, isFinisher, isFinisher ? 5.0 : 3.0, 0.04);
        playSFX('breakProp');

      const isRooftopProp =
        prop.type === 'rooftopTrashCan' ||
        prop.type === 'rooftopMetalBin' ||
        prop.type === 'rooftopWoodenCrate';

      const isPenthouseProp =
        prop.type === 'penthouseBreakableStatue' ||
        prop.type === 'penthouseBreakablePlant' ||
        prop.type === 'penthouseBreakableChair';

      const isPrecinctProp =
        prop.type === 'precinctWaterCooler' ||
        prop.type === 'precinctTrashCan' ||
        prop.type === 'precinctChair';

      const isStage3Prop =
        prop.type === 'garageTire' || prop.type === 'garageDrum' || prop.type === 'garageCone';

      if (isRooftopProp || isPenthouseProp || isPrecinctProp || isStage3Prop) {
        // Intact sprite launched upward and sideways in a spinning arc fading over 0.6s
        const hitDir =
          Math.sign(playerRef.current.vx || (playerRef.current.facingRight ? 1 : -1)) || 1;
        const isHeavyDebris = prop.type === 'penthouseBreakableChair' || prop.type === 'rooftopWoodenCrate';
        flyingDebrisPropsRef.current.push({
          id: `debris_prop_${Date.now()}_${Math.random()}`,
          type: prop.type,
          x: prop.x,
          y: prop.y,
          vx: hitDir * ((isHeavyDebris ? 205 : 175) + Math.random() * 80),
          vy: (Math.random() - 0.5) * 40,
          z: -10,
          vz: (isHeavyDebris ? -430 : -380) - Math.random() * 70,
          rotation: 0,
          vRot: hitDir * (10 + Math.random() * 6),
          timer: 0.6,
          maxTimer: 0.6,
        });

        if (isRooftopProp || isPenthouseProp || isPrecinctProp) {
          // 40% chance of health recovery or high-value score pickup (zero weapons)
          if (Math.random() < 0.40) {
            dropsRef.current.push({
              id: `drop_${Date.now()}_${Math.random()}`,
              type: Math.random() < 0.5 ? 'food' : 'score',
              x: prop.x,
              y: prop.y,
            });
          }
        } else if (prop.type === 'garageCone') {
          // 35% chance to drop a score pickup
          if (Math.random() < 0.35) {
            dropsRef.current.push({
              id: `drop_${Date.now()}_${Math.random()}`,
              type: 'score',
              x: prop.x,
              y: prop.y,
            });
          }
        } else {
          // Tires and Oil Drums: 50% chance to drop an item:
          // split evenly between health recovery (food) and high-value score pickup
          const r = Math.random();
          if (r < 0.25) {
            dropsRef.current.push({
              id: `drop_${Date.now()}_${Math.random()}`,
              type: 'food',
              x: prop.x,
              y: prop.y,
            });
          } else if (r < 0.50) {
            dropsRef.current.push({
              id: `drop_${Date.now()}_${Math.random()}`,
              type: 'score',
              x: prop.x,
              y: prop.y,
            });
          }
        }

        setGameState((prev) => ({ ...prev, score: prev.score + 100 }));
        const idx = trashCansRef.current.indexOf(prop);
        if (idx !== -1) {
          trashCansRef.current.splice(idx, 1);
        }
        return;
      }

      // Thematic Debris & Destruction Particle Systems
      if (prop.type === 'clubSpeaker') {
        // DJ Speaker: heavy cabinet panels, speaker-cone fragments, copper coils
        const speakerColors = ['#0f172a', '#1e293b', '#334155', '#475569', '#f97316'];
        for (let p = 0; p < 16; p++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 140 + Math.random() * 240;
          debrisParticlesRef.current.push({
            x: prop.x,
            y: prop.y - 70,
            vx: Math.cos(angle) * speed,
            vy: -180 - Math.random() * 200,
            width: 7 + Math.random() * 8,
            height: 7 + Math.random() * 8,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 16,
            color: speakerColors[Math.floor(Math.random() * speakerColors.length)],
            timer: 0.8 + Math.random() * 0.4,
            maxTimer: 1.2,
            type: 'debris',
          });
        }
        // Speaker-cone circular / driver fragments
        for (let c = 0; c < 8; c++) {
          const angle = (c / 8) * Math.PI * 2;
          const speed = 150 + Math.random() * 190;
          debrisParticlesRef.current.push({
            x: prop.x,
            y: prop.y - 60,
            vx: Math.cos(angle) * speed,
            vy: -190 - Math.random() * 190,
            width: 9,
            height: 9,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 14,
            color: '#1e293b',
            timer: 0.85 + Math.random() * 0.35,
            maxTimer: 1.2,
            type: 'can',
          });
        }
      } else if (prop.type === 'clubStool') {
        // Bar Stool: polished wood seat + chrome/metal frame legs
        const stoolColors = ['#854d0e', '#a16207', '#ca8a04', '#94a3b8', '#cbd5e1'];
        for (let p = 0; p < 14; p++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 130 + Math.random() * 210;
          debrisParticlesRef.current.push({
            x: prop.x,
            y: prop.y - 45,
            vx: Math.cos(angle) * speed,
            vy: -160 - Math.random() * 200,
            width: 5 + Math.random() * 7,
            height: 5 + Math.random() * 7,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 18,
            color: stoolColors[Math.floor(Math.random() * stoolColors.length)],
            timer: 0.7 + Math.random() * 0.4,
            maxTimer: 1.1,
            type: 'debris',
          });
        }
      } else if (prop.type === 'clubTable') {
        // Club Dinner Table: dark polished wood + glass / metallic accents
        const tableColors = ['#451a03', '#78350f', '#92400e', '#b45309', '#f8fafc'];
        for (let p = 0; p < 16; p++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 140 + Math.random() * 220;
          debrisParticlesRef.current.push({
            x: prop.x,
            y: prop.y - 54,
            vx: Math.cos(angle) * speed,
            vy: -170 - Math.random() * 210,
            width: 6 + Math.random() * 8,
            height: 6 + Math.random() * 8,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 16,
            color: tableColors[Math.floor(Math.random() * tableColors.length)],
            timer: 0.8 + Math.random() * 0.4,
            maxTimer: 1.2,
            type: 'debris',
          });
        }
      } else if (prop.type === 'fire_hydrant') {
        // Hydrant: bursts upward water-spray fountain particles!
        const waterColors = ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0284c7'];
        for (let w = 0; w < 32; w++) {
          const spreadAngle = (Math.random() - 0.5) * 0.6;
          const speed = 260 + Math.random() * 280;
          debrisParticlesRef.current.push({
            x: prop.x + (Math.random() - 0.5) * 16,
            y: prop.y - 20,
            vx: Math.sin(spreadAngle) * speed * 0.5,
            vy: -Math.cos(spreadAngle) * speed,
            width: 3 + Math.random() * 4,
            height: 6 + Math.random() * 8,
            rotation: 0,
            vRot: 0,
            color: waterColors[Math.floor(Math.random() * waterColors.length)],
            timer: 0.8 + Math.random() * 0.5,
            maxTimer: 1.3,
            type: 'water',
          });
        }
        // Red cast-iron metal debris chunks
        const ironColors = ['#dc2626', '#b91c1c', '#7f1d1d', '#450a0a'];
        for (let p = 0; p < 8; p++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 120 + Math.random() * 180;
          debrisParticlesRef.current.push({
            x: prop.x,
            y: prop.y - 25,
            vx: Math.cos(angle) * speed,
            vy: -150 - Math.random() * 180,
            width: 5 + Math.random() * 6,
            height: 5 + Math.random() * 6,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 14,
            color: ironColors[Math.floor(Math.random() * ironColors.length)],
            timer: 0.7 + Math.random() * 0.3,
            maxTimer: 1.0,
            type: 'debris',
          });
        }
      } else if (prop.type === 'phone_booth') {
        // Phone Booth: scatters sharp glass shards + red metal frame pieces
        const glassColors = ['#ffffff', '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc'];
        for (let g = 0; g < 24; g++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 140 + Math.random() * 240;
          debrisParticlesRef.current.push({
            x: prop.x + (Math.random() - 0.5) * 20,
            y: prop.y - 50 + (Math.random() - 0.5) * 40,
            vx: Math.cos(angle) * speed,
            vy: -160 - Math.random() * 220,
            width: 4 + Math.random() * 6,
            height: 6 + Math.random() * 8,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 22,
            color: glassColors[Math.floor(Math.random() * glassColors.length)],
            timer: 0.8 + Math.random() * 0.4,
            maxTimer: 1.2,
            type: 'glass',
          });
        }
        const frameColors = ['#b91c1c', '#991b1b', '#334155'];
        for (let p = 0; p < 8; p++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 130 + Math.random() * 170;
          debrisParticlesRef.current.push({
            x: prop.x,
            y: prop.y - 45,
            vx: Math.cos(angle) * speed,
            vy: -180 - Math.random() * 180,
            width: 7 + Math.random() * 8,
            height: 7 + Math.random() * 8,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 14,
            color: frameColors[Math.floor(Math.random() * frameColors.length)],
            timer: 0.7 + Math.random() * 0.3,
            maxTimer: 1.0,
            type: 'debris',
          });
        }
      } else if (prop.type === 'soda_machine') {
        // Soda Machine: sparks/metal can particles + cabinet panels
        const canColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#e2e8f0'];
        for (let c = 0; c < 10; c++) {
          const angle = (c / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
          const speed = 150 + Math.random() * 220;
          debrisParticlesRef.current.push({
            x: prop.x + (Math.random() - 0.5) * 20,
            y: prop.y - 40,
            vx: Math.cos(angle) * speed,
            vy: -200 - Math.random() * 220,
            width: 8,
            height: 14,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 18,
            color: canColors[Math.floor(Math.random() * canColors.length)],
            timer: 0.9 + Math.random() * 0.4,
            maxTimer: 1.3,
            type: 'can',
          });
        }
        // Electrical sparks from severed vendor wires
        for (let s = 0; s < 14; s++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 200 + Math.random() * 250;
          sparksRef.current.push({
            x: prop.x,
            y: prop.y - 50,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: Math.random() > 0.4 ? '#00f0ff' : '#facc15',
            timer: 0.25 + Math.random() * 0.15,
            maxTimer: 0.35,
            size: 3.0,
          });
        }
        const panelColors = ['#1e293b', '#334155', '#475569', '#cbd5e1'];
        for (let p = 0; p < 8; p++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 120 + Math.random() * 180;
          debrisParticlesRef.current.push({
            x: prop.x,
            y: prop.y - 50,
            vx: Math.cos(angle) * speed,
            vy: -170 - Math.random() * 200,
            width: 8 + Math.random() * 8,
            height: 8 + Math.random() * 8,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 12,
          color: panelColors[Math.floor(Math.random() * panelColors.length)],
          timer: 0.8 + Math.random() * 0.3,
          maxTimer: 1.1,
          type: 'debris',
        });
      }
    } else {
      // Trash Can: metallic wire-mesh debris particles
      const colors = ['#94a3b8', '#64748b', '#cbd5e1', '#475569', '#334155'];
        for (let p = 0; p < 12; p++) {
          const angle = (p / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
          const speed = 140 + Math.random() * 220;
          debrisParticlesRef.current.push({
            x: prop.x,
            y: prop.y - 30,
            vx: Math.cos(angle) * speed,
            vy: -180 - Math.random() * 220,
            width: 6 + Math.random() * 8,
            height: 6 + Math.random() * 8,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 16,
            color: colors[Math.floor(Math.random() * colors.length)],
            timer: 0.7 + Math.random() * 0.4,
            maxTimer: 1.1,
            type: 'debris',
          });
        }
      }

      dropsRef.current.push({
        id: `drop_${Date.now()}_${Math.random()}`,
        type: prop.drop,
        x: prop.x,
        y: prop.y,
      });

      setGameState((prev) => ({ ...prev, score: prev.score + 100 }));
      const idx = trashCansRef.current.indexOf(prop);
      if (idx !== -1) {
        trashCansRef.current.splice(idx, 1);
      }
    },
    [spawnImpact],
  );

  const damageProp = useCallback(
    (can: BreakableProp, canIdx: number, isFinisher: boolean, isKick: boolean, dmg = 15) => {
      const isRooftopProp =
        can.type === 'rooftopTrashCan' ||
        can.type === 'rooftopMetalBin' ||
        can.type === 'rooftopWoodenCrate';

      if (isRooftopProp) {
        if (can.health <= 1 || isFinisher || isKick) {
          can.health = 0;
          smashProp(can, true);
          hitVfxRef.current.push({
            x: can.x,
            y: can.y - 95,
            text: 'SMASH!',
            color: '#ffaa00',
            timer: 0.4,
            maxTimer: 0.4,
          });
        } else {
          can.health -= 1;
          can.hitFlashTimer = 0.20;
          can.wobbleTimer = 0.25;
          if (isKick) {
            playSFX('kickKneeContact');
          } else {
            playSFX('punchContact');
          }
          spawnImpact(can.x, can.y - 50, false, 2.5, 0);
          hitVfxRef.current.push({
            x: can.x,
            y: can.y - 75,
            text: 'HIT!',
            color: '#ffea00',
            timer: 0.35,
            maxTimer: 0.35,
          });
        }
        return;
      }

      const isPenthouseProp =
        can.type === 'penthouseBreakableStatue' ||
        can.type === 'penthouseBreakablePlant' ||
        can.type === 'penthouseBreakableChair';

      if (isPenthouseProp) {
        if (can.type === 'penthouseBreakablePlant') {
          // Ceramic Potted Penthouse Plants break in 1 hit!
          can.health = 0;
          smashProp(can, true);
          hitVfxRef.current.push({
            x: can.x,
            y: can.y - 95,
            text: 'SMASH!',
            color: '#ffaa00',
            timer: 0.4,
            maxTimer: 0.4,
          });
        } else {
          // Sculptural Statues and Leather Executive Chairs take 2 hits
          can.health -= 1;
          const isStatue = can.type === 'penthouseBreakableStatue';
          const isChair = can.type === 'penthouseBreakableChair';
          if (can.health <= 0) {
            smashProp(can, true);
            hitVfxRef.current.push({
              x: can.x,
              y: isStatue ? can.y - 120 : isChair ? can.y - 150 : can.y - 105,
              text: 'SMASH!',
              color: '#ffaa00',
              timer: 0.4,
              maxTimer: 0.4,
            });
          } else {
            // First hit: white hit flash and shake
            can.hitFlashTimer = 0.20;
            can.wobbleTimer = 0.25;
            if (isKick) {
              playSFX('kickKneeContact');
            } else {
              playSFX('punchContact');
            }
            spawnImpact(can.x, isStatue ? can.y - 70 : isChair ? can.y - 90 : can.y - 60, false, 2.5, 0);
            hitVfxRef.current.push({
              x: can.x,
              y: isStatue ? can.y - 90 : isChair ? can.y - 120 : can.y - 80,
              text: 'HIT!',
              color: '#ffea00',
              timer: 0.35,
              maxTimer: 0.35,
            });
          }
        }
        return;
      }

      const isPrecinctProp =
        can.type === 'precinctWaterCooler' ||
        can.type === 'precinctTrashCan' ||
        can.type === 'precinctChair';

      if (isPrecinctProp) {
        if (can.type === 'precinctChair') {
          // Wooden Chairs break in 1 hit
          can.health = 0;
          smashProp(can, true);
          hitVfxRef.current.push({
            x: can.x,
            y: can.y - 110,
            text: 'SMASH!',
            color: '#ffaa00',
            timer: 0.4,
            maxTimer: 0.4,
          });
        } else {
          // Water Coolers and Metal Trash Cans take 2 hits (white flash + wobble on first hit)
          can.health -= 1;
          const isCooler = can.type === 'precinctWaterCooler';
          if (can.health <= 0) {
            smashProp(can, true);
            hitVfxRef.current.push({
              x: can.x,
              y: isCooler ? can.y - 120 : can.y - 80,
              text: 'SMASH!',
              color: '#ffaa00',
              timer: 0.4,
              maxTimer: 0.4,
            });
          } else {
            can.hitFlashTimer = 0.20;
            can.wobbleTimer = 0.25;
            if (isKick) {
              playSFX('kickKneeContact');
            } else {
              playSFX('punchContact');
            }
            spawnImpact(can.x, isCooler ? can.y - 78 : can.y - 52, false, 2.5, 0);
            hitVfxRef.current.push({
              x: can.x,
              y: isCooler ? can.y - 100 : can.y - 68,
              text: 'HIT!',
              color: '#ffea00',
              timer: 0.35,
              maxTimer: 0.35,
            });
          }
        }
        return;
      }

      const isStage5Prop =
        can.type === 'casinoStanchion' || can.type === 'casinoStool' || can.type === 'casinoTable';

      if (isStage5Prop) {
        if (can.type === 'casinoStool') {
          // Casino Bar Stools take 2 hits (flash white briefly and shake slightly on the first hit)
          can.health -= 1;
          if (can.health <= 0) {
            smashProp(can, true);
            hitVfxRef.current.push({
              x: can.x,
              y: can.y - 75,
              text: 'SMASH!',
              color: '#ffaa00',
              timer: 0.4,
              maxTimer: 0.4,
            });
          } else {
            can.hitFlashTimer = 0.20;
            can.wobbleTimer = 0.25;
            if (isKick) {
              playSFX('kickKneeContact');
            } else {
              playSFX('punchContact');
            }
            spawnImpact(can.x, can.y - 52, false, 2.5, 0);
            hitVfxRef.current.push({
              x: can.x,
              y: can.y - 68,
              text: 'HIT!',
              color: '#ffea00',
              timer: 0.35,
              maxTimer: 0.35,
            });
          }
        } else {
          // Brass Stanchion Posts and Cocktail Tables break in 1 hit
          can.health = 0;
          smashProp(can, true);
          hitVfxRef.current.push({
            x: can.x,
            y: can.y - 75,
            text: 'SMASH!',
            color: '#ffaa00',
            timer: 0.4,
            maxTimer: 0.4,
          });
        }
        return;
      }

      const isStage3Prop =
        can.type === 'garageTire' || can.type === 'garageDrum' || can.type === 'garageCone';

      if (isStage3Prop) {
        if (can.type === 'garageCone') {
          // Road Cones break in 1 hit
          can.health = 0;
          smashProp(can, true);
          hitVfxRef.current.push({
            x: can.x,
            y: can.y - 75,
            text: 'SMASH!',
            color: '#ffaa00',
            timer: 0.4,
            maxTimer: 0.4,
          });
        } else {
          // Tires and Oil Drums take 2 hits
          can.health -= 1;
          if (can.health <= 0) {
            smashProp(can, true);
            hitVfxRef.current.push({
              x: can.x,
              y: can.y - 82,
              text: 'SMASH!',
              color: '#ffaa00',
              timer: 0.4,
              maxTimer: 0.4,
            });
          } else {
            // First hit: flash white briefly and shake slightly
            can.hitFlashTimer = 0.20;
            can.wobbleTimer = 0.25;
            if (isKick) {
              playSFX('kickKneeContact');
            } else {
              playSFX('punchContact');
            }
            spawnImpact(can.x, can.y - 52, false, 2.5, 0);
            hitVfxRef.current.push({
              x: can.x,
              y: can.y - 68,
              text: 'HIT!',
              color: '#ffea00',
              timer: 0.35,
              maxTimer: 0.35,
            });
          }
        }
        return;
      }

      // Stage 1 & Stage 2 props
      let effectiveDmg = dmg;
      if (can.type === 'clubSpeaker') {
        effectiveDmg = isFinisher ? 30 : isKick ? 25 : 10;
      } else if (can.type === 'clubStool' || can.type === 'clubTable') {
        effectiveDmg = isFinisher ? 30 : isKick ? 20 : 10;
      }
      can.health -= effectiveDmg;

      if (can.health <= 0) {
        smashProp(can, isFinisher || isKick);
        hitVfxRef.current.push({
          x: can.x,
          y: can.y - 65,
          text: 'SMASH!',
          color: '#ffaa00',
          timer: 0.4,
          maxTimer: 0.4,
        });
      } else {
        can.hitFlashTimer = 0.15;
        can.wobbleTimer = 0.25;
        if (isKick) {
          playSFX('kickKneeContact');
        } else {
          playSFX('punchContact');
        }
        spawnImpact(can.x, can.y - 45, false, 2.0, 0);
        hitVfxRef.current.push({
          x: can.x,
          y: can.y - 50,
          text: `${effectiveDmg} POW!!`,
          color: '#ffea00',
          timer: 0.4,
          maxTimer: 0.4,
        });
      }
    },
    [smashProp, spawnImpact],
  );

  const smashTrashCan = (can: TrashCanProp, canIdx: number, isFinisher: boolean) => {
    damageProp(can, canIdx, isFinisher, false, 15);
  };

  function getHeroAttackFrameKey(fighter: Fighter): { frameKey: string; isHitFrame: boolean; canBufferCombo: boolean } {
  const move = fighter.attackMove || (fighter.comboStep === 4 ? 'kick2' : fighter.comboStep === 2 || fighter.comboStep === 3 ? 'punch2' : 'punch1');
  const elapsed = fighter.attackElapsed ?? 0;

  if (move === 'punch1') {
    // Punch 1 (4 Frames Total):
    // Frame 0 (Smear): 45ms, no hitbox
    // Frame 1 (Hit): 100ms, ACTIVE HITBOX enabled (using existing punch 1 hit sprite)
    // Frame 2 (Follow Through): 50ms, combo buffer window active, no hitbox
    // Frame 3 (Recover): 50ms, combo buffer window active, no hitbox
    if (elapsed < 0.045) return { frameKey: 'hero_punch_smear', isHitFrame: false, canBufferCombo: false };
    if (elapsed < 0.145) return { frameKey: 'hero_punch_1', isHitFrame: true, canBufferCombo: false };
    if (elapsed < 0.195) return { frameKey: 'hero_punch1_follow', isHitFrame: false, canBufferCombo: true };
    return { frameKey: 'hero_load', isHitFrame: false, canBufferCombo: true };
  }

  if (move === 'punch2') {
    // Punch 2 (6 Frames Total):
    // Frame 0 (Load): 45ms, no hitbox
    // Frame 1 (Pull): 45ms, no hitbox
    // Frame 2 (Smear): 45ms, no hitbox
    // Frame 3 (Hit): 100ms, ACTIVE HITBOX enabled (using existing punch 2 hit sprite)
    // Frame 4 (Follow Through): 50ms, combo buffer window active, no hitbox
    // Frame 5 (Recover): 50ms, combo buffer window active, no hitbox
    if (elapsed < 0.045) return { frameKey: 'hero_load', isHitFrame: false, canBufferCombo: false };
    if (elapsed < 0.090) return { frameKey: 'hero_pull', isHitFrame: false, canBufferCombo: false };
    if (elapsed < 0.135) return { frameKey: 'hero_punch2_smear', isHitFrame: false, canBufferCombo: false };
    if (elapsed < 0.235) return { frameKey: 'hero_punch_2', isHitFrame: true, canBufferCombo: false };
    if (elapsed < 0.285) return { frameKey: 'hero_punch2_follow', isHitFrame: false, canBufferCombo: true };
    return { frameKey: 'hero_load', isHitFrame: false, canBufferCombo: true };
  }

  if (move === 'kick2') {
    // Kick 2 (6 Frames Total):
    // Frame 0 (Load): 45ms, no hitbox
    // Frame 1 (Spring): 45ms, no hitbox
    // Frame 2 (Smear): 45ms, no hitbox
    // Frame 3 (Hit): 100ms, ACTIVE HITBOX enabled (using existing kick 2 hit sprite)
    // Frame 4 (Follow Through): 50ms, combo buffer window active, no hitbox
    // Frame 5 (Recover): 50ms, combo buffer window active, no hitbox
    if (elapsed < 0.045) return { frameKey: 'hero_kick_kneel', isHitFrame: false, canBufferCombo: false };
    if (elapsed < 0.090) return { frameKey: 'hero_kick_spring', isHitFrame: false, canBufferCombo: false };
    if (elapsed < 0.135) return { frameKey: 'hero_kick_smear', isHitFrame: false, canBufferCombo: false };
    if (elapsed < 0.235) return { frameKey: 'hero_kick_2', isHitFrame: true, canBufferCombo: false };
    if (elapsed < 0.285) return { frameKey: 'hero_kick_smear', isHitFrame: false, canBufferCombo: true };
    return { frameKey: 'hero_kick_spring', isHitFrame: false, canBufferCombo: true };
  }

  // Kick 1 single move fallback
  return {
    frameKey: (fighter.stateTimer > 0.15) ? 'hero_kick_1' : 'hero_kick_2',
    isHitFrame: fighter.stateTimer > 0.05 && fighter.stateTimer <= 0.22,
    canBufferCombo: fighter.stateTimer <= 0.18,
  };
}

  function startHeroAttack(player: Fighter, move: 'punch1' | 'punch2' | 'kick2' | 'kick1', comboStep: number) {
  player.stateName = (move === 'kick1' || move === 'kick2') ? 'kick' : 'attack';
  player.attackMove = move;
  player.comboStep = comboStep;
  player.comboWindowTimer = 0.75;
  player.attackElapsed = 0;
  player.hasHitCurrentAttack = false;
  player.hasHitThisSwing = false;
  player.bufferedInput = null;

  if (move === 'punch1') {
    player.stateTimer = 0.245;
  } else if (move === 'punch2') {
    player.stateTimer = 0.335;
  } else if (move === 'kick2') {
    player.stateTimer = 0.335;
  } else {
    player.stateTimer = 0.30;
  }
  playSFX('actionKickPress');
}

  // Main update loop
  const update = (dt: number) => {
    if (gameStateRef.current.status !== 'PLAYING' || isGameMenuOpen || showContinueModalRef.current) return;

    // Post-Victor defeat countdown: allows Victor's ground KO animation to finish cleanly (~1.2s)
    if (victorDefeatedTransitionRef.current.pending) {
      victorDefeatedTransitionRef.current.timer -= dt;
      if (victorDefeatedTransitionRef.current.timer <= 0) {
        victorDefeatedTransitionRef.current.pending = false;
        startVictorToOutroTransition();
      }
    }

    // Stage Transition Flow (3.0s banner & tally)
    if (stageClearTransitionRef.current.active) {
      stageClearTransitionRef.current.timer -= dt;
      if (stageClearTransitionRef.current.timer <= 0) {
        stageClearTransitionRef.current.active = false;
        if (stageClearTransitionRef.current.fromStage === 1) {
          transitionToStage2();
        } else if (stageClearTransitionRef.current.fromStage === 2) {
          startIntermissionCutscene('stage2');
        } else if (stageClearTransitionRef.current.fromStage === 3) {
          transitionToStage4();
        } else if (stageClearTransitionRef.current.fromStage === 4) {
          startIntermissionCutscene('stage4');
        } else if (stageClearTransitionRef.current.fromStage === 5) {
          transitionToStage6();
        } else if (stageClearTransitionRef.current.fromStage === 6) {
          startIntermissionCutscene('stage6');
        } else if (stageClearTransitionRef.current.fromStage === 7) {
          transitionToStage8();
        }
        return;
      }
    }

    const player = playerRef.current;
    const enemies = enemiesRef.current;
    const trashCans = trashCansRef.current;
    const drops = dropsRef.current;
    const input = inputRef.current;
    const touch = touchActionsRef.current;

    if (screenShakeRef.current > 0) {
      screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
    }

    if (comboCountRef.current > 0) {
      comboTimerRef.current -= dt;
      if (comboTimerRef.current <= 0) {
        comboCountRef.current = 0;
      }
    }

    for (let i = impactBurstsRef.current.length - 1; i >= 0; i--) {
      impactBurstsRef.current[i].timer -= dt;
      if (impactBurstsRef.current[i].timer <= 0) {
        impactBurstsRef.current.splice(i, 1);
      }
    }
    if (impactBurstsRef.current.length > 12) {
      impactBurstsRef.current.splice(0, impactBurstsRef.current.length - 12);
    }

    for (let i = sparksRef.current.length - 1; i >= 0; i--) {
      const p = sparksRef.current[i];
      p.timer -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 450 * dt;
      p.vx *= Math.pow(0.2, dt);
      p.vy *= Math.pow(0.2, dt);
      if (p.timer <= 0) {
        sparksRef.current.splice(i, 1);
      }
    }
    if (sparksRef.current.length > 40) {
      sparksRef.current.splice(0, sparksRef.current.length - 40);
    }

    for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
      shockwavesRef.current[i].timer -= dt;
      if (shockwavesRef.current[i].timer <= 0) {
        shockwavesRef.current.splice(i, 1);
      }
    }

    for (let i = debrisParticlesRef.current.length - 1; i >= 0; i--) {
      const p = debrisParticlesRef.current[i];
      p.timer -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 650 * dt;
      p.rotation += p.vRot * dt;
      if (p.timer <= 0) {
        debrisParticlesRef.current.splice(i, 1);
      }
    }
    if (debrisParticlesRef.current.length > 40) {
      debrisParticlesRef.current.splice(0, debrisParticlesRef.current.length - 40);
    }

    for (let i = flyingDebrisPropsRef.current.length - 1; i >= 0; i--) {
      const p = flyingDebrisPropsRef.current[i];
      p.timer -= dt;
      p.vz += 1150 * dt;
      p.z += p.vz * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vRot * dt;
      if (p.timer <= 0) {
        flyingDebrisPropsRef.current.splice(i, 1);
      }
    }

    for (let i = trashCans.length - 1; i >= 0; i--) {
      const can = trashCans[i];
      if (can.hitFlashTimer > 0) can.hitFlashTimer = Math.max(0, can.hitFlashTimer - dt);
      if (can.wobbleTimer > 0) can.wobbleTimer = Math.max(0, can.wobbleTimer - dt);
    }

    for (let i = hitVfxRef.current.length - 1; i >= 0; i--) {
      hitVfxRef.current[i].timer -= dt;
      if (hitVfxRef.current[i].timer <= 0) {
        hitVfxRef.current.splice(i, 1);
      }
    }
    if (hitVfxRef.current.length > 20) {
      hitVfxRef.current.splice(0, hitVfxRef.current.length - 20);
    }

    if (combatCalloutRef.current) {
      combatCalloutRef.current.timer -= dt;
      if (combatCalloutRef.current.timer <= 0) {
        combatCalloutRef.current = null;
      }
    }

    // Stage Opening Transition Banner & Fade Countdown
    if (stageIntroTimerRef.current > 0) {
      stageIntroTimerRef.current = Math.max(0, stageIntroTimerRef.current - dt);
    }

    // Streets of Rage 4 Bottom-Center Boss Health Bar HUD tracking
    const bossFighter = enemies.find(
      (e) =>
        e.type === 'boss' &&
        (
          (currentStageRef.current === 2 && e.id === 'stage2_club_boss') ||
          (currentStageRef.current === 4 && e.id === 'stage4_race_boss') ||
          (currentStageRef.current === 6 && e.id === 'stage6_police_boss') ||
          (currentStageRef.current === 8 && e.id === 'stage8_rooftop_boss')
        )
    );

    const bHud = bossHudRef.current;
    if (bossFighter) {
      bHud.active = true;
      bHud.bossId = bossFighter.id;
      bHud.maxHealth = Math.max(1, bossFighter.maxHealth);
      bHud.health = Math.max(0, bossFighter.health);
      if (bossFighter.id === 'stage2_club_boss') {
        bHud.bossName = 'LEON';
        bHud.bossAssetKey = 'leon_idle_1';
      } else if (bossFighter.id === 'stage4_race_boss') {
        bHud.bossName = 'HELL KAGE';
        bHud.bossAssetKey = 'hellkage_idle_1';
      } else if (bossFighter.id === 'stage6_police_boss') {
        bHud.bossName = 'BONE HEAD';
        bHud.bossAssetKey = 'bonehead_idle_1';
      } else if (bossFighter.id === 'stage8_rooftop_boss') {
        bHud.bossName = 'VICTOR';
        bHud.bossAssetKey = 'victor_idle_1';
      }

      // Boss Music Trigger: On Stages 2, 4, 6, 8, the moment the boss spawns and health bar appears
      if (bossFighter.health > 0 && musicManager.getCurrentTrack() !== 'boss') {
        musicManager.playBossMusic();
      }

      if (bossFighter.health > 0) {
        bHud.alpha = Math.min(1, bHud.alpha + dt * 3.0);
      } else {
        bHud.alpha = Math.max(0, bHud.alpha - dt * 1.5);
      }
    } else {
      bHud.alpha = Math.max(0, bHud.alpha - dt * 2.0);
      if (bHud.alpha <= 0) {
        bHud.active = false;
      }
    }

    // Smooth health drain and lag damage catch-up ghost bar
    if (bHud.active) {
      if (bHud.displayHealth <= 0 && bHud.health > 0) {
        bHud.displayHealth = bHud.health;
        bHud.ghostHealth = bHud.health;
      } else {
        bHud.displayHealth += (bHud.health - bHud.displayHealth) * Math.min(1, dt * 8);
        if (bHud.ghostHealth < bHud.displayHealth) {
          bHud.ghostHealth = bHud.displayHealth;
        } else if (bHud.ghostHealth > bHud.displayHealth) {
          bHud.ghostHealth = Math.max(
            bHud.displayHealth,
            bHud.ghostHealth - (bHud.maxHealth * 0.35) * dt
          );
        }
      }
    }

    // Micro-pause (hit-stop) on impactful strikes
    if (hitStopTimerRef.current > 0) {
      hitStopTimerRef.current -= dt;
      return;
    }

    player.animTimer += dt;

    const gp = currentGamepadRef.current;

    const moveLeft = Boolean(
      input.actions.left ||
      keyStateRef.current['arrowleft'] ||
      keyStateRef.current['a'] ||
      keyStateRef.current['keya'] ||
      touch.left ||
      gp.left
    );
    const moveRight = Boolean(
      input.actions.right ||
      keyStateRef.current['arrowright'] ||
      keyStateRef.current['d'] ||
      keyStateRef.current['keyd'] ||
      touch.right ||
      gp.right
    );
    const moveUp = Boolean(
      input.actions.up ||
      keyStateRef.current['arrowup'] ||
      keyStateRef.current['w'] ||
      keyStateRef.current['keyw'] ||
      touch.up ||
      gp.up
    );
    const moveDown = Boolean(
      input.actions.down ||
      keyStateRef.current['arrowdown'] ||
      keyStateRef.current['s'] ||
      keyStateRef.current['keys'] ||
      touch.down ||
      gp.down
    );

    // Punch: Z / Enter / Touch punch
    const punchKey = Boolean(
      keyStateRef.current['z'] ||
      keyStateRef.current['keyz'] ||
      keyStateRef.current['enter'] ||
      touch.punch
    );
    // Kick: X / Touch kick
    const kickKey = Boolean(
      keyStateRef.current['x'] ||
      keyStateRef.current['keyx'] ||
      touch.kick
    );
    // Jump: Space / Touch jump
    const jumpKey = Boolean(
      keyStateRef.current[' '] ||
      keyStateRef.current['space'] ||
      touch.jump
    );
    // Special: Key C / V / Touch special
    const specialKey = Boolean(
      keyStateRef.current['c'] ||
      keyStateRef.current['keyc'] ||
      keyStateRef.current['v'] ||
      keyStateRef.current['keyv'] ||
      touch.special
    );

    // Action button edge detection (fresh press on keyboard, mobile touch, or edge-triggered gamepad button)
    const punchPressed = (punchKey && !lastPunchKeyRef.current) || gp.punchPressed;
    const kickPressed = (kickKey && !lastKickKeyRef.current) || gp.kickPressed;
    const jumpPressed = (jumpKey && !lastJumpKeyRef.current) || gp.jumpPressed;
    const specialPressed = (specialKey && !lastSpecialKeyRef.current) || gp.specialPressed;

    lastPunchKeyRef.current = punchKey;
    lastKickKeyRef.current = kickKey;
    lastJumpKeyRef.current = jumpKey;
    lastSpecialKeyRef.current = specialKey;

    const speed = getConfig('playerSpeed') as number;
    const pipeBonus = getConfig('pipeBonusDamage') as number;

    // Countdown pickup sprite timer and gun special cooldown timer
    if (player.pickupTimer && player.pickupTimer > 0) {
      player.pickupTimer -= dt;
    }
    if (player.specialCooldown && player.specialCooldown > 0) {
      player.specialCooldown = Math.max(0, player.specialCooldown - dt);
    }

    // Dedicated helper ensuring punchContact / kickKneeContact strictly require active attack states
    // and that the strike has not already connected. When walking, moving, or idling, contact sounds NEVER play.
    const playStrikeContactSound = (type: 'punch' | 'kick') => {
      const activeAttackStates = [
        'attack',
        'kick',
        'jump_punch',
        'jump_kick',
        'grab_knee',
        'special',
      ];
      if (!activeAttackStates.includes(player.stateName)) return;
      if (player.hasHitThisSwing || player.hasHitCurrentAttack) return;
      if (player.stateName === 'walk' || player.stateName === 'idle') return;

      if (type === 'kick') {
        playSFX('kickKneeContact');
      } else {
        playSFX('punchContact');
      }
    };

    // Dedicated horizontal and responsive vertical lane walking speed (beat 'em up ratio ~0.72)
    const horizontalSpeed = speed;
    const verticalSpeed = speed * 0.72;

    if (player.invulnTimer > 0) {
      player.invulnTimer -= dt;
    }

    // --- PLAYER ACTION STATE MACHINE ---
    const isAirborne = ['jump', 'jump_punch', 'jump_kick'].includes(player.stateName);
    const isPlayerInCombatAction = ['attack', 'kick', 'special', 'hurt', 'knockdown', 'dead', 'jump', 'jump_punch', 'jump_kick', 'grab', 'grab_knee', 'throw'].includes(player.stateName);

    // Spawns a high-speed projectile bullet at gun barrel height facing current direction
    const fireGunBurstShot = (shotNumber: 1 | 2 | 3) => {
      playSFX('gunShot');
      const dir = player.facingRight ? 1 : -1;
      const barrelX = player.x + dir * 65;
      const barrelY = player.y - 115;
      bulletsRef.current.push({
        id: `bullet_${Date.now()}_${Math.random()}`,
        x: barrelX,
        y: player.y,
        visualY: barrelY,
        vx: dir * 700,
        facingRight: player.facingRight,
        shotNumber,
      });
      // Subtle muzzle blast flash
      spawnImpact(barrelX, barrelY, false, 2.0, 0);
    };

    if (!isPlayerInCombatAction) {
      // 1. Trigger JUMP (Space or virtual jump button)
      if (jumpPressed && isGroundedRef.current) {
        player.stateName = 'jump';
        player.comboStep = 0;
        player.comboWindowTimer = 0;
        player.jumpZ = -2;
        player.jumpVz = -620;
        player.hasHitCurrentAttack = false;
        player.hasHitThisSwing = false;
        isGroundedRef.current = false;
        playSFX('jumpLand');
      } else if (specialPressed) {
        // 2. 3-Shot Burst Gun Special Move ('C' or virtual Special button)
        // Classic Streets of Rage critical-health safety rule: costs 8 HP, never drops below 1 HP
        player.health = Math.max(1, player.health - 8);
        player.hp = player.health;
        player.stateName = 'special';
        player.stateTimer = 0.45;
        player.specialElapsed = 0;
        player.specialShotFired = [true, false, false];
        player.vx = 0;
        player.vy = 0;
        player.invulnTimer = 0.45;

        // Shot 1 fires immediately at t = 0.00s
        fireGunBurstShot(1);
        hitVfxRef.current.push({
          x: player.x,
          y: player.y - 120,
          text: 'BURST FIRE!',
          color: '#ffdd00',
          timer: 0.4,
          maxTimer: 0.4,
        });
      } else if (kickPressed) {
        if ((player.comboWindowTimer ?? 0) > 0 && player.comboStep >= 1) {
          startHeroAttack(player, 'kick2', 4);
        } else {
          startHeroAttack(player, 'kick1', 0);
        }
      } else if (punchPressed) {
        if ((player.comboWindowTimer ?? 0) <= 0) {
          startHeroAttack(player, 'punch1', 1);
        } else if (player.comboStep === 1) {
          startHeroAttack(player, 'punch2', 2);
        } else if (player.comboStep === 2) {
          startHeroAttack(player, 'punch2', 3);
        } else if (player.comboStep === 3) {
          startHeroAttack(player, 'kick2', 4);
        } else {
          startHeroAttack(player, 'punch1', 1);
        }
      } else {
        let dx = 0;
        let dy = 0;
        if (moveLeft) dx -= 1;
        if (moveRight) dx += 1;
        if (moveUp) dy -= 1;
        if (moveDown) dy += 1;

        // Snappy, independent horizontal and depth lane velocities
        player.vx = dx * horizontalSpeed;
        player.vy = dy * verticalSpeed;

        if (dx > 0) player.facingRight = true;
        if (dx < 0) player.facingRight = false;

        const isMoving = dx !== 0 || dy !== 0;
        player.stateName = isMoving ? 'walk' : 'idle';
        player.hasHitCurrentAttack = true;
        player.hasHitThisSwing = true;

        // Auto walk-in grab
        if (isMoving && !player.grabbedEnemy) {
          for (const enemy of enemies) {
            if (
              enemy.health <= 0 ||
              enemy.stateName === 'dead' ||
              enemy.stateName === 'knockdown' ||
              enemy.invulnTimer > 0 ||
              enemy.isFlyingProjectile
            ) {
              continue;
            }
            if (enemy.type !== 'punk') continue;

            const distX = Math.abs(enemy.x - player.x);
            const distY = Math.abs(enemy.y - player.y);
            if (distX <= 42 && distY <= 15) {
              player.stateName = 'grab';
              player.grabbedEnemy = enemy;
              player.grabKneeCount = 0;
              player.grabTimer = 3.5;
              player.vx = 0;
              player.vy = 0;
              enemy.hasAttackToken = false;
              enemy.windupTimer = 0;
              enemy.stateName = 'hurt';
              enemy.stateTimer = 4.0;
              enemy.vx = 0;
              enemy.vy = 0;
              enemy.facingRight = !player.facingRight;
              enemy.x = player.x + (player.facingRight ? 40 : -40);
              enemy.y = player.y;
              break;
            }
          }
        }
      }
    } else if (isAirborne) {
      player.jumpVz = (player.jumpVz ?? 0) + 1300 * dt;
      player.jumpZ = (player.jumpZ ?? 0) + (player.jumpVz ?? 0) * dt;

      if (moveLeft) {
        player.vx = -horizontalSpeed * 0.85;
        player.facingRight = false;
      } else if (moveRight) {
        player.vx = horizontalSpeed * 0.85;
        player.facingRight = true;
      } else {
        player.vx *= Math.pow(0.5, dt);
      }
      player.x += player.vx * dt;

      // 2.5D Mid-air lane steering: allow jumping diagonally into background/foreground lanes
      let airDy = 0;
      if (moveUp) airDy -= 1;
      if (moveDown) airDy += 1;
      player.vy = airDy * (verticalSpeed * 0.8);
      player.y += player.vy * dt;
      const { minY: jumpYMin, maxY: jumpYMax } = getStageWalkableYBounds(currentStageRef.current);
      player.y = Math.max(jumpYMin, Math.min(jumpYMax, player.y));

      if (punchPressed && player.stateName === 'jump') {
        player.stateName = 'jump_punch';
        player.hasHitCurrentAttack = false;
        player.hasHitThisSwing = false;
        playSFX('actionKickPress');
      } else if (kickPressed && (player.stateName === 'jump' || player.stateName === 'jump_punch')) {
        player.stateName = 'jump_kick';
        player.hasHitCurrentAttack = false;
        player.hasHitThisSwing = false;
        playSFX('actionKickPress');
      }

      // Mid-air collision check
      if (['jump_punch', 'jump_kick'].includes(player.stateName) && !player.hasHitCurrentAttack && !player.hasHitThisSwing) {
        const isKick = player.stateName === 'jump_kick';
        const reachX = isKick ? 220 : 175;
        const reachY = 75;

        enemies.forEach((enemy) => {
          if (enemy.health <= 0 || enemy.invulnTimer > 0) return;
          const isHk = enemy.id === 'stage4_race_boss';
          const isBh = enemy.id === 'stage6_police_boss';
          const isVic = enemy.id === 'stage8_rooftop_boss';
          const extraReachX = (isHk || isBh || isVic) ? 45 : 0;
          const effectiveReachY = (isHk || isBh || isVic) ? Math.round(reachY * 1.5) : reachY;
          const distY = Math.abs(enemy.y - player.y);
          const distX = enemy.x - player.x;
          const inFront = player.facingRight
            ? distX >= -40 && distX <= (reachX + extraReachX)
            : distX <= 40 && distX >= -(reachX + extraReachX);

          if (inFront && distY <= effectiveReachY) {
            // Strict check: trigger contact audio only for active strikes
            if (isKick) {
              playStrikeContactSound('kick');
            } else {
              playStrikeContactSound('punch');
            }
            player.hasHitCurrentAttack = true;
            player.hasHitThisSwing = true;
            const dmg = isKick ? 32 : 20;
            const knockback = isKick ? 280 : 110;
            const isFinisher = isKick || enemy.health <= dmg;

            enemy.health = Math.max(0, enemy.health - dmg);
            enemy.invulnTimer = 0.35;
            enemy.windupTimer = 0;
            enemy.hasAttackToken = false;
            enemy.vx = (player.facingRight ? 1 : -1) * knockback;
            comboCountRef.current += 1;
            comboTimerRef.current = 2.5;

            const dir = player.facingRight ? 1 : -1;
            const contactX = (player.x + dir * 60 + enemy.x) * 0.5;
            const contactY = (isHk || isBh || isVic)
              ? (isKick ? enemy.y - 150 : enemy.y - 175)
              : (isKick ? enemy.y - 100 : enemy.y - 120);
            spawnImpact(contactX, contactY, isFinisher, isFinisher ? 7.5 : 4.0);

            const pts = (dmg * 10) * Math.min(5, comboCountRef.current);
            setGameState((prev) => ({ ...prev, score: prev.score + pts }));

            if (enemy.health <= 0) {
              enemy.stateName = 'knockdown';
              enemy.stateTimer = 0.85;
              enemy.hasPlayedFallSound = false;
              if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
                enemy.animState = { currentAction: 'DEATH', currentFrame: 0, timer: 0 };
              }
              combatCalloutRef.current = {
                text: 'KO !!',
                isKo: true,
                fontSize: 50,
                timer: 0.8,
                maxTimer: 0.8,
              };
            } else {
              if (isKick) {
                enemy.stateName = 'knockdown';
                enemy.stateTimer = 0.85; // 0.20s air arc + 0.65s on ground
                enemy.hasPlayedFallSound = false;
                if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
                  enemy.animState = { currentAction: 'HURT', currentFrame: 0, timer: 0 };
                }
              } else {
                enemy.stateName = 'hurt';
                enemy.stateTimer = 0.35;
                if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
                  enemy.animState = { currentAction: 'HURT', currentFrame: 0, timer: 0 };
                }
              }
              combatCalloutRef.current = {
                text: `${dmg} ${isKick ? 'DROPKICK!' : 'AERIAL JAB!'}`,
                isKo: false,
                fontSize: isKick ? 42 : 36,
                timer: 0.8,
                maxTimer: 0.8,
              };
            }
          }
        });

        // Check breakable trash cans in air
        trashCans.forEach((can, canIdx) => {
          if (can.health <= 0) return;
          const isClub = can.type === 'clubStool' || can.type === 'clubTable' || can.type === 'clubSpeaker';
          const isGarage = can.type === 'garageTire' || can.type === 'garageDrum' || can.type === 'garageCone';
          const isEnlargedPrecinct = can.type === 'precinctWaterCooler' || can.type === 'precinctChair';
          const isChair = can.type === 'penthouseBreakableChair';
          const isPenthouse = can.type === 'penthouseBreakableStatue' || can.type === 'penthouseBreakablePlant' || isChair;
          const reachBack = isChair ? 153 : can.type === 'clubSpeaker' ? 85 : isClub ? 75 : isGarage ? 83 : (isEnlargedPrecinct || isPenthouse) ? 102 : 45;
          const reachPropY = isChair ? 288 : can.type === 'clubSpeaker' ? 130 : isClub ? 115 : isGarage ? 142 : (isEnlargedPrecinct || isPenthouse) ? 192 : 85;
          const distY = Math.abs(can.y - player.y);
          const distX = can.x - player.x;
          const inFront = player.facingRight ? distX >= -reachBack && distX <= reachX : distX <= reachBack && distX >= -reachX;
          if (inFront && distY <= reachPropY) {
            const isKick = player.stateName === 'jump_kick';
            if (isKick) {
              playStrikeContactSound('kick');
            } else {
              playStrikeContactSound('punch');
            }
            player.hasHitCurrentAttack = true;
            player.hasHitThisSwing = true;
            damageProp(can, canIdx, isKick, isKick, isKick ? 32 : 20);
          }
        });
      }

      // Touchdown / land on street lane
      if ((player.jumpZ ?? 0) >= 0) {
        player.jumpZ = 0;
        player.jumpVz = 0;
        player.stateName = 'idle';
        player.hasHitCurrentAttack = true;
        player.hasHitThisSwing = true;
        if (!isGroundedRef.current) {
          isGroundedRef.current = true;
          playSFX('jumpLand');
        }
      }
    } else if (player.stateName === 'grab') {
      player.vx = 0;
      player.vy = 0;
      const enemy = player.grabbedEnemy;
      if (!enemy || enemy.health <= 0 || enemy.stateName === 'dead') {
        player.stateName = 'idle';
        if (enemy) {
          enemy.isGrabbed = false;
          enemy.state = 'idle';
          enemy.stateName = 'idle';
          enemy.stateTimer = 0;
        }
        player.grabbedEnemy = null;
      } else {
        enemy.vx = 0;
        enemy.vy = 0;
        enemy.x = player.x + (player.facingRight ? 40 : -40);
        enemy.y = player.y;
        enemy.facingRight = !player.facingRight;
        enemy.stateName = 'hurt';

        player.grabTimer = (player.grabTimer ?? 3.5) - dt;
        if (player.grabTimer <= 0) {
          player.stateName = 'idle';
          enemy.isGrabbed = false;
          enemy.state = 'idle';
          enemy.stateName = 'idle';
          enemy.stateTimer = 0;
          player.grabbedEnemy = null;
        } else {
          const hasDirection = moveLeft || moveRight;
          if (hasDirection && (punchPressed || kickPressed)) {
            // Overhead Throw
            playSFX('actionKickPress');
            const throwDir = moveRight ? 1 : moveLeft ? -1 : player.facingRight ? 1 : -1;
            player.facingRight = throwDir > 0;
            player.stateName = 'throw';
            player.stateTimer = 0.45;
            const thrown = player.grabbedEnemy;
            player.grabbedEnemy = null;

            if (thrown) {
              thrown.isGrabbed = false;
              thrown.state = 'knockdown';
              thrown.isFlyingProjectile = true;
              thrown.stateName = 'knockdown';
              thrown.flyingVx = throwDir * 540;
              thrown.flyingVy = 0;
              thrown.flyingZ = -40;
              thrown.flyingVz = -380;
              thrown.rotation = 0;
              thrown.hitEnemiesIds = [thrown.id];
              thrown.health = Math.max(0, thrown.health - 35);
              thrown.stateTimer = 0.85; // 0.20s air + 0.65s ground
              thrown.invulnTimer = 0;
              thrown.hasPlayedFallSound = false;

              spawnImpact(player.x + throwDir * 40, player.y - 100, true, 8.0);
              combatCalloutRef.current = {
                text: '35 OVERHEAD THROW!',
                isKo: thrown.health <= 0,
                fontSize: 44,
                timer: 0.8,
                maxTimer: 0.8,
              };
              const pts = 350 * Math.min(5, (comboCountRef.current += 1));
              setGameState((prev) => ({ ...prev, score: prev.score + pts }));
            }
          } else if (!hasDirection && (punchPressed || kickPressed)) {
            // Knee strike
            player.stateName = 'grab_knee';
            player.stateTimer = 0.28;
            player.hasHitCurrentAttack = false;
            player.hasHitThisSwing = false;
            player.grabKneeCount = (player.grabKneeCount ?? 0) + 1;
            if (enemy) {
              enemy.health = Math.max(0, enemy.health - 18);
              comboCountRef.current += 1;
              comboTimerRef.current = 2.5;
              playStrikeContactSound('kick');
              player.hasHitCurrentAttack = true;
              player.hasHitThisSwing = true;
              const isThird = (player.grabKneeCount ?? 0) >= 3;
              spawnImpact(
                player.x + (player.facingRight ? 40 : -40),
                player.y - 105,
                isThird || enemy.health <= 0,
                isThird ? 7.0 : 4.0
              );
              combatCalloutRef.current = {
                text: `18 KNEE #${player.grabKneeCount}!`,
                isKo: enemy.health <= 0,
                fontSize: 40,
                timer: 0.8,
                maxTimer: 0.8,
              };
              const pts = 180 * Math.min(5, comboCountRef.current);
              setGameState((prev) => ({ ...prev, score: prev.score + pts }));

              if (isThird || enemy.health <= 0) {
                enemy.isGrabbed = false;
                enemy.state = 'knockdown';
                enemy.stateName = 'knockdown';
                enemy.stateTimer = 0.85; // 0.20s air arc + 0.65s on ground
                enemy.hasPlayedFallSound = false;
                enemy.vx = (player.facingRight ? 1 : -1) * 230;
                player.grabbedEnemy = null;
              }
            }
          }
        }
      }
    } else if (player.stateName === 'grab_knee') {
      player.vx = 0;
      player.vy = 0;

      if ((punchPressed || kickPressed) && (player.grabKneeCount ?? 0) < 3 && player.stateTimer <= 0.16 && player.grabbedEnemy && player.grabbedEnemy.health > 0) {
        player.stateTimer = 0.28;
        player.hasHitCurrentAttack = false;
        player.hasHitThisSwing = false;
        player.grabKneeCount = (player.grabKneeCount ?? 0) + 1;
        const enemy = player.grabbedEnemy;
        enemy.health = Math.max(0, enemy.health - 18);
        comboCountRef.current += 1;
        comboTimerRef.current = 2.5;
        playStrikeContactSound('kick');
        player.hasHitCurrentAttack = true;
        player.hasHitThisSwing = true;
        const isThird = (player.grabKneeCount ?? 0) >= 3;
        spawnImpact(
          player.x + (player.facingRight ? 40 : -40),
          player.y - 105,
          isThird || enemy.health <= 0,
          isThird ? 7.0 : 4.0
        );
        combatCalloutRef.current = {
          text: `18 KNEE #${player.grabKneeCount}!`,
          isKo: enemy.health <= 0,
          fontSize: 40,
          timer: 0.8,
          maxTimer: 0.8,
        };
        const pts = 180 * Math.min(5, comboCountRef.current);
        setGameState((prev) => ({ ...prev, score: prev.score + pts }));

        if (isThird || enemy.health <= 0) {
          enemy.isGrabbed = false;
          enemy.state = 'knockdown';
          enemy.stateName = 'knockdown';
          enemy.stateTimer = 0.85; // 0.20s air arc + 0.65s on ground
          enemy.hasPlayedFallSound = false;
          enemy.vx = (player.facingRight ? 1 : -1) * 230;
          player.grabbedEnemy = null;
        }
      }

      player.stateTimer -= dt;
      if (player.grabbedEnemy && player.grabbedEnemy.health > 0) {
        player.grabbedEnemy.x = player.x + (player.facingRight ? 40 : -40);
        player.grabbedEnemy.y = player.y;
        player.grabbedEnemy.stateName = 'hurt';
      }
      if (player.stateTimer <= 0) {
        if (player.grabbedEnemy && player.grabbedEnemy.health > 0 && (player.grabKneeCount ?? 0) < 3) {
          player.stateName = 'grab';
        } else {
          player.stateName = 'idle';
          player.hasHitCurrentAttack = true;
          player.hasHitThisSwing = true;
          if (player.grabbedEnemy) {
            player.grabbedEnemy.isGrabbed = false;
            player.grabbedEnemy.state = 'idle';
            player.grabbedEnemy.stateName = 'idle';
            player.grabbedEnemy.stateTimer = 0;
            player.grabbedEnemy = null;
          }
        }
      }
    } else if (player.stateName === 'throw') {
      player.vx = 0;
      player.vy = 0;
      player.stateTimer -= dt;
      if (player.stateTimer <= 0) {
        player.stateName = 'idle';
        player.hasHitCurrentAttack = true;
        player.hasHitThisSwing = true;
      }
    } else {
      player.stateTimer -= dt;

      if (player.stateName === 'hurt') {
        player.vx *= Math.pow(0.1, dt);
        if (player.stateTimer <= 0) {
          player.stateName = 'idle';
          player.hasHitCurrentAttack = true;
          player.hasHitThisSwing = true;
          player.vx = 0;
          player.vy = 0;
        }
      } else if (player.stateName === 'knockdown') {
        player.x += player.vx * dt;
        player.vx *= Math.pow(0.2, dt);

        if (player.stateTimer <= 0) {
          player.vx = 0;
          player.vy = 0;
          if (player.health <= 0) {
            player.stateName = 'dead';
            musicManager.pauseMusic();
            if (continuesRef.current > 0) {
              if (!showContinueModalRef.current) {
                playGameOverSting();
                setShowContinueModal(true);
                showContinueModalRef.current = true;
              }
            } else {
              setGameState((prev) => ({ ...prev, status: 'GAME_OVER' }));
            }
          } else {
            player.stateName = 'idle';
            player.hasHitCurrentAttack = true;
            player.hasHitThisSwing = true;
            player.invulnTimer = 1.0;
          }
        }
      } else if (player.stateName === 'dead') {
        player.vx = 0;
        player.vy = 0;
      } else if (player.stateName === 'special') {
        // Tactical 3-shot gun burst state handling (locked in place)
        player.vx = 0;
        player.vy = 0;
        player.specialElapsed = (player.specialElapsed ?? 0) + dt;
        const elapsed = player.specialElapsed;

        // Shot 2 (t = 0.14s)
        if (elapsed >= 0.14 && player.specialShotFired && !player.specialShotFired[1]) {
          player.specialShotFired[1] = true;
          fireGunBurstShot(2);
        }

        // Shot 3 (t = 0.28s)
        if (elapsed >= 0.28 && player.specialShotFired && !player.specialShotFired[2]) {
          player.specialShotFired[2] = true;
          fireGunBurstShot(3);
        }

        // Hold gunPose3Sprite until t = 0.45s before returning to idle
        if (player.stateTimer <= 0) {
          player.stateName = 'idle';
          player.hasHitCurrentAttack = true;
          player.hasHitThisSwing = true;
        }
      } else if (['attack', 'kick'].includes(player.stateName)) {
        player.vx = 0;
        player.vy = 0;
        player.attackElapsed = (player.attackElapsed ?? 0) + dt;

        const { isHitFrame, canBufferCombo } = getHeroAttackFrameKey(player);

        // Input buffering and combo chaining during follow-through / recovery frames
        if (punchPressed) {
          if (canBufferCombo) {
            if (player.comboStep === 1) {
              startHeroAttack(player, 'punch2', 2);
            } else if (player.comboStep === 2) {
              startHeroAttack(player, 'punch2', 3);
            } else if (player.comboStep === 3) {
              startHeroAttack(player, 'kick2', 4);
            } else {
              startHeroAttack(player, 'punch1', 1);
            }
          } else {
            player.bufferedInput = 'punch';
          }
        } else if (kickPressed) {
          if (canBufferCombo) {
            startHeroAttack(player, 'kick2', 4);
          } else {
            player.bufferedInput = 'kick';
          }
        } else if (canBufferCombo && player.bufferedInput) {
          const buf = player.bufferedInput;
          player.bufferedInput = null;
          if (buf === 'kick') {
            startHeroAttack(player, 'kick2', 4);
          } else {
            if (player.comboStep === 1) {
              startHeroAttack(player, 'punch2', 2);
            } else if (player.comboStep === 2) {
              startHeroAttack(player, 'punch2', 3);
            } else if (player.comboStep === 3) {
              startHeroAttack(player, 'kick2', 4);
            } else {
              startHeroAttack(player, 'punch1', 1);
            }
          }
        }

        // Active Attack Hitbox strictly enabled on the designated Hit frame
        if (isHitFrame && !player.hasHitCurrentAttack && !player.hasHitThisSwing) {
          const isKickAttack = player.attackMove === 'kick2' || player.stateName === 'kick';
          const attackMult = isKickAttack ? 1.35 : 1.2375;
          const reachX = Math.round((player.hasPipe ? 252 : 180) * attackMult);
          const reachY = Math.round(75 * attackMult);

          enemies.forEach((enemy) => {
            if (enemy.health <= 0 || enemy.invulnTimer > 0) return;
            const isHk = enemy.id === 'stage4_race_boss';
            const isBh = enemy.id === 'stage6_police_boss';
            const isVic = enemy.id === 'stage8_rooftop_boss';
            const extraReachX = (isHk || isBh || isVic) ? 45 : 0;
            const effectiveReachY = (isHk || isBh || isVic) ? Math.round(reachY * 1.5) : reachY;
            const distY = Math.abs(enemy.y - player.y);
            const distX = enemy.x - player.x;
            const inFront = player.facingRight
              ? distX >= -40 && distX <= (reachX + extraReachX)
              : distX <= 40 && distX >= -(reachX + extraReachX);

            const isWhirlwindHit = player.stateName === 'special' && Math.abs(distX) <= ((isHk || isBh || isVic) ? 320 : 270) && distY <= ((isHk || isBh || isVic) ? 120 : 90);

            if ((inFront && distY <= effectiveReachY) || isWhirlwindHit) {
              const isComboFinisher = player.attackMove === 'kick2' || (player.stateName === 'attack' && player.comboStep === 4);

              // Sound triggers
              if (player.attackMove === 'kick2' || player.stateName === 'kick') {
                playStrikeContactSound('kick');
                if (isComboFinisher) {
                  playSFX('enemyFallLose');
                }
              } else {
                playStrikeContactSound('punch');
              }

              player.hasHitCurrentAttack = true;
              player.hasHitThisSwing = true;

              let dmg = 15;
              let knockback = 40;

              if (player.attackMove === 'kick2' || (player.stateName === 'attack' && player.comboStep === 4)) {
                dmg = 30;
                knockback = 260;
              } else if (player.attackMove === 'punch2' || player.comboStep === 3) {
                dmg = player.comboStep === 3 ? 25 : 18;
                knockback = 50;
              } else if (player.attackMove === 'punch1' || player.comboStep === 1) {
                dmg = 15;
                knockback = 35;
              } else if (player.stateName === 'kick') {
                dmg = 25;
                knockback = 220;
              }
              if (player.hasPipe) dmg += pipeBonus;

              const dir = player.facingRight ? 1 : -1;
              const contactX = isWhirlwindHit
                ? (player.x + enemy.x) * 0.5
                : (player.x + dir * 95 + enemy.x) * 0.5;
              const contactY = (isHk || isBh || isVic)
                ? ((player.stateName === 'kick' || isComboFinisher) ? enemy.y - 155 : enemy.y - 180)
                : ((player.stateName === 'kick' || isComboFinisher) ? enemy.y - 105 : enemy.y - 125);

              // Bone Head & Heavy Bruiser Armor: Armor against weak single hits while winding up or attacking
              const isBoneHead = enemy.id === 'stage6_police_boss';
              const isHeavyBruiser = enemy.enemyVariant === 'enemy3';
              const isArmoredPunch = (isBoneHead || isHeavyBruiser) && !isComboFinisher && (enemy.stateName === 'attack' || enemy.windupTimer > 0) && dmg <= 20;

              if (isArmoredPunch) {
                enemy.health = Math.max(0, enemy.health - dmg);
                enemy.invulnTimer = 0.20;
                spawnImpact(contactX, contactY, false, 2.0, 0);
                hitVfxRef.current.push({
                  x: enemy.x,
                  y: enemy.y - (isBoneHead ? 120 : 80),
                  text: 'SUPER ARMOR!',
                  color: isBoneHead ? '#e2e8f0' : '#a855f7',
                  timer: 0.4,
                  maxTimer: 0.4,
                });
                playSFX('punchContact');
                return;
              }

              const willDefeat = enemy.health <= dmg;
              const isHeavyImpact =
                isComboFinisher ||
                player.stateName === 'kick' ||
                player.stateName === 'special' ||
                willDefeat;

              if (willDefeat) {
                if (enemy.id === 'stage2_club_boss') preloadIntermissionSet('stage2');
                if (enemy.id === 'stage4_race_boss') preloadIntermissionSet('stage4');
                if (enemy.id === 'stage6_police_boss') preloadIntermissionSet('stage6');
              }

              enemy.health = Math.max(0, enemy.health - dmg);
              enemy.invulnTimer = isComboFinisher ? 0.35 : 0.28;
              enemy.windupTimer = 0;
              enemy.hasAttackToken = false;
              enemy.vx = (player.facingRight ? 1 : -1) * knockback;
              comboCountRef.current += 1;
              comboTimerRef.current = 2.5;

              // Hits 1, 2, 3: fast and snappy with NO freeze and NO camera shake (0, 0)
              // Hit 4 / Kick 2: authentic finisher impact with 0.06s hitstop freeze & camera shake
              if (isComboFinisher) {
                spawnImpact(contactX, contactY, true, 4.0, 0.06);
              } else if (player.stateName === 'attack') {
                spawnImpact(contactX, contactY, false, 0, 0);
              } else if (player.stateName === 'kick') {
                spawnImpact(contactX, contactY, true, 4.0, 0.04);
              } else {
                spawnImpact(contactX, contactY, isHeavyImpact, isHeavyImpact ? 6.0 : 3.0, 0.04);
              }

              // Base score pts from hit
              let pts = (dmg * 10) * Math.min(5, comboCountRef.current);

              // Upper-Left KO! pulse & +50 * comboCount bonus on 4-hit finisher or enemy knockout
              if (isComboFinisher || willDefeat) {
                const finisherBonus = 50 * comboCountRef.current;
                pts += finisherBonus;
              }

              setGameState((prev) => ({ ...prev, score: prev.score + pts }));

              if (willDefeat) {
                enemy.stateName = 'knockdown';
                enemy.stateTimer = 0.85; // 0.20s air arc + 0.65s on ground before permanent KO fade
                enemy.hasPlayedFallSound = false;
                if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
                  enemy.animState = { currentAction: 'DEATH', currentFrame: 0, timer: 0 };
                }

                combatCalloutRef.current = {
                  text: 'KO !!',
                  isKo: true,
                  fontSize: 50,
                  timer: 0.85,
                  maxTimer: 0.85,
                };
              } else {
                if (isComboFinisher || player.stateName === 'kick' || player.stateName === 'special') {
                  enemy.stateName = 'knockdown';
                  enemy.stateTimer = 0.85; // 0.20s air arc + 0.65s on ground
                  enemy.hasPlayedFallSound = false;
                  if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
                    enemy.animState = { currentAction: 'HURT', currentFrame: 0, timer: 0 };
                  }

                  combatCalloutRef.current = {
                    text: `${dmg} POW!!`,
                    isKo: isComboFinisher,
                    fontSize: 46,
                    timer: 0.85,
                    maxTimer: 0.85,
                  };
                } else {
                  enemy.stateName = 'hurt';
                  enemy.stateTimer = player.comboStep === 3 ? 0.38 : 0.32;
                  if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
                    enemy.animState = { currentAction: 'HURT', currentFrame: 0, timer: 0 };
                  }

                  combatCalloutRef.current = {
                    text: `${dmg} POW!!`,
                    isKo: false,
                    fontSize: player.comboStep === 3 ? 40 : 36,
                    timer: 0.8,
                    maxTimer: 0.8,
                  };
                }
              }
            }
          });

          // Break street trash can check
          trashCans.forEach((can, canIdx) => {
            if (can.health <= 0) return;
            const isClub = can.type === 'clubStool' || can.type === 'clubTable' || can.type === 'clubSpeaker';
            const isGarage = can.type === 'garageTire' || can.type === 'garageDrum' || can.type === 'garageCone';
            const isEnlargedPrecinct = can.type === 'precinctWaterCooler' || can.type === 'precinctChair';
            const isChair = can.type === 'penthouseBreakableChair';
            const isPenthouse = can.type === 'penthouseBreakableStatue' || can.type === 'penthouseBreakablePlant' || isChair;
            const reachBack = isChair ? 153 : can.type === 'clubSpeaker' ? 85 : isClub ? 75 : isGarage ? 83 : (isEnlargedPrecinct || isPenthouse) ? 102 : 45;
            const reachPropY = isChair ? 300 : can.type === 'clubSpeaker' ? 135 : isClub ? 120 : isGarage ? 150 : (isEnlargedPrecinct || isPenthouse) ? 202 : 120;
            const distY = Math.abs(can.y - player.y);
            const distX = can.x - player.x;
            const inFront = player.facingRight ? distX >= -reachBack && distX <= reachX : distX <= reachBack && distX >= -reachX;
            if (inFront && distY <= reachPropY) {
              const isComboFinisher = player.attackMove === 'kick2' || (player.stateName === 'attack' && player.comboStep === 4);
              const isKick = player.attackMove === 'kick2' || player.stateName === 'kick';

              if (player.attackMove === 'kick2' || player.stateName === 'kick') {
                playStrikeContactSound('kick');
              } else {
                playStrikeContactSound('punch');
              }
              player.hasHitCurrentAttack = true;
              player.hasHitThisSwing = true;

              let dmg = 15;
              if (isComboFinisher) dmg = 30;
              else if (player.comboStep === 3) dmg = 25;
              else if (player.comboStep === 2) dmg = 18;
              else dmg = 15;
              if (player.hasPipe) dmg += pipeBonus;

              damageProp(can, canIdx, isComboFinisher || isKick, isKick, dmg);
            }
          });
        }

        if (player.stateTimer <= 0) {
          if (player.bufferedInput) {
            const buf = player.bufferedInput;
            player.bufferedInput = null;
            if (buf === 'kick') {
              startHeroAttack(player, 'kick2', 4);
            } else {
              if (player.comboStep === 1) startHeroAttack(player, 'punch2', 2);
              else if (player.comboStep === 2) startHeroAttack(player, 'punch2', 3);
              else if (player.comboStep === 3) startHeroAttack(player, 'kick2', 4);
              else startHeroAttack(player, 'punch1', 1);
            }
          } else {
            player.stateName = 'idle';
            player.hasHitCurrentAttack = true;
            player.hasHitThisSwing = true;
            player.attackMove = undefined;
            if (player.comboStep === 4) {
              player.comboStep = 0;
              player.comboWindowTimer = 0;
            }
          }
        }
      }
    }

    // Apply player movement
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Street trash can obstacle collision
    trashCans.forEach((can) => {
      if (can.health <= 0) return;
      const isRooftop = can.type === 'rooftopTrashCan' || can.type === 'rooftopMetalBin' || can.type === 'rooftopWoodenCrate';
      const isClub = can.type === 'clubStool' || can.type === 'clubTable' || can.type === 'clubSpeaker';
      const isGarage = can.type === 'garageTire' || can.type === 'garageDrum' || can.type === 'garageCone';
      const isEnlargedPrecinct = can.type === 'precinctWaterCooler' || can.type === 'precinctChair';
      const isChair = can.type === 'penthouseBreakableChair';
      const isPenthouse = can.type === 'penthouseBreakableStatue' || can.type === 'penthouseBreakablePlant' || isChair;
      const footHalfW = isChair ? 69 : can.type === 'clubSpeaker' ? 47 : isClub ? 41 : isGarage ? (can.type === 'garageDrum' ? 36 : can.type === 'garageTire' ? 33 : 27) : (isEnlargedPrecinct || isPenthouse || isRooftop) ? 46 : 24;
      const footHalfH = isChair ? 24 : can.type === 'clubSpeaker' ? 16 : isClub ? 14 : isGarage ? 15 : (isEnlargedPrecinct || isPenthouse || isRooftop) ? 16 : 8;
      const footCenterY = can.y - (isChair ? 12 : can.type === 'clubSpeaker' ? 8 : isClub ? 7 : isGarage ? 8 : (isEnlargedPrecinct || isPenthouse || isRooftop) ? 8 : 4);
      const dx = player.x - can.x;
      const dy = player.y - footCenterY;
      if (Math.abs(dx) < footHalfW && Math.abs(dy) < footHalfH) {
        const overlapX = footHalfW - Math.abs(dx);
        const overlapY = footHalfH - Math.abs(dy);
        if (overlapX < overlapY) {
          player.x += Math.sign(dx || 1) * overlapX;
        } else {
          player.y += Math.sign(dy || 1) * overlapY;
        }
      }
    });

    const { minY: walkYMin, maxY: walkYMax } = getStageWalkableYBounds(currentStageRef.current);
    player.y = Math.max(walkYMin, Math.min(walkYMax, player.y));

    const stageTotalW = currentStageRef.current === 8 ? STAGE_8_TOTAL_WIDTH : currentStageRef.current === 7 ? STAGE_7_TOTAL_WIDTH : currentStageRef.current === 6 ? STAGE_6_TOTAL_WIDTH : currentStageRef.current >= 2 ? STAGE_2_TOTAL_WIDTH : STAGE_1_TOTAL_WIDTH;
    const currentSecWidth = currentStageRef.current === 8 ? STAGE_8_SECTOR_WIDTH : currentStageRef.current === 7 ? STAGE_7_SECTOR_WIDTH : currentStageRef.current === 6 ? STAGE_6_SECTOR_WIDTH : currentStageRef.current >= 2 ? STAGE_2_SECTOR_WIDTH : SECTOR_WIDTH;
    const sectorMinX = (currentSectorRef.current - 1) * currentSecWidth;
    const sectorMaxX = sectorMinX + currentSecWidth;
    if (currentStageRef.current === 8) {
      if (arenaLockedRef.current) {
        player.x = Math.max(cameraXRef.current + 40, Math.min(cameraXRef.current + canvasWidth - 60, player.x));
      }
      // Clamp player worldX bounds strictly within [0, canvas.width * 2]
      player.x = Math.max(40, Math.min(stageTotalW - 40, player.x));
    } else if (arenaLockedRef.current) {
      player.x = Math.max(cameraXRef.current + 40, Math.min(cameraXRef.current + canvasWidth - 60, player.x));
    } else {
      player.x = Math.max(sectorMinX + 40, Math.min(stageTotalW, player.x));
    }

    // Pick up items (briefly swaps sprite to pickupSprite for 0.25s while restoring HP / equipping weapon and adding score)
    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      const dist = Math.hypot(drop.x - player.x, drop.y - player.y);
      if (dist < 90) {
        player.pickupTimer = 0.25; // Trigger 0.25s item pickup animation
        playSFX('itemPickup');
        if (drop.type === 'food') {
          player.health = Math.min(player.maxHealth, player.health + 30);
          player.hp = player.health;
          hitVfxRef.current.push({
            x: player.x,
            y: player.y - 90,
            text: '+30 HP! (FOOD)',
            color: '#00ff88',
            timer: 0.5,
            maxTimer: 0.5,
          });
        } else if (drop.type === 'score') {
          setGameState((prev) => ({ ...prev, score: prev.score + 250 }));
          hitVfxRef.current.push({
            x: player.x,
            y: player.y - 90,
            text: '+250 SCORE!',
            color: '#ffd700',
            timer: 0.5,
            maxTimer: 0.5,
          });
        } else if (drop.type === 'snack') {
          player.health = Math.min(player.maxHealth, player.health + 46);
          player.hp = player.health;
          setGameState((prev) => ({ ...prev, score: prev.score + 250 }));
          hitVfxRef.current.push({
            x: player.x,
            y: player.y - 90,
            text: '+46 HP! (+250 PTS)',
            color: '#00ff88',
            timer: 0.5,
            maxTimer: 0.5,
          });
        } else if (drop.type === 'pipe') {
          player.hasPipe = true;
          setGameState((prev) => ({ ...prev, score: prev.score + 500 }));
          hitVfxRef.current.push({
            x: player.x,
            y: player.y - 90,
            text: 'IRON PIPE EQUIPPED! (+500 PTS)',
            color: '#00f0ff',
            timer: 0.7,
            maxTimer: 0.7,
          });
        }
        drops.splice(i, 1);
      }
    }

    // --- BULLET PROJECTILES UPDATE & LANE COLLISION ---
    const bullets = bulletsRef.current;
    for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
      const bullet = bullets[bIdx];
      bullet.x += bullet.vx * dt;

        // Check bullet collision with enemies within same Y-depth lane (±25px vertical tolerance)
        let bulletHit = false;
        for (const enemy of enemies) {
          if (enemy.health <= 0 || enemy.stateName === 'dead') continue;
          const isHk = enemy.id === 'stage4_race_boss';
          const isLeon = enemy.id === 'stage2_club_boss';
          const isBh = enemy.id === 'stage6_police_boss';
          const isVic = enemy.id === 'stage8_rooftop_boss';
          const depthTol = (isHk || isBh || isVic) ? 38 : isLeon ? 21 : 25;
          const horizTol = (isHk || isBh || isVic) ? 60 : isLeon ? 34 : 40;
          const depthDiff = Math.abs(bullet.y - enemy.y);
          const horizDiff = Math.abs(bullet.x - enemy.x);

          if (depthDiff <= depthTol && horizDiff <= horizTol) {
            bulletHit = true;
            const isShot3 = bullet.shotNumber === 3;
            const dmg = isShot3 ? 30 : 15;
            const willDefeat = enemy.health <= dmg;
            if (willDefeat) {
              if (enemy.id === 'stage2_club_boss') preloadIntermissionSet('stage2');
              if (enemy.id === 'stage4_race_boss') preloadIntermissionSet('stage4');
              if (enemy.id === 'stage6_police_boss') preloadIntermissionSet('stage6');
            }

            // Sound triggers
            playSFX('punchContact');
            if (isShot3) {
              playSFX('enemyFallLose');
            }

            enemy.health = Math.max(0, enemy.health - dmg);
            enemy.invulnTimer = isShot3 ? 0.35 : 0.20;
            enemy.windupTimer = 0;
            enemy.hasAttackToken = false;
            enemy.vx = Math.sign(bullet.vx) * (isShot3 ? 260 : 70);

            comboCountRef.current += 1;
            comboTimerRef.current = 2.5;

            const contactX = (bullet.x + enemy.x) * 0.5;
            const contactY = (isHk || isBh || isVic) ? enemy.y - 165 : isLeon ? enemy.y - 94 : enemy.y - 110;
            spawnImpact(contactX, contactY, isShot3, isShot3 ? 5.0 : 2.5, isShot3 ? 0.05 : 0);

            // Score bonus
            let pts = (dmg * 10) * Math.min(5, comboCountRef.current);
            if (isShot3 || willDefeat) {
              pts += 50 * comboCountRef.current;
            }
            setGameState((prev) => ({ ...prev, score: prev.score + pts }));

            if (willDefeat) {
              enemy.stateName = 'knockdown';
              enemy.stateTimer = 0.85;
              enemy.hasPlayedFallSound = false;
              if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
                enemy.animState = { currentAction: 'DEATH', currentFrame: 0, timer: 0 };
              }
              combatCalloutRef.current = {
                text: 'KO !!',
                isKo: true,
                fontSize: 50,
                timer: 0.85,
                maxTimer: 0.85,
              };
            } else if (isShot3) {
              // Shot 3: Knockdown on enemy with 30 POW!! (0.20s air arc + 0.65s on ground)
              enemy.stateName = 'knockdown';
              enemy.stateTimer = 0.85;
              enemy.hasPlayedFallSound = false;
              if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
                enemy.animState = { currentAction: 'HURT', currentFrame: 0, timer: 0 };
              }
              combatCalloutRef.current = {
                text: '30 POW!!',
                isKo: true,
                fontSize: 46,
                timer: 0.85,
                maxTimer: 0.85,
              };
            } else {
              // Shots 1 & 2: 15 damage with 15 POW!! pop-up
              enemy.stateName = 'hurt';
              enemy.stateTimer = 0.3;
              if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
                enemy.animState = { currentAction: 'HURT', currentFrame: 0, timer: 0 };
              }
              combatCalloutRef.current = {
                text: '15 POW!!',
                isKo: false,
                fontSize: 38,
                timer: 0.8,
                maxTimer: 0.8,
              };
            }
            break;
          }
        }

      // Check bullet collision with trash cans
      if (!bulletHit) {
        for (let cIdx = trashCans.length - 1; cIdx >= 0; cIdx--) {
          const can = trashCans[cIdx];
          if (can.health <= 0) continue;
          const isClub = can.type === 'clubStool' || can.type === 'clubTable' || can.type === 'clubSpeaker';
          const isGarage = can.type === 'garageTire' || can.type === 'garageDrum' || can.type === 'garageCone';
          const isEnlargedPrecinct = can.type === 'precinctWaterCooler' || can.type === 'precinctChair';
          const isChair = can.type === 'penthouseBreakableChair';
          const isPenthouse = can.type === 'penthouseBreakableStatue' || can.type === 'penthouseBreakablePlant' || isChair;
          const hitRadiusY = isChair ? 102 : can.type === 'clubSpeaker' ? 58 : isClub ? 52 : isGarage ? 60 : (isEnlargedPrecinct || isPenthouse) ? 68 : 30;
          const hitRadiusX = isChair ? 135 : can.type === 'clubSpeaker' ? 78 : isClub ? 69 : isGarage ? 83 : (isEnlargedPrecinct || isPenthouse) ? 90 : 40;
          if (Math.abs(bullet.y - can.y) <= hitRadiusY && Math.abs(bullet.x - can.x) <= hitRadiusX) {
            bulletHit = true;
            const isShot3 = bullet.shotNumber === 3;
            damageProp(can, cIdx, isShot3, false, isShot3 ? 30 : 15);
            break;
          }
        }
      }

      // Destroy bullet upon contact or when it leaves the screen bounds
      if (
        bulletHit ||
        bullet.x < cameraXRef.current - 120 ||
        bullet.x > cameraXRef.current + canvasWidth + 120
      ) {
        bullets.splice(bIdx, 1);
      }
    }

    // --- REINFORCEMENT TRICKLE SPAWNING SYSTEM ---
    // Strict classic Streets of Rage crowd-control & spawn pacing rules:
    // 1. Max 3-4 Enemies on Screen at Once: strictly capped at 4 concurrent enemies on screen max.
    // 2. No Early Spawns: NEVER spawn a reinforcement the instant an enemy hits 0 HP.
    //    Wait until defeated enemies finish their ground KO pose, complete their flash/fade-out animation,
    //    and are 100% removed from the canvas/array.
    // 3. Breather Delay: Only after the defeated enemy has completely finished fading out and is removed,
    //    count down an additional 0.6s breather delay before the next queue reinforcement walks in from off-screen.
    const hasDefeatedEnemies = enemies.some((e) => e.health <= 0 || e.stateName === 'dead');
    const maxSimultaneousOnScreen = 4;

    if (
      pendingEnemiesRef.current.length > 0 &&
      enemies.length < maxSimultaneousOnScreen &&
      !hasDefeatedEnemies
    ) {
      if (reinforcementTimerRef.current > 0) {
        reinforcementTimerRef.current -= dt;
      } else {
        const nextCfg = pendingEnemiesRef.current.shift();
        if (nextCfg) {
          const side: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right';
          nextCfg.spawnSide = side;
          nextCfg.entryDelay = 0.12;
          const spawnedList = createStaggeredEnemies([nextCfg], cameraXRef.current);
          if (spawnedList.length > 0) {
            enemies.push(spawnedList[0]);
          }
          // After spawning, reset 0.6s breather delay before any subsequent reinforcement
          reinforcementTimerRef.current = 0.6;
        }
      }
    } else if (hasDefeatedEnemies) {
      // Hold reinforcement timer at 0.6s while defeated enemies are still on screen / vanishing
      reinforcementTimerRef.current = 0.6;
    }

    // --- ENEMY AI & UPDATES ---
    const punkSpeed = getConfig('enemyPunkSpeed') as number;
    const bossSpeed = getConfig('enemyBossSpeed') as number;
    const { minY: currentWalkMinY, maxY: currentWalkMaxY } = getStageWalkableYBounds(currentStageRef.current);

    // Enforce strict walkable floor Y bounds across player, all enemies, and breakables every frame
    player.y = Math.max(currentWalkMinY, Math.min(currentWalkMaxY, player.y));
    enemies.forEach((enemy) => {
      enemy.y = Math.max(currentWalkMinY, Math.min(currentWalkMaxY, enemy.y));
    });
    trashCans.forEach((can) => {
      can.y = Math.max(currentWalkMinY, Math.min(currentWalkMaxY, can.y));
    });

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      enemy.animTimer += dt;

      const isPlayerGrappling = ['grab', 'grab_knee', 'knee', 'throw'].includes(player.stateName);
      const isEnemyMarkedGrabbed = Boolean(
        enemy.isGrabbed || enemy.state === 'grabbed' || enemy.stateName === 'grabbed',
      );

      if (isEnemyMarkedGrabbed) {
        if (!isPlayerGrappling || player.grabbedEnemy !== enemy) {
          enemy.isGrabbed = false;
          enemy.state = 'idle';
          enemy.stateName = 'idle';
          enemy.stateTimer = 0;
          if (player.grabbedEnemy === enemy) {
            player.grabbedEnemy = null;
          }
        }
      }

      // Update thrown projectile enemy
      if (enemy.isFlyingProjectile) {
        enemy.flyingVz = (enemy.flyingVz ?? 0) + 1200 * dt;
        enemy.flyingZ = (enemy.flyingZ ?? 0) + (enemy.flyingVz ?? 0) * dt;
        enemy.x += (enemy.flyingVx ?? 0) * dt;
        enemy.rotation = (enemy.rotation ?? 0) + Math.sign(enemy.flyingVx ?? 1) * dt * 12;

        for (const other of enemies) {
          if (
            other.id === enemy.id ||
            other.health <= 0 ||
            other.stateName === 'dead' ||
            enemy.hitEnemiesIds?.includes(other.id)
          ) {
            continue;
          }
          const isHk = other.id === 'stage4_race_boss';
          const isLeon = other.id === 'stage2_club_boss';
          const isBh = other.id === 'stage6_police_boss';
          const isVic = other.id === 'stage8_rooftop_boss';
          const dx = Math.abs(other.x - enemy.x);
          const dy = Math.abs(other.y - enemy.y);
          const hitDx = (isHk || isBh || isVic) ? 112 : isLeon ? 64 : 75;
          const hitDy = (isHk || isBh || isVic) ? 90 : isLeon ? 51 : 60;
          if (dx <= hitDx && dy <= hitDy) {
            enemy.hitEnemiesIds = enemy.hitEnemiesIds || [enemy.id];
            enemy.hitEnemiesIds.push(other.id);
            const throwDir = Math.sign(enemy.flyingVx ?? 1);
            const smashDmg = 30;
            other.health = Math.max(0, other.health - smashDmg);
            other.stateName = 'knockdown';
            other.windupTimer = 0;
            other.stateTimer = 0.85; // 0.20s air arc + 0.65s on ground
            other.hasPlayedFallSound = false;
            other.vx = throwDir * 240;
            spawnImpact(other.x, other.y - 100, true, 8.0);
            combatCalloutRef.current = {
              text: '30 BODY SLAM!',
              isKo: other.health <= 0,
              fontSize: 44,
              timer: 0.8,
              maxTimer: 0.8,
            };
          }
        }

        // Thrown enemy colliding with breakable objects
        for (let cIdx = trashCans.length - 1; cIdx >= 0; cIdx--) {
          const can = trashCans[cIdx];
          if (can.health <= 0) continue;
          const isRooftop = can.type === 'rooftopTrashCan' || can.type === 'rooftopMetalBin' || can.type === 'rooftopWoodenCrate';
          const isGarage = can.type === 'garageTire' || can.type === 'garageDrum' || can.type === 'garageCone';
          const isCasino = can.type === 'casinoStanchion' || can.type === 'casinoStool' || can.type === 'casinoTable';
          const isEnlargedPrecinct = can.type === 'precinctWaterCooler' || can.type === 'precinctChair';
          const isChair = can.type === 'penthouseBreakableChair';
          const isPenthouse = can.type === 'penthouseBreakableStatue' || can.type === 'penthouseBreakablePlant' || isChair;
          const dx = Math.abs(can.x - enemy.x);
          const dy = Math.abs(can.y - enemy.y);
          const hitDx = isChair ? 210 : (isEnlargedPrecinct || isPenthouse || isRooftop) ? 140 : (isGarage || isCasino) ? 98 : 65;
          const hitDy = isChair ? 142 : (isEnlargedPrecinct || isPenthouse || isRooftop) ? 95 : (isGarage || isCasino) ? 68 : 45;
          if (dx <= hitDx && dy <= hitDy) {
            damageProp(can, cIdx, true, false, 30);
          }
        }

        if ((enemy.flyingZ ?? 0) >= 0) {
          enemy.flyingZ = 0;
          enemy.isFlyingProjectile = false;
          enemy.isGrabbed = false;
          enemy.state = 'idle';
          enemy.rotation = 0;
          enemy.stateName = 'knockdown';
          enemy.windupTimer = 0;
          enemy.stateTimer = 0.65; // Landed on ground for 0.65s
          enemy.vx = (enemy.flyingVx ?? 0) * 0.15;
          spawnImpact(enemy.x, enemy.y - 25, true, 8.5);
          if (!enemy.hasPlayedFallSound) {
            enemy.hasPlayedFallSound = true;
            enemy.defeatSoundPlayed = true;
            playSFX('enemyFallLose');
          }
        }
        continue;
      }

      if (player.grabbedEnemy?.id === enemy.id && isPlayerGrappling && enemy.isGrabbed) {
        continue;
      }

      if (Math.abs(enemy.vx) > 5) {
        enemy.x += enemy.vx * dt;
        enemy.vx *= Math.pow(0.05, dt);
      }
      if (enemy.invulnTimer > 0) enemy.invulnTimer -= dt;

      // Knockdown and Hurt recovery state handling
      if (['hurt', 'knockdown'].includes(enemy.stateName)) {
        enemy.windupTimer = 0;
        enemy.hasAttackToken = false;

        // Fall sound plays once as the enemy lands on the deck (~0.65s remaining)
        if (enemy.stateName === 'knockdown' && !enemy.hasPlayedFallSound && enemy.stateTimer <= 0.65) {
          enemy.hasPlayedFallSound = true;
          enemy.defeatSoundPlayed = true;
          playSFX('enemyFallLose');
        }

        enemy.stateTimer -= dt;

        if (enemy.stateTimer <= 0) {
          if (enemy.health > 0) {
            // Stand back up in Idle stance with brief 0.5s wake-up invulnerability (subtle blink) and resume fighting
            enemy.stateName = 'idle';
            enemy.invulnTimer = 0.5; // 0.5s wake-up invulnerability!
            enemy.hasPlayedFallSound = false;
            enemy.cooldownTimer = 0.25;
            if (enemy.id === 'stage2_club_boss') {
              enemy.retreatTimer = 0.45;
              enemy.retreatVx = (enemy.x > player.x ? 1 : -1) * 130;
            }
            if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
              enemy.animState = { currentAction: 'IDLE', currentFrame: 0, timer: 0 };
            }
          } else {
            // HP <= 0: Final KO knockdown, transition to permanent dead state and start flash & fade out
            enemy.stateName = 'dead';
            enemy.defeatTimer = 0;
            if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
              enemy.animState = { currentAction: 'DEATH', currentFrame: 0, timer: 0 };
            }
          }
        }
        continue;
      }

      // Permanent KO Defeat state (flashes and fades out over ~2.5s)
      if (enemy.stateName === 'dead' || enemy.health <= 0) {
        enemy.windupTimer = 0;
        enemy.hasAttackToken = false;
        enemy.stateName = 'dead';
        if (!enemy.hasPlayedFallSound) {
          enemy.hasPlayedFallSound = true;
          enemy.defeatSoundPlayed = true;
          playSFX('enemyFallLose');
        }
        if (enemy.defeatTimer === undefined) {
          enemy.defeatTimer = 0;
        }
        enemy.defeatTimer += dt;

        if (enemy.defeatTimer >= 2.0) {
          enemies.splice(i, 1);
          // Set 0.6s breather delay immediately upon full removal from canvas/array
          reinforcementTimerRef.current = 0.6;
        }
        continue;
      }

      // Hold enemy AI aggression for the first 1.5 seconds of stage opening (1.8s - 0.3s = 1.5s)
      if (stageIntroTimerRef.current > 0.3) {
        enemy.windupTimer = 0;
        enemy.vx = 0;
        enemy.vy = 0;
        enemy.stateName = 'idle';
        if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
          if (enemy.animState.currentAction !== 'IDLE') {
            enemy.animState = { currentAction: 'IDLE', currentFrame: 0, timer: 0 };
          }
        }
        continue;
      }

      // Streets of Rage Attack Token System: strictly capped at 2 simultaneous active attackers max
      const maxAttackTokens = 2;

      // Ensure any enemy in hurt, knockdown, dead, entering, flying, grabbed, or cooldown state yields their token
      enemies.forEach((e) => {
        if (
          e.health <= 0 ||
          e.isEntering ||
          ['hurt', 'knockdown', 'dead'].includes(e.stateName) ||
          e.isFlyingProjectile ||
          e.isGrabbed ||
          (e.cooldownTimer ?? 0) > 0
        ) {
          e.hasAttackToken = false;
        }
      });

      const eligibleEnemies = enemies.filter(
        (e) =>
          e.health > 0 &&
          !e.isEntering &&
          !['hurt', 'knockdown', 'dead'].includes(e.stateName) &&
          !e.isFlyingProjectile &&
          !e.isGrabbed &&
          (e.cooldownTimer ?? 0) <= 0
      );

      let tokenCount = eligibleEnemies.filter((e) => e.hasAttackToken).length;
      if (tokenCount < maxAttackTokens) {
        // Sort candidates by priority: flanking Rushers when player is turned away, then closest to player
        const candidates = eligibleEnemies
          .filter((e) => !e.hasAttackToken)
          .sort((a, b) => {
            const aIsBehind = (player.facingRight && a.x < player.x) || (!player.facingRight && a.x > player.x);
            const bIsBehind = (player.facingRight && b.x < player.x) || (!player.facingRight && b.x > player.x);
            const aScore = (a.enemyVariant === 'enemy2' && aIsBehind ? -600 : 0) + Math.hypot(a.x - player.x, a.y - player.y);
            const bScore = (b.enemyVariant === 'enemy2' && bIsBehind ? -600 : 0) + Math.hypot(b.x - player.x, b.y - player.y);
            return aScore - bScore;
          });
        for (const candidate of candidates) {
          if (tokenCount >= maxAttackTokens) break;
          candidate.hasAttackToken = true;
          tokenCount++;
        }
      }

      // Update Cooldowns and Retreats
      if ((enemy.cooldownTimer ?? 0) > 0) {
        enemy.cooldownTimer = Math.max(0, (enemy.cooldownTimer ?? 0) - dt);
        if (enemy.cooldownTimer === 0) {
          enemy.hasAttackToken = false; // Token freed on cooldown end
        }
      }
      if ((enemy.retreatTimer ?? 0) > 0) {
        enemy.retreatTimer = Math.max(0, (enemy.retreatTimer ?? 0) - dt);
        enemy.x += (enemy.retreatVx ?? 0) * dt;
      }

      // Staggered Offscreen Entry Logic
      if (enemy.isEntering) {
        if ((enemy.entryDelay ?? 0) > 0) {
          enemy.entryDelay = Math.max(0, (enemy.entryDelay ?? 0) - dt);
          enemy.stateName = 'idle';
          enemy.vx = 0;
          enemy.vy = 0;
          continue;
        }

        const entrySpeed = enemy.type === 'boss' ? 112 : 125;
        const dir = enemy.spawnSide === 'left' ? 1 : -1;
        enemy.facingRight = dir > 0;
        enemy.stateName = 'walk';
        enemy.x += dir * entrySpeed * dt;

        const reachedTarget =
          (enemy.spawnSide === 'left' && enemy.x >= (enemy.targetEntryX ?? cameraXRef.current + 80)) ||
          (enemy.spawnSide === 'right' && enemy.x <= (enemy.targetEntryX ?? cameraXRef.current + canvasWidth - 80));

        if (reachedTarget) {
          enemy.isEntering = false;
        }
        continue;
      }

      // Anti-Stacking Separation Vector from fellow enemies (scaled for steady pacing)
      let avoidVx = 0;
      let avoidVy = 0;
      for (const other of enemies) {
        if (other.id === enemy.id || other.health <= 0 || other.isEntering) continue;
        const sepX = enemy.x - other.x;
        const sepY = enemy.y - other.y;
        const sepDist = Math.hypot(sepX, sepY);
        if (sepDist > 0 && sepDist < 42) {
          const force = (42 - sepDist) / 42;
          avoidVx += (sepX / sepDist) * force * 35;
          avoidVy += (sepY / sepDist) * force * 26;
        }
      }

      // Archetype Speed and Stats Configuration (Balanced Normal/Medium Arcade Setting: 0.14s windups, +20% recovery cooldowns, -15% damage)
      const isBoss = enemy.type === 'boss';
      let eSpeed = isBoss ? ((getConfig('enemyBossSpeed') as number) ?? 94) : ((getConfig('enemyPunkSpeed') as number) ?? 112);
      let eWindupDuration = 0.14;
      let eCooldownDuration = 0.90; // +20% recovery (0.75 * 1.20)
      let eDamage = 10; // -15% damage (12 * 0.85 = 10.2 -> 10)
      let eKnockback = 80;

      const isBrawler = enemy.enemyVariant === 'enemy1';
      const isRusher = enemy.enemyVariant === 'enemy2';
      const isBruiser = enemy.enemyVariant === 'enemy3';
      const isLeonBoss = enemy.id === 'stage2_club_boss';
      const isHellKageBoss = enemy.id === 'stage4_race_boss';
      const isBoneHeadBoss = enemy.id === 'stage6_police_boss';
      const isVictorBoss = enemy.id === 'stage8_rooftop_boss';
      const isVictorAbove35 = isVictorBoss && enemy.health >= enemy.maxHealth * 0.35;
      const isHitAndRun = isRusher || isHellKageBoss || isVictorAbove35;

      if (isBrawler) {
        // Standard Brawler (Combo-Recovery Punisher): ~88 px/s, 0.14s readable windup, 0.90s recovery cooldown, 10 damage (-15%)
        eSpeed = 88;
        eWindupDuration = 0.14;
        eCooldownDuration = 0.90;
        eDamage = 10;
      } else if (isRusher) {
        // Fast Punk / Rusher (Back-Attack Exploiter): ~112 px/s, 0.14s readable windup, 0.84s recovery cooldown (0.70 * 1.20), 7 damage (-15%)
        eSpeed = 112;
        eWindupDuration = 0.14;
        eCooldownDuration = 0.84;
        eDamage = 7;
      } else if (isBruiser) {
        // Heavy Bruiser (Relentless Pressure & Hit-Armor): ~62 px/s, 0.16s windup, 1.02s recovery cooldown (0.85 * 1.20), 19 damage (-15%)
        eSpeed = 62;
        eWindupDuration = 0.16;
        eCooldownDuration = 1.02;
        eDamage = 19;
        eKnockback = 240;
      }

      // Escalating Boss Archetypes
      if (isLeonBoss) {
        // Leon (Stage 2 Boss): ~88 px/s, 0.14s readable windup, 0.72s recovery cooldown (0.60 * 1.20), 20 damage (-15%)
        eSpeed = 88;
        eWindupDuration = 0.14;
        eCooldownDuration = 0.72;
        eDamage = 20;
      } else if (isHellKageBoss) {
        // Hell Kage (Stage 4 Boss): ~112 px/s, 0.14s readable windup, 0.60s recovery cooldown (0.50 * 1.20), 19 damage (-15%)
        eSpeed = 112;
        eWindupDuration = 0.14;
        eCooldownDuration = 0.60;
        eDamage = 19;
      } else if (isBoneHeadBoss) {
        // Bone Head (Stage 6 Boss): ~62 px/s, 0.16s readable windup, 0.84s recovery cooldown (0.70 * 1.20), 24 damage (-15%)
        eSpeed = 62;
        eWindupDuration = 0.16;
        eCooldownDuration = 0.84;
        eDamage = 24;
        eKnockback = 260;
      } else if (isVictorBoss) {
        // Victor (Stage 8 Final Boss): ~106 px/s (~140 px/s berserk), 0.14s readable windup (0.12s berserk), 0.60s recovery cooldown (0.42s berserk), 24 damage / 30 berserk (-15%)
        const isVictorEnraged = enemy.health < enemy.maxHealth * 0.35;
        enemy.isBerserk = isVictorEnraged;
        eSpeed = isVictorEnraged ? 140 : 106;
        eWindupDuration = isVictorEnraged ? 0.12 : 0.14;
        eCooldownDuration = isVictorEnraged ? 0.42 : 0.60;
        eDamage = isVictorEnraged ? 30 : 24;
        eKnockback = 260;
      }

      // Cap cooldowns at 1.15s maximum so regular enemies stay within ~0.85s-1.15s and bosses ~0.60s-0.85s
      eCooldownDuration = Math.min(1.15, eCooldownDuration);

      const distX = player.x - enemy.x;
      const distY = player.y - enemy.y;
      const distToPlayer = Math.hypot(distX, distY);
      enemy.facingRight = distX > 0;

      // Melee Punch Hitbox Execution State
      if (enemy.stateName === 'attack' || enemy.stateName === 'kick') {
        enemy.stateTimer -= dt;
        if (!enemy.hasHitCurrentAttack && enemy.stateTimer < 0.28) {
          const reachX = (isHellKageBoss || isBoneHeadBoss || isVictorBoss) ? 90 : isLeonBoss ? 75 : 68;
          const reachY = 22; // Strict Z-lane contact threshold
          const playerAirborne = (player.jumpZ ?? 0) < -50;

          if (
            Math.abs(distX) <= reachX &&
            Math.abs(distY) <= reachY &&
            !playerAirborne &&
            player.invulnTimer <= 0 &&
            player.stateName !== 'dead' &&
            player.stateName !== 'throw'
          ) {
            enemy.hasHitCurrentAttack = true;
            player.health = Math.max(0, player.health - eDamage);
            player.invulnTimer = 0.8;
            player.comboStep = 0;
            player.comboWindowTimer = 0;
            playSFX('playerDamage');
            spawnImpact(player.x, player.y - 85, enemy.type === 'boss' || isBruiser, enemy.type === 'boss' ? 7.5 : 4.0);

            if (player.grabbedEnemy) {
              const held = player.grabbedEnemy;
              held.isGrabbed = false;
              held.state = 'idle';
              held.stateName = 'idle';
              held.stateTimer = 0;
              player.grabbedEnemy = null;
            }

            const causesKnockdown = enemy.type === 'boss' || isBruiser || player.health <= 0;
            if (player.health <= 0) {
              player.stateName = 'dead';
              player.vx = 0;
              player.vy = 0;
              player.jumpZ = 0;
              isGroundedRef.current = true;
              musicManager.pauseMusic();
              if (continuesRef.current > 0) {
                playGameOverSting();
                setTimeout(() => {
                  if (playerRef.current.health <= 0 && gameStateRef.current.status === 'PLAYING') {
                    setShowContinueModal(true);
                    showContinueModalRef.current = true;
                  }
                }, 800);
              } else {
                setTimeout(() => {
                  setGameState((prev) => ({ ...prev, status: 'GAME_OVER' }));
                }, 1200);
              }
            } else if (causesKnockdown) {
              player.stateName = 'knockdown';
              player.stateTimer = 0.6;
              player.jumpZ = 0;
              isGroundedRef.current = true;
              player.vx = (enemy.facingRight ? 1 : -1) * eKnockback;
              screenShakeRef.current = 10;
            } else {
              player.stateName = 'hurt';
              player.stateTimer = 0.3;
              player.jumpZ = 0;
              isGroundedRef.current = true;
              player.vx = (enemy.facingRight ? 1 : -1) * 45;
              screenShakeRef.current = 5;
            }

            hitVfxRef.current.push({
              x: player.x,
              y: player.y - 70,
              text: enemy.type === 'boss' ? 'CRUSH!' : isBruiser ? 'SLAM!' : 'HIT!',
              color: '#ff3333',
              timer: 0.4,
              maxTimer: 0.4,
            });
          }
        }

        if (enemy.stateTimer <= 0) {
          enemy.stateName = 'idle';
          enemy.hasAttackToken = false; // Token surrendered upon finishing punch
          enemy.cooldownTimer = eCooldownDuration; // Post-punch recovery cooldown

          // Rusher steps back slightly after punch
          if (isRusher) {
            enemy.retreatTimer = 0.30;
            enemy.retreatVx = (enemy.x > player.x ? 1 : -1) * 112;
          }

          if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
            enemy.animState = { currentAction: 'IDLE', currentFrame: 0, timer: 0 };
          }
        }
        continue;
      }

      // Streets of Rage Rules of Engagement: Active Attacker vs Flanking / Circling
      const hasToken = Boolean(enemy.hasAttackToken);
      const isPunchCooldown = (enemy.cooldownTimer ?? 0) > 0;

      // Night Razor State Reading for Situational Attack Triggers
      const isPlayerAttacking = ['attack', 'kick'].includes(player.stateName);
      const heroAttackInfo = isPlayerAttacking ? getHeroAttackFrameKey(player) : null;
      const isPlayerRecovering = isPlayerAttacking && Boolean(heroAttackInfo?.canBufferCombo);
      const isPlayerWhiffed = isPlayerAttacking && !player.hasHitCurrentAttack && (player.attackElapsed ?? 0) > 0.12;
      const isPlayerInComboWindow = (player.comboWindowTimer ?? 0) > 0 && player.stateName === 'idle';
      const isPlayerVulnerableRecovery = isPlayerRecovering || isPlayerWhiffed || isPlayerInComboWindow;
      const isPlayerFacingAway = (player.facingRight && enemy.x < player.x) || (!player.facingRight && enemy.x > player.x);
      const isPlayerApproachingWithoutAttack =
        player.stateName === 'walk' &&
        ((player.facingRight && player.vx > 10 && enemy.x > player.x) ||
          (!player.facingRight && player.vx < -10 && enemy.x < player.x)) &&
        (player.jumpZ ?? 0) >= -10;

      const isPlayerWalkingDirectlyToward =
        player.stateName === 'walk' &&
        ((player.facingRight && player.vx > 15 && enemy.x > player.x) ||
          (!player.facingRight && player.vx < -15 && enemy.x < player.x)) &&
        distToPlayer < 240 && distToPlayer > 30;

      const isPlayerSteppingBackOrStopped =
        player.stateName !== 'walk' ||
        (enemy.x > player.x && player.vx <= 5) ||
        (enemy.x < player.x && player.vx >= -5);
      const isPlayerTurnedOrBackingOff = isPlayerFacingAway || isPlayerSteppingBackOrStopped;

      // --- HIT-AND-RUN ("RETREAT & COUNTER") AI BEHAVIOR ---
      // Type 2 (Fast Punk/Rusher), Hell Kage, and Victor (>35% HP):
      // 1. When on attack cooldown and Night Razor walks directly toward them: back-step away and reposition Z-lane to keep distance.
      if (isHitAndRun && isPunchCooldown && isPlayerWalkingDirectlyToward) {
        const retreatDir = Math.sign(enemy.x - player.x) || 1;
        const backstepSpeed = isHellKageBoss ? 135 : isVictorBoss ? 130 : 120;
        enemy.vx = retreatDir * backstepSpeed + avoidVx;

        // Reposition Z-lane to maintain spacing
        const zStep = Math.sign(enemy.y - player.y) || (enemy.id.charCodeAt(0) % 2 === 0 ? 1 : -1);
        enemy.vy = zStep * (backstepSpeed * 0.6) + avoidVy;

        enemy.x += enemy.vx * dt;
        enemy.y += enemy.vy * dt;
        enemy.facingRight = distX > 0; // Maintain facing toward player while back-stepping
        enemy.stateName = 'walk';
        continue;
      }

      // 2. The instant Night Razor turns away or backs off, immediately dash forward to counter-punch with readable ~0.13s-0.14s windup
      // (Strictly adheres to max 2 active attack tokens)
      const currentActiveTokenCount = enemies.filter((e) => e.hasAttackToken && e.health > 0 && !['hurt', 'knockdown', 'dead'].includes(e.stateName)).length;
      if (isHitAndRun && isPlayerTurnedOrBackingOff && distToPlayer < 280 && (enemy.hasAttackToken || currentActiveTokenCount < maxAttackTokens)) {
        enemy.cooldownTimer = 0; // Cancel remaining cooldown immediately
        enemy.hasAttackToken = true; // Claim attack token for counter-punch
        eSpeed = isHellKageBoss ? 150 : isVictorBoss ? 145 : 135; // Dash forward!
        eWindupDuration = 0.13; // Readable counter-punch windup
      }

      // Smart Situational Windup Tuning (Fair 0.13s-0.15s reaction window to counter, jump, or reposition)
      if (isBrawler && isPlayerVulnerableRecovery) {
        // Type 1 — Street Brawler (Combo-Recovery Punisher): 0.13s readable telegraph during recovery/whiff
        eWindupDuration = 0.13;
      } else if (isRusher && (isPlayerFacingAway || (isPlayerAttacking && !isPlayerFacingAway))) {
        // Type 2 — Fast Punk / Rusher (Back-Attack Exploiter): 0.13s telegraph when player faces away
        eWindupDuration = 0.13;
      } else if (isLeonBoss && (isPlayerVulnerableRecovery || isPlayerApproachingWithoutAttack)) {
        // Leon (Stage 2 Boss): 0.13s telegraph on recovery or direct approach
        eWindupDuration = 0.13;
      } else if (isHellKageBoss && (isPlayerFacingAway || isPlayerWhiffed || (enemy.retreatTimer ?? 0) > 0)) {
        // Hell Kage (Stage 4 Boss): 0.13s telegraph counter-punch
        eWindupDuration = 0.13;
      } else if (isVictorBoss && (isPlayerFacingAway || isPlayerVulnerableRecovery || (enemy.health < enemy.maxHealth * 0.35))) {
        // Victor (Stage 8 Final Boss): 0.13s telegraph strike
        eWindupDuration = 0.13;
      }

      // Readable reaction window cap across all enemy archetypes (~0.14s)
      if (!isBruiser && !isBoneHeadBoss) {
        eWindupDuration = Math.min(0.14, eWindupDuration);
      }

      // Determine Target Position
      let targetX = player.x;
      let targetY = player.y;

      const punchRangeX = (isHellKageBoss || isBoneHeadBoss || isVictorBoss) ? 82 : isLeonBoss ? 70 : 64;
      const isAlignedInZ = Math.abs(distY) <= 20; // Aligned within ±20px of footY
      const isWithinPunchRange = Math.abs(distX) <= punchRangeX;

      if (hasToken && !isPunchCooldown) {
        // Active attacker: aim for strict Z-lane alignment (within ±20px) and horizontal punch range
        const preferredSide = enemy.x >= player.x ? 1 : -1;
        targetX = player.x + preferredSide * (isBruiser || isBoneHeadBoss ? 46 : 54);
        targetY = player.y;

        // Hell Kage: rapid Z-lane repositioning (sharp sine wave lane switching to catch player sideways)
        if (isHellKageBoss) {
          targetY += Math.sin(Date.now() * 0.007) * 16;
        }

        // Heavy Bruiser & Bone Head: March directly into range without backing off
        if (isBruiser || isBoneHeadBoss) {
          enemy.retreatTimer = 0;
          enemy.retreatVx = 0;
        }

        // Deterministic Attack Execution: No RNG dice-rolls, strict max hesitation cap
        if (isAlignedInZ && isWithinPunchRange) {
          enemy.vx = 0;
          enemy.vy = 0;
          enemy.stateName = 'idle'; // Halts walk cycle cleanly in idle stance before punching
          enemy.windupTimer += dt;

          if (enemy.windupTimer >= eWindupDuration) {
            enemy.windupTimer = 0;
            enemy.stateName = 'attack'; // Snaps into attack frame
            enemy.stateTimer = 0.40;
            enemy.hasHitCurrentAttack = false;
            if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
              enemy.animState = { currentAction: 'ATTACK', currentFrame: 0, timer: 0 };
            }
          }
          continue;
        } else {
          // Reset windup if player moves out of range or lane before punch snaps
          enemy.windupTimer = 0;
        }
      } else {
        // Non-token holding enemy (enemies 3 and 4) or in recovery cooldown:
        // Strictly hold back outside punch range (circling/pacing at 140px-180px away and shifted off Z-lane)
        enemy.windupTimer = 0;

        const flankSign = enemy.x >= player.x ? 1 : -1;
        // Pacing distance: 160px horizontally (respectful buffer outside punch range of 64-82px)
        targetX = player.x + flankSign * 160;
        // Shifted off Z-lane: maintain 38-45px vertical depth offset so they circle outside the ±20px punch range
        const zOffsetSign = enemy.y >= player.y ? 1 : -1;
        targetY = player.y + zOffsetSign * 40 + (enemy.zLaneJitter ?? 0) * 2;

        // Holding enemies move at measured, respectful pacing speed
        eSpeed *= 0.85;
      }

      // Movement vector toward target position + anti-stacking separation force
      const toTargetX = targetX - enemy.x;
      const toTargetY = targetY - enemy.y;

      let moveDirX = 0;
      let moveDirY = 0;

      if (Math.abs(toTargetX) > 12) moveDirX = Math.sign(toTargetX);
      if (Math.abs(toTargetY) > 8) moveDirY = Math.sign(toTargetY);

      enemy.vx = moveDirX * eSpeed + avoidVx;
      enemy.vy = moveDirY * (eSpeed * 0.58) + avoidVy;

      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;

      const isMoving = Math.abs(enemy.vx) > 3 || Math.abs(enemy.vy) > 3 || moveDirX !== 0 || moveDirY !== 0;
      enemy.stateName = isMoving ? 'walk' : 'idle';

      if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
        const targetAction = isMoving ? 'WALK' : 'IDLE';
        if (enemy.animState.currentAction !== targetAction) {
          enemy.animState = { currentAction: targetAction, currentFrame: 0, timer: 0 };
        }
      }

      if (enemy.type === 'boss' && enemy.id !== 'stage2_club_boss' && enemy.id !== 'stage4_race_boss' && enemy.id !== 'stage6_police_boss' && enemy.id !== 'stage8_rooftop_boss') {
        enemy.animState = bossRendererRef.current.getNextState(enemy.animState, dt);
      }
    }

    // Check sector clear condition (strictly requires all wave quota reinforcements to have spawned and been defeated)
    const activeEnemies = enemies.filter((e) => e.health > 0);
    if (activeEnemies.length === 0 && pendingEnemiesRef.current.length === 0 && !sectorClearedRef.current) {
      sectorClearedRef.current = true;
      arenaLockedRef.current = false;

      if (currentStageRef.current === 1) {
        // Stage 1 Progression: 4 structured combat waves
        const curWave = stage1WaveRef.current;
        if (curWave >= 4) {
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: 'STAGE 1 CLEAR!',
            color: '#00f0ff',
            timer: 2.0,
            maxTimer: 2.0,
          });
          playStageClearFanfare();
          musicManager.stopMusic();
          stageClearTransitionRef.current = { active: true, timer: 3.0, fromStage: 1 };
          setGameState((prev) => ({ ...prev, score: prev.score + 5000 }));
        } else {
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: `WAVE ${curWave} CLEAR!`,
            color: '#00f0ff',
            timer: 1.5,
            maxTimer: 1.5,
          });
          rideOutActiveRef.current = true;
          rideOutPulseTimerRef.current = 0;
          rideOutBlinkCycleRef.current = -1;
          playerXAtUnlockRef.current = player.x;
        }
      } else if (currentStageRef.current === 2) {
        // Stage 2 (Nightclub Dancefloor) Progression: KEEP BOSS Leon!
        const curWave = stage2WaveRef.current;
        if (curWave === 4) {
          // Stage 2 Boss (Leon) defeated -> transitions after 3.0s stage tally into Stage 3 Intermission
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: 'LEON DEFEATED!',
            color: '#ff00aa',
            timer: 2.0,
            maxTimer: 2.0,
          });
          playStageClearFanfare();
          musicManager.stopMusic();
          preloadIntermissionSet('stage2');
          stageClearTransitionRef.current = { active: true, timer: 3.0, fromStage: 2 };
          setGameState((prev) => ({ ...prev, score: prev.score + 7500 }));
        } else {
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: `WAVE ${curWave} CLEAR! RIDE OUT >>>`,
            color: '#00f0ff',
            timer: 1.5,
            maxTimer: 1.5,
          });
          rideOutActiveRef.current = true;
          rideOutPulseTimerRef.current = 0;
          rideOutBlinkCycleRef.current = -1;
          playerXAtUnlockRef.current = player.x;
        }
      } else if (currentStageRef.current === 3) {
        // Stage 3 (Underground Parking Garage) Progression: 3 regular waves, NO boss
        const curWave = stage3WaveRef.current;
        if (curWave >= 3) {
          // Defeating the last regular enemy wave immediately triggers STAGE CLEAR!
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: 'STAGE 3 CLEAR!',
            color: '#ffd700',
            timer: 2.0,
            maxTimer: 2.0,
          });
          playStageClearFanfare();
          musicManager.stopMusic();
          stageClearTransitionRef.current = { active: true, timer: 3.0, fromStage: 3 };
          setGameState((prev) => ({ ...prev, score: prev.score + 10000 }));
        } else {
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: `WAVE ${curWave} CLEAR! RIDE OUT >>>`,
            color: '#00f0ff',
            timer: 1.5,
            maxTimer: 1.5,
          });
          rideOutActiveRef.current = true;
          rideOutPulseTimerRef.current = 0;
          rideOutBlinkCycleRef.current = -1;
          playerXAtUnlockRef.current = player.x;
        }
      } else if (currentStageRef.current === 4) {
        // Stage 4 (Downtown Street Race) Progression: KEEP BOSS Hell Kage!
        const curWave = stage4WaveRef.current;
        if (curWave === 4) {
          // Stage 4 Boss (Hell Kage) defeated -> transitions into Stage 5 Intermission after 3.0s stage tally
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: 'HELL KAGE DEFEATED!',
            color: '#00f0ff',
            timer: 2.0,
            maxTimer: 2.0,
          });
          playStageClearFanfare();
          musicManager.stopMusic();
          preloadIntermissionSet('stage4');
          stageClearTransitionRef.current = { active: true, timer: 3.0, fromStage: 4 };
          setGameState((prev) => ({ ...prev, score: prev.score + 12500 }));
        } else {
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: `WAVE ${curWave} CLEAR! RIDE OUT >>>`,
            color: '#00f0ff',
            timer: 1.5,
            maxTimer: 1.5,
          });
          rideOutActiveRef.current = true;
          rideOutPulseTimerRef.current = 0;
          rideOutBlinkCycleRef.current = -1;
          playerXAtUnlockRef.current = player.x;
        }
      } else if (currentStageRef.current === 5) {
        // Stage 5 (The Casino) Progression: 3 regular waves, NO boss
        const curWave = stage5WaveRef.current;
        if (curWave >= 3) {
          // Defeating the last regular enemy wave immediately triggers STAGE CLEAR!
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: 'STAGE 5 CLEAR!',
            color: '#ffd700',
            timer: 2.0,
            maxTimer: 2.0,
          });
          playStageClearFanfare();
          musicManager.stopMusic();
          stageClearTransitionRef.current = { active: true, timer: 3.0, fromStage: 5 };
          setGameState((prev) => ({ ...prev, score: prev.score + 15000 }));
        } else {
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: `WAVE ${curWave} CLEAR! RIDE OUT >>>`,
            color: '#00f0ff',
            timer: 1.5,
            maxTimer: 1.5,
          });
          rideOutActiveRef.current = true;
          rideOutPulseTimerRef.current = 0;
          rideOutBlinkCycleRef.current = -1;
          playerXAtUnlockRef.current = player.x;
        }
      } else if (currentStageRef.current === 6) {
        // Stage 6 (Police Precinct) Progression: KEEP BOSS Bone Head!
        const curWave = stage6WaveRef.current;
        if (curWave === 4) {
          // Stage 6 Boss (Bone Head) defeated -> Transitions into Stage 7 Intermission!
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: 'BONE HEAD DEFEATED / HEADING TO PENTHOUSE!',
            color: '#1a75ff',
            timer: 2.0,
            maxTimer: 2.0,
          });
          playStageClearFanfare();
          musicManager.stopMusic();
          preloadIntermissionSet('stage6');
          stageClearTransitionRef.current = { active: true, timer: 3.0, fromStage: 6 };
          setGameState((prev) => ({ ...prev, score: prev.score + 17500 }));
        } else {
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: `WAVE ${curWave} CLEAR! RIDE OUT >>>`,
            color: '#00f0ff',
            timer: 1.5,
            maxTimer: 1.5,
          });
          rideOutActiveRef.current = true;
          rideOutPulseTimerRef.current = 0;
          rideOutBlinkCycleRef.current = -1;
          playerXAtUnlockRef.current = player.x;
        }
      } else if (currentStageRef.current === 7) {
        // Stage 7 (Executive Penthouse) Progression: 3 regular waves, NO boss
        const curWave = stage7WaveRef.current;
        if (curWave >= 3) {
          // Defeating the last regular enemy wave immediately triggers STAGE CLEAR!
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: 'STAGE 7 CLEAR!',
            color: '#ffaa33',
            timer: 2.0,
            maxTimer: 2.0,
          });
          playStageClearFanfare();
          musicManager.stopMusic();
          stageClearTransitionRef.current = { active: true, timer: 3.0, fromStage: 7 };
          setGameState((prev) => ({ ...prev, score: prev.score + 20000 }));
        } else {
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: `WAVE ${curWave} CLEAR! RIDE OUT >>>`,
            color: '#00f0ff',
            timer: 1.5,
            maxTimer: 1.5,
          });
          rideOutActiveRef.current = true;
          rideOutPulseTimerRef.current = 0;
          rideOutBlinkCycleRef.current = -1;
          playerXAtUnlockRef.current = player.x;
        }
      } else {
        // Stage 8 (Skyscraper Rooftop) Progression: Wave 3 is the Final Boss Wave (KEEP BOSS Victor!)
        const curWave = stage8WaveRef.current;
        if (curWave === 3) {
          // Stage 8 Boss (Victor) defeated -> Trigger Post-Victor Victory Outro Slideshow!
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: 'VICTOR DEFEATED!',
            color: '#00f0ff',
            timer: 2.0,
            maxTimer: 2.0,
          });
          playStageClearFanfare();
          musicManager.stopMusic();
          victorDefeatedTransitionRef.current = {
            pending: true,
            timer: 1.2,
          };
        } else {
          hitVfxRef.current.push({
            x: player.x,
            y: 250,
            text: `WAVE ${curWave} CLEAR! RIDE OUT >>>`,
            color: '#00f0ff',
            timer: 1.5,
            maxTimer: 1.5,
          });
          rideOutActiveRef.current = true;
          rideOutPulseTimerRef.current = 0;
          rideOutBlinkCycleRef.current = -1;
          playerXAtUnlockRef.current = player.x;
        }
      }

      if (rideOutActiveRef.current) {
        rideOutChimeTimerRef.current = 0;
        playRideOutChime();
      }
    }

    // Camera follow and sector/wave transition
    // Pulse the "Ride Out" Wave-Clear Chime in sync with the blinking indicator (~every 0.8s) until Night Razor advances to the next wave zone
    if (
      rideOutActiveRef.current &&
      !arenaLockedRef.current &&
      !stageClearTransitionRef.current.active &&
      player.health > 0 &&
      gameStateRef.current.status === 'PLAYING'
    ) {
      rideOutPulseTimerRef.current += dt;
      rideOutChimeTimerRef.current += dt;
      if (rideOutChimeTimerRef.current >= 0.8) {
        rideOutChimeTimerRef.current -= 0.8;
        playRideOutChime();
      }
    } else if (arenaLockedRef.current || stageClearTransitionRef.current.active || player.health <= 0 || gameStateRef.current.status !== 'PLAYING') {
      rideOutActiveRef.current = false;
      rideOutChimeTimerRef.current = 0;
    }

    if (currentStageRef.current === 1) {
      const curWave = stage1WaveRef.current;
      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 900,
        3: 1800,
        4: 2700,
      };
      const lockX = waveLockPositions[curWave] || 0;

      if (arenaLockedRef.current) {
        targetCameraXRef.current = lockX;
      } else {
        targetCameraXRef.current = Math.max(lockX, Math.min(STAGE_1_TOTAL_WIDTH - canvasWidth, player.x - 300));
        goArrowFlashTimerRef.current += dt * 4;

        // Trigger next wave as player advances horizontally across the stage
        if (curWave === 1 && player.x >= 1150) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage1Wave(2);
        } else if (curWave === 2 && player.x >= 2050) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage1Wave(3);
        } else if (curWave === 3 && player.x >= 2950) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage1Wave(4);
        }
      }
    } else if (currentStageRef.current === 2) {
      // Stage 2 Camera & Wave Logic
      const curWave = stage2WaveRef.current;
      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 900,
        3: 1800,
        4: 2800,
      };
      const lockX = waveLockPositions[curWave] || 0;

      if (arenaLockedRef.current) {
        targetCameraXRef.current = lockX;
      } else {
        targetCameraXRef.current = Math.max(lockX, Math.min(STAGE_2_TOTAL_WIDTH - canvasWidth, player.x - 300));
        goArrowFlashTimerRef.current += dt * 4;

        // Trigger next wave as player progresses
        if (curWave === 1 && player.x >= 1150) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage2Wave(2);
        } else if (curWave === 2 && player.x >= 1850) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage2Wave(3);
        } else if (curWave === 3 && player.x >= 2800) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage2Wave(4); // Boss Wave!
        }
      }
    } else if (currentStageRef.current === 3) {
      // Stage 3 (Underground Parking Garage) Camera & Wave Logic: 3 regular waves, NO boss
      const curWave = stage3WaveRef.current;
      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 900,
        3: 1800,
      };
      const lockX = waveLockPositions[curWave] || 0;

      if (arenaLockedRef.current) {
        targetCameraXRef.current = lockX;
      } else {
        targetCameraXRef.current = Math.max(lockX, Math.min(STAGE_3_TOTAL_WIDTH - canvasWidth, player.x - 300));
        goArrowFlashTimerRef.current += dt * 4;

        // Trigger next wave as player progresses (waves 1 -> 2 and 2 -> 3)
        if (curWave === 1 && player.x >= 1150) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage3Wave(2);
        } else if (curWave === 2 && player.x >= 1850) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage3Wave(3);
        }
      }
    } else if (currentStageRef.current === 4) {
      // Stage 4 (Downtown Street Race) Camera & Wave Logic
      const curWave = stage4WaveRef.current;
      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 900,
        3: 1800,
        4: 2800,
      };
      const lockX = waveLockPositions[curWave] || 0;

      if (arenaLockedRef.current) {
        targetCameraXRef.current = lockX;
      } else {
        targetCameraXRef.current = Math.max(lockX, Math.min(STAGE_4_TOTAL_WIDTH - canvasWidth, player.x - 300));
        goArrowFlashTimerRef.current += dt * 4;

        // Trigger next wave as player progresses
        if (curWave === 1 && player.x >= 1150) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage4Wave(2);
        } else if (curWave === 2 && player.x >= 1850) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage4Wave(3);
        } else if (curWave === 3 && player.x >= 2800) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage4Wave(4); // Boss Wave!
        }
      }
    } else if (currentStageRef.current === 5) {
      // Stage 5 (The Casino) Camera & Wave Logic: 3 regular waves, NO boss
      const curWave = stage5WaveRef.current;
      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 900,
        3: 1800,
      };
      const lockX = waveLockPositions[curWave] || 0;

      if (arenaLockedRef.current) {
        targetCameraXRef.current = lockX;
      } else {
        targetCameraXRef.current = Math.max(lockX, Math.min(STAGE_5_TOTAL_WIDTH - canvasWidth, player.x - 300));
        goArrowFlashTimerRef.current += dt * 4;

        // Trigger next wave as player progresses (waves 1 -> 2 and 2 -> 3)
        if (curWave === 1 && player.x >= 1150) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage5Wave(2);
        } else if (curWave === 2 && player.x >= 1850) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage5Wave(3);
        }
      }
    } else if (currentStageRef.current === 6) {
      // Stage 6 (Police Precinct) Camera & Wave Logic
      const curWave = stage6WaveRef.current;
      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 1200,
        3: 2400,
        4: 4000,
      };
      const lockX = waveLockPositions[curWave] || 0;

      if (curWave === 4) {
        // Boss fight: lock camera horizontally at the end of final Section B (Armory/Evidence room)
        // so the room never wraps or restarts during the boss fight
        targetCameraXRef.current = 4000;
      } else if (arenaLockedRef.current) {
        targetCameraXRef.current = lockX;
      } else {
        targetCameraXRef.current = Math.max(lockX, Math.min(STAGE_6_TOTAL_WIDTH - canvasWidth, player.x - 300));
        goArrowFlashTimerRef.current += dt * 4;

        // Trigger next wave as player progresses into next room section
        if (curWave === 1 && player.x >= 1200) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage6Wave(2);
        } else if (curWave === 2 && player.x >= 2400) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage6Wave(3);
        } else if (curWave === 3 && player.x >= 3600) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage6Wave(4); // Boss Wave in final Section B Armory/Evidence room!
        }
      }
    } else if (currentStageRef.current === 7) {
      // Stage 7 (Executive Penthouse) Camera & Wave Logic: 3 regular waves, NO boss
      const curWave = stage7WaveRef.current;
      const waveLockPositions: Record<number, number> = {
        1: 0,
        2: 800,
        3: 1600,
      };
      const lockX = waveLockPositions[curWave] || 0;

      if (arenaLockedRef.current) {
        targetCameraXRef.current = lockX;
      } else {
        targetCameraXRef.current = Math.max(lockX, Math.min(STAGE_7_TOTAL_WIDTH - canvasWidth, player.x - 300));
        goArrowFlashTimerRef.current += dt * 4;

        // Trigger next wave as player progresses into next room section (800px intervals: waves 1 -> 2 and 2 -> 3)
        if (curWave === 1 && player.x >= 800) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage7Wave(2);
        } else if (curWave === 2 && player.x >= 1600) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage7Wave(3);
        }
      }
    } else {
      // Stage 8 (Skyscraper Rooftop) Camera & Wave Logic: Exactly 2 4:3 screens wide
      const curWave = stage8WaveRef.current;
      const maxCameraX = STAGE_8_SECTOR_WIDTH; // Lock camera scroll boundary to exactly canvas.width (stopping cleanly at right edge of Panel 2)

      if (curWave === 3) {
        // Boss Wave: camera locked at maxCameraX = canvas.width (Panel 2 arena)
        targetCameraXRef.current = maxCameraX;
      } else if (arenaLockedRef.current) {
        targetCameraXRef.current = curWave === 1 ? 0 : Math.min(maxCameraX, Math.max(0, player.x - 300));
      } else {
        targetCameraXRef.current = Math.max(0, Math.min(maxCameraX, player.x - 300));
        goArrowFlashTimerRef.current += dt * 4;

        // Trigger next wave as player progresses across the 2-screen length
        if (curWave === 1 && player.x >= 950) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage8Wave(2);
        } else if (curWave === 2 && player.x >= 1500) {
          rideOutActiveRef.current = false;
          rideOutChimeTimerRef.current = 0;
          initStage8Wave(3); // Boss Wave in second panel arena!
        }
      }
    }

    cameraXRef.current += (targetCameraXRef.current - cameraXRef.current) * Math.min(1, dt * 5);
  };

  // Main canvas draw loop
  const draw = (ctx: CanvasRenderingContext2D) => {
    // Lock DPR = 1 on mobile/touch viewports so iPhone Safari and mobile browsers render at full 60fps with zero retina slowdown
    const isMobileDevice =
      isMobile ||
      (typeof window !== 'undefined' &&
        (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
          'ontouchstart' in window ||
          (navigator.maxTouchPoints != null && navigator.maxTouchPoints > 0) ||
          window.innerWidth <= 900));
    const dpr = isMobileDevice ? 1 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    prepareCanvas(ctx, canvasWidth, canvasHeight, dpr);
    ctx.imageSmoothingEnabled = true;

    // Frame clear & solid backdrop to eliminate "hall of mirrors" smear trails
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = currentStageRef.current === 6 ? '#080d18' : currentStageRef.current === 5 ? '#15050b' : currentStageRef.current === 3 ? '#080a0f' : currentStageRef.current === 2 ? '#090712' : '#0a0a14';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Render custom 4:3 Title Cover filling the canvas edge-to-edge
    if (gameStateRef.current.status === 'START') {
      const cover = externalAssets['title_cover'];
      if (cover) {
        ctx.drawImage(cover, 0, 0, canvasWidth, canvasHeight);
      }
      return;
    }

    // Render custom 4:3 Game Over Screen filling the canvas edge-to-edge
    if (gameStateRef.current.status === 'GAME_OVER') {
      const gameOverCover = externalAssets['game_over_screen'];
      if (gameOverCover) {
        ctx.drawImage(gameOverCover, 0, 0, canvasWidth, canvasHeight);
      }
      return;
    }

    // Render custom 4:3 Comic Cutscene Slides filling 4:3 canvas edge-to-edge cleanly without stretching
    if (
      gameStateRef.current.status === 'INTRO_CUTSCENE' ||
      gameStateRef.current.status === 'OUTRO_CUTSCENE'
    ) {
      const isIntro = gameStateRef.current.status === 'INTRO_CUTSCENE';
      const slideIdx = cutsceneSlideRef.current;
      const slideKey = isIntro
        ? (slideIdx === 0 ? 'intro_slide_1' : slideIdx === 1 ? 'intro_slide_2' : 'intro_slide_3')
        : (slideIdx === 0 ? 'outro_slide_1' : slideIdx === 1 ? 'outro_slide_2' : 'outro_slide_3');
      const slideAsset = externalAssets[slideKey];
      if (slideAsset) {
        const natW = ('naturalWidth' in slideAsset ? slideAsset.naturalWidth : slideAsset.width) || canvasWidth;
        const natH = ('naturalHeight' in slideAsset ? slideAsset.naturalHeight : slideAsset.height) || canvasHeight;
        const scale = Math.max(canvasWidth / natW, canvasHeight / natH);
        const renderW = natW * scale;
        const renderH = natH * scale;
        const renderX = (canvasWidth - renderW) / 2;
        const renderY = (canvasHeight - renderH) / 2;
        ctx.drawImage(slideAsset, renderX, renderY, renderW, renderH);
      }
      if (blackOverlayAlphaRef.current >= 0.999) {
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
      }
      return;
    }

    // Render 2-Slide Mid-Game Intermission Cutscenes (Stage 2 -> 3, Stage 4 -> 5, Stage 6 -> 7)
    if (
      gameStateRef.current.status === 'INTERMISSION_CUTSCENE' &&
      intermissionCutsceneRef.current
    ) {
      const cur = intermissionCutsceneRef.current;
      const cfg = INTERMISSION_CONFIGS[cur.currentSet];
      const imgUrl = cur.slideIndex === 0 ? cfg.slide1Url : cfg.slide2Url;
      const directUrl = resolveDirectImageUrl(imgUrl);
      const imgAsset = intermissionImageCache[directUrl];

      if (imgAsset) {
        const natW =
          ('naturalWidth' in imgAsset ? imgAsset.naturalWidth : (imgAsset as any).width) ||
          canvasWidth;
        const natH =
          ('naturalHeight' in imgAsset ? imgAsset.naturalHeight : (imgAsset as any).height) ||
          canvasHeight;
        const scale = Math.max(canvasWidth / natW, canvasHeight / natH);
        const renderW = natW * scale;
        const renderH = natH * scale;
        const renderX = (canvasWidth - renderW) / 2;
        const renderY = (canvasHeight - renderH) / 2;
        ctx.drawImage(imgAsset, renderX, renderY, renderW, renderH);
      } else {
        loadIntermissionImage(imgUrl);
        ctx.fillStyle = '#0a0d18';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Slide 2: Pearl City Map Photo - render large, crisp bold white uppercase text with heavy black drop shadow
      if (cur.slideIndex === 1 && cur.mapText) {
        ctx.save();
        const textY = Math.round(canvasHeight * 0.82);

        // Subtle dark translucent backdrop for superior contrast and readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
        ctx.fillRect(0, textY - 32, canvasWidth, 64);

        ctx.font = 'italic 900 28px Impact, "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Heavy black drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.98)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        // Heavy black stroke
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.lineJoin = 'miter';
        ctx.strokeText(cur.mapText, canvasWidth / 2, textY);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(cur.mapText, canvasWidth / 2, textY);
        ctx.restore();
      }

      if (blackOverlayAlphaRef.current >= 0.999) {
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
      }
      return;
    }

    const shakeOffsetX = (Math.random() - 0.5) * screenShakeRef.current;
    const shakeOffsetY = (Math.random() - 0.5) * screenShakeRef.current;

    ctx.save();
    ctx.translate(shakeOffsetX, shakeOffsetY);

    const camX = cameraXRef.current;

    if (currentStageRef.current === 1) {
      // --- STAGE 1 BACKGROUND PARALLAX ---
      // Layer 1: Sky (slow parallax: factor 0.15)
      const skyAsset = externalAssets['stage1_sky'] || localAssets['stage1_sky'];
      if (skyAsset) {
        const skyNatW = 'naturalWidth' in skyAsset ? skyAsset.naturalWidth : skyAsset.width;
        const skyNatH = 'naturalHeight' in skyAsset ? skyAsset.naturalHeight : skyAsset.height;
        const skyH = canvasHeight;
        const skyW = (skyNatW / Math.max(1, skyNatH)) * skyH;
        const skyOffset = (camX * 0.15) % skyW;

        for (let x = -skyOffset - skyW; x < canvasWidth + skyW; x += skyW) {
          ctx.drawImage(skyAsset, x, 0, skyW, skyH);
        }
      } else {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        skyGrad.addColorStop(0, '#0c021f');
        skyGrad.addColorStop(0.5, '#25084a');
        skyGrad.addColorStop(1, '#110326');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      const curbScreenY = 375;

      // Layer 2: Buildings
      const bldg1Asset = externalAssets['buildingSection1'] || externalAssets['stage1_buildings'];
      const bldg2Asset = externalAssets['buildingSection2'] || bldg1Asset;

      const bldgH = 562.5 * 1.35 * 1.35 * 1.25 * 0.87 * 1.10;
      const bldgNatH = bldg1Asset ? ('naturalHeight' in bldg1Asset ? bldg1Asset.naturalHeight : bldg1Asset.height) : 450;
      const bldgLastSolid = bldg1Asset && (bldg1Asset as any)._lastSolidY != null ? (bldg1Asset as any)._lastSolidY : bldgNatH;
      const bldgBottomRatio = bldgNatH > 0 ? bldgLastSolid / bldgNatH : 1;
      const bldgY = curbScreenY - bldgH * bldgBottomRatio + 4;

      const bldgNatW = bldg1Asset ? ('naturalWidth' in bldg1Asset ? bldg1Asset.naturalWidth : bldg1Asset.width) : 800;
      const bldgW = (bldgNatW / Math.max(1, bldgNatH)) * bldgH;

      const bldgOffset = camX * 0.45;
      const startK = Math.floor((bldgOffset - canvasWidth) / bldgW) - 1;
      const endK = Math.ceil((bldgOffset + canvasWidth * 2) / bldgW) + 1;

      for (let k = startK; k <= endK; k++) {
        const drawX = k * bldgW - bldgOffset;
        if (drawX + bldgW < -100 || drawX > canvasWidth + 100) continue;

        const isBldg2 = k >= 1;
        const targetBldg = !isBldg2 ? (bldg1Asset || bldg2Asset) : (bldg2Asset || bldg1Asset);
        const targetY = isBldg2 ? bldgY - bldgH * 0.1301 : bldgY;
        if (targetBldg) {
          ctx.drawImage(targetBldg, drawX, targetY, bldgW, bldgH);
        } else {
          ctx.fillStyle = !isBldg2 ? '#170933' : '#1e0c3a';
          ctx.fillRect(drawX, targetY, bldgW, bldgH);
        }
      }

      // Layer 3: Street (Seamless alternating mirrored horizontal tiling with blended seams)
      const streetAsset = externalAssets['stage1_street'] || localAssets['stage1_street'];
      const streetNatW = streetAsset ? ('naturalWidth' in streetAsset ? streetAsset.naturalWidth : streetAsset.width) : 800;
      const streetNatH = streetAsset ? ('naturalHeight' in streetAsset ? streetAsset.naturalHeight : streetAsset.height) : 225;
      const firstSolidY = streetAsset && (streetAsset as any)._firstSolidY != null ? (streetAsset as any)._firstSolidY : 0;
      const curbRatio = streetNatH > 0 ? firstSolidY / streetNatH : 0;

      const visibleStreetH = canvasHeight - curbScreenY;
      const streetH = curbRatio > 0 && curbRatio < 0.8 ? visibleStreetH / (1 - curbRatio) : visibleStreetH;
      const streetY = canvasHeight - streetH;

      if (streetAsset) {
        const streetW = Math.round((streetNatW / Math.max(1, streetNatH)) * streetH);
        // Overlap adjacent tiles by 1px to prevent sub-pixel gap lines during camera scrolling
        const tileStep = streetW - 1;
        const startTile = Math.floor((camX - 100) / tileStep);
        const endTile = Math.ceil((camX + canvasWidth + 100) / tileStep);

        for (let i = startTile; i <= endTile; i++) {
          const drawX = i * tileStep - camX;
          if (drawX + streetW < -50 || drawX > canvasWidth + 50) continue;

          const isMirrored = ((i % 2) + 2) % 2 === 1;

          if (isMirrored) {
            ctx.save();
            ctx.translate(drawX + streetW, streetY);
            ctx.scale(-1, 1);
            ctx.drawImage(streetAsset, 0, 0, streetW + 1, streetH);
            ctx.restore();
          } else {
            ctx.drawImage(streetAsset, drawX, streetY, streetW + 1, streetH);
          }
        }

        // Soft horizontal alpha-feather gradient over vertical tile seams
        // so asphalt grain, street lines, and curb edges connect continuously with zero harsh cuts
        const seamBlendW = 28;
        for (let i = startTile; i <= endTile + 1; i++) {
          const seamX = Math.round(i * tileStep - camX);
          if (seamX + seamBlendW >= -50 && seamX - seamBlendW <= canvasWidth + 50) {
            const seamGrad = ctx.createLinearGradient(seamX - seamBlendW / 2, 0, seamX + seamBlendW / 2, 0);
            seamGrad.addColorStop(0, 'rgba(15, 12, 25, 0)');
            seamGrad.addColorStop(0.5, 'rgba(15, 12, 25, 0.22)');
            seamGrad.addColorStop(1, 'rgba(15, 12, 25, 0)');
            ctx.fillStyle = seamGrad;
            ctx.fillRect(seamX - seamBlendW / 2, curbScreenY, seamBlendW, visibleStreetH);
          }
        }
      } else {
        ctx.fillStyle = '#1e1b29';
        ctx.fillRect(0, curbScreenY, canvasWidth, visibleStreetH);
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(0, 500, canvasWidth, 6);
      }
    } else if (currentStageRef.current === 2) {
      // --- STAGE 2 (NIGHTCLUB DANCEFLOOR) BACKGROUND PARALLAX ---
      const floorTopY = Math.round(canvasHeight * 0.65) - 2; // ~388px, covering bottom 35% with 2px tuck to eliminate any seam
      const visibleFloorH = canvasHeight - floorTopY;

      // Layer 1: Unified Nightclub Background Sections (0.65x Parallax speed)
      // clubBg1 renders across first half (0 to 50% = 0 to 1800), clubBg2 continues across second half (50% to 100% = 1800 to 3600)
      const bgH = Math.round(canvasHeight * 0.65 * 1.50 * 1.30); // 30% larger (~761px)
      const bgY = -Math.round(bgH * 0.25); // Lowered 5% downward: net -25% offset from base (~ -190px)

      // Ambient top & canvas backdrop to guarantee clean coverage
      ctx.fillStyle = '#090117';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const bg1Asset = externalAssets['clubBg1'] || externalAssets['clubBg'];
      const bg2Asset = externalAssets['clubBg2'] || bg1Asset;

      const bgNatW = bg1Asset ? ('naturalWidth' in bg1Asset ? bg1Asset.naturalWidth : bg1Asset.width) : 800;
      const bgNatH = bg1Asset ? ('naturalHeight' in bg1Asset ? bg1Asset.naturalHeight : bg1Asset.height) : 450;
      const bgW = Math.round((bgNatW / Math.max(1, bgNatH)) * bgH);
      const bgOffset = camX * 0.65;

      // Section 1: clubBg1 (untouched scale & position)
      const startK1 = Math.floor((bgOffset - canvasWidth) / bgW) - 1;
      for (let k = startK1; k <= 0; k++) {
        const drawX = k * bgW - bgOffset;
        if (drawX + bgW < -100 || drawX > canvasWidth + 100) continue;

        if (bg1Asset) {
          ctx.drawImage(bg1Asset, drawX, bgY, bgW + 1, bgH);
        } else {
          const clubGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
          clubGrad.addColorStop(0, '#090117');
          clubGrad.addColorStop(0.5, '#1e053a');
          clubGrad.addColorStop(1, '#0c001f');
          ctx.fillStyle = clubGrad;
          ctx.fillRect(drawX, bgY, bgW + 1, bgH);
        }
      }

      // Section 2: clubBg2 - Second half (50% to 100%) with vertical position shifted downward by 0.01% (+0.0001 * bgH)
      const bg2Y = bgY + bgH * 0.0001;
      const s2StartX = bgW - bgOffset;
      const startJ = Math.max(0, Math.floor((-s2StartX) / bgW) - 1);
      const endJ = Math.ceil((canvasWidth - s2StartX) / bgW) + 1;

      for (let j = startJ; j <= endJ; j++) {
        const drawX2 = s2StartX + j * bgW;
        if (drawX2 + bgW < -100 || drawX2 > canvasWidth + 100) continue;

        const targetAsset = bg2Asset || bg1Asset;
        if (targetAsset) {
          ctx.drawImage(targetAsset, drawX2, bg2Y, bgW + 1, bgH);
        } else {
          const clubGrad = ctx.createLinearGradient(0, bg2Y, 0, bg2Y + bgH);
          clubGrad.addColorStop(0, '#090117');
          clubGrad.addColorStop(0.5, '#2e054a');
          clubGrad.addColorStop(1, '#0c001f');
          ctx.fillStyle = clubGrad;
          ctx.fillRect(drawX2, bg2Y, bgW + 1, bgH);
        }
      }

      // Layer 2: Walkable Sunken Dancefloor (1.0x Parallax speed, bottom 35% from behind clubBg edge)
      ctx.fillStyle = '#120524';
      ctx.fillRect(0, floorTopY, canvasWidth, visibleFloorH);

      const floorAsset = externalAssets['clubFloor'];
      if (floorAsset) {
        const floorNatW = 'naturalWidth' in floorAsset ? floorAsset.naturalWidth : floorAsset.width;
        const floorNatH = 'naturalHeight' in floorAsset ? floorAsset.naturalHeight : floorAsset.height;
        const floorFirstSolid = (floorAsset as any)._firstSolidY != null ? (floorAsset as any)._firstSolidY : 0;
        const floorTopRatio = floorNatH > 0 ? floorFirstSolid / floorNatH : 0;

        const floorH = floorTopRatio > 0 && floorTopRatio < 0.8 ? visibleFloorH / (1 - floorTopRatio) : visibleFloorH;
        const floorY = canvasHeight - floorH;
        const floorW = (floorNatW / Math.max(1, floorNatH)) * floorH;
        const floorOffset = (camX * 1.0) % floorW;

        for (let x = -floorOffset - floorW; x < canvasWidth + floorW; x += floorW) {
          ctx.drawImage(floorAsset, x, floorY, floorW, floorH);
        }
      } else {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, floorTopY, canvasWidth, visibleFloorH);
      }
    } else if (currentStageRef.current === 3) {
      // --- STAGE 3 (UNDERGROUND PARKING GARAGE) BACKGROUND & FLOOR PARALLAX ---
      ctx.fillStyle = '#080a0f';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const bgOffset = camX * 0.65;

      // Layer 1: garageBg1 & garageBg2 (Uniform Proportional Scaling - Zero Horizontal Stretching)
      // Slices top garage portion (srcY = 0, srcHeight = bgImg.height * 0.67) and computes uniform scale factor
      // (destHeight = canvas.height * 0.67, scale = destHeight / srcHeight) so destWidth = srcWidth * scale (locked 1:1 aspect ratio).
      // Placed sequentially side-by-side at their natural proportional destWidth at 0.65x parallax speed to span stage cleanly.
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      if ('imageSmoothingQuality' in ctx) {
        (ctx as any).imageSmoothingQuality = 'high';
      }

      const bgDestY = Math.round(-canvasHeight * 0.10);
      const bgDestH = canvasHeight * 0.67;

      const bg1Asset = externalAssets['garageBg1'];
      const bg2Asset = externalAssets['garageBg2'] || bg1Asset;

      const bg1NatW = bg1Asset ? ('naturalWidth' in bg1Asset ? bg1Asset.naturalWidth : bg1Asset.width) : 800;
      const bg1NatH = bg1Asset ? ('naturalHeight' in bg1Asset ? bg1Asset.naturalHeight : bg1Asset.height) : 600;
      const srcW1 = bg1NatW || 800;
      const srcH1 = (bg1NatH || 600) * 0.67;
      const scale1 = bgDestH / Math.max(1, srcH1);
      const destWidth1 = Math.max(50, Math.round(srcW1 * scale1));

      const targetAsset2 = bg2Asset || bg1Asset;
      const bg2NatW = targetAsset2 ? ('naturalWidth' in targetAsset2 ? targetAsset2.naturalWidth : targetAsset2.width) : 800;
      const bg2NatH = targetAsset2 ? ('naturalHeight' in targetAsset2 ? targetAsset2.naturalHeight : targetAsset2.height) : 600;
      const srcW2 = bg2NatW || 800;
      const srcH2 = (bg2NatH || 600) * 0.67;
      const scale2 = bgDestH / Math.max(1, srcH2);
      const destWidth2 = Math.max(50, Math.round(srcW2 * scale2));

      const pairW = destWidth1 + destWidth2;
      const startPair = Math.floor((bgOffset - 200) / pairW);
      const endPair = Math.ceil((bgOffset + canvasWidth + 200) / pairW);

      for (let p = startPair; p <= endPair; p++) {
        // Section 1: garageBg1
        const bg1WorldX = p * pairW;
        const bg1DrawX = bg1WorldX - bgOffset;
        if (bg1DrawX + destWidth1 >= -50 && bg1DrawX <= canvasWidth + 50) {
          if (bg1Asset) {
            ctx.drawImage(bg1Asset, 0, 0, srcW1, srcH1, bg1DrawX, bgDestY, destWidth1 + 1, bgDestH);
          } else {
            const garageGrad = ctx.createLinearGradient(0, bgDestY, 0, bgDestY + bgDestH);
            garageGrad.addColorStop(0, '#0c0f17');
            garageGrad.addColorStop(0.5, '#181e2b');
            garageGrad.addColorStop(1, '#0e121a');
            ctx.fillStyle = garageGrad;
            ctx.fillRect(bg1DrawX, bgDestY, destWidth1 + 1, bgDestH);
          }
        }

        // Section 2: garageBg2
        const bg2WorldX = p * pairW + destWidth1;
        const bg2DrawX = bg2WorldX - bgOffset;
        if (bg2DrawX + destWidth2 >= -50 && bg2DrawX <= canvasWidth + 50) {
          if (targetAsset2) {
            ctx.drawImage(targetAsset2, 0, 0, srcW2, srcH2, bg2DrawX, bgDestY, destWidth2 + 1, bgDestH);
          } else {
            const garageGrad = ctx.createLinearGradient(0, bgDestY, 0, bgDestY + bgDestH);
            garageGrad.addColorStop(0, '#080c14');
            garageGrad.addColorStop(0.5, '#141b26');
            garageGrad.addColorStop(1, '#0b0f17');
            ctx.fillStyle = garageGrad;
            ctx.fillRect(bg2DrawX, bgDestY, destWidth2 + 1, bgDestH);
          }
        }
      }
      ctx.restore();

      // Fluorescent Ceiling Light Flickers (Periodic subtle voltage dip: 0.05 to 0.22 cyan-white glow)
      const lightPositions = [220, 680, 1140, 1600, 2060, 2520, 2980, 3440];
      const time = Date.now() * 0.001;
      const floorDestY = Math.round(bgDestY + bgDestH) - 2;
      const floorDestH = canvasHeight - floorDestY;

      lightPositions.forEach((worldLightX, idx) => {
        const screenLightX = worldLightX - camX * 0.65;
        if (screenLightX < -150 || screenLightX > canvasWidth + 150) return;

        const dipCycle = (time * 0.35 + idx * 1.37) % 1.0;
        const inDip = dipCycle < 0.18;

        let glowAlpha = 0.16;
        if (inDip) {
          const dipJitter = Math.sin(time * 35 + idx * 7) * 0.5 + Math.cos(time * 62 + idx * 11) * 0.5;
          glowAlpha = 0.05 + Math.abs(dipJitter) * (0.22 - 0.05);
        } else {
          glowAlpha = 0.14 + Math.sin(time * 2.5 + idx * 0.8) * 0.04;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const coneGrad = ctx.createLinearGradient(screenLightX, 0, screenLightX, floorDestY);
        coneGrad.addColorStop(0, `rgba(220, 248, 255, ${glowAlpha * 1.25})`);
        coneGrad.addColorStop(0.35, `rgba(140, 230, 255, ${glowAlpha * 0.75})`);
        coneGrad.addColorStop(1, 'rgba(60, 180, 240, 0)');

        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(screenLightX - 28, 0);
        ctx.lineTo(screenLightX + 28, 0);
        ctx.lineTo(screenLightX + 160, floorDestY);
        ctx.lineTo(screenLightX - 160, floorDestY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, glowAlpha * 4.5)})`;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fillRect(screenLightX - 25, 0, 50, 4);

        ctx.restore();
      });

      // Layer 2: garageFloor (Uniform Proportional Scaling - Zero Vertical Squishing)
      // Slices concrete floor portion and computes uniform scale factor (destHeight = canvas.height * 0.35, scale = destHeight / srcHeight).
      // Sets destWidth = srcWidth * scale (exact 1:1 proportions).
      // Tiles garageFloor seamlessly left-to-right at destWidth intervals along destY (1.0x camera speed)
      // so its yellow curb meets the bottom of garageBg cleanly at 100% native crispness with zero black gap.
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      if ('imageSmoothingQuality' in ctx) {
        (ctx as any).imageSmoothingQuality = 'high';
      }

      // Concrete floor underlap guarantee to eliminate any potential hairline gap
      ctx.fillStyle = '#10141d';
      ctx.fillRect(0, floorDestY, canvasWidth, floorDestH);

      const floorAsset = externalAssets['garageFloor'];
      const floorNatW = floorAsset ? ('naturalWidth' in floorAsset ? floorAsset.naturalWidth : floorAsset.width) : 800;
      const floorNatH = floorAsset ? ('naturalHeight' in floorAsset ? floorAsset.naturalHeight : floorAsset.height) : 600;

      const floorFirstSolid = (floorAsset as any)?._firstSolidY != null && (floorAsset as any)._firstSolidY < floorNatH
        ? (floorAsset as any)._firstSolidY
        : 0;
      const floorSrcX = 0;
      const floorSrcY = floorFirstSolid;
      const floorSrcW = floorNatW || 800;
      const floorSrcH = Math.max(1, floorNatH - floorSrcY);

      const floorScale = floorDestH / Math.max(1, floorSrcH);
      const floorDestW = Math.max(50, Math.round(floorSrcW * floorScale));

      const startFloorTile = Math.floor((camX - 100) / floorDestW);
      const endFloorTile = Math.ceil((camX + canvasWidth + 100) / floorDestW);

      for (let t = startFloorTile; t <= endFloorTile; t++) {
        const floorDrawX = t * floorDestW - camX;
        if (floorDrawX + floorDestW < -50 || floorDrawX > canvasWidth + 50) continue;

        if (floorAsset) {
          ctx.drawImage(
            floorAsset,
            floorSrcX,
            floorSrcY,
            floorSrcW,
            floorSrcH,
            floorDrawX,
            floorDestY,
            floorDestW + 1,
            floorDestH
          );
        } else {
          ctx.fillStyle = '#10141d';
          ctx.fillRect(floorDrawX, floorDestY, floorDestW + 1, floorDestH);
          ctx.fillStyle = 'rgba(234, 179, 8, 0.75)';
          ctx.fillRect(floorDrawX + 20, floorDestY + 10, 10, floorDestH - 20);
        }
      }
      ctx.restore();
    } else if (currentStageRef.current === 4) {
      // --- STAGE 4 (DOWNTOWN STREET RACE) BACKGROUND PARALLAX ---
      ctx.fillStyle = '#05070e';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const curbScreenY = 385;
      const visibleFloorH = canvasHeight - curbScreenY;

      // Layer 1 — City Skyline (depth = -30): 0.15x camera speed
      const skyAsset = externalAssets['stage4_skyline'];
      if (skyAsset) {
        const skyNatW = 'naturalWidth' in skyAsset ? skyAsset.naturalWidth : skyAsset.width;
        const skyNatH = 'naturalHeight' in skyAsset ? skyAsset.naturalHeight : skyAsset.height;
        const skyH = canvasHeight;
        const skyW = (skyNatW / Math.max(1, skyNatH)) * skyH;
        const skyOffset = (camX * 0.15) % skyW;

        for (let x = -skyOffset - skyW; x < canvasWidth + skyW; x += skyW) {
          ctx.drawImage(skyAsset, x, 0, skyW + 1, skyH);
        }
      } else {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        skyGrad.addColorStop(0, '#040714');
        skyGrad.addColorStop(0.5, '#0b162c');
        skyGrad.addColorStop(1, '#050a17');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Layer 2 — Alternating Midground Buildings (depth = -20): 0.45x camera speed
      // Scaled up 1.5x (50% increase), aspect ratios locked, shifted down by an additional 7% (total 42%) canvas height
      const bldA = externalAssets['stage4_bldA'];
      const bldB = externalAssets['stage4_bldB'] || bldA;

      const bldgH = Math.round(430 * 1.5); // 645 (1.5x scale)
      const bottomY = curbScreenY + 10; // Overlaps curb by 10px to close any visible skyline gap
      const bldgYShift = Math.round(canvasHeight * 0.42); // Lowered by 42% of canvas height (shifted down additional 7%)
      const bldAY = bottomY - bldgH + bldgYShift;
      const bldBY = bottomY - bldgH + bldgYShift;

      const bldANatW = bldA ? ('naturalWidth' in bldA ? bldA.naturalWidth : bldA.width) : 800;
      const bldANatH = bldA ? ('naturalHeight' in bldA ? bldA.naturalHeight : bldA.height) : 450;
      const bldAW = Math.round((bldANatW / Math.max(1, bldANatH)) * bldgH);

      const bldBNatW = bldB ? ('naturalWidth' in bldB ? bldB.naturalWidth : bldB.width) : 800;
      const bldBNatH = bldB ? ('naturalHeight' in bldB ? bldB.naturalHeight : bldB.height) : 450;
      const bldBW = Math.round((bldBNatW / Math.max(1, bldBNatH)) * bldgH);

      const pairW = bldAW + bldBW;
      const bldgOffset = camX * 0.45;
      const startP = Math.floor((bldgOffset - canvasWidth) / pairW) - 1;
      const endP = Math.ceil((bldgOffset + canvasWidth * 2) / pairW) + 1;

      for (let p = startP; p <= endP; p++) {
        const drawXA = p * pairW - bldgOffset;
        const drawXB = drawXA + bldAW;

        if (drawXA + bldAW >= -50 && drawXA <= canvasWidth + 50) {
          if (bldA) {
            ctx.drawImage(bldA, drawXA, bldAY, bldAW + 1, bldgH);
          } else {
            ctx.fillStyle = '#0c1220';
            ctx.fillRect(drawXA, bldAY, bldAW + 1, bldgH);
          }
        }

        if (drawXB + bldBW >= -50 && drawXB <= canvasWidth + 50) {
          if (bldB) {
            ctx.drawImage(bldB, drawXB, bldBY, bldBW + 1, bldgH);
          } else {
            ctx.fillStyle = '#090f1a';
            ctx.fillRect(drawXB, bldBY, bldBW + 1, bldgH);
          }
        }
      }

      // Layer 2.5 — Storefront Neon Sign Flicker & Tuner Car Headlight Flares (depth = -19):
      // Exclusively runs during Stage 4, anchored to Midground Buildings coordinate space (0.45x camera scroll speed),
      // placed just in front of Midground Buildings Section A & B and behind Playable Asphalt Floor.
      const stage4FxTime = performance.now() * 0.001;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const drawStage4NeonSign = (
        sx: number,
        sy: number,
        rx: number,
        ry: number,
        r: number,
        g: number,
        b: number,
        seed: number
      ) => {
        // Off-screen culling: skip any glow if outside viewport
        if (sx + rx < -20 || sx - rx > canvasWidth + 20) return;

        // Subtle continuous voltage hum (opacity oscillating gently between 0.16 and 0.24)
        const hum = 0.20 + 0.04 * Math.sin(stage4FxTime * 22 + seed * 3.71);

        // Realistic 2-frame electrical neon flicker every 5 to 8s (staggered randomly per sign)
        const cycle = 5.0 + Math.abs((seed * 1.83) % 3.0);
        const t = (stage4FxTime + Math.abs(seed) * 2.7) % cycle;
        let alpha = hum;
        if (t < 0.15) {
          if (t < 0.060) {
            alpha = 0.04; // Opacity drops to 0.04 for ~60ms
          } else if (t < 0.110) {
            alpha = 0.34; // Flashes briefly to 0.34
          } else {
            alpha = hum;  // Returns to steady glow
          }
        }

        const glowCanvas = getColorGlowCanvas(r, g, b);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.drawImage(glowCanvas, sx - rx, sy - ry, rx * 2, ry * 2);
        ctx.restore();
      };

      const drawStage4Headlight = (
        hx: number,
        hy: number,
        isXenon: boolean,
        boost: number
      ) => {
        // Off-screen culling
        if (hx < -70 || hx > canvasWidth + 70) return;

        const baseRadius = 14 * boost;
        const brightness = Math.min(1.0, 0.72 * boost);
        const rCore = 255;
        const gCore = isXenon ? 250 : 225;
        const bCore = 255;
        const rHalo = isXenon ? 230 : 77;
        const gHalo = isXenon ? 247 : 166;
        const bHalo = 255;

        // 1. Soft downward light cone reflecting onto wet street curb
        const coneBottomY = curbScreenY + 20;
        const coneGrad = ctx.createLinearGradient(hx, hy, hx, coneBottomY);
        coneGrad.addColorStop(0, `rgba(${rHalo}, ${gHalo}, ${bHalo}, ${0.35 * brightness})`);
        coneGrad.addColorStop(0.5, `rgba(${rHalo}, ${gHalo}, ${bHalo}, ${0.16 * brightness})`);
        coneGrad.addColorStop(1, `rgba(${rHalo}, ${gHalo}, ${bHalo}, 0)`);

        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(hx - 2, hy);
        ctx.lineTo(hx + 2, hy);
        ctx.lineTo(hx + 26 * boost, coneBottomY);
        ctx.lineTo(hx - 26 * boost, coneBottomY);
        ctx.closePath();
        ctx.fill();

        // Wet curb reflection pool
        ctx.save();
        ctx.translate(hx, curbScreenY + 4);
        ctx.scale(1.0, 0.30);
        const reflGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 22 * boost);
        reflGrad.addColorStop(0, `rgba(${rHalo}, ${gHalo}, ${bHalo}, ${0.26 * brightness})`);
        reflGrad.addColorStop(1, `rgba(${rHalo}, ${gHalo}, ${bHalo}, 0)`);
        ctx.fillStyle = reflGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 22 * boost, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Star-flare rays (horizontal streak + vertical streak)
        const hRay = 26 * boost;
        const vRay = 15 * boost;
        ctx.strokeStyle = `rgba(${rCore}, ${gCore}, ${bCore}, ${0.65 * brightness})`;
        ctx.lineWidth = 1.7 * boost;
        ctx.beginPath();
        ctx.moveTo(hx - hRay, hy);
        ctx.lineTo(hx + hRay, hy);
        ctx.moveTo(hx, hy - vRay);
        ctx.lineTo(hx, hy + vRay);
        ctx.stroke();

        // Diagonal mini-rays
        const dRay = 10 * boost;
        ctx.strokeStyle = `rgba(${rHalo}, ${gHalo}, ${bHalo}, ${0.38 * brightness})`;
        ctx.lineWidth = 1.0 * boost;
        ctx.beginPath();
        ctx.moveTo(hx - dRay * 0.7, hy - dRay * 0.7);
        ctx.lineTo(hx + dRay * 0.7, hy + dRay * 0.7);
        ctx.moveTo(hx - dRay * 0.7, hy + dRay * 0.7);
        ctx.lineTo(hx + dRay * 0.7, hy - dRay * 0.7);
        ctx.stroke();

        // 3. Central circular glow flare
        const flareGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, Math.max(1, baseRadius));
        flareGrad.addColorStop(0, `rgba(${rCore}, ${gCore}, ${bCore}, ${0.95 * brightness})`);
        flareGrad.addColorStop(0.35, `rgba(${rHalo}, ${gHalo}, ${bHalo}, ${0.58 * brightness})`);
        flareGrad.addColorStop(1, `rgba(${rHalo}, ${gHalo}, ${bHalo}, 0)`);
        ctx.fillStyle = flareGrad;
        ctx.beginPath();
        ctx.arc(hx, hy, Math.max(1, baseRadius), 0, Math.PI * 2);
        ctx.fill();
      };

      for (let p = startP; p <= endP; p++) {
        const drawXA = p * pairW - bldgOffset;
        const drawXB = drawXA + bldAW;

        // Skip pair entirely if completely outside extended viewport
        if (drawXA + pairW < -100 || drawXA > canvasWidth + 100) continue;

        // === SECTION A (Building A) ===
        if (drawXA + bldAW >= -50 && drawXA <= canvasWidth + 50) {
          // 1. Storefront Neon Signs (Electric cyan #00F0FF, Hot pink #FF1E8E, Neon orange #FF7B00)
          // Electric Cyan #00F0FF
          drawStage4NeonSign(drawXA + 0.22 * bldAW, bldAY + 0.32 * bldgH, 48, 22, 0, 240, 255, p * 10 + 1);
          // Hot Pink #FF1E8E
          drawStage4NeonSign(drawXA + 0.52 * bldAW, bldAY + 0.26 * bldgH, 54, 24, 255, 30, 142, p * 10 + 2);
          // Neon Orange #FF7B00
          drawStage4NeonSign(drawXA + 0.82 * bldAW, bldAY + 0.38 * bldgH, 46, 20, 255, 123, 0, p * 10 + 3);

          // 2. Parked Tuner Car Headlights along curb (curbScreenY = 385)
          // Car A1: Cool-blue (#4DA6FF)
          const carA1Seed = p * 10 + 4;
          const carA1Cycle = 4.0 + Math.abs((carA1Seed * 1.57) % 3.0); // 4 to 7 seconds
          const carA1T = (stage4FxTime + Math.abs(carA1Seed) * 2.3) % carA1Cycle;
          const isCarA1Flash = (carA1T < 0.15) || (carA1T >= 0.22 && carA1T < 0.37);
          const carA1Boost = isCarA1Flash ? 1.40 : 1.0;
          const carA1X = drawXA + 0.34 * bldAW;
          const carA1Y = curbScreenY - 16;
          drawStage4Headlight(carA1X - 13, carA1Y, false, carA1Boost);
          drawStage4Headlight(carA1X + 13, carA1Y, false, carA1Boost);

          // Car A2: Xenon-white (#E6F7FF)
          const carA2Seed = p * 10 + 5;
          const carA2Cycle = 4.0 + Math.abs((carA2Seed * 1.57) % 3.0);
          const carA2T = (stage4FxTime + Math.abs(carA2Seed) * 2.3) % carA2Cycle;
          const isCarA2Flash = (carA2T < 0.15) || (carA2T >= 0.22 && carA2T < 0.37);
          const carA2Boost = isCarA2Flash ? 1.40 : 1.0;
          const carA2X = drawXA + 0.72 * bldAW;
          const carA2Y = curbScreenY - 16;
          drawStage4Headlight(carA2X - 13, carA2Y, true, carA2Boost);
          drawStage4Headlight(carA2X + 13, carA2Y, true, carA2Boost);
        }

        // === SECTION B (Building B) ===
        if (drawXB + bldBW >= -50 && drawXB <= canvasWidth + 50) {
          // 1. Storefront Neon Signs (Hot pink #FF1E8E, Electric cyan #00F0FF, Neon orange #FF7B00)
          // Hot Pink #FF1E8E
          drawStage4NeonSign(drawXB + 0.24 * bldBW, bldBY + 0.30 * bldgH, 50, 22, 255, 30, 142, p * 10 + 6);
          // Electric Cyan #00F0FF
          drawStage4NeonSign(drawXB + 0.56 * bldBW, bldBY + 0.40 * bldgH, 46, 20, 0, 240, 255, p * 10 + 7);
          // Neon Orange #FF7B00
          drawStage4NeonSign(drawXB + 0.84 * bldBW, bldBY + 0.28 * bldgH, 52, 25, 255, 123, 0, p * 10 + 8);

          // 2. Parked Tuner Car Headlights along curb
          // Car B1: Xenon-white (#E6F7FF)
          const carB1Seed = p * 10 + 9;
          const carB1Cycle = 4.0 + Math.abs((carB1Seed * 1.57) % 3.0); // 4 to 7 seconds
          const carB1T = (stage4FxTime + Math.abs(carB1Seed) * 2.3) % carB1Cycle;
          const isCarB1Flash = (carB1T < 0.15) || (carB1T >= 0.22 && carB1T < 0.37);
          const carB1Boost = isCarB1Flash ? 1.40 : 1.0;
          const carB1X = drawXB + 0.36 * bldBW;
          const carB1Y = curbScreenY - 16;
          drawStage4Headlight(carB1X - 13, carB1Y, true, carB1Boost);
          drawStage4Headlight(carB1X + 13, carB1Y, true, carB1Boost);

          // Car B2: Cool-blue (#4DA6FF)
          const carB2Seed = p * 10 + 10;
          const carB2Cycle = 4.0 + Math.abs((carB2Seed * 1.57) % 3.0);
          const carB2T = (stage4FxTime + Math.abs(carB2Seed) * 2.3) % carB2Cycle;
          const isCarB2Flash = (carB2T < 0.15) || (carB2T >= 0.22 && carB2T < 0.37);
          const carB2Boost = isCarB2Flash ? 1.40 : 1.0;
          const carB2X = drawXB + 0.78 * bldBW;
          const carB2Y = curbScreenY - 16;
          drawStage4Headlight(carB2X - 13, carB2Y, false, carB2Boost);
          drawStage4Headlight(carB2X + 13, carB2Y, false, carB2Boost);
        }
      }

      ctx.restore();

      // Layer 3 — Asphalt Street Floor (depth = -10): 1.0x camera speed
      ctx.fillStyle = '#10141e';
      ctx.fillRect(0, curbScreenY, canvasWidth, visibleFloorH);

      const floorAsset = externalAssets['stage4_floor'];
      const floorNatW = floorAsset ? ('naturalWidth' in floorAsset ? floorAsset.naturalWidth : floorAsset.width) : 800;
      const floorNatH = floorAsset ? ('naturalHeight' in floorAsset ? floorAsset.naturalHeight : floorAsset.height) : 400;

      const floorFirstSolid = (floorAsset as any)?._firstSolidY != null && (floorAsset as any)._firstSolidY < floorNatH
        ? (floorAsset as any)._firstSolidY
        : 0;
      const floorSrcH = Math.max(1, floorNatH - floorFirstSolid);
      const floorScale = visibleFloorH / floorSrcH;
      const floorDestW = Math.max(50, Math.round(floorNatW * floorScale));

      // Overlap adjacent tiles by 1px to prevent sub-pixel gap lines during camera scrolling
      const tileStep = floorDestW - 1;
      const startTile = Math.floor((camX - 100) / tileStep);
      const endTile = Math.ceil((camX + canvasWidth + 100) / tileStep);

      for (let i = startTile; i <= endTile; i++) {
        const drawX = i * tileStep - camX;
        if (drawX + floorDestW < -50 || drawX > canvasWidth + 50) continue;

        const isMirrored = ((i % 2) + 2) % 2 === 1;

        if (floorAsset) {
          if (isMirrored) {
            ctx.save();
            ctx.translate(drawX + floorDestW, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(
              floorAsset,
              0,
              floorFirstSolid,
              floorNatW,
              floorSrcH,
              0,
              curbScreenY,
              floorDestW + 1,
              visibleFloorH
            );
            ctx.restore();
          } else {
            ctx.drawImage(
              floorAsset,
              0,
              floorFirstSolid,
              floorNatW,
              floorSrcH,
              drawX,
              curbScreenY,
              floorDestW + 1,
              visibleFloorH
            );
          }
        } else {
          ctx.fillStyle = '#111520';
          ctx.fillRect(drawX, curbScreenY, floorDestW + 1, visibleFloorH);
          ctx.fillStyle = 'rgba(255, 230, 0, 0.7)';
          ctx.fillRect(drawX + 20, curbScreenY + 60, 40, 6);
        }
      }
    } else if (currentStageRef.current === 5) {
      // --- STAGE 5 (THE CASINO) BACKGROUND & FLOOR PARALLAX ---
      ctx.fillStyle = '#17040b';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const curbScreenY = 375;
      const visibleFloorH = canvasHeight - curbScreenY;

      // Layer 1 — Alternating Casino Background (depth = -20): 0.4x camera speed
      const bgA = externalAssets['casinoBgA'];
      const bgB = externalAssets['casinoBgB'] || bgA;

      const bgDestH = canvasHeight;
      const bgDestY = 0;

      const bgANatW = bgA ? ('naturalWidth' in bgA ? bgA.naturalWidth : bgA.width) : 800;
      const bgANatH = bgA ? ('naturalHeight' in bgA ? bgA.naturalHeight : bgA.height) : 450;
      const bgAW = Math.round(bgANatW * (bgDestH / Math.max(1, bgANatH)));

      const bgBNatW = bgB ? ('naturalWidth' in bgB ? bgB.naturalWidth : bgB.width) : 800;
      const bgBNatH = bgB ? ('naturalHeight' in bgB ? bgB.naturalHeight : bgB.height) : 450;
      const bgBW = Math.round(bgBNatW * (bgDestH / Math.max(1, bgBNatH)));

      const pairBgW = bgAW + bgBW - 2; // with 1px overlap per section
      const bgOffset = camX * 0.4;
      const startBgP = Math.floor((bgOffset - canvasWidth) / pairBgW) - 1;
      const endBgP = Math.ceil((bgOffset + canvasWidth * 2) / pairBgW) + 1;

      for (let p = startBgP; p <= endBgP; p++) {
        const drawXA = p * pairBgW - bgOffset;
        const drawXB = drawXA + bgAW - 1; // 1px overlap

        if (drawXA + bgAW >= -50 && drawXA <= canvasWidth + 50) {
          if (bgA) {
            ctx.drawImage(bgA, drawXA, bgDestY, bgAW + 1, bgDestH);
          } else {
            ctx.fillStyle = '#2a0914';
            ctx.fillRect(drawXA, bgDestY, bgAW + 1, bgDestH);
          }
        }

        if (drawXB + bgBW >= -50 && drawXB <= canvasWidth + 50) {
          if (bgB) {
            ctx.drawImage(bgB, drawXB, bgDestY, bgBW + 1, bgDestH);
          } else {
            ctx.fillStyle = '#220610';
            ctx.fillRect(drawXB, bgDestY, bgBW + 1, bgDestH);
          }
        }
      }

      // Layer 1.5 — Neon Sign Glow Overlays & Buzz / Flicker Animation (depth = -19):
      const neonTime = performance.now() * 0.001;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const drawNeonGlow = (
        screenX: number,
        screenY: number,
        radius: number,
        r: number,
        g: number,
        b: number,
        seed: number
      ) => {
        if (screenX + radius < 0 || screenX - radius > canvasWidth) return;

        const phase = seed * 2.39;
        let alpha = 0.22 + 0.04 * Math.sin(neonTime * 18 + phase);

        const cycle = 5.0 + Math.abs((seed * 1.73) % 3.0);
        const cycleTime = (neonTime + Math.abs(seed) * 3.1) % cycle;
        if (cycleTime < 0.15) {
          if (cycleTime < 0.06) {
            alpha = 0.05;
          } else if (cycleTime < 0.11) {
            alpha = 0.35;
          } else {
            alpha = 0.22;
          }
        }

        const glowCanvas = getColorGlowCanvas(r, g, b);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.drawImage(glowCanvas, screenX - radius, screenY - radius, radius * 2, radius * 2);
        ctx.restore();
      };

      for (let p = startBgP; p <= endBgP; p++) {
        const drawXA = p * pairBgW - bgOffset;
        const drawXB = drawXA + bgAW - 1;

        const vipX = drawXA + 0.35 * bgAW;
        const vipY = 0.22 * canvasHeight;
        drawNeonGlow(vipX, vipY, 65, 180, 50, 255, p * 4 + 1);

        const winX = drawXA + 0.65 * bgAW;
        const winY = 0.38 * canvasHeight;
        drawNeonGlow(winX - 10, winY, 55, 255, 200, 50, p * 4 + 2);
        drawNeonGlow(winX + 12, winY - 4, 48, 0, 220, 255, p * 4 + 2.5);

        const hrX = drawXB + 0.45 * bgBW;
        const hrY = 0.20 * canvasHeight;
        drawNeonGlow(hrX, hrY, 70, 255, 40, 70, p * 4 + 3);
        drawNeonGlow(hrX, hrY + 6, 42, 255, 215, 60, p * 4 + 3.2);

        const wheelX = drawXB + 0.72 * bgBW;
        const wheelY = 0.32 * canvasHeight;
        drawNeonGlow(wheelX, wheelY, 65, 255, 215, 60, p * 4 + 4);
      }

      ctx.restore();

      // Layer 2 — Alternating Playable Casino Floor (depth = -10): 1.0x camera speed
      const floorA = externalAssets['casinoFloorA'];
      const floorANatW = floorA ? ('naturalWidth' in floorA ? floorA.naturalWidth : floorA.width) : 800;
      const floorANatH = floorA ? ('naturalHeight' in floorA ? floorA.naturalHeight : floorA.height) : 600;

      const destH = canvasHeight;
      const scaleA = destH / Math.max(1, floorANatH);
      const floorW = Math.round(floorANatW * scaleA);

      const tileStep = floorW - 1;
      const startTile = Math.floor((camX - 100) / tileStep);
      const endTile = Math.ceil((camX + canvasWidth + 100) / tileStep);

      for (let i = startTile; i <= endTile; i++) {
        const drawX = i * tileStep - camX;
        if (drawX + floorW < -50 || drawX > canvasWidth + 50) continue;

        const isMirrored = ((i % 2) + 2) % 2 === 1;

        if (floorA) {
          if (isMirrored) {
            ctx.save();
            ctx.translate(drawX + floorW, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(floorA, 0, 0, floorANatW, floorANatH, 0, 0, floorW + 1, destH);
            ctx.restore();
          } else {
            ctx.drawImage(floorA, 0, 0, floorANatW, floorANatH, drawX, 0, floorW + 1, destH);
          }
        } else {
          ctx.fillStyle = '#300816';
          ctx.fillRect(drawX, 0, floorW + 1, destH);
        }
      }
    } else if (currentStageRef.current === 6) {
      // --- STAGE 6 (POLICE PRECINCT) BACKGROUND & FLOOR PARALLAX ---
      ctx.fillStyle = '#080d18';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Layer 1 — Outside Window Background (depth = -25):
      // Height covers the entire top half of the screen (top = 0 down to canvas.height * 0.55)
      // and spans seamlessly across the stage width at 0.25x horizontal parallax scroll.
      // Positioned vertically so the night skyline, police cars, and flashing lights fill window panes completely.
      const winBg = externalAssets['precinctWindowBg'];
      const winDestH = Math.round(canvasHeight * 0.55);
      if (winBg) {
        const winNatW = 'naturalWidth' in winBg ? winBg.naturalWidth : winBg.width;
        const winNatH = 'naturalHeight' in winBg ? winBg.naturalHeight : winBg.height;
        const winW = Math.round((winNatW / Math.max(1, winNatH)) * winDestH);
        const winOffset = (camX * 0.25) % winW;

        for (let x = -winOffset - winW; x < canvasWidth + winW; x += winW) {
          ctx.drawImage(winBg, x, 0, winW + 1, winDestH);
        }
      } else {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, winDestH);
        skyGrad.addColorStop(0, '#060a14');
        skyGrad.addColorStop(0.5, '#0e1828');
        skyGrad.addColorStop(1, '#080d18');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvasWidth, winDestH);
      }

      // Layer 1.5 — Alternating Red (#FF1A1A) and Blue (#1A75FF) Police Siren Flashes (depth = -22):
      // Soft, periodic additive police siren light pulses near the upper window area (visible through window panes)
      const sirenTime = performance.now() * 0.001;
      const sirenCycle = Math.floor(sirenTime / 0.45);
      const isRedPrimary = sirenCycle % 2 === 0;
      const sirenPulse = 0.75 + 0.25 * Math.sin((sirenTime % 0.45) * (Math.PI / 0.45));

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const sirenLightPoints = [
        { xRatio: 0.15, isRed: isRedPrimary },
        { xRatio: 0.38, isRed: !isRedPrimary },
        { xRatio: 0.62, isRed: isRedPrimary },
        { xRatio: 0.85, isRed: !isRedPrimary },
      ];

      sirenLightPoints.forEach((pt) => {
        const ptX = pt.xRatio * canvasWidth;
        const ptY = 110;
        const rColor = pt.isRed ? 255 : 26;
        const gColor = pt.isRed ? 26 : 117;
        const bColor = pt.isRed ? 26 : 255;
        const alpha = 0.28 * sirenPulse;

        const sirenGlow = getColorGlowCanvas(rColor, gColor, bColor);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.drawImage(sirenGlow, ptX - 220, ptY - 220, 440, 440);
        ctx.restore();
      });

      // Window bar reflection band (y: 40..190)
      const topReflGrad = ctx.createLinearGradient(0, 40, 0, 190);
      const topR = isRedPrimary ? 255 : 26;
      const topG = isRedPrimary ? 26 : 117;
      const topB = isRedPrimary ? 26 : 255;
      topReflGrad.addColorStop(0, `rgba(${topR}, ${topG}, ${topB}, ${0.12 * sirenPulse})`);
      topReflGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = topReflGrad;
      ctx.fillRect(0, 40, canvasWidth, 150);

      ctx.restore();

      // Layer 2 — Alternating Precinct Room Section A & Section B (depth = -10):
      // Enlarge Room Backgrounds by 50% (1.5x scale): destHeight = canvas.height * 1.5
      // destY = canvas.height - destHeight so bottom edge of cracked tile floor sits flush with viewport bottom.
      // Tile Section A -> Section B -> Section A -> Section B seamlessly end-to-end with 1px overlap.
      const roomA = externalAssets['precinctRoomA'];
      const roomB = externalAssets['precinctRoomB'] || roomA;

      const roomDestH = Math.round(canvasHeight * 1.5);
      const roomDestY = canvasHeight - roomDestH;

      const roomANatW = roomA ? ('naturalWidth' in roomA ? roomA.naturalWidth : roomA.width) : 800;
      const roomANatH = roomA ? ('naturalHeight' in roomA ? roomA.naturalHeight : roomA.height) : 600;
      const secAW = Math.round(roomANatW * (roomDestH / Math.max(1, roomANatH)));

      const roomBNatW = roomB ? ('naturalWidth' in roomB ? roomB.naturalWidth : roomB.width) : 800;
      const roomBNatH = roomB ? ('naturalHeight' in roomB ? roomB.naturalHeight : roomB.height) : 600;
      const secBW = Math.round(roomBNatW * (roomDestH / Math.max(1, roomBNatH)));

      const destWidth = secAW || 1200;

      const sections = [
        { type: 'A' as const, asset: roomA, w: secAW },
        { type: 'B' as const, asset: roomB, w: secBW },
        { type: 'A' as const, asset: roomA, w: secAW },
        { type: 'B' as const, asset: roomB, w: secBW },
      ];

      sections.forEach((sec, idx) => {
        const secW = sec.w || destWidth;
        const tileStartX = idx * (destWidth - 1);
        const drawX = tileStartX - camX;
        const renderW = idx === sections.length - 1 ? Math.max(secW + 2, STAGE_6_TOTAL_WIDTH - tileStartX + 20) : (secW + 1);

        if (drawX + renderW >= -100 && drawX <= canvasWidth + 100) {
          if (sec.asset) {
            ctx.drawImage(sec.asset, drawX, roomDestY, renderW, roomDestH);
          } else {
            ctx.fillStyle = sec.type === 'A' ? '#1c2230' : '#181d2a';
            ctx.fillRect(drawX, roomDestY, renderW, roomDestH);
          }
        }
      });
    } else if (currentStageRef.current === 7) {
      // --- STAGE 7 (EXECUTIVE PENTHOUSE) BACKGROUND & FLOOR PARALLAX ---
      ctx.fillStyle = '#0a0515';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Layer 1 — Purple Twilight Skyline (depth = -25):
      // Fills 100% viewport height (Y = 0 to canvasHeight) and at least 100% viewport width
      // Continuous horizontal parallax scrolling at 0.2x with alternating mirrored tiles (scaleX = -1 on odd tiles)
      const skyAsset = externalAssets['penthouseSkyline'];
      const destHeight = canvasHeight;
      const destY = 0;

      if (skyAsset) {
        const skylineImg = skyAsset;
        const skyNatW = 'naturalWidth' in skylineImg ? skylineImg.naturalWidth : skylineImg.width;
        const skyNatH = 'naturalHeight' in skylineImg ? skylineImg.naturalHeight : skylineImg.height;
        let destWidth = Math.round(skyNatW * (destHeight / Math.max(1, skyNatH)));
        if (destWidth < canvasWidth) {
          destWidth = Math.max(canvasWidth, destWidth);
        }

        const scrollOffset = (camX * 0.2) % (destWidth * 2);
        const tileStep = destWidth - 1;
        const startTile = Math.floor((camX * 0.2 - canvasWidth) / tileStep) - 1;
        const endTile = Math.ceil((camX * 0.2 + canvasWidth * 2) / tileStep) + 1;

        for (let i = startTile; i <= endTile; i++) {
          const drawX = Math.round(i * tileStep - camX * 0.2);
          if (drawX + destWidth < -50 || drawX > canvasWidth + 50) continue;

          // Tile index i: if Math.abs(i) % 2 === 1, flip horizontally with 1px overlap
          // If Math.abs(i) % 2 === 0, draw normal with 1px overlap
          const isMirrored = Math.abs(i) % 2 === 1;

          if (isMirrored) {
            ctx.save();
            ctx.translate(drawX + destWidth, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(skylineImg, 0, destY, destWidth + 1, destHeight);
            ctx.restore();
          } else {
            ctx.drawImage(skylineImg, drawX, destY, destWidth + 1, destHeight);
          }
        }
      } else {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, destHeight);
        skyGrad.addColorStop(0, '#120422');
        skyGrad.addColorStop(0.5, '#2a0845');
        skyGrad.addColorStop(1, '#0e021a');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvasWidth, destHeight);
      }

      // Layer 2 — Executive Penthouse Room A & Room B (4 x 800px rooms, depth = -10)
      const roomA = externalAssets['penthouseRoomA'];
      const roomB = externalAssets['penthouseRoomB'] || roomA;
      const roomDestH = Math.round(canvasHeight * 1.5);
      const roomDestY = canvasHeight - roomDestH;
      const secW = 800;

      const pentSections = [
        { type: 'A' as const, asset: roomA },
        { type: 'B' as const, asset: roomB },
        { type: 'A' as const, asset: roomA },
        { type: 'B' as const, asset: roomB },
      ];

      pentSections.forEach((sec, idx) => {
        const tileStartX = idx * (secW - 1);
        const drawX = tileStartX - camX;
        const renderW = idx === pentSections.length - 1 ? Math.max(secW + 2, STAGE_7_TOTAL_WIDTH - tileStartX + 20) : (secW + 1);

        if (drawX + renderW >= -100 && drawX <= canvasWidth + 100) {
          if (sec.asset) {
            ctx.drawImage(sec.asset, drawX, roomDestY, renderW, roomDestH);
          } else {
            ctx.fillStyle = sec.type === 'A' ? '#1c152b' : '#221935';
            ctx.fillRect(drawX, roomDestY, renderW, roomDestH);
          }
        }
      });

      // Ceiling recessed warm amber spotlights
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      STAGE7_SPOTLIGHT_ANCHORS.forEach((spot) => {
        const drawOriginX = spot.originX - camX;
        if (drawOriginX < -150 || drawOriginX > canvasWidth + 150) return;
        const targetX = drawOriginX + Math.tan(spot.angleRad) * canvasHeight;

        const grad = ctx.createLinearGradient(drawOriginX, 0, targetX, canvasHeight);
        grad.addColorStop(0, 'rgba(255, 200, 100, 0.25)');
        grad.addColorStop(0.3, 'rgba(255, 180, 70, 0.14)');
        grad.addColorStop(0.8, 'rgba(255, 160, 50, 0.06)');
        grad.addColorStop(1, 'rgba(255, 140, 30, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(drawOriginX - spot.widthTop / 2, 0);
        ctx.lineTo(drawOriginX + spot.widthTop / 2, 0);
        ctx.lineTo(targetX + spot.widthBottom / 2, canvasHeight);
        ctx.lineTo(targetX - spot.widthBottom / 2, canvasHeight);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();
    } else {
      // --- STAGE 8 (SKYSCRAPER ROOFTOP) BACKGROUND & FLOOR PARALLAX ---
      ctx.fillStyle = '#050711';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Layer 1 — Skyscraper Skyline (depth = -30):
      const skyAsset = externalAssets['rooftopSkyline'];
      const skyDestH = canvasHeight;
      const skyDestY = 0;

      if (skyAsset) {
        const skylineImg = skyAsset;
        const skyNatW = 'naturalWidth' in skylineImg ? skylineImg.naturalWidth : skylineImg.width;
        const skyNatH = 'naturalHeight' in skylineImg ? skylineImg.naturalHeight : skylineImg.height;
        let skyW = Math.round(skyNatW * (skyDestH / Math.max(1, skyNatH)));
        if (skyW < canvasWidth) {
          skyW = Math.max(canvasWidth, skyW);
        }

        const tileStep = skyW - 1;
        const startTile = Math.floor((camX * 0.2 - canvasWidth) / tileStep) - 1;
        const endTile = Math.ceil((camX * 0.2 + canvasWidth * 2) / tileStep) + 1;

        for (let i = startTile; i <= endTile; i++) {
          const drawX = Math.round(i * tileStep - camX * 0.2);
          if (drawX + skyW < -50 || drawX > canvasWidth + 50) continue;

          const isMirrored = Math.abs(i) % 2 === 1;

          if (isMirrored) {
            ctx.save();
            ctx.translate(drawX + skyW, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(skylineImg, 0, skyDestY, skyW + 1, skyDestH);
            ctx.restore();
          } else {
            ctx.drawImage(skylineImg, drawX, skyDestY, skyW + 1, skyDestH);
          }
        }
      } else {
        const skyGrad = ctx.createLinearGradient(0, skyDestY, 0, skyDestY + skyDestH);
        skyGrad.addColorStop(0, '#040714');
        skyGrad.addColorStop(0.5, '#0b162c');
        skyGrad.addColorStop(1, '#050a17');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Layer 2 — Rooftop Floor Section A & Section B (depth = -10):
      // Render Panel 1 (Billboard & Helipad) and Panel 2 (Rooftop Access Shed & Water Tower) exactly once without looping
      // Panel 1: worldX = 0 to canvas.width (STAGE_8_SECTOR_WIDTH)
      // Panel 2: worldX = canvas.width to canvas.width * 2 (STAGE_8_SECTOR_WIDTH to STAGE_8_TOTAL_WIDTH)
      const secA = externalAssets['rooftopSectionA'];
      const secB = externalAssets['rooftopSectionB'] || secA;
      const destHeight = Math.round(canvasHeight * 1.5);
      const destY = canvasHeight - destHeight;

      const panelWidth = STAGE_8_SECTOR_WIDTH; // 1280 (canvas.width)

      const rooftopSections = [
        { type: 'A' as const, asset: secA, worldX: 0, w: panelWidth },
        { type: 'B' as const, asset: secB, worldX: panelWidth, w: panelWidth },
      ];

      rooftopSections.forEach((sec) => {
        const drawX = Math.round(sec.worldX - camX);
        const renderW = sec.w + 1;

        if (drawX + renderW >= -100 && drawX <= canvasWidth + 100) {
          if (sec.asset) {
            ctx.drawImage(sec.asset, drawX, destY, renderW, destHeight);
          } else {
            ctx.fillStyle = sec.type === 'A' ? '#0d131f' : '#0a101b';
            ctx.fillRect(drawX, destY, renderW, destHeight);
          }
        }
      });

      // Keep the soft seam blend / gradient at worldX = canvas.width (panelWidth) where Panel 1 and Panel 2 meet
      const seamWorldX = panelWidth;
      const seamDrawX = Math.round(seamWorldX - camX);
      if (seamDrawX + 24 >= -50 && seamDrawX - 24 <= canvasWidth + 50) {
        const seamGrad = ctx.createLinearGradient(seamDrawX - 24, 0, seamDrawX + 24, 0);
        seamGrad.addColorStop(0, 'rgba(10, 15, 25, 0)');
        seamGrad.addColorStop(0.5, 'rgba(10, 15, 25, 0.45)');
        seamGrad.addColorStop(1, 'rgba(10, 15, 25, 0)');

        ctx.fillStyle = seamGrad;
        ctx.fillRect(seamDrawX - 24, destY, 48, canvasHeight - destY);
      }

      // Layer 2B — Additive warning beacons on antenna towers:
      const beaconTime = performance.now() * 0.001;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const beaconGlow = getColorGlowCanvas(255, 30, 30);
      STAGE8_BEACON_LIGHTS.forEach((beacon) => {
        const drawX = Math.round(beacon.x - camX);
        const drawY = beacon.y;
        if (drawX < -80 || drawX > canvasWidth + 80) return;

        const pulse = 0.5 + 0.5 * Math.sin(beaconTime * 4.5 + beacon.phase);
        const radius = 18 + 14 * pulse;
        const alpha = 0.45 * pulse;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 1.5));
        ctx.drawImage(beaconGlow, drawX - radius, drawY - radius, radius * 2, radius * 2);
        ctx.restore();

        ctx.fillStyle = `rgba(255, 230, 230, ${0.8 * pulse})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // World entities (Y-sorted)
    ctx.save();
    ctx.translate(-cameraXRef.current, 0);

    // Stage 2 Exclusive: Pulsing Dance Floor Light Pools (depth = -5, above floor texture, below characters)
    if (currentStageRef.current === 2) {
      const time = performance.now() * 0.001;
      const beatAngle = time * Math.PI * 4; // 120 BPM (~2 Hz, 4*pi rad/s)

      STAGE2_FLOOR_LIGHT_POOLS.forEach((pool) => {
        // Frustum culling in world coordinate space
        if (pool.x + pool.rx < camX - 60 || pool.x - pool.rx > camX + canvasWidth + 60) {
          return;
        }

        const cfg = STAGE2_POOL_COLORS[pool.color];
        const pulse = 0.78 + 0.22 * Math.sin(beatAngle + pool.phase);
        const sizeScale = 0.90 + 0.12 * Math.sin(beatAngle + pool.phase);

        const rx = pool.rx * sizeScale;
        const ry = pool.ry * sizeScale;
        const alpha = cfg.baseAlpha * pulse;

        const poolCanvas = getCachedPoolCanvas(pool.color);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = alpha;
        ctx.drawImage(poolCanvas, pool.x - rx, pool.y - ry, rx * 2, ry * 2);
        ctx.restore();
      });
    }

    const snackImg = localAssets['energy_snack'];
    const pipeImg = localAssets['iron_pipe'];
    const badgeImg = localAssets['combat_hud_badge'];

    type WorldEntity =
      | { type: 'trashCan'; y: number; item: TrashCanProp }
      | { type: 'drop'; y: number; item: DropItem }
      | { type: 'fighter'; y: number; item: Fighter }
      | { type: 'flyingDebris'; y: number; item: FlyingDebrisProp };

    const worldEntities: WorldEntity[] = [
      ...trashCansRef.current.map((tc) => ({ type: 'trashCan' as const, y: tc.y, item: tc })),
      ...dropsRef.current.map((d) => ({ type: 'drop' as const, y: d.y, item: d })),
      ...[playerRef.current, ...enemiesRef.current].map((f) => ({ type: 'fighter' as const, y: f.y, item: f })),
      ...flyingDebrisPropsRef.current.map((fd) => ({ type: 'flyingDebris' as const, y: fd.y, item: fd })),
    ];
    worldEntities.sort((a, b) => a.y - b.y);

    worldEntities.forEach((entity) => {
      if (entity.type === 'flyingDebris') {
        const prop = entity.item;
        const assetKey = PROP_ASSET_KEYS[prop.type] || 'garageTire';
        const propAsset = externalAssets[assetKey];
        if (!propAsset) return;

        const drawH = PROP_BASE_HEIGHTS[prop.type] || 65;
        const natW = 'naturalWidth' in propAsset ? propAsset.naturalWidth : propAsset.width;
        const natH = 'naturalHeight' in propAsset ? propAsset.naturalHeight : propAsset.height;
        const aspect = (natH > 0 && natW > 0) ? natW / natH : 0.8;
        const drawW = drawH * aspect;

        const alpha = Math.max(0, Math.min(1, prop.timer / prop.maxTimer));

        ctx.save();
        ctx.globalAlpha = alpha;
        const centerX = prop.x;
        const centerY = prop.y + prop.z - drawH / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(prop.rotation);
        ctx.drawImage(propAsset, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      } else if (entity.type === 'trashCan') {
        const can = entity.item;
        const assetKey = PROP_ASSET_KEYS[can.type] || 'trash_can';
        const propAsset = externalAssets[assetKey];
        const isAssetReady = Boolean(
          propAsset &&
          (
            propAsset instanceof HTMLCanvasElement ||
            (propAsset instanceof HTMLImageElement && propAsset.complete && propAsset.naturalWidth > 0) ||
            (('width' in propAsset) && propAsset.width > 0 && ('height' in propAsset) && propAsset.height > 0)
          )
        );

        if (!isAssetReady) {
          // Never draw an ugly brown fallback rectangle if the custom sprite is not ready
          return;
        }

        const drawH = PROP_BASE_HEIGHTS[can.type] || 60;
        const natW = 'naturalWidth' in propAsset! ? propAsset.naturalWidth : propAsset!.width;
        const natH = 'naturalHeight' in propAsset! ? propAsset.naturalHeight : propAsset!.height;
        const aspect = (natH > 0 && natW > 0) ? natW / natH : 0.65;
        const drawW = drawH * aspect;

        // Dark contact shadow centered directly underneath base (zero floating, sits firmly on ground)
        const isClubProp = can.type === 'clubStool' || can.type === 'clubTable' || can.type === 'clubSpeaker';
        const isGarageProp = can.type === 'garageTire' || can.type === 'garageDrum' || can.type === 'garageCone';
        const isEnlargedPrecinct = can.type === 'precinctWaterCooler' || can.type === 'precinctChair';
        const shadowWidth = drawW * (isGarageProp ? 0.9 : 0.85);
        const shadowHeight = can.type === 'clubSpeaker' ? 20 : isClubProp ? 17 : isGarageProp ? 21 : isEnlargedPrecinct ? 18 : 12;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
        ctx.beginPath();
        ctx.ellipse(can.x, can.y, shadowWidth / 2, shadowHeight / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const wobbleOffset = can.wobbleTimer > 0 ? Math.sin(can.wobbleTimer * 50) * 4 : 0;
        const drawX = can.x - drawW / 2 + wobbleOffset;
        // Anchored directly by actual bottom pixel edge onto ground Y-coordinate
        const drawY = can.y - drawH;

        ctx.save();
        ctx.drawImage(propAsset!, drawX, drawY, drawW, drawH);
        if (can.hitFlashTimer > 0) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.drawImage(propAsset!, drawX, drawY, drawW, drawH);
        }
        ctx.restore();
      } else if (entity.type === 'drop') {
        const drop = entity.item;
        if (drop.type === 'food' || drop.type === 'snack') {
          const sw = 72;
          const sh = 36;
          if (snackImg && snackImg.complete && snackImg.naturalWidth > 0) {
            ctx.drawImage(snackImg, drop.x - sw / 2, drop.y - sh, sw, sh);
          } else {
            ctx.fillStyle = '#ffaa33';
            ctx.fillRect(drop.x - sw / 2, drop.y - sh, sw, sh);
          }
        } else if (drop.type === 'score') {
          const bw = 40;
          const bh = 48;
          if (badgeImg && badgeImg.complete && badgeImg.naturalWidth > 0) {
            ctx.drawImage(badgeImg, drop.x - bw / 2, drop.y - bh, bw, bh);
          } else {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(drop.x, drop.y - 20, 18, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (drop.type === 'pipe') {
          const pw = 117;
          const ph = 22;
          if (pipeImg && pipeImg.complete && pipeImg.naturalWidth > 0) {
            ctx.drawImage(pipeImg, drop.x - pw / 2, drop.y - ph, pw, ph);
          } else {
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(drop.x - pw / 2, drop.y - ph, pw, ph);
          }
        }
      } else {
        const fighter = entity.item;
        const isPlayer = fighter.type === 'player';
        const isBoss = fighter.type === 'boss';
        const isLeon = isBoss && fighter.id === 'stage2_club_boss';
        const isHellKage = isBoss && fighter.id === 'stage4_race_boss';
        const isBoneHead = isBoss && fighter.id === 'stage6_police_boss';
        const isVictor = isBoss && fighter.id === 'stage8_rooftop_boss';
        const isEnemyDefeated = !isPlayer && !isBoss && (fighter.health <= 0 || fighter.stateName === 'dead' || fighter.stateName === 'knockdown');
        const isLeonDefeated = isLeon && (fighter.health <= 0 || fighter.stateName === 'dead');
        const isHellKageDefeated = isHellKage && (fighter.health <= 0 || fighter.stateName === 'dead');
        const isBoneHeadDefeated = isBoneHead && (fighter.health <= 0 || fighter.stateName === 'dead');
        const isVictorDefeated = isVictor && (fighter.health <= 0 || fighter.stateName === 'dead');

        if ((isEnemyDefeated || isLeonDefeated || isHellKageDefeated || isBoneHeadDefeated || isVictorDefeated) && fighter.defeatTimer != null && fighter.defeatTimer >= 1.5) {
          const blinkPhase = Math.floor((fighter.defeatTimer - 1.5) / 0.125);
          if (blinkPhase % 2 === 1) {
            return;
          }
        }

        const isPlayerDefeated = isPlayer && fighter.stateName === 'dead';
        const isPlayerKnockdown = isPlayer && fighter.stateName === 'knockdown';
        const isPlayerPickup = isPlayer && (fighter.pickupTimer ?? 0) > 0;
        const isPlayerReduced = isPlayerDefeated || isPlayerKnockdown;

        const baseW = isBoss ? 300 : 240;
        const baseH = isBoss ? 300 : 240;
        const scaleMultiplier = (isEnemyDefeated || isPlayerReduced || isPlayerPickup) ? 0.85 : 1.0;
        const spriteW = baseW * scaleMultiplier;
        const spriteH = baseH * scaleMultiplier;
        const drawX = fighter.x - spriteW / 2;
        let drawY = fighter.y - spriteH + 20;

        let airArcY = 0;
        if (fighter.stateName === 'knockdown') {
          airArcY = Math.sin((fighter.stateTimer / 0.6) * Math.PI) * 45;
          drawY -= airArcY;
        }

        if (isPlayer && fighter.jumpZ) {
          drawY += fighter.jumpZ;
        } else if (!isPlayer && fighter.flyingZ) {
          drawY += fighter.flyingZ;
        }

        if (isEnemyDefeated && !fighter.isFlyingProjectile) {
          const variant = (currentStageRef.current === 6 && !isBoss) ? 'enemy3' : (fighter.enemyVariant || 'enemy1');
          const loseKey = `${variant}_lose`;
          const loseAsset = externalAssets[loseKey] || externalAssets['enemy_lose'];
          const assetH = loseAsset ? ('naturalHeight' in loseAsset ? loseAsset.naturalHeight : loseAsset.height) : spriteH;
          const lastSolid = loseAsset && (loseAsset as any)._lastSolidY != null ? (loseAsset as any)._lastSolidY : null;
          if (lastSolid != null && assetH > 0) {
            drawY = fighter.y - (lastSolid / assetH) * spriteH + 6 - airArcY;
          } else {
            drawY = fighter.y - spriteH + (105 * 0.85) - airArcY;
          }
        } else if (isPlayerDefeated) {
          const loseAsset = externalAssets['hero_lose'];
          const assetH = loseAsset ? ('naturalHeight' in loseAsset ? loseAsset.naturalHeight : loseAsset.height) : spriteH;
          const lastSolid = loseAsset && (loseAsset as any)._lastSolidY != null ? (loseAsset as any)._lastSolidY : null;
          if (lastSolid != null && assetH > 0) {
            drawY = fighter.y - (lastSolid / assetH) * spriteH + 6;
          } else {
            drawY = fighter.y - spriteH + (105 * 0.85);
          }
        }

        // Ground shadow
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        const jumpOffset = isPlayer ? Math.abs(fighter.jumpZ ?? 0) : Math.abs(fighter.flyingZ ?? 0);
        const airScale = Math.max(0.35, 1 - jumpOffset / 280);
        const shadowRadiusX = Math.max(12, ((isBoss ? ((isHellKage || isBoneHead || isVictor) ? 69 : isLeon ? 51 : 60) : (isEnemyDefeated || isPlayerReduced) ? 58 * 0.85 : 42) - airArcY * 0.25) * airScale);
        const shadowRadiusY = Math.max(5, ((isBoss ? ((isHellKage || isBoneHead || isVictor) ? 23 : isLeon ? 19 : 22) : (isEnemyDefeated || isPlayerReduced) ? 12 * 0.85 : 14) - airArcY * 0.1) * airScale);
        ctx.ellipse(fighter.x, fighter.y, shadowRadiusX, shadowRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Enemy windup cue (strictly suppressed when enemy is defeated, dying, dead, knocked down, hurt, grabbed, or thrown)
        const isEnemyDownOrDefeated =
          fighter.health <= 0 ||
          (fighter.hp !== undefined && fighter.hp <= 0) ||
          fighter.stateName === 'dead' ||
          fighter.stateName === 'knockdown' ||
          fighter.stateName === 'hurt' ||
          fighter.state === 'dead' ||
          fighter.state === 'down' ||
          fighter.state === 'knockdown' ||
          fighter.isFlyingProjectile ||
          Boolean(fighter.isGrabbed) ||
          (fighter.defeatTimer !== undefined && fighter.defeatTimer > 0);

        // Enemy windup cue (strictly suppressed for bosses like Victor and Bone Head, and when defeated/down)
        const isTelegraphSuppressed =
          isBoss ||
          isVictor ||
          isBoneHead ||
          isHellKage ||
          isLeon ||
          fighter.id === 'stage8_rooftop_boss' ||
          fighter.id === 'stage6_police_boss' ||
          fighter.id === 'stage4_race_boss' ||
          fighter.id === 'stage2_club_boss';

        if (!isPlayer && !isEnemyDownOrDefeated && !isTelegraphSuppressed && fighter.windupTimer > 0) {
          ctx.save();
          ctx.fillStyle = 'rgba(255, 230, 0, 0.5)';
          ctx.beginPath();
          const cueY = fighter.y - 140;
          ctx.arc(fighter.x, cueY, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (isPlayer && fighter.invulnTimer > 0 && fighter.stateName !== 'hurt' && Math.floor(Date.now() / 80) % 2 === 0) {
          return;
        }

        ctx.save();
        // Subtle wake-up invulnerability blink for standing enemies
        if (!isPlayer && fighter.invulnTimer > 0 && fighter.health > 0 && fighter.stateName !== 'knockdown' && fighter.stateName !== 'hurt') {
          if (Math.floor(Date.now() / 70) % 2 === 0) {
            ctx.globalAlpha = 0.45;
          }
        }

        if (!fighter.facingRight) {
          ctx.translate(fighter.x, drawY);
          ctx.scale(-1, 1);
          ctx.translate(-fighter.x, -drawY);
        }

        if (isPlayer) {
          let frameKey = 'hero_idle_1';
          if (fighter.stateName === 'dead') {
            frameKey = 'hero_lose';
          } else if (fighter.stateName === 'knockdown') {
            frameKey = 'hero_damage_midfall';
          } else if (fighter.stateName === 'hurt') {
            frameKey = 'hero_damage';
          } else if ((fighter.pickupTimer ?? 0) > 0) {
            frameKey = 'pickupSprite';
          } else if (fighter.stateName === 'special') {
            const elapsed = fighter.specialElapsed ?? 0;
            if (elapsed < 0.14) {
              frameKey = 'gunPose1Sprite';
            } else if (elapsed < 0.28) {
              frameKey = 'gunPose2Sprite';
            } else {
              frameKey = 'gunPose3Sprite';
            }
          } else if (fighter.stateName === 'jump') {
            frameKey = 'hero_jump';
          } else if (fighter.stateName === 'jump_punch') {
            frameKey = 'hero_jumppunch';
          } else if (fighter.stateName === 'jump_kick') {
            frameKey = 'hero_jumpkick';
          } else if (fighter.stateName === 'grab') {
            frameKey = 'hero_grab';
          } else if (fighter.stateName === 'grab_knee') {
            frameKey = 'hero_knee';
          } else if (fighter.stateName === 'throw') {
            frameKey = 'hero_throw';
          } else if (['attack', 'kick'].includes(fighter.stateName)) {
            frameKey = getHeroAttackFrameKey(fighter).frameKey;
          } else if (fighter.stateName === 'walk') {
            const walkCycle = ['hero_walk_1', 'hero_walk_2', 'hero_walk_3', 'hero_walk_4'];
            frameKey = walkCycle[Math.floor(fighter.animTimer / 0.12) % 4];
          } else {
            const idleCycle = ['hero_idle_1', 'hero_idle_2'];
            frameKey = idleCycle[Math.floor(fighter.animTimer / 0.35) % 2];
          }

          const heroAsset = externalAssets[frameKey];
          if (heroAsset) {
            const isAttackFrame = [
              'hero_punch_smear',
              'hero_punch_1',
              'hero_punch1_follow',
              'hero_load',
              'hero_pull',
              'hero_punch2_smear',
              'hero_punch_2',
              'hero_punch2_follow',
              'hero_kick_kneel',
              'hero_kick_spring',
              'hero_kick_smear',
              'hero_kick_2',
              'hero_kick_1',
            ].includes(frameKey);

            if (isAttackFrame) {
              const BASE_HERO_ATTACK_HEIGHT = 145;
              const natW =
                (heroAsset as any).naturalWidth ||
                heroAsset.width ||
                ('naturalWidth' in heroAsset ? (heroAsset as any).naturalWidth : 0) ||
                1;
              const natH =
                (heroAsset as any).naturalHeight ||
                heroAsset.height ||
                ('naturalHeight' in heroAsset ? (heroAsset as any).naturalHeight : 0) ||
                1;

              const cropX = (heroAsset as any)._cropX ?? 0;
              const cropY = (heroAsset as any)._cropY ?? 0;
              const cropW = (heroAsset as any)._cropW ?? natW;
              const cropH = (heroAsset as any)._cropH ?? natH;

              const sourceWidth = cropW > 0 ? cropW : natW;
              const sourceHeight = cropH > 0 ? cropH : natH;

              // Determine attack move group and its reference Hit frame
              let attackGroup: 'punch1' | 'punch2' | 'kick2' | 'kick1' = 'punch1';
              if (['hero_punch_2', 'hero_punch2_smear', 'hero_punch2_follow', 'hero_pull'].includes(frameKey)) {
                attackGroup = 'punch2';
              } else if (['hero_kick_2', 'hero_kick_kneel', 'hero_kick_spring', 'hero_kick_smear'].includes(frameKey)) {
                attackGroup = 'kick2';
              } else if (frameKey === 'hero_kick_1') {
                attackGroup = 'kick1';
              } else if (frameKey === 'hero_load') {
                attackGroup = (fighter.attackMove === 'punch2' || fighter.comboStep === 2 || fighter.comboStep === 3) ? 'punch2' : 'punch1';
              } else {
                attackGroup = 'punch1';
              }

              const isKick = attackGroup === 'kick1' || attackGroup === 'kick2';
              // Punch multiplier: +10% -> 1.125 * 1.10 = 1.2375x
              // Kick multiplier: +20% -> 1.125 * 1.20 = 1.35x
              const attackScaleMultiplier = isKick ? 1.35 : 1.2375;
              const TARGET_HERO_HEIGHT = Math.round(BASE_HERO_ATTACK_HEIGHT * attackScaleMultiplier);

              let refHitKey = 'hero_punch_1';
              if (attackGroup === 'punch2') {
                refHitKey = 'hero_punch_2';
              } else if (attackGroup === 'kick2') {
                refHitKey = 'hero_kick_2';
              } else if (attackGroup === 'kick1') {
                refHitKey = 'hero_kick_1';
              }

              const refHitAsset = externalAssets[refHitKey] || externalAssets['hero_punch_1'];
              const refHitCropH = (refHitAsset as any)?._cropH || (refHitAsset as any)?._charH || BASE_HERO_ATTACK_HEIGHT;

              // Scale each tween frame proportionally so its visible rendered height matches target Hit frame height
              // (or proportional pose height for crouch/spring)
              const isCrouchOrSpring = frameKey === 'hero_kick_kneel' || frameKey === 'hero_kick_spring';
              const drawHeight = isCrouchOrSpring
                ? Math.round(sourceHeight * (TARGET_HERO_HEIGHT / Math.max(1, refHitCropH)))
                : TARGET_HERO_HEIGHT;

              // Lock True Natural Aspect Ratio: drawWidth = Math.round(drawHeight * (sourceWidth / sourceHeight))
              const nativeAspectRatio = sourceWidth / Math.max(1, sourceHeight);
              const drawWidth = Math.round(drawHeight * nativeAspectRatio);

              // Anchor by bottom-most visible pixel (footY) and center horizontally
              const footY = fighter.y + (fighter.jumpZ ?? 0);
              const destY = Math.round(footY - drawHeight);
              const destX = Math.round(fighter.x - drawWidth / 2);

              ctx.drawImage(heroAsset, cropX, cropY, cropW, cropH, destX, destY, drawWidth, drawHeight);
            } else {
              ctx.drawImage(heroAsset, drawX, drawY, spriteW, spriteH);
            }
          } else {
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(drawX, drawY, spriteW, spriteH);
          }
        } else if (isLeon) {
          let frameKey = 'leon_idle_1';
          if (fighter.health <= 0 || fighter.stateName === 'dead' || fighter.stateName === 'knockdown') {
            frameKey = 'leon_knockdown';
          } else if (fighter.stateName === 'hurt') {
            frameKey = 'leon_hurt';
          } else if (fighter.stateName === 'attack' || fighter.stateName === 'kick') {
            frameKey = 'leon_punch';
          } else if (fighter.stateName === 'walk') {
            const step = (Math.floor(fighter.animTimer / 0.115) % 4) + 1;
            frameKey = `leon_walk_${step}`;
          } else {
            const step = (Math.floor(fighter.animTimer / 0.4) % 2) + 1;
            frameKey = `leon_idle_${step}`;
          }

          const leonAsset = externalAssets[frameKey];
          if (leonAsset) {
            const natW = 'naturalWidth' in leonAsset ? leonAsset.naturalWidth : leonAsset.width;
            const natH = 'naturalHeight' in leonAsset ? leonAsset.naturalHeight : leonAsset.height;
            const aspect = (natH > 0 && natW > 0) ? natW / natH : 1.0;
            // Proportion: shrunk by 15% (0.85x multiplier)
            const isKnockedDown = fighter.health <= 0 || fighter.stateName === 'dead' || fighter.stateName === 'knockdown';
            const leonH = Math.round((isKnockedDown ? 210 : 265) * 0.85);
            const leonW = leonH * aspect;

            // Anchor by bottom-center: footY = fighter.y firmly planted on the dance floor
            const lDrawX = fighter.x - leonW / 2;
            const lastSolid = (leonAsset as any)._lastSolidY;
            let lDrawY = fighter.y - leonH;
            if (lastSolid != null && natH > 0 && lastSolid > 0) {
              lDrawY = fighter.y - (lastSolid / natH) * leonH;
            }
            if (fighter.stateName === 'knockdown') {
              lDrawY -= airArcY;
            }

            ctx.drawImage(leonAsset, lDrawX, lDrawY, leonW, leonH);
          } else {
            ctx.fillStyle = '#ff00aa';
            ctx.fillRect(fighter.x - Math.round(50 * 0.85), fighter.y - Math.round(120 * 0.85), Math.round(100 * 0.85), Math.round(120 * 0.85));
          }
          } else if (isHellKage) {
          let frameKey = 'hellkage_idle_1';
          const isKnockdown =
            fighter.health <= 0 ||
            fighter.stateName === 'dead' ||
            fighter.stateName === 'knockdown';

          if (isKnockdown) {
            frameKey = 'hellkage_knockdown';
          } else if (fighter.stateName === 'hurt') {
            frameKey = 'hellkage_hurt';
          } else if (fighter.stateName === 'attack' || fighter.stateName === 'kick') {
            frameKey = 'hellkage_punch';
          } else if (fighter.stateName === 'walk') {
            const step = (Math.floor(fighter.animTimer / 0.115) % 4) + 1;
            frameKey = `hellkage_walk_${step}`;
          } else {
            const step = (Math.floor(fighter.animTimer / 0.4) % 2) + 1;
            frameKey = `hellkage_idle_${step}`;
          }

          const hkAsset = externalAssets[frameKey] || externalAssets['hellkage_idle_1'];
          if (hkAsset) {
            const cropW = (hkAsset as any)._cropW || ('naturalWidth' in hkAsset ? hkAsset.naturalWidth : hkAsset.width);
            const cropH = (hkAsset as any)._cropH || ('naturalHeight' in hkAsset ? hkAsset.naturalHeight : hkAsset.height);

            // Target standing height matching 50% enlarged boss stature (145 * 1.5 = 217.5px -> ~218px)
            const TARGET_STANDING_HEIGHT = Math.round(145 * 1.5);

            // Reference height from idle frame to keep body proportions identical in knockdown
            const idleRef = externalAssets['hellkage_idle_1'] || hkAsset;
            const idleCropH =
              (idleRef as any)._cropH ||
              ('naturalHeight' in idleRef ? idleRef.naturalHeight : idleRef.height) ||
              TARGET_STANDING_HEIGHT;
            const standingScale = idleCropH > 0 ? TARGET_STANDING_HEIGHT / idleCropH : 1.0;

            let renderWidth = 0;
            let renderHeight = 0;

            if (isKnockdown) {
              // Lose / knockdown pose: apply scale multiplier of 0.80 (shrink 20%)
              const loseScale = 0.80;
              renderHeight = Math.round(cropH * standingScale * loseScale);
              renderWidth = Math.round(cropW * standingScale * loseScale);
            } else if (frameKey === 'hellkage_punch') {
              // Punch pose: apply scale multiplier of 0.90 (shrink 10%)
              const punchHeight = Math.round(TARGET_STANDING_HEIGHT * 0.90);
              renderHeight = punchHeight;
              renderWidth = Math.round(cropW * (punchHeight / Math.max(1, cropH)));
            } else if (frameKey === 'hellkage_hurt') {
              // Damage / Hurt pose: apply scale multiplier of 0.90 (shrink 10%)
              const hurtHeight = Math.round(TARGET_STANDING_HEIGHT * 0.90);
              renderHeight = hurtHeight;
              renderWidth = Math.round(cropW * (hurtHeight / Math.max(1, cropH)));
            } else {
              // All other standing states (idle1, idle2, walk1-walk4):
              // Normalize to fixed target height, preserving frame's trimmed aspect ratio
              renderHeight = TARGET_STANDING_HEIGHT;
              renderWidth = Math.round(cropW * (TARGET_STANDING_HEIGHT / Math.max(1, cropH)));
            }

            // Foot stance horizontal anchoring: map stanceCenterX directly to fighter.x
            const footAnchorRatioX = isKnockdown ? 0.5 : ((hkAsset as any)._footAnchorRatioX ?? 0.5);
            const drawX = Math.round(fighter.x - renderWidth * footAnchorRatioX);
            let destY = Math.round(fighter.y - renderHeight);
            if (fighter.stateName === 'knockdown') {
              destY -= Math.round(airArcY);
            }

            ctx.drawImage(hkAsset, drawX, destY, renderWidth, renderHeight);
          } else {
            ctx.fillStyle = '#ff4400';
            ctx.fillRect(fighter.x - 60, fighter.y - 218, 120, 218);
          }
        } else if (isBoneHead) {
          let frameKey = 'bonehead_idle_1';
          const isKnockdown =
            fighter.health <= 0 ||
            fighter.stateName === 'dead' ||
            fighter.stateName === 'knockdown';

          if (isKnockdown) {
            frameKey = 'bonehead_knockdown';
          } else if (fighter.stateName === 'hurt') {
            frameKey = 'bonehead_hurt';
          } else if (fighter.stateName === 'attack' || fighter.stateName === 'kick') {
            frameKey = 'bonehead_punch';
          } else if (fighter.stateName === 'walk') {
            const step = (Math.floor(fighter.animTimer / 0.115) % 4) + 1;
            frameKey = `bonehead_walk_${step}`;
          } else {
            const step = (Math.floor(fighter.animTimer / 0.4) % 2) + 1;
            frameKey = `bonehead_idle_${step}`;
          }

          const TARGET_BONEHEAD_HEIGHT = Math.round(145 * 1.5); // ~218px (50% enlarged)
          const bhAsset = externalAssets[frameKey] || externalAssets['bonehead_idle_1'];
          if (bhAsset) {
            const cropW = (bhAsset as any)._cropW || ('naturalWidth' in bhAsset ? bhAsset.naturalWidth : bhAsset.width);
            const cropH = (bhAsset as any)._cropH || ('naturalHeight' in bhAsset ? bhAsset.naturalHeight : bhAsset.height);

            // Reference height from idle frame to keep body proportions identical in knockdown
            const idleRef = externalAssets['bonehead_idle_1'] || bhAsset;
            const idleCropH =
              (idleRef as any)._cropH ||
              ('naturalHeight' in idleRef ? idleRef.naturalHeight : idleRef.height) ||
              TARGET_BONEHEAD_HEIGHT;
            const standingScale = idleCropH > 0 ? TARGET_BONEHEAD_HEIGHT / idleCropH : 1.0;

            let renderWidth = 0;
            let renderHeight = 0;

            if (isKnockdown) {
              // Lose / knockdown pose: reduced by 15% from previous (0.90 * 0.85 = 0.765x scale multiplier)
              const loseScale = 0.765;
              renderHeight = Math.round(cropH * standingScale * loseScale);
              renderWidth = Math.round(cropW * standingScale * loseScale);
            } else if (frameKey === 'bonehead_punch') {
              // Punch pose: reduced by 3% from previous (0.97 * 0.97 = ~0.9409x scale multiplier)
              const punchHeight = Math.round(TARGET_BONEHEAD_HEIGHT * 0.9409);
              renderHeight = punchHeight;
              renderWidth = Math.round(cropW * (punchHeight / Math.max(1, cropH)));
            } else if (frameKey === 'bonehead_hurt') {
              // Damage / Hurt pose: apply scale multiplier of 0.95 (shrink 5%)
              const hurtHeight = Math.round(TARGET_BONEHEAD_HEIGHT * 0.95);
              renderHeight = hurtHeight;
              renderWidth = Math.round(cropW * (hurtHeight / Math.max(1, cropH)));
            } else {
              // All other standing states (idle1, idle2, walk1-walk4):
              // 50% enlarged fixed height (~218px) while preserving each frame's aspect ratio
              renderHeight = TARGET_BONEHEAD_HEIGHT;
              renderWidth = Math.round(cropW * (TARGET_BONEHEAD_HEIGHT / Math.max(1, cropH)));
            }

            // Core-Torso Horizontal Anchor & Grounded footY:
            // Anchor horizontally using center of core torso/head mass (20% to 60% vertical band from top of visible bounding box)
            // with Math.round() draw coordinates so body stays completely steady.
            // Anchor vertically by bottom-most visible pixel (footY) so he lies flat on the floor when defeated.
            const torsoAnchorRatioX = isKnockdown ? 0.5 : ((bhAsset as any)._torsoAnchorRatioX ?? (bhAsset as any)._footAnchorRatioX ?? 0.5);
            const bDrawX = Math.round(fighter.x - renderWidth * torsoAnchorRatioX);
            let bDestY = Math.round(fighter.y - renderHeight);
            if (fighter.stateName === 'knockdown') {
              bDestY -= Math.round(airArcY);
            }

            ctx.drawImage(bhAsset, bDrawX, bDestY, renderWidth, renderHeight);
          } else {
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(fighter.x - Math.round(35 * 1.5), fighter.y - TARGET_BONEHEAD_HEIGHT, Math.round(70 * 1.5), TARGET_BONEHEAD_HEIGHT);
          }
        } else if (isVictor) {
          let frameKey = 'victor_idle_1';
          if (fighter.health <= 0 || fighter.stateName === 'dead' || fighter.stateName === 'knockdown') {
            frameKey = 'victor_knockdown';
          } else if (fighter.stateName === 'hurt') {
            frameKey = 'victor_hurt';
          } else if (fighter.stateName === 'attack' || fighter.stateName === 'kick') {
            frameKey = 'victor_punch';
          } else if (fighter.stateName === 'walk') {
            const step = (Math.floor(fighter.animTimer / 0.115) % 4) + 1;
            frameKey = `victor_walk_${step}`;
          } else {
            const step = (Math.floor(fighter.animTimer / 0.4) % 2) + 1;
            frameKey = `victor_idle_${step}`;
          }

          const victorAsset = externalAssets[frameKey];
          if (victorAsset) {
            const natW = 'naturalWidth' in victorAsset ? victorAsset.naturalWidth : victorAsset.width;
            const natH = 'naturalHeight' in victorAsset ? victorAsset.naturalHeight : victorAsset.height;
            const aspect = (natH > 0 && natW > 0) ? natW / natH : 1.0;
            // 50% enlarged boss stature (1.5x of previous ~156px height -> ~234px height)
            const isKnockedDown = fighter.health <= 0 || fighter.stateName === 'dead' || fighter.stateName === 'knockdown';
            const victorH = Math.round((isKnockedDown ? 130 : 156) * 1.5);
            const victorW = Math.round(victorH * aspect);

            // Firmly planted bottom-center anchor (footY)
            const vDrawX = Math.round(fighter.x - victorW / 2);
            const lastSolid = (victorAsset as any)._lastSolidY;
            let vDrawY = Math.round(fighter.y - victorH);
            if (lastSolid != null && natH > 0 && lastSolid > 0) {
              vDrawY = Math.round(fighter.y - (lastSolid / natH) * victorH);
            }
            if (fighter.stateName === 'knockdown') {
              vDrawY -= Math.round(airArcY);
            }

            // Clean clip strictly from actual character head downwards to guarantee zero floating top-edge lines
            const firstSolid = (victorAsset as any)._firstSolidY;
            if (firstSolid != null && natH > 0 && firstSolid > 0) {
              const headY = vDrawY + (firstSolid / natH) * victorH;
              ctx.save();
              ctx.beginPath();
              ctx.rect(vDrawX - 10, headY - 1, victorW + 20, victorH + 20);
              ctx.clip();
              ctx.drawImage(victorAsset, vDrawX, vDrawY, victorW, victorH);
              ctx.restore();
            } else {
              ctx.drawImage(victorAsset, vDrawX, vDrawY, victorW, victorH);
            }
          } else {
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(fighter.x - 60, fighter.y - 234, 120, 234);
          }
        } else if (isBoss) {
          bossRendererRef.current.draw(ctx, fighter.animState, drawX, drawY, spriteW, spriteH, localAssets);
        } else {
          const variant = fighter.enemyVariant || 'enemy1';
          let frameKey = `${variant}_idle`;
          if (fighter.health <= 0 || fighter.stateName === 'dead' || fighter.stateName === 'knockdown') {
            frameKey = `${variant}_lose`;
          } else if (
            fighter.isFlyingProjectile ||
            fighter.stateName === 'hurt' ||
            fighter.stateName === 'grabbed' ||
            Boolean(fighter.isGrabbed)
          ) {
            frameKey = `${variant}_damage`;
          } else if (fighter.stateName === 'attack') {
            frameKey = `${variant}_punch`;
          } else if (fighter.stateName === 'walk') {
            const step = (Math.floor(fighter.animTimer / 0.115) % 4) + 1;
            frameKey = `${variant}_walk${step}`;
          } else {
            frameKey = `${variant}_idle`;
          }

          if (fighter.isFlyingProjectile && fighter.rotation) {
            ctx.save();
            ctx.translate(drawX + spriteW / 2, drawY + spriteH / 2);
            ctx.rotate(fighter.rotation);
            ctx.translate(-(drawX + spriteW / 2), -(drawY + spriteH / 2));
          }

          const fallbackKey = frameKey.replace(variant, 'enemy').replace('walk', 'walk_');
          const enemyAsset =
            externalAssets[frameKey] ||
            externalAssets[fallbackKey] ||
            externalAssets['enemy_idle'];
          if (enemyAsset) {
            ctx.drawImage(enemyAsset, drawX, drawY, spriteW, spriteH);
          } else {
            ctx.fillStyle = variant === 'enemy2' ? '#ff6600' : variant === 'enemy3' ? '#a855f7' : '#ff3333';
            ctx.fillRect(drawX, drawY, spriteW, spriteH);
          }

          if (fighter.isFlyingProjectile && fighter.rotation) {
            ctx.restore();
          }
        }

        ctx.restore();

                  // Overhead health bar for Night Razor, Bosses, and regular enemies
          if (fighter.health > 0) {
            const barW = isBoss ? 100 : 80;
            const barH = isBoss ? 8 : 6;
            const barX = fighter.x - barW / 2;
            const barY = fighter.y - spriteH + 15;
            const hpPercent = Math.max(0, Math.min(1, fighter.health / Math.max(1, fighter.maxHealth)));

            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
            ctx.fillStyle = isPlayer ? '#22c55e' : isBoss ? '#ef4444' : '#ffdd00';
            ctx.fillRect(barX, barY, barW * hpPercent, barH);
          }

      }
    });

    // Draw Flying Bullet Projectiles
    bulletsRef.current.forEach((bullet) => {
      const bulletAsset = externalAssets['bulletProjectileSprite'];
      const bw = 50;
      const bh = 22;
      ctx.save();
      ctx.translate(bullet.x, bullet.visualY);
      if (bullet.vx < 0) {
        ctx.scale(-1, 1);
      }
      if (bulletAsset) {
        ctx.drawImage(bulletAsset, -bw / 2, -bh / 2, bw, bh);
      } else {
        ctx.fillStyle = '#ffea00';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
      }
      ctx.restore();
    });

    // Shockwave Rings
    shockwavesRef.current.forEach((shock) => {
      const progress = 1 - shock.timer / shock.maxTimer;
      const currentRadius = Math.max(1, shock.radius + (shock.maxRadius - shock.radius) * Math.pow(progress, 0.7));
      const alpha = Math.max(0, shock.timer / shock.maxTimer);

      ctx.save();
      ctx.strokeStyle = shock.color;
      ctx.lineWidth = Math.max(1, 5.5 * alpha);
      ctx.beginPath();
      ctx.arc(shock.x, shock.y, currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(0.5, 3 * alpha);
      ctx.beginPath();
      ctx.arc(shock.x, shock.y, Math.max(1, currentRadius - 3), 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const segments = 12;
      for (let s = 0; s < segments; s++) {
        if (s % 2 === 0) {
          const a1 = (s * Math.PI * 2) / segments;
          const a2 = a1 + 0.28;
          const rOffset = Math.sin(s * 3.7 + shock.timer * 22) * 5;
          const x1 = shock.x + Math.cos(a1) * (currentRadius + rOffset);
          const y1 = shock.y + Math.sin(a1) * (currentRadius + rOffset);
          const x2 = shock.x + Math.cos(a2) * (currentRadius - rOffset * 0.6);
          const y2 = shock.y + Math.sin(a2) * (currentRadius - rOffset * 0.6);
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
      }
      ctx.stroke();
      ctx.restore();
    });

    // Starburst Flash
    impactBurstsRef.current.forEach((burst) => {
      const progress = 1 - burst.timer / burst.maxTimer;
      const alpha = Math.max(0, 1 - progress);
      const scale = 0.45 + Math.sin(progress * Math.PI * 0.75) * 0.7;
      const rOuter = Math.max(1, burst.radius * scale);
      const rInner = Math.max(1, rOuter * 0.44);
      const spikes = burst.spikes;

      ctx.save();
      ctx.translate(burst.x, burst.y);
      ctx.rotate(burst.angle + progress * 0.25);

      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const rad = i % 2 === 0 ? rOuter : rInner;
        const a = (i * Math.PI) / spikes;
        const px = Math.cos(a) * rad;
        const py = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      ctx.lineWidth = burst.isFinisher ? 5 : 3.5;
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.85})`;
      ctx.stroke();

      ctx.fillStyle = burst.isFinisher
        ? `rgba(255, 230, 0, ${alpha * 0.95})`
        : `rgba(255, 240, 50, ${alpha * 0.95})`;
      ctx.fill();

      const innerScale = 0.58;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const rad = (i % 2 === 0 ? rOuter : rInner) * innerScale;
        const a = (i * Math.PI) / spikes + 0.12;
        const px = Math.cos(a) * rad;
        const py = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.lineWidth = burst.isFinisher ? 3 : 2;
      for (let i = 0; i < spikes; i += 2) {
        const a = (i * Math.PI) / spikes;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (rOuter * 0.78), Math.sin(a) * (rOuter * 0.78));
        ctx.lineTo(Math.cos(a) * (rOuter * 1.32), Math.sin(a) * (rOuter * 1.32));
        ctx.stroke();
      }

      ctx.restore();
    });

    // Particle Sparks
    sparksRef.current.forEach((spark) => {
      const alpha = Math.max(0, spark.timer / spark.maxTimer);
      const trailLength = 0.038;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = spark.color;
      ctx.lineWidth = Math.max(1, spark.size * alpha);
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(spark.x, spark.y);
      ctx.lineTo(spark.x - spark.vx * trailLength, spark.y - spark.vy * trailLength);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, Math.max(0.5, (spark.size * 0.6) * alpha), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Flying Thematic Debris Particles (Water geyser, Glass shards, Mini soda cans, Metal chunks)
    debrisParticlesRef.current.forEach((d) => {
      const alpha = Math.max(0, d.timer / d.maxTimer);
      ctx.save();

      if (d.type === 'water') {
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, Math.max(1, d.width), Math.max(2, d.height), 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.type === 'glass') {
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = d.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-d.width / 2, -d.height / 2);
        ctx.lineTo(d.width / 2, -d.height / 4);
        ctx.lineTo(d.width / 3, d.height / 2);
        ctx.lineTo(-d.width / 3, d.height / 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (d.type === 'can') {
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = d.color;
        ctx.fillRect(-d.width / 2, -d.height / 2, d.width, d.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-d.width / 2 + 1, -d.height / 2 + 1, d.width - 2, 2);
      } else {
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = d.color;
        ctx.fillRect(-d.width / 2, -d.height / 2, d.width, d.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-d.width / 2, -d.height / 2, d.width, d.height);
      }
      ctx.restore();
    });

    // Hit VFX & Text Pops
    hitVfxRef.current.forEach((vfx) => {
      ctx.save();
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = vfx.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      if (vfx.text) {
        ctx.strokeText(vfx.text, vfx.x, vfx.y - (vfx.maxTimer - vfx.timer) * 40);
        ctx.fillText(vfx.text, vfx.x, vfx.y - (vfx.maxTimer - vfx.timer) * 40);
      }
      ctx.restore();
    });

    // Streets of Rage Pulsing "Ride Out" Advance Graphic Indicator
    if (rideOutActiveRef.current) {
      const blinkCycle = 0.8;
      const visibleDur = 0.52;
      const cycleTime = rideOutPulseTimerRef.current % blinkCycle;
      const isBlinkVisible = cycleTime < visibleDur;

      if (isBlinkVisible) {
        const pulseRatio = cycleTime / visibleDur;
        const pulseScale = 1.0 + Math.sin(pulseRatio * Math.PI) * 0.16;
        const pulseOpacity = 0.92 + Math.sin(pulseRatio * Math.PI) * 0.08;

        const rideAsset = externalAssets['ride_out_prompt'] || externalAssets['ride_out_banner'];
        const natW = rideAsset ? ('naturalWidth' in rideAsset ? rideAsset.naturalWidth : (rideAsset as any).width || 180) : 180;
        const natH = rideAsset ? ('naturalHeight' in rideAsset ? rideAsset.naturalHeight : (rideAsset as any).height || 64) : 64;
        const aspect = (natH > 0 && natW > 0) ? natW / natH : 2.8;

        // 50% bigger size (1.5x scale)
        const drawH = Math.round(58 * 1.5); // 87px
        const drawW = Math.min(330, Math.max(180, Math.round(drawH * aspect)));

        // Position lowered by 12% of canvas height (24 + 600 * 0.12 = 96px)
        const screenX = canvasWidth - drawW - 24;
        const screenY = 24 + Math.round(canvasHeight * 0.12);
        const indicatorX = cameraXRef.current + screenX + drawW / 2;
        const indicatorY = screenY + drawH / 2;

        ctx.save();
        ctx.translate(indicatorX, indicatorY);
        ctx.scale(pulseScale, pulseScale);
        ctx.globalAlpha = Math.max(0, Math.min(1, pulseOpacity));

        if (rideAsset) {
          ctx.drawImage(rideAsset, -drawW / 2, -drawH / 2, drawW, drawH);
        } else {
          // Styled geometric fallback while asset preloads
          ctx.save();
          ctx.fillStyle = 'rgba(10, 15, 25, 0.75)';
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(-drawW / 2, -drawH / 2, drawW, drawH, 16);
          ctx.fill();
          ctx.stroke();
          ctx.font = 'italic 900 34px Impact, "Arial Black", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#facc15';
          ctx.fillText('RIDE OUT →', 0, 0);
          ctx.restore();
        }

        ctx.restore();
      }
    }

    ctx.restore(); // Restores cameraXRef.current translation

    // Stage 2 Exclusive: Sweeping Overhead Spotlights (Electric Cyan, Hot Magenta, Neon Purple at 0.12 to 0.18 opacity)
    if (currentStageRef.current === 2) {
      const time = performance.now() * 0.001;

      STAGE2_SPOTLIGHTS.forEach((spot) => {
        const originX = spot.originXRatio * canvasWidth;
        const originY = 0;
        const targetX = spot.baseTargetRatio * canvasWidth + Math.sin(time * spot.sweepSpeed + spot.phase) * spot.sweepAmp;
        const targetY = canvasHeight;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Volumetric light beam cone/trapezoid projecting downward from ceiling truss
        const grad = ctx.createLinearGradient(originX, originY, targetX, targetY);
        grad.addColorStop(0, `rgba(${spot.rgb[0]}, ${spot.rgb[1]}, ${spot.rgb[2]}, ${spot.opacity * 1.25})`);
        grad.addColorStop(0.3, `rgba(${spot.rgb[0]}, ${spot.rgb[1]}, ${spot.rgb[2]}, ${spot.opacity})`);
        grad.addColorStop(0.7, `rgba(${spot.rgb[0]}, ${spot.rgb[1]}, ${spot.rgb[2]}, ${spot.opacity * 0.65})`);
        grad.addColorStop(1, `rgba(${spot.rgb[0]}, ${spot.rgb[1]}, ${spot.rgb[2]}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(originX - spot.topW / 2, originY);
        ctx.lineTo(originX + spot.topW / 2, originY);
        ctx.lineTo(targetX + spot.bottomW / 2, targetY);
        ctx.lineTo(targetX - spot.bottomW / 2, targetY);
        ctx.closePath();
        ctx.fill();

        // Top ceiling truss lamp fixture flare / lens glow
        const flareGrad = ctx.createRadialGradient(originX, originY, 0, originX, originY, 28);
        flareGrad.addColorStop(0, `rgba(255, 255, 255, ${spot.opacity * 2.2})`);
        flareGrad.addColorStop(0.4, `rgba(${spot.rgb[0]}, ${spot.rgb[1]}, ${spot.rgb[2]}, ${spot.opacity * 1.4})`);
        flareGrad.addColorStop(1, `rgba(${spot.rgb[0]}, ${spot.rgb[1]}, ${spot.rgb[2]}, 0)`);
        ctx.fillStyle = flareGrad;
        ctx.beginPath();
        ctx.arc(originX, originY, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
    }

    // --- FOREGROUND DEPTH OVERLAYS (1.15x PARALLAX SPEED) ---
    // Rendered AFTER fighters, enemies, and street objects, but BEFORE combat callout & HUD overlays
    ctx.save();
    ctx.translate(-camX * 1.15, 0);

    if (currentStageRef.current === 1) {
      FOREGROUND_PROPS.forEach((prop) => {
        const asset = externalAssets[prop.assetKey];
        if (asset) {
          const natW = 'naturalWidth' in asset ? asset.naturalWidth : asset.width;
          const natH = 'naturalHeight' in asset ? asset.naturalHeight : asset.height;
          const aspect = natH > 0 ? natW / natH : 1.0;
          const drawH = prop.h;
          const drawW = prop.w !== undefined ? prop.w : drawH * aspect;
          const drawX = prop.x - drawW / 2;
          const drawY = prop.y !== undefined ? prop.y : (canvasHeight + (prop.bottomOffset ?? 0) - drawH);

          // Frustum culling in 1.15x parallax space
          if (drawX + drawW >= camX * 1.15 - 100 && drawX <= camX * 1.15 + canvasWidth + 100) {
            ctx.drawImage(asset, drawX, drawY, drawW, drawH);
          }
        }
      });
    } else if (currentStageRef.current === 2) {
      // Stage 2: 1.15x Parallax Foreground Depth Overlays & Guardrails
      // 1. Guardrails at start and end of Stage 2 sectors
      const railAsset = externalAssets['clubFgRails'];
      if (railAsset) {
        const rNatW = 'naturalWidth' in railAsset ? railAsset.naturalWidth : railAsset.width;
        const rNatH = 'naturalHeight' in railAsset ? railAsset.naturalHeight : railAsset.height;
        const railH = 145;
        const railW = (rNatW / Math.max(1, rNatH)) * railH;
        const railPositions = [80, 2400, 3300];

        railPositions.forEach((rX) => {
          const drawX = rX - railW / 2;
          const drawY = canvasHeight - railH;
          if (drawX + railW >= camX * 1.15 - 100 && drawX <= camX * 1.15 + canvasWidth + 100) {
            ctx.drawImage(railAsset, drawX, drawY, railW, railH);
          }
        });
      }

      // 2. Stage 2 Foreground Overlays (clubBeam1, clubCouple1, clubBeam2, clubCouple2)
      STAGE2_FOREGROUND_PROPS.forEach((prop) => {
        const asset = externalAssets[prop.assetKey];
        if (asset) {
          const natW = 'naturalWidth' in asset ? asset.naturalWidth : asset.width;
          const natH = 'naturalHeight' in asset ? asset.naturalHeight : asset.height;
          if (!natW || !natH) return;

          let drawW = 0;
          let drawH = 0;
          let drawY = 0;

          if (prop.type === 'beam') {
            const isClubBeam1 = prop.assetKey === 'clubBeam1';
            const yShift = isClubBeam1 ? Math.round(canvasHeight * 0.10) : 0;
            drawH = canvasHeight + 20 + yShift;
            drawY = -5 - yShift;
            const aspect = natW / natH;
            drawW = Math.round((canvasHeight + 20) * aspect);
            drawW = Math.max(100, Math.min(140, drawW));
          } else {
            drawH = 185;
            drawY = canvasHeight + 10 - drawH;
            const aspect = natW / natH;
            drawW = Math.round(drawH * aspect);
          }

          const drawX = Math.round(prop.x - drawW / 2);

          if (drawX + drawW >= camX * 1.15 - 120 && drawX <= camX * 1.15 + canvasWidth + 120) {
            ctx.drawImage(asset, drawX, drawY, drawW, drawH);
          }
        }
      });
    } else if (currentStageRef.current === 3) {
      // Stage 3: 1.15x Parallax Foreground Depth Overlays (Trimmed Pillars & Cars)
      ctx.save();
      STAGE3_FOREGROUND_PROPS.forEach((prop) => {
        const asset = externalAssets[prop.assetKey] || externalAssets[prop.assetKey.replace(/\d+$/, '')];
        const isAssetReady = Boolean(
          asset &&
          (
            asset instanceof HTMLCanvasElement ||
            (asset instanceof HTMLImageElement && asset.complete && asset.naturalWidth > 0) ||
            (('width' in asset) && asset.width > 0 && ('height' in asset) && asset.height > 0)
          )
        );

        if (prop.type === 'beam') {
          // garageBeam (2 placements: around x = 260 and x = 1650):
          // Concrete pillar spans from very top of screen (y = -5) all the way past bottom edge (y = canvas.height + 10)
          const drawY = -5;
          const drawH = canvasHeight + 15;
          let drawW = 120;
          if (isAssetReady && asset) {
            const natW = 'naturalWidth' in asset ? asset.naturalWidth : asset.width;
            const natH = 'naturalHeight' in asset ? asset.naturalHeight : asset.height;
            const aspect = (natH > 0 && natW > 0) ? natW / natH : 0.22;
            drawW = Math.max(80, Math.round(drawH * aspect));
          }
          const drawX = Math.round(prop.x - drawW / 2);

          if (drawX + drawW >= camX * 1.15 - 120 && drawX <= camX * 1.15 + canvasWidth + 120) {
            ctx.globalAlpha = 0.70;
            if (isAssetReady && asset) {
              ctx.drawImage(asset, drawX, drawY, drawW, drawH);
            } else {
              ctx.save();
              ctx.fillStyle = '#252d3d';
              ctx.fillRect(drawX, drawY, drawW, drawH);
              ctx.strokeStyle = '#0f141d';
              ctx.lineWidth = 4;
              ctx.strokeRect(drawX, drawY, drawW, drawH);
              ctx.restore();
            }
            ctx.globalAlpha = 1.0;
          }
        } else {
          // garageCar (garageCar1 around x = 850, garageCar2 around x = 1950):
          const drawH = Math.round(145 * 1.10);
          let drawW = Math.round(280 * 1.10);
          if (isAssetReady && asset) {
            const natW = 'naturalWidth' in asset ? asset.naturalWidth : asset.width;
            const natH = 'naturalHeight' in asset ? asset.naturalHeight : asset.height;
            const aspect = (natH > 0 && natW > 0) ? natW / natH : 1.95;
            drawW = Math.round(drawH * aspect);
          }
          const drawX = Math.round(prop.x - drawW / 2);
          const drawY = Math.round((canvasHeight + 5) - drawH);

          if (drawX + drawW >= camX * 1.15 - 120 && drawX <= camX * 1.15 + canvasWidth + 120) {
            if (isAssetReady && asset) {
              ctx.drawImage(asset, drawX, drawY, drawW, drawH);
            } else {
              ctx.save();
              ctx.fillStyle = '#0a0d14';
              ctx.beginPath();
              ctx.roundRect(drawX, drawY, drawW, drawH, 12);
              ctx.fill();
              ctx.restore();
            }
          }
        }
      });
      ctx.restore();
    } else if (currentStageRef.current === 4) {
      // Stage 4: 1.15x Parallax Foreground Depth Overlays (Fence and 4 Guys)
      // Scaled up 1.5x, anchored to bottom with ~25% extending off-screen past canvas.height
      ctx.save();

      // 1. Foreground Fence Overlay (depth = 1000) - Scaled up 50% (1.5x)
      const stage4Fence = externalAssets['stage4_fence'];
      const fenceAsset = stage4Fence;
      if (fenceAsset) {
        const naturalWidth = 'naturalWidth' in fenceAsset ? fenceAsset.naturalWidth : fenceAsset.width;
        const naturalHeight = 'naturalHeight' in fenceAsset ? fenceAsset.naturalHeight : fenceAsset.height;
        const fAspect = (naturalHeight > 0 && naturalWidth > 0) ? naturalWidth / naturalHeight : 1.6;

        STAGE4_FOREGROUND_FENCES.forEach((fence) => {
          const fenceScale = 1.5;
          const destHeight = fence.h;
          const destWidth = Math.round(destHeight * fAspect);
          const drawH = destHeight;
          const drawW = destWidth;
          const drawX = Math.round(fence.x - drawW / 2);
          const drawY = Math.round(canvasHeight + drawH * 0.25 - drawH);

          if (drawX + drawW >= camX * 1.15 - 120 && drawX <= camX * 1.15 + canvasWidth + 120) {
            ctx.drawImage(fenceAsset, drawX, drawY, destWidth, destHeight);
          }
        });
      }

      // 2. 4 Foreground Spectators with 2px vertical sine wave idle breathing/bobbing
      const time = Date.now() * 0.003;
      STAGE4_FOREGROUND_SPECTATORS.forEach((guy, idx) => {
        const guyAsset = externalAssets[guy.key];
        if (guyAsset) {
          const gNatW = 'naturalWidth' in guyAsset ? guyAsset.naturalWidth : guyAsset.width;
          const gNatH = 'naturalHeight' in guyAsset ? guyAsset.naturalHeight : guyAsset.height;
          const gAspect = (gNatH > 0 && gNatW > 0) ? gNatW / gNatH : 0.65;
          const drawH = guy.baseH;
          const drawW = Math.round(drawH * gAspect);
          const bob = Math.sin(time + idx * 1.5) * 2;
          const drawX = Math.round(guy.x - drawW / 2);
          const drawY = Math.round(canvasHeight + drawH * 0.25 - drawH + bob);

          if (drawX + drawW >= camX * 1.15 - 120 && drawX <= camX * 1.15 + canvasWidth + 120) {
            ctx.drawImage(guyAsset, drawX, drawY, drawW, drawH);
          }
        }
      });

      ctx.restore();
    } else if (currentStageRef.current === 5) {
      // Stage 5: 1.15x Parallax Foreground Depth Overlays (Velvet Ropes & Foreground Slot Machines)
      ctx.save();

      const ropeAsset = externalAssets['casinoVelvetRopeBlurred'] || externalAssets['casinoVelvetRope'];
      const slotAsset = externalAssets['casinoSlotFgBlurred'] || externalAssets['casinoSlotFg'];

      const sNatW = slotAsset ? ('naturalWidth' in slotAsset ? slotAsset.naturalWidth : slotAsset.width) : 800;
      const sNatH = slotAsset ? ('naturalHeight' in slotAsset ? slotAsset.naturalHeight : slotAsset.height) : 600;
      const sAspect = (sNatH > 0 && sNatW > 0) ? sNatW / sNatH : 0.8;

      if (ropeAsset) {
        const rNatW = 'naturalWidth' in ropeAsset ? ropeAsset.naturalWidth : ropeAsset.width;
        const rNatH = 'naturalHeight' in ropeAsset ? ropeAsset.naturalHeight : ropeAsset.height;
        const rAspect = (rNatH > 0 && rNatW > 0) ? rNatW / rNatH : 2.5;
        const ropeH = Math.round(140 * 1.5);
        const ropeW = Math.round(ropeH * rAspect);
        const ropeY = Math.round(canvasHeight - ropeH * 0.73);

        STAGE5_FOREGROUND_ROPES.forEach((rope) => {
          const drawX = Math.round(rope.x - ropeW / 2);
          const screenX = drawX - camX * 1.15;

          if (screenX + ropeW < 0 || screenX > canvasWidth) {
            return;
          }

          const overlapsSlot = STAGE5_FOREGROUND_SLOTS.some((slot) => {
            const slotH = Math.round(slot.h * 1.4);
            const slotW = Math.round(slotH * sAspect);
            const slotDrawX = Math.round(slot.x - slotW / 2);
            return drawX < slotDrawX + slotW && drawX + ropeW > slotDrawX;
          });
          if (overlapsSlot) return;

          ctx.drawImage(ropeAsset, drawX, ropeY, ropeW, ropeH);
        });
      }

      if (slotAsset) {
        STAGE5_FOREGROUND_SLOTS.forEach((slot) => {
          const slotH = Math.round(slot.h * 1.4);
          const slotW = Math.round(slotH * sAspect);
          const drawX = Math.round(slot.x - slotW / 2);
          const drawY = Math.round(canvasHeight - slotH * 0.72);
          const screenX = drawX - camX * 1.15;

          if (screenX + slotW < 0 || screenX > canvasWidth) {
            return;
          }

          ctx.drawImage(slotAsset, drawX, drawY, slotW, slotH);
        });
      }

      ctx.restore();
    } else if (currentStageRef.current === 6) {
      // Stage 6: 1.15x Parallax Foreground Depth Overlays (Desk Cop 1, Desk Cop 2, 3 Helmeted Riot Cops)
      // 1. Crisp chroma-keyed canvases rendered directly without any blur() filter or fringe.
      // 2. Desk Cop 1: Spawned ONLY ONCE at stage start (worldX = 40), scaled & positioned at the same vertical framing height as Desk Cop 2.
      // 3. Desk Cop 2: Retained at exact current scale (baseH: 260 * 1.4), height (yRatio: 0.82), and position (x: 2150).
      // 4. Riot Cops: Spawned exactly TWICE (x: 1150 and x: 2980), spaced widely in open gaps with zero overlap.
      ctx.save();

      STAGE6_FOREGROUND_PROPS.forEach((prop) => {
        const baseKey = prop.key.replace('Blurred', '');
        const asset = externalAssets[prop.key] || externalAssets[baseKey];
        if (asset) {
          const natW = 'naturalWidth' in asset ? asset.naturalWidth : (asset as any).width;
          const natH = 'naturalHeight' in asset ? asset.naturalHeight : (asset as any).height;
          const aspect = (natH > 0 && natW > 0 && isFinite(natW / natH)) ? natW / natH : 1.25;
          const isDeskCop1 = prop.key.includes('DeskCop1');
          const isDeskCop2 = prop.key.includes('DeskCop2');
          const isRiotCops = prop.key.includes('RiotCops');

          let scale = 1.4;
          let yRatio = ('yRatio' in prop && typeof (prop as any).yRatio === 'number') ? (prop as any).yRatio : 0.82;

          if (isDeskCop1) {
            // Desk Cop 1: Scaled down by 10% (0.9x previous size), anchored cleanly at bottom-left
            scale = 1.4 * 1.35 * 1.5 * 0.9;
            yRatio = 1.0; // Anchored along bottom-left edge
          } else if (isDeskCop2) {
            scale = 1.4 * 0.85; // Preserved Desk Cop 2
            yRatio = 0.82;
          } else if (isRiotCops) {
            // Shrink the 3 Helmeted Riot Cops by 35% (0.65x current size)
            scale = 1.4 * 0.65;
            yRatio = 1.0; // Anchored along bottom edge of screen
          }

          const drawH = Math.round(prop.baseH * scale);
          const drawW = Math.round(drawH * aspect);
          const drawX = isDeskCop1 ? 0 : Math.round(prop.x - drawW / 2);
          const drawY = Math.round(canvasHeight - drawH * yRatio);

          const screenX = drawX - camX * 1.15;
          if (screenX + drawW < -100 || screenX > canvasWidth + 100) {
            return;
          }

          ctx.drawImage(asset, drawX, drawY, drawW, drawH);
        }
      });

      ctx.restore();
    } else if (currentStageRef.current === 7) {
      // Stage 7: 1.15x Parallax Foreground Depth Overlays (Palm Plants & Ribbon Statues)
      ctx.save();

      STAGE7_FOREGROUND_PROPS.forEach((prop) => {
        const asset = externalAssets[prop.key];
        if (asset) {
          const natW = 'naturalWidth' in asset ? asset.naturalWidth : (asset as any).width;
          const natH = 'naturalHeight' in asset ? asset.naturalHeight : (asset as any).height;
          const aspect = (natH > 0 && natW > 0 && isFinite(natW / natH)) ? natW / natH : 0.85;

          const drawH = prop.baseH;
          const drawW = Math.round(drawH * aspect);
          const drawX = Math.round(prop.x - drawW / 2);
          const drawY = Math.round(canvasHeight - drawH * 0.88);

          const screenX = drawX - camX * 1.15;
          if (screenX + drawW < -100 || screenX > canvasWidth + 100) {
            return;
          }

          ctx.drawImage(asset, drawX, drawY, drawW, drawH);
        }
      });

      ctx.restore();
    } else {
      // Stage 8: 1.15x Parallax Foreground Depth Overlays (Rooftop Foreground Ledge)
      // Scaled up by 50% (1.5x previous baseH: 190 * 1.5 = 285px)
      // Anchored along bottom edge of screen (destY = canvas.height - destHeight).
      // Tiled horizontally across the stage with seamless edge-to-edge connection (1px overlap)
      // at 1.15x parallax speed so there are zero gaps between segments across the entire stage width.
      ctx.save();

      const ledgeAsset = externalAssets['rooftopForegroundLedge'];
      if (ledgeAsset) {
        const natW = 'naturalWidth' in ledgeAsset ? ledgeAsset.naturalWidth : (ledgeAsset as any).width;
        const natH = 'naturalHeight' in ledgeAsset ? ledgeAsset.naturalHeight : (ledgeAsset as any).height;
        const destHeight = Math.round(190 * 1.5); // 285px (+50% scale)
        const aspect = (natH > 0 && natW > 0 && isFinite(natW / natH)) ? natW / natH : 1.33;
        const destWidth = Math.round(destHeight * aspect);
        const destY = canvasHeight - destHeight;

        // Tile horizontally across the stage with seamless edge-to-edge connection (1px overlap)
        const tileStep = destWidth - 1;
        const startTile = Math.floor((camX * 1.15 - 150) / tileStep) - 1;
        const endTile = Math.ceil((camX * 1.15 + canvasWidth + 150) / tileStep) + 1;

        for (let i = startTile; i <= endTile; i++) {
          const drawX = i * tileStep;
          ctx.drawImage(ledgeAsset, drawX, destY, destWidth, destHeight);
        }
      }

      ctx.restore();
    }

    ctx.restore();

    // Stage 6: Room Seam Cover Pillars at Top Foreground Overlay (depth = 1000)
    // Rendered in front of Night Razor, enemies, and breakables so characters cleanly walk behind the pillar
    if (currentStageRef.current === 6) {
      const seamPillar = externalAssets['precinctSeamPillar'];
      if (seamPillar) {
        const pNatW = 'naturalWidth' in seamPillar ? seamPillar.naturalWidth : seamPillar.width;
        const pNatH = 'naturalHeight' in seamPillar ? seamPillar.naturalHeight : seamPillar.height;
        const pillarW = Math.round(pNatW * (canvasHeight / Math.max(1, pNatH)));

        const roomANatW = externalAssets['precinctRoomA']
          ? ('naturalWidth' in externalAssets['precinctRoomA']! ? externalAssets['precinctRoomA']!.naturalWidth : externalAssets['precinctRoomA']!.width)
          : 800;
        const roomANatH = externalAssets['precinctRoomA']
          ? ('naturalHeight' in externalAssets['precinctRoomA']! ? externalAssets['precinctRoomA']!.naturalHeight : externalAssets['precinctRoomA']!.height)
          : 600;
        const roomDestH = Math.round(canvasHeight * 1.5);
        const destWidth = Math.round(roomANatW * (roomDestH / Math.max(1, roomANatH))) || 1200;

        // Seams occur at (i + 1) * (destWidth - 1) for i = 0, 1, 2
        const seamPositions = [0, 1, 2].map((i) => (i + 1) * (destWidth - 1));

        seamPositions.forEach((seamWorldX) => {
          const drawX = Math.round(seamWorldX - camX - pillarW / 2);
          if (drawX + pillarW >= -100 && drawX <= canvasWidth + 100) {
            ctx.drawImage(seamPillar, drawX, 0, pillarW, canvasHeight);
          }
        });
      }
    }

    // Stage 7: Room Seam Dividing Columns at Top Foreground Overlay (depth = 1000)
    // Extends 2% past both top and bottom of screen (destY = -2%, destHeight = 104%) with horizontal center locked over each seam
    if (currentStageRef.current === 7) {
      const seamDivider = externalAssets['penthouseSeamDivider'];
      if (seamDivider) {
        const dividerImg = seamDivider;
        const pNatW = 'naturalWidth' in dividerImg ? dividerImg.naturalWidth : dividerImg.width;
        const pNatH = 'naturalHeight' in dividerImg ? dividerImg.naturalHeight : dividerImg.height;
        const destHeight = Math.round(canvasHeight * 1.04);
        const destY = Math.round(-canvasHeight * 0.02);
        const destWidth = Math.round(pNatW * (destHeight / Math.max(1, pNatH)));
        const seamPositions = [800, 1600, 2400];

        seamPositions.forEach((seamWorldX) => {
          const drawX = Math.round(seamWorldX - camX - destWidth / 2);
          if (drawX + destWidth >= -100 && drawX <= canvasWidth + 100) {
            ctx.drawImage(dividerImg, drawX, destY, destWidth, destHeight);
          }
        });
      }
    }

    ctx.restore(); // Restores arena camera shake: keeps upper-left KO! callout and top HUD completely steady!

    // --- BOTTOM-CENTER CONTINUOUS BOSS HEALTH BAR HUD ---
    const bossHud = bossHudRef.current;
    if (false && bossHud.active) {
      const centerX = canvasWidth / 2; // 400
      const centerY = canvasHeight - 34; // 566 (cleanly near bottom margin, clear of touch controls)
      const totalWidth = 360; // Same total horizontal span (from x: 220 to 580)
      const barH = 14;
      const barX = centerX - totalWidth / 2;
      const barY = centerY - barH / 2;

      const hpRatio = Math.max(0, Math.min(1, bossHud.displayHealth / Math.max(1, bossHud.maxHealth)));
      const ghostRatio = Math.max(0, Math.min(1, bossHud.ghostHealth / Math.max(1, bossHud.maxHealth)));

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, bossHud.alpha));

      // 1. Boss Nameplate: bold, crisp uppercase arcade lettering directly above the far-left edge
      const nameX = barX;
      const nameY = barY - 5;
      ctx.save();
      ctx.font = 'bold 12px "Press Start 2P", Impact, monospace, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';

      // Warm arcade under-glow drop shadow
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.lineJoin = 'miter';
      ctx.strokeText(bossHud.bossName, nameX, nameY);

      // Gold-to-amber arcade gradient text fill
      if (!cachedBossTextGrad) {
        cachedBossTextGrad = ctx.createLinearGradient(nameX, nameY - 14, nameX, nameY);
        cachedBossTextGrad.addColorStop(0, '#ffffff');
        cachedBossTextGrad.addColorStop(0.5, '#fef08a');
        cachedBossTextGrad.addColorStop(1, '#f59e0b');
      }
      ctx.fillStyle = cachedBossTextGrad;
      ctx.fillText(bossHud.bossName, nameX, nameY);
      ctx.restore();

      // 2. Bar Drop Shadow & Dark Beveled Background
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#0a0515';
      ctx.fillRect(barX, barY, totalWidth, barH);
      ctx.restore();

      if (!cachedBossBgGrad) {
        cachedBossBgGrad = ctx.createLinearGradient(0, barY, 0, barY + barH);
        cachedBossBgGrad.addColorStop(0, '#1c152b');
        cachedBossBgGrad.addColorStop(0.5, '#0f0a1c');
        cachedBossBgGrad.addColorStop(1, '#07040d');
      }
      ctx.fillStyle = cachedBossBgGrad;
      ctx.fillRect(barX, barY, totalWidth, barH);

      // 3. Ghost Bar (Yellow/Orange damage catch-up lag bar draining from right to left)
      if (ghostRatio > 0) {
        const ghostW = totalWidth * ghostRatio;
        ctx.save();
        if (!cachedBossGhostGrad) {
          cachedBossGhostGrad = ctx.createLinearGradient(0, barY, 0, barY + barH);
          cachedBossGhostGrad.addColorStop(0, '#fef08a');
          cachedBossGhostGrad.addColorStop(0.45, '#f59e0b');
          cachedBossGhostGrad.addColorStop(1, '#b45309');
        }
        ctx.fillStyle = cachedBossGhostGrad;
        ctx.fillRect(barX, barY, ghostW, barH);
        ctx.restore();
      }

      // 4. Primary Health Fill: original vibrant crimson-to-orange / arcade red-yellow gradient
      // Draining smoothly from right to left as boss takes damage
      if (hpRatio > 0) {
        const fillW = totalWidth * hpRatio;
        ctx.save();
        if (!cachedBossFillGrad) {
          cachedBossFillGrad = ctx.createLinearGradient(barX, 0, barX + totalWidth, 0);
          cachedBossFillGrad.addColorStop(0, '#dc2626');   // Vibrant crimson
          cachedBossFillGrad.addColorStop(0.5, '#f97316'); // Arcade orange
          cachedBossFillGrad.addColorStop(1, '#facc15');   // Bright arcade yellow
        }
        ctx.fillStyle = cachedBossFillGrad;
        ctx.fillRect(barX, barY, fillW, barH);

        // Top highlight line for neon arcade gloss
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(barX, barY, fillW, 2);
        ctx.restore();
      }

      // 5. Subtle segment divider ticks (at 25%, 50%, 75%)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75].forEach((seg) => {
        const segX = barX + totalWidth * seg;
        ctx.beginPath();
        ctx.moveTo(segX, barY + 1);
        ctx.lineTo(segX, barY + barH - 1);
        ctx.stroke();
      });

      // 6. Solid Outer Borders
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(barX, barY, totalWidth, barH);

      ctx.strokeStyle = '#f59e0b'; // Gold arcade accent border
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, totalWidth, barH);

      ctx.restore();
    }

    // Streets of Rage 4-Style Combat Callout
    if (combatCalloutRef.current) {
      const callout = combatCalloutRef.current;
      const elapsed = callout.maxTimer - callout.timer;

      // Arcade pop-pulse on KO! or Hit 4 Finisher
      let scale = 1.0;
      if (elapsed < 0.10) {
        const p = Math.max(0, Math.min(1, elapsed / 0.10));
        scale = (callout.isKo ? 1.55 : 1.35) - (callout.isKo ? 0.55 : 0.35) * p;
      }

      let alpha = 1.0;
      if (callout.timer < 0.2) {
        alpha = Math.max(0, callout.timer / 0.2);
      }

      const anchorX = 72;
      const anchorY = 165;

      ctx.save();
      ctx.translate(anchorX, anchorY);
      ctx.rotate(-0.087266);
      ctx.scale(scale, scale);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      ctx.font = `italic 900 ${callout.fontSize}px Impact, "Arial Black", sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      ctx.save();
      ctx.translate(4, 4);
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = callout.isKo ? 8 : 7;
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 2;
      ctx.strokeText(callout.text, 0, 0);
      ctx.fillText(callout.text, 0, 0);
      ctx.restore();

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = callout.isKo ? 8 : 7;
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 2;
      ctx.strokeText(callout.text, 0, 0);

      if (callout.isKo) {
        if (!cachedCalloutKoGrad) {
          cachedCalloutKoGrad = ctx.createLinearGradient(0, -25, 0, 20);
          cachedCalloutKoGrad.addColorStop(0, '#00FFFF');
          cachedCalloutKoGrad.addColorStop(0.35, '#FFFFFF');
          cachedCalloutKoGrad.addColorStop(0.7, '#FFD700');
          cachedCalloutKoGrad.addColorStop(1, '#FF8800');
        }
        ctx.fillStyle = cachedCalloutKoGrad;
      } else {
        if (!cachedCalloutHitGrad) {
          cachedCalloutHitGrad = ctx.createLinearGradient(0, -25, 0, 20);
          cachedCalloutHitGrad.addColorStop(0, '#FFF200');
          cachedCalloutHitGrad.addColorStop(1, '#FF5500');
        }
        ctx.fillStyle = cachedCalloutHitGrad;
      }

      ctx.fillText(callout.text, 0, 0);

      ctx.restore();
    }

    // Celebratory STAGE CLEAR Banner & Score Tally (3.0 seconds duration)
    // 100% Transparent backdrop so stage artwork remains completely visible behind text
    if (stageClearTransitionRef.current.active) {
      const remaining = stageClearTransitionRef.current.timer;
      const isFromStage1 = stageClearTransitionRef.current.fromStage === 1;
      const isFromStage2 = stageClearTransitionRef.current.fromStage === 2;
      const isFromStage3 = stageClearTransitionRef.current.fromStage === 3;
      const isFromStage4 = stageClearTransitionRef.current.fromStage === 4;
      const isFromStage5 = stageClearTransitionRef.current.fromStage === 5;
      const isFromStage6 = stageClearTransitionRef.current.fromStage === 6;
      const isFromStage7 = stageClearTransitionRef.current.fromStage === 7;
      const elapsed = 3.0 - remaining;
      const p = Math.max(0, Math.min(1, elapsed / 0.3));
      const scale = elapsed < 0.3 ? 0.7 + 0.3 * p : 1.0;

      ctx.save();
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.scale(scale, scale);

      const headerText = isFromStage1
        ? 'STAGE 1 CLEAR!'
        : isFromStage2
        ? 'STAGE 2 CLEAR!'
        : isFromStage3
        ? 'STAGE 3 CLEAR!'
        : isFromStage4
        ? 'STAGE 4 CLEAR!'
        : isFromStage5
        ? 'STAGE 5 CLEAR!'
        : isFromStage6
        ? 'STAGE 6 CLEAR!'
        : 'STAGE 7 CLEAR!';

      const subText = isFromStage1
        ? 'STREETS SECURED - ENTERING NIGHTCLUB'
        : isFromStage2
        ? 'NIGHTCLUB SECURED - ENTERING PARKING GARAGE'
        : isFromStage3
        ? 'PARKING GARAGE SECURED - ENTERING DOWNTOWN RACE'
        : isFromStage4
        ? 'DOWNTOWN RACE SECURED - ENTERING THE CASINO'
        : isFromStage5
        ? 'THE CASINO SECURED - ENTERING POLICE PRECINCT'
        : isFromStage6
        ? 'POLICE PRECINCT SECURED - ENTERING EXECUTIVE PENTHOUSE'
        : 'EXECUTIVE PENTHOUSE SECURED - ASCENDING TO SKYSCRAPER ROOFTOP';

      const bonusText = isFromStage1
        ? 'STAGE BONUS: +5,000 PTS'
        : isFromStage2
        ? 'STAGE BONUS: +7,500 PTS'
        : isFromStage3
        ? 'STAGE BONUS: +10,000 PTS'
        : isFromStage4
        ? 'STAGE BONUS: +12,500 PTS'
        : isFromStage5
        ? 'STAGE BONUS: +15,000 PTS'
        : isFromStage6
        ? 'STAGE BONUS: +17,500 PTS'
        : 'STAGE BONUS: +20,000 PTS';

      const countdownSec = Math.ceil(remaining);
      const tickerText = isFromStage1
        ? `DANCEFLOOR UNLOCKS IN ${countdownSec}s...`
        : isFromStage2
        ? `PARKING GARAGE UNLOCKS IN ${countdownSec}s...`
        : isFromStage3
        ? `DOWNTOWN STREET RACE UNLOCKS IN ${countdownSec}s...`
        : isFromStage4
        ? `THE CASINO UNLOCKS IN ${countdownSec}s...`
        : isFromStage5
        ? `POLICE PRECINCT UNLOCKS IN ${countdownSec}s...`
        : isFromStage6
        ? `EXECUTIVE PENTHOUSE UNLOCKS IN ${countdownSec}s...`
        : `SKYSCRAPER ROOFTOP UNLOCKS IN ${countdownSec}s...`;

      // 1. Main Headline: Bold Yellow (#FACC15) with crisp black drop shadow & outline
      ctx.save();
      ctx.font = '900 46px Impact, "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 8;
      ctx.lineJoin = 'miter';
      ctx.strokeText(headerText, 0, -65);
      ctx.fillStyle = '#FACC15';
      ctx.fillText(headerText, 0, -65);
      ctx.restore();

      // 2. Subtitle: Crisp clean white (#FFFFFF) with crisp black drop shadow & outline
      ctx.save();
      ctx.font = 'bold 17px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.lineJoin = 'miter';
      ctx.strokeText(subText, 0, -18);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(subText, 0, -18);
      ctx.restore();

      // 3. Current Score: Crisp clean white (#FFFFFF) with crisp black drop shadow & outline
      ctx.save();
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.lineJoin = 'miter';
      const scoreText = `CURRENT SCORE: ${gameState.score.toLocaleString()}`;
      ctx.strokeText(scoreText, 0, 26);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(scoreText, 0, 26);
      ctx.restore();

      // 4. Stage Bonus: Crisp clean white (#FFFFFF) with crisp black drop shadow & outline
      ctx.save();
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.lineJoin = 'miter';
      ctx.strokeText(bonusText, 0, 64);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(bonusText, 0, 64);
      ctx.restore();

      // 5. Countdown text: Crisp clean white (#FFFFFF) with crisp black drop shadow & outline
      ctx.save();
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.lineJoin = 'miter';
      ctx.strokeText(tickerText, 0, 98);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(tickerText, 0, 98);
      ctx.restore();

      ctx.restore();
    }

    // --- CINEMATIC STREETS OF RAGE 4-STYLE STAGE OPENING SYSTEM ---
    if (stageIntroTimerRef.current > 0) {
      const elapsed = STAGE_INTRO_DURATION - stageIntroTimerRef.current;

      // 1. Smooth Fade-In From Black (0.8s duration: alpha from 1 down to 0)
      if (elapsed <= 0.8) {
        const fadeAlpha = Math.max(0, Math.min(1, 1.0 - (elapsed / 0.8)));
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
      }

      // 2. Stage Title Card Banner (~1.8s presentation)
      // Slide-in from left (0.0s - 0.3s), hold center-left (0.3s - 1.4s), slide/fade out (1.4s - 1.8s)
      const targetX = 50;
      const bannerY = Math.round(canvasHeight * 0.40); // 240px (center-left)
      let bannerX = targetX;
      let bannerAlpha = 1.0;

      if (elapsed < 0.3) {
        const pIn = Math.max(0, Math.min(1, elapsed / 0.3));
        const easeIn = Math.sin((pIn * Math.PI) / 2);
        bannerX = -460 + (targetX + 460) * easeIn;
        bannerAlpha = Math.min(1, pIn * 2.5);
      } else if (elapsed <= 1.4) {
        bannerX = targetX;
        bannerAlpha = 1.0;
      } else {
        const pOut = Math.max(0, Math.min(1, (elapsed - 1.4) / 0.4));
        const easeOut = pOut * pOut;
        bannerX = targetX - easeOut * 460;
        bannerAlpha = Math.max(0, 1.0 - pOut);
      }

      const bw = 430;
      const bh = 98;
      const skew = 22; // Sleek angled parallelogram skew

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, bannerAlpha));

      // 2A. Sleek Angled Parallelogram Backdrop with Dark Translucent Fill
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bannerX + skew, bannerY);
      ctx.lineTo(bannerX + bw + skew, bannerY);
      ctx.lineTo(bannerX + bw - skew, bannerY + bh);
      ctx.lineTo(bannerX - skew, bannerY + bh);
      ctx.closePath();

      ctx.shadowColor = 'rgba(0, 0, 0, 0.92)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = 'rgba(10, 15, 30, 0.78)';
      ctx.fill();

      // Cyber cyan outer border
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 2B. Angled Left Edge Accent Trim (Vibrant cyan/yellow/orange bar)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bannerX + skew, bannerY);
      ctx.lineTo(bannerX + skew + 8, bannerY);
      ctx.lineTo(bannerX - skew + 8, bannerY + bh);
      ctx.lineTo(bannerX - skew, bannerY + bh);
      ctx.closePath();
      const leftBarGrad = ctx.createLinearGradient(0, bannerY, 0, bannerY + bh);
      leftBarGrad.addColorStop(0, '#00f0ff');
      leftBarGrad.addColorStop(0.5, '#ffd700');
      leftBarGrad.addColorStop(1, '#ff6600');
      ctx.fillStyle = leftBarGrad;
      ctx.fill();
      ctx.restore();

      // 2C. Subtle Horizontal Accent Bar between Stage number and location name
      const dividerY = bannerY + 44;
      const dividerGrad = ctx.createLinearGradient(bannerX + 24, dividerY, bannerX + bw - 30, dividerY);
      dividerGrad.addColorStop(0, '#00f0ff');
      dividerGrad.addColorStop(0.35, '#ffd700');
      dividerGrad.addColorStop(0.8, 'rgba(255, 215, 0, 0.35)');
      dividerGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = dividerGrad;
      ctx.fillRect(bannerX + 24, dividerY, bw - 60, 2.5);

      // 2D. "STAGE [X]" in Bold Yellow/Cyan Accent Lettering
      const stageNum = currentStageRef.current;
      const stageNumText = `STAGE ${stageNum}`;
      ctx.save();
      ctx.font = 'italic 900 22px Impact, "Arial Black", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.lineJoin = 'miter';
      ctx.strokeText(stageNumText, bannerX + 28, bannerY + 24);

      const stageTextGrad = ctx.createLinearGradient(bannerX + 28, bannerY + 12, bannerX + 28, bannerY + 36);
      stageTextGrad.addColorStop(0, '#ffffff');
      stageTextGrad.addColorStop(0.35, '#ffea00');
      stageTextGrad.addColorStop(1, '#00f0ff');
      ctx.fillStyle = stageTextGrad;
      ctx.fillText(stageNumText, bannerX + 28, bannerY + 24);
      ctx.restore();

      // 2E. Stage Location Name in Crisp White Uppercase Text with Dark Drop Shadow
      const locationName = STAGE_NAMES[stageNum] || 'CITY STREETS';
      ctx.save();
      ctx.font = 'italic 900 28px Impact, "Arial Black", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.lineJoin = 'miter';
      ctx.strokeText(locationName, bannerX + 28, bannerY + 71);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(locationName, bannerX + 28, bannerY + 71);
      ctx.restore();

      ctx.restore();
    }

    if (blackOverlayAlphaRef.current >= 0.999) {
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    }
  };

  const updateRef = useRef(update);
  const drawRef = useRef(draw);
  updateRef.current = update;
  drawRef.current = draw;

  useEffect(() => {
    let raf = 0;
    let lastTime = 0;
    const loop = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      // Update cinematic fade transition system
      updateTransitionRef.current(dt);

      // Poll USB joysticks / gamepads every frame
      const gp = pollGamepadsRef.current();
      currentGamepadRef.current = gp;
      handleGamepadUiRef.current(gp);
      prevGamepadRef.current = gp;

      if (inputRef.current) {
        const cancelPressed = inputRef.current.actions.cancel;
        if (cancelPressed && !lastCancelRef.current) {
          const currentStatus = gameStateRef.current.status;
          if (currentStatus === 'PLAYING') {
            setIsGameMenuOpen((prev) => !prev);
          } else if (currentStatus === 'START') {
            exitChat({}).catch(() => {});
          } else if (['GAME_OVER', 'VICTORY'].includes(currentStatus)) {
            setGameState((prev) => ({ ...prev, status: 'START' }));
          }
        }
        lastCancelRef.current = cancelPressed;
      }

      stepperRef.current?.(time, (stepDt) => updateRef.current(stepDt));

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawRef.current(ctx);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [exitChat]);

  const playerHp = playerRef.current.health;
  const playerMaxHp = playerRef.current.maxHealth;
  const hpPercent = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));

  return (
    <div className="fixed inset-0 overflow-hidden touch-none flex flex-col items-center justify-between bg-slate-950 text-white font-sans select-none">
      {!allAssetsReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white">
          <div className="text-xl font-bold tracking-wider text-cyan-400 animate-pulse">
            LOADING ASSETS...
          </div>
        </div>
      )}

      {/* USB GAMEPAD / JOYSTICK CONNECTION NOTIFICATION TOAST */}
      {gamepadNotification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-950/90 border-2 border-cyan-400 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.7)] backdrop-blur-md flex items-center gap-2.5 text-xs sm:text-sm font-mono font-bold text-cyan-300 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-3">
          <Gamepad size={18} className="text-cyan-400 shrink-0 animate-pulse" />
          <span>{gamepadNotification}</span>
        </div>
      )}

      {/* DEDICATED TOP HUD BAR */}
      <header className="w-full h-14 bg-slate-900/90 border-b border-cyan-500/30 flex items-center justify-between px-4 z-20 shrink-0 backdrop-blur-sm">
        {/* Left: Night Razor Face Portrait Emblem & Dynamic Health Bar */}
        <div className="flex items-center gap-2.5">
          {/* Glowing Emblem Circle Frame with Night Razor's Portrait */}
          <div className="relative w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_12px_rgba(0,240,255,0.7)] border border-cyan-300 flex items-center justify-center overflow-hidden shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
              <PortraitDisplay asset={externalAssets['hero_portrait']} />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-black text-white tracking-wider"
                style={{textShadow: '1px 1px 2px rgba(0, 0, 0, 0.85)'}}>
                NIGHT RAZOR
              </span>
              <span className="text-[10px] text-slate-400 font-mono">LIVES: {gameState.lives}</span>
              <span className="text-[10px] font-mono font-bold text-yellow-300 bg-yellow-950/70 border border-yellow-500/50 px-1.5 py-0.5 rounded shadow-[0_0_6px_rgba(234,179,8,0.3)]">
                CONTINUES: {continues}
              </span>
              {playerRef.current.hasPipe && (
                <span className="text-[9px] bg-slate-700 px-1 py-0.5 rounded text-cyan-300 font-mono">
                  PIPE
                </span>
              )}
            </div>
            {/* Dynamic Health Bar (Gold/Orange >30% -> Bright Red <=30%) */}
            <div
              className={`w-32 md:w-48 h-3.5 bg-slate-950 rounded-sm border transition-colors duration-200 overflow-hidden relative ${
                hpPercent <= 30
                  ? 'border-red-500/90 shadow-[0_0_10px_rgba(255,30,30,0.6)]'
                  : 'border-slate-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]'
              }`}>
              <div
                className={`h-full transition-all duration-150 ${
                  hpPercent <= 30 ? 'animate-pulse' : ''
                }`}
                style={{
                  width: `${hpPercent}%`,
                  background:
                    hpPercent <= 30
                      ? 'linear-gradient(90deg, #FF1E1E 0%, #B80000 100%)'
                      : 'linear-gradient(90deg, #FFD700 0%, #FF6B00 100%)',
                  boxShadow:
                    hpPercent <= 30
                      ? '0 0 10px rgba(255, 30, 30, 0.9), inset 0 1px 2px rgba(255, 200, 200, 0.6)'
                      : 'inset 0 1px 2px rgba(255, 255, 255, 0.5), 0 0 6px rgba(255, 215, 0, 0.4)',
                }}
              />
              <span
                className="absolute inset-0 flex items-center justify-center text-[9px] font-black font-mono text-white tracking-wider pointer-events-none select-none"
                style={{
                  textShadow:
                    '0 0 3px rgba(0, 0, 0, 0.9), 1px 1px 0 rgba(0, 0, 0, 0.9), -1px -1px 0 rgba(0, 0, 0, 0.9), 1px -1px 0 rgba(0, 0, 0, 0.9), -1px 1px 0 rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.9)',
                }}>
                {Math.ceil(playerHp)} / {playerMaxHp}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Stage/Wave and Score */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-[10px] text-slate-400 font-mono uppercase">
              {gameState.status === 'INTRO_CUTSCENE'
                ? 'PROLOGUE'
                : gameState.status === 'OUTRO_CUTSCENE'
                ? 'EPILOGUE'
                : gameState.status === 'INTERMISSION_CUTSCENE'
                ? 'INTERMISSION'
                : `STAGE ${currentStageRef.current}`}
            </div>
            <div className="text-sm font-black text-yellow-400">
              {gameState.status === 'INTRO_CUTSCENE' || gameState.status === 'OUTRO_CUTSCENE'
                ? `SLIDE ${cutsceneSlide + 1} / 3`
                : gameState.status === 'INTERMISSION_CUTSCENE' && intermissionCutscene
                ? `SLIDE ${intermissionCutscene.slideIndex + 1} / 2`
                : currentStageRef.current === 8
                ? (stage8WaveRef.current === 3 ? 'FINAL BOSS' : `WAVE ${stage8WaveRef.current} / 3`)
                : currentStageRef.current === 7
                ? `WAVE ${stage7WaveRef.current} / 3`
                : currentStageRef.current === 6
                ? (stage6WaveRef.current === 4 ? 'BOSS' : `WAVE ${stage6WaveRef.current} / 4`)
                : currentStageRef.current === 5
                ? `WAVE ${stage5WaveRef.current} / 3`
                : currentStageRef.current === 4
                ? (stage4WaveRef.current === 4 ? 'BOSS' : `WAVE ${stage4WaveRef.current} / 4`)
                : currentStageRef.current === 3
                ? `WAVE ${stage3WaveRef.current} / 3`
                : currentStageRef.current === 2
                ? (stage2WaveRef.current === 4 ? 'BOSS' : `WAVE ${stage2WaveRef.current} / 4`)
                : `WAVE ${stage1WaveRef.current} / 4`}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-400 font-mono uppercase">SCORE</div>
            <div className="text-sm md:text-base font-black text-white font-mono">
              {gameState.score.toLocaleString()}
            </div>
          </div>
          {comboCountRef.current > 1 && (
            <div className="hidden sm:flex flex-col items-center animate-bounce">
              <span className="text-[9px] font-black text-pink-500 tracking-widest">COMBO</span>
              <span className="text-base font-black text-yellow-300 drop-shadow-[0_0_8px_rgba(255,0,85,0.8)]">
                {comboCountRef.current}x
              </span>
            </div>
          )}
        </div>

        {/* Top-Right: Sound Toggle & Game Menu Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudioMute}
            aria-label={musicMuted || sfxMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
            title="Toggle Mute (M key)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md border ${
              musicMuted || sfxMuted
                ? 'bg-rose-950/70 border-rose-500/60 text-rose-300 hover:bg-rose-900/80'
                : 'bg-slate-800 hover:bg-slate-700 border-cyan-500/40 text-cyan-300'
            }`}>
            {musicMuted || sfxMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span className="hidden md:inline font-mono">{musicMuted || sfxMuted ? 'MUTED' : 'AUDIO'}</span>
          </button>

          <button
            onClick={() => setIsGameMenuOpen((prev) => !prev)}
            data-testid="menu-toggle-button"
            aria-label="Pause Game (P / Esc)"
            title="Pause Game (P / Esc)"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 transition-all shadow-md">
            <Menu size={16} />
            <span className="hidden sm:inline">PAUSE</span>
          </button>
        </div>
      </header>

      {/* GAME CANVAS WRAPPER */}
      <div className="flex-1 w-full min-h-0 relative flex items-center justify-center bg-black overflow-hidden">
                            <div
            className="relative flex items-center justify-center shadow-2xl overflow-hidden"
            style={{
              aspectRatio: `${canvasWidth} / ${canvasHeight}`,
              width: 'min(100vw, calc((100dvh - 3.5rem) * 4 / 3))',
              height: 'min(calc(100dvh - 3.5rem), calc(100vw * 3 / 4))',
              maxWidth: '100%',
              maxHeight: '100%',
            }}>


          {allAssetsReady && (
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full h-full object-contain block select-none"
            />
          )}

          {/* CUSTOM 4:3 COMIC CUTSCENE OVERLAY (PRE-STAGE 1 INTRO & POST-VICTOR OUTRO) */}
          {(gameState.status === 'INTRO_CUTSCENE' || gameState.status === 'OUTRO_CUTSCENE') && (
            <div
              className="absolute inset-0 z-40 flex flex-col justify-between p-3 sm:p-5 cursor-pointer select-none"
              onClick={advanceCutscene}
              role="region"
              aria-label="Comic Cutscene">
              {/* Top Bar: Slide Indicator Pill & SKIP ⏭ Button */}
              <div className="flex items-center justify-between w-full pointer-events-auto">
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-black/75 border border-cyan-500/50 rounded-full backdrop-blur-md shadow-lg">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                    {gameState.status === 'INTRO_CUTSCENE' ? 'INTRO' : 'OUTRO'}
                  </span>
                  <div className="flex items-center gap-1.5 ml-1">
                    {[0, 1, 2].map((idx) => (
                      <div
                        key={idx}
                        className={`transition-all duration-200 rounded-full ${
                          cutsceneSlide === idx
                            ? 'w-5 h-1.5 bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                            : 'w-1.5 h-1.5 bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    skipCutscene();
                  }}
                  aria-label="Skip Cutscene"
                  className="px-4 py-2 bg-slate-950/80 hover:bg-slate-900 active:scale-95 text-slate-200 hover:text-white border border-slate-700/80 rounded-full font-mono font-bold text-xs sm:text-sm tracking-wider backdrop-blur-md transition-all shadow-lg flex items-center gap-1.5">
                  <span>SKIP ⏭</span>
                </button>
              </div>

              {/* Bottom Right: Clean Corner NEXT ▶ Button */}
              <div className="flex items-center justify-end w-full pointer-events-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    advanceCutscene();
                  }}
                  aria-label="Next Slide"
                  className="px-6 py-2.5 bg-slate-950/85 hover:bg-slate-900 active:scale-95 text-cyan-300 hover:text-cyan-200 border-2 border-cyan-400/90 rounded-full font-mono font-black text-xs sm:text-sm tracking-wider backdrop-blur-md transition-all shadow-[0_0_20px_rgba(0,240,255,0.6)] hover:shadow-[0_0_30px_rgba(0,240,255,0.9)] flex items-center gap-2">
                  <span>
                    {cutsceneSlide < 2
                      ? 'NEXT ▶'
                      : gameState.status === 'INTRO_CUTSCENE'
                      ? 'START BRAWL ▶'
                      : 'VICTORY ▶'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 2-SLIDE MID-GAME INTERMISSION CUTSCENE OVERLAY */}
          {gameState.status === 'INTERMISSION_CUTSCENE' && intermissionCutscene && (
            <div
              className="absolute inset-0 z-40 flex flex-col justify-between p-3 sm:p-5 cursor-pointer select-none"
              onClick={advanceIntermissionCutscene}
              role="region"
              aria-label="Intermission Cutscene">
              {/* Top Bar: Slide Indicator Pill & SKIP ⏭ Button */}
              <div className="flex items-center justify-between w-full pointer-events-auto">
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-black/75 border border-cyan-500/50 rounded-full backdrop-blur-md shadow-lg">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                    INTERMISSION
                  </span>
                  <div className="flex items-center gap-1.5 ml-1">
                    {[0, 1].map((idx) => (
                      <div
                        key={idx}
                        className={`transition-all duration-200 rounded-full ${
                          intermissionCutscene.slideIndex === idx
                            ? 'w-5 h-1.5 bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                            : 'w-1.5 h-1.5 bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    skipIntermissionCutscene();
                  }}
                  aria-label="Skip Cutscene"
                  className="px-4 py-2 bg-slate-950/80 hover:bg-slate-900 active:scale-95 text-slate-200 hover:text-white border border-slate-700/80 rounded-full font-mono font-bold text-xs sm:text-sm tracking-wider backdrop-blur-md transition-all shadow-lg flex items-center gap-1.5">
                  <span>SKIP ⏭</span>
                </button>
              </div>

              {/* Bottom Right: Clean Corner NEXT ▶ Button */}
              <div className="flex items-center justify-end w-full pointer-events-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    advanceIntermissionCutscene();
                  }}
                  aria-label="Next Slide"
                  className="px-6 py-2.5 bg-slate-950/85 hover:bg-slate-900 active:scale-95 text-cyan-300 hover:text-cyan-200 border-2 border-cyan-400/90 rounded-full font-mono font-black text-xs sm:text-sm tracking-wider backdrop-blur-md transition-all shadow-[0_0_20px_rgba(0,240,255,0.6)] hover:shadow-[0_0_30px_rgba(0,240,255,0.9)] flex items-center gap-2">
                  <span>
                    {intermissionCutscene.slideIndex === 0
                      ? 'NEXT ▶'
                      : `START STAGE ${intermissionCutscene.targetStage} ▶`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* CINEMATIC BLACKOUT FADE OVERLAY */}
          <div
            ref={fadeOverlayRef}
            data-testid="fade-overlay"
            aria-hidden="true"
            className="absolute inset-0 z-50 bg-black pointer-events-none transition-none"
            style={{
              opacity: blackOverlayAlpha,
              pointerEvents: isTransitioning ? 'auto' : 'none',
              display: blackOverlayAlpha > 0 || isTransitioning ? 'block' : 'none',
            }}
          />

          {/* CUSTOM 4:3 TITLE MENU OVERLAY */}
          {gameState.status === 'START' && !autoStartPending && allAssetsReady && (
            <div
              ref={startOverlayRef}
              role="dialog"
              aria-modal="true"
              aria-label="Night Razor Title Screen"
              data-overlay-container=""
              data-playground-modal="true"
              className="absolute inset-0 z-40 flex flex-col justify-end items-center overflow-hidden select-none">
              {/* Cover Art filling 4:3 canvas edge-to-edge */}
              <img
                src={resolveDirectImageUrl(COVER_ART_URLS.title_cover)}
                alt="Night Razor Title Cover"
                crossOrigin="anonymous"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Bottom sleek compact controls positioned cleanly along the very bottom edge */}
              <div className="relative z-10 w-full pb-3 sm:pb-5 pt-6 px-4 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col items-center gap-2">
                {/* Sleek, compact START GAME button */}
                <button
                  autoFocus
                  data-testid="start-button"
                  onClick={() => {
                    audioManager.preload();
                    audioManager.onUserInteraction(false);
                    initGame();
                  }}
                  className="px-8 sm:px-12 py-3 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:via-sky-300 hover:to-blue-400 active:scale-95 text-slate-950 font-black text-lg sm:text-xl tracking-wider rounded-full shadow-[0_0_25px_rgba(0,240,255,0.7)] hover:shadow-[0_0_35px_rgba(0,240,255,0.9)] transition-all flex items-center gap-2.5 border-2 border-white/80">
                  <Play size={20} fill="currentColor" />
                  <span>START GAME</span>
                </button>

                {/* Secondary sleek controls: How to Play */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsHowToPlayOpen(true)}
                    className="px-3 py-1 bg-slate-900/80 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white border border-slate-700/60 rounded-lg text-xs font-mono font-bold tracking-wider backdrop-blur-md transition-all shadow-md flex items-center gap-1">
                    <HelpCircle size={13} className="text-cyan-400" />
                    <span>HOW TO PLAY</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOM 4:3 GAME OVER OVERLAY */}
          {gameState.status === 'GAME_OVER' && (
            <div
              ref={gameOverOverlayRef}
              role="dialog"
              aria-modal="true"
              aria-label="Night Razor Game Over"
              data-overlay-container=""
              data-playground-modal="true"
              className="absolute inset-0 z-40 flex flex-col justify-end items-center overflow-hidden select-none">
              {/* Custom Game Over Artwork at full brightness and clarity without tinted overlays */}
              <img
                src={resolveDirectImageUrl(COVER_ART_URLS.game_over_screen)}
                alt="Night Razor Game Over"
                crossOrigin="anonymous"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Lower section below the GAME OVER artwork lettering */}
              <div className="relative z-10 w-full pb-5 sm:pb-8 pt-6 px-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center gap-2.5">
                {/* Single clean Final Score readout */}
                <div className="px-5 py-1.5 rounded-xl bg-black/75 border border-yellow-400/60 shadow-[0_0_15px_rgba(255,215,0,0.25)] backdrop-blur-sm flex items-center gap-3">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-yellow-400 uppercase">
                    FINAL SCORE
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wider drop-shadow-[0_2px_8px_rgba(255,215,0,0.6)]">
                    {gameState.score.toLocaleString()}
                  </span>
                </div>

                {/* Interactive PLAY AGAIN and QUIT TO TITLE MENU buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    autoFocus
                    data-testid="start-button"
                    onClick={() => {
                      stopGameOverSound();
                      audioManager.preload();
                      audioManager.onUserInteraction(true);
                      initGame();
                    }}
                    className="px-8 sm:px-10 py-3 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:to-amber-400 active:scale-95 text-white font-black text-base sm:text-lg tracking-wider rounded-full shadow-[0_0_25px_rgba(255,50,50,0.6)] hover:shadow-[0_0_35px_rgba(255,100,50,0.8)] transition-all flex items-center gap-2.5 border-2 border-yellow-300">
                    <RotateCw size={20} />
                    <span>PLAY AGAIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopGameOverSound();
                      musicManager.stopMusic();
                      setContinues(3);
                      continuesRef.current = 3;
                      setGameState((prev) => ({ ...prev, status: 'START' }));
                    }}
                    className="px-5 py-3 bg-slate-900/80 hover:bg-slate-800 active:scale-95 text-slate-200 hover:text-white border border-slate-700 rounded-full text-xs sm:text-sm font-mono font-bold tracking-wider backdrop-blur-sm transition-all shadow-md">
                    QUIT TO TITLE MENU
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

          {/* SLEEK ARCADE CONTINUE MODAL OVERLAY */}
          {showContinueModal && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Continue Game"
              className="absolute inset-0 z-45 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200">
              <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-400 rounded-2xl p-6 shadow-[0_0_35px_rgba(0,240,255,0.45)] flex flex-col items-center gap-4 text-center">
                {/* Title */}
                <h2 className="text-3xl sm:text-4xl font-black italic tracking-wider text-yellow-400 drop-shadow-[0_2px_10px_rgba(250,204,21,0.6)]">
                  CONTINUE?
                </h2>

                {/* Stage indicator */}
                <div className="text-xs font-mono text-cyan-300 font-bold tracking-widest uppercase">
                  STAGE {currentStageRef.current}: {STAGE_NAMES[currentStageRef.current] || 'CITY STREETS'}
                </div>

                {/* Continues remaining badge */}
                <div className="px-4 py-2 bg-slate-950/90 border border-cyan-500/60 rounded-xl shadow-inner flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-300">CONTINUES REMAINING:</span>
                  <span className="text-xl font-black font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                    {continues}
                  </span>
                </div>

                <p className="text-xs text-slate-400 max-w-[260px] leading-relaxed">
                  Restart from the beginning of Stage {currentStageRef.current} with 100% HP!
                </p>

                {/* Action Buttons */}
                <div className="w-full flex flex-col gap-2.5 mt-2">
                  <button
                    autoFocus
                    onClick={useContinue}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 active:scale-95 text-slate-950 font-black text-base sm:text-lg tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.7)] hover:shadow-[0_0_30px_rgba(0,240,255,0.9)] transition-all flex items-center justify-center gap-2 border-2 border-white/80">
                    <RotateCw size={20} />
                    <span>USE CONTINUE</span>
                  </button>

                  <button
                    onClick={quitFromContinue}
                    className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-white rounded-lg text-xs font-mono font-bold tracking-wider transition-colors border border-slate-700/60">
                    QUIT TO TITLE
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 font-mono">
                  Press <span className="text-cyan-400 font-bold">SPACE / ENTER / Z / A / X</span> to Continue
                  <br />
                  <span className="text-rose-400 font-bold">ESC / B</span> to Quit
                </div>
              </div>
            </div>
          )}

        {/* MOBILE CONTROLS OVERLAY - Scaled and anchored strictly inside the visible screen safe area (0 to window.innerWidth) in both portrait and landscape */}
                        {(isMobile || 'ontouchstart' in window || navigator.maxTouchPoints > 0) && gameState.status === 'PLAYING' && !isGameMenuOpen && !showContinueModal && (

          <div
            className="absolute inset-0 pointer-events-none z-30 flex justify-between items-end p-2 sm:p-4 overflow-hidden"
            style={{
              maxWidth: '100vw',
              paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
              paddingLeft: 'max(0.5rem, env(safe-area-inset-left, 0.5rem))',
              paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0.5rem))',
            }}>
            {/* Custom 8-Way Red Arcade Joystick (Bottom-Left) */}
            <ArcadeJoystick
              controls={arcadeControls}
              touchActionsRef={touchActionsRef}
              onUserInteraction={() => audioManager.onUserInteraction(true)}
            />

            {/* Custom 4 Metallic Arcade Buttons in Diamond Layout (Bottom-Right: S-Top, P-Left, J-Right, K-Bottom) */}
            <ArcadeDiamondButtons
              controls={arcadeControls}
              touchActionsRef={touchActionsRef}
              onUserInteraction={() => audioManager.onUserInteraction(true)}
            />
          </div>
        )}
      </div>

      {/* GAME MENU OVERLAY */}
      {isGameMenuOpen && (
        <MenuOverlay tone="neutral" zIndex={60}>
          <div className="w-full max-w-md bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-white">
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-3">
              <h2 className="text-2xl font-black text-cyan-400 tracking-wider">GAME MENU</h2>
              <button
                onClick={() => setIsGameMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>

            <button
              onClick={() => setIsGameMenuOpen(false)}
              autoFocus
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl text-base flex items-center justify-center gap-2 transition-all shadow-md">
              <Play size={20} />
              RESUME BRAWL
            </button>

            <div className="w-full grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const next = !sfxMuted;
                  setSfxMuted(next);
                  audioManager.setSfxMuted(next);
                }}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-colors ${
                  sfxMuted
                    ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-cyan-300 hover:bg-slate-700'
                }`}>
                {sfxMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                SFX: {sfxMuted ? 'OFF' : 'ON'}
              </button>

              <button
                onClick={() => {
                  const next = !musicMuted;
                  setMusicMuted(next);
                  audioManager.setMusicMuted(next);
                }}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-colors ${
                  musicMuted
                    ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-cyan-300 hover:bg-slate-700'
                }`}>
                {musicMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                MUSIC: {musicMuted ? 'OFF' : 'ON'}
              </button>
            </div>

            <button
              onClick={() => {
                setIsGameMenuOpen(false);
                restartCurrentStage();
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
              <RotateCw size={16} />
              RETRY CURRENT STAGE
            </button>

            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
              <HelpCircle size={16} />
              HOW TO PLAY
            </button>

            <button
              onClick={() => {
                setIsGameMenuOpen(false);
                musicManager.stopMusic();
                setGameState((prev) => ({ ...prev, status: 'START' }));
              }}
              className="w-full py-2 bg-transparent hover:bg-red-950/40 text-red-400 font-semibold rounded-xl text-xs transition-all">
              QUIT TO TITLE
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* HOW TO PLAY MODAL */}
      {isHowToPlayOpen && (
        <MenuOverlay tone="neutral" zIndex={70}>
          <div className="w-full max-w-md bg-slate-900 border-2 border-cyan-400 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-white">
            <h2 className="text-2xl font-black text-cyan-400">HOW TO PLAY</h2>
            <div className="w-full text-xs text-slate-300 space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p>
                <strong className="text-cyan-400">🎮 USB & BLUETOOTH GAMEPAD / ARCADE FIGHTSTICK:</strong>
                <br />• Movement: Left Analog Stick (0.25 deadzone) or D-Pad
                <br />• Punch: Button 2 (X / Square) or Button 4 (LB / L1)
                <br />• Kick: Button 3 (Y / Triangle) or Button 7 (RT / R2)
                <br />• Jump: Button 0 (A / Cross)
                <br />• Special Gun Burst: Button 1 (B / Circle) or Button 5 (RB / R1)
                <br />• Start / Confirm / Advance: Button 9 (Start) or Button 0 / 2 (A / X)
                <br />• Pause / Skip: Button 8 (Select / Share)
              </p>
              <p>
                <strong className="text-yellow-400">MOVEMENT:</strong> Use Arrow Keys (or WASD / Virtual D-pad / Joystick) to maneuver freely across road lanes (Y: 360-570).
              </p>
              <p>
                <strong className="text-emerald-400">JUMP (C / Space):</strong> 2.5D Jump into the air! Steer across lanes while airborne; ground shadow tracks your base landing spot.
              </p>
              <p>
                <strong className="text-yellow-400">PUNCH (Z):</strong> 4-Hit Arcade Combo Chain: Jab (15) &rarr; Jab (15) &rarr; Body Blow (25) &rarr; Finisher Kick (30 Knockdown)! In mid-air: aerial jump jab!
              </p>
              <p>
                <strong className="text-amber-400">KICK (X):</strong> Heavy roundhouse on ground. In mid-air: flying dropkick with massive knockdown power!
              </p>
              <p>
                <strong className="text-cyan-400">AUTO WALK-IN GRAB:</strong> Walk directly into Street Punks without attacking to lock into a grapple!
              </p>
              <p>
                <strong className="text-cyan-300">GRAB COMBOS:</strong>
                <br />• Neutral Punch/Kick: deliver crushing knee strikes (up to 3x)!
                <br />• Left/Right + Punch/Kick: execute Overhead Throw into oncoming enemy crowds!
              </p>
              <p>
                <strong className="text-pink-400">SPECIAL GUN BURST (C / V):</strong> Tactical 3-shot gun burst! Costs 8 HP (safety capped at 1 HP). Shot 1 & 2 deal 15 damage; Shot 3 deals 30 damage with heavy knockdown!
              </p>
              <p>
                <strong className="text-emerald-400">BREAKABLE PROPS & ITEMS:</strong>
                <br />• Stage 1 Streets: Smash Fire Hydrants and Wire-Mesh Trash Cans!
                <br />• Stage 2 Nightclub: Smash Bar Stools, Club Dinner Tables, and heavy DJ Speakers on the dancefloor!
                <br />• Stage 3 Parking Garage: Smash Road Cones (1-hit), Tires (2-hits), and heavy Oil Drums (2-hits) for recovery food and score pickups!
                <br />• Stage 4 Downtown Race: Smash road barriers, tires, oil drums, and hydrants along the speedway!
                <br />• Stage 5 The Casino: Smash Brass Stanchions (1-hit), Casino Cocktail Tables (1-hit), and Casino Bar Stools (2-hits) for food & casino score bonuses!
                <br />• Stage 6 Police Precinct: Smash Wooden Chairs (1-hit), Water Coolers (2-hits), and Metal Trash Cans (2-hits) for recovery food & precinct score bonuses!
                <br />• Stage 7 Penthouse: Smash Ceramic Plants (1-hit), Metallic Statues (2-hits), and Executive Chairs (2-hits) for food & score items!
                <br />• Stage 8 Rooftop: Smash Wooden Crates, Metal Bins, and Trash Cans across the rooftop helipad and access shed for food & score recovery!
                <br />• Recover Food (+30 HP) and Score Badges (+250 PTS)! Custom pickup pose triggers upon collection with bonus score!
              </p>
            </div>
            <button
              onClick={() => setIsHowToPlayOpen(false)}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl text-sm transition-all">
              CLOSE GUIDE
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* VICTORY OVERLAY */}
      {gameState.status === 'VICTORY' && (
        <Overlay
          title="PEARL CITY SAVED!"
          description={`Victor and the Syndicate have been defeated! Final Score: ${gameState.score.toLocaleString()}`}
          actionLabel="PLAY AGAIN"
          onAction={resetGame}
          icon={<RotateCw size={24} />}
          tone="victory">
          <button
            type="button"
            onClick={() => {
              musicManager.stopMusic();
              stopGameOverSound();
              setGameState({
                status: 'START',
                score: 0,
                level: 1,
                lives: getConfig('startingLives') as number,
              });
            }}
            className="mt-4 px-6 py-2.5 bg-slate-900/80 hover:bg-slate-800 active:scale-95 text-slate-200 hover:text-white border border-slate-700 rounded-full font-mono text-xs sm:text-sm font-bold tracking-wider backdrop-blur-md transition-all shadow-md">
            RETURN TO TITLE MENU
          </button>
        </Overlay>
      )}
    </div>
  );
}

