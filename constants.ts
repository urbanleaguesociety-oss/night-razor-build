import {SpriteConfig} from './utils/helper';

/**
 * Configuration for the Night Razor game.
 */
export const CONFIG = {
  // Game basics
  title: {
    value: 'Night Razor',
    type: 'string',
    label: 'Game Title',
    group: 'GAME',
  },
  baseCanvasWidth: {
    value: 800,
    type: 'number',
    label: 'Base Canvas Width',
    group: 'GAME',
  },
  baseCanvasHeight: {
    value: 600,
    type: 'number',
    label: 'Base Canvas Height',
    group: 'GAME',
  },

  // System Constants for the physics loop
  targetFPS: {
    value: 60,
    type: 'number',
    label: 'Target FPS',
    group: 'SYSTEM',
  },
  stepMs: {
    value: 1000 / 60,
    type: 'number',
    label: 'Step MS',
    group: 'SYSTEM',
  },
  maxSubSteps: {
    value: 5,
    type: 'number',
    label: 'Max Sub Steps',
    group: 'SYSTEM',
  },

  // Thematic elements enforcing the unique game aesthetic
  backgroundColor: {
    value: '#0f051d',
    type: 'color',
    label: 'Background Color',
    group: 'THEME',
  },
  primaryColor: {
    value: '#00f0ff',
    type: 'color',
    label: 'Primary Color',
    group: 'THEME',
  },
  accentColor: {
    value: '#ff0055',
    type: 'color',
    label: 'Accent Color',
    group: 'THEME',
  },
  fontFamily: {
    value: "'Press Start 2P', monospace, sans-serif",
    type: 'string',
    label: 'Font Family',
    group: 'THEME',
  },

  // Audio levels
  defaultMusicVolume: {
    value: 0.81,
    type: 'number',
    label: 'Default Music Volume',
    group: 'AUDIO',
  },
  defaultSfxVolume: {
    value: 0.35,
    type: 'number',
    label: 'Default SFX Volume',
    group: 'AUDIO',
  },

  // Gameplay Tuning & Rules (Tunable in Playground)
  playerMaxHealth: {
    value: 100,
    type: 'number',
    label: 'Player Max Health',
    group: 'Rules',
  },
  playerSpeed: {
    value: 260,
    type: 'number',
    label: 'Player Move Speed',
    group: 'Physics',
  },
  playerSpecialHpCost: {
    value: 8,
    type: 'number',
    label: 'Special Move HP Cost',
    group: 'Rules',
  },
  startingLives: {
    value: 3,
    type: 'number',
    label: 'Starting Lives',
    group: 'Rules',
  },
  enemyPunkSpeed: {
    value: 105.3,
    type: 'number',
    label: 'Punk Move Speed',
    group: 'Physics',
  },
  enemyBossSpeed: {
    value: 94,
    type: 'number',
    label: 'Boss Move Speed',
    group: 'Physics',
  },
  pipeBonusDamage: {
    value: 15,
    type: 'number',
    label: 'Pipe Bonus Damage',
    group: 'Rules',
  },

  // Asset dimensions and aspect ratios from metadata
  assetSkylineAspectRatio: {
    value: 1376 / 768, // ~1.7916
    type: 'number',
    label: 'Skyline Aspect Ratio',
    group: 'ASSETS',
  },
  assetStreetAspectRatio: {
    value: 1376 / 335, // ~4.107
    type: 'number',
    label: 'Street Road Aspect Ratio',
    group: 'ASSETS',
  },
  assetCrateAspectRatio: {
    value: 1.0, // 558x558
    type: 'number',
    label: 'Crate Aspect Ratio',
    group: 'ASSETS',
  },
  assetSnackAspectRatio: {
    value: 822 / 372, // ~2.2096
    type: 'number',
    label: 'Snack Aspect Ratio',
    group: 'ASSETS',
  },
  assetPipeAspectRatio: {
    value: 862 / 126, // ~6.841
    type: 'number',
    label: 'Pipe Aspect Ratio',
    group: 'ASSETS',
  },
  assetBadgeAspectRatio: {
    value: 556 / 680, // ~0.8176
    type: 'number',
    label: 'Badge Aspect Ratio',
    group: 'ASSETS',
  },

  // Stage 2 Breakable URLs (Direct Raw Images)
  clubStoolUrl: {
    value: 'https://i.postimg.cc/7hsmdsCJ/Bar-stool-game-asset-5cc81bbe.jpg',
    type: 'string',
    label: 'Club Stool Image URL',
    group: 'ASSETS',
  },
  clubSpeakerUrl: {
    value: 'https://i.postimg.cc/sfw6MXTL/DJ-club-speaker-street-prop-ca2a06ac.jpg',
    type: 'string',
    label: 'Club Speaker Image URL',
    group: 'ASSETS',
  },
  clubTableUrl: {
    value: 'https://i.postimg.cc/qqbjSbts/Club-dining-table-sprite-asset-c4524b47.jpg',
    type: 'string',
    label: 'Club Table Image URL',
    group: 'ASSETS',
  },

  // Legacy template key support
  playerSprite: {
    value: undefined as SpriteConfig | undefined,
    type: 'sprite',
    label: 'Player Sprite',
    group: 'Visuals',
  },
};

export const STAGE2_BREAKABLE_URLS = {
  clubStool: 'https://i.postimg.cc/7hsmdsCJ/Bar-stool-game-asset-5cc81bbe.jpg',
  clubSpeaker: 'https://i.postimg.cc/sfw6MXTL/DJ-club-speaker-street-prop-ca2a06ac.jpg',
  clubTable: 'https://i.postimg.cc/qqbjSbts/Club-dining-table-sprite-asset-c4524b47.jpg',
} as const;

export const STAGE2_FOREGROUND_URLS = {
  clubBeam1: 'https://i.postimg.cc/kRSQtyFH/Metal-truss-beam.jpg',
  clubBeam2: 'https://i.postimg.cc/bSnx2R9f/Brick-column.jpg',
  clubCouple1: 'https://i.postimg.cc/8fvRrbmG/Vip-couple-1.jpg',
  clubCouple2: 'https://i.postimg.cc/m19YFSyB/Vip-couple-2.jpg',
} as const;

export const LEON_URLS = {
  leon_idle_1: 'https://i.postimg.cc/mDFS32mx/Create-character-in-art-style-fe36df12.jpg',
  leon_idle_2: 'https://i.postimg.cc/mg8VBncB/Modify-idle-pose-variation-4bc4f118.jpg',
  leon_walk_1: 'https://i.postimg.cc/bv5T22H6/Pose-character-in-walk-position-79997a61.jpg',
  leon_walk_2: 'https://i.postimg.cc/d0fBTTm6/Pose-character-in-straight-leg-a184e734.jpg',
  leon_walk_3: 'https://i.postimg.cc/q7FLCCXQ/Pose-character-like-character-two-beb09d56.jpg',
  leon_walk_4: 'https://i.postimg.cc/d0fBTTm6/Pose-character-in-straight-leg-a184e734.jpg',
  leon_punch: 'https://i.postimg.cc/DZbcQyxT/Pose-first-character-like-second-ebc458dc.jpg',
  leon_hurt: 'https://i.postimg.cc/nzQ1Kc3b/Pose-first-character-like-second-d84e1d8f.jpg',
  leon_knockdown: 'https://i.postimg.cc/bv5T229z/Pose-first-character-like-second-a96dd3e0.jpg',
} as const;

export const HELL_KAGE_URLS = {
  hellkage_idle_1: 'https://i.postimg.cc/Xv2CZS35/Modify-idle-pose-variation-11b2f711.jpg',
  hellkage_idle_2: 'https://i.postimg.cc/63yGnj5V/Modify-idle-pose-variation-c42db279.jpg',
  hellkage_walk_1: 'https://i.postimg.cc/sXtg6L8M/Center-my-character-f97a9c90.jpg',
  hellkage_walk_2: 'https://i.postimg.cc/bJKwC5Md/Center-my-character-81fd139b.jpg',
  hellkage_walk_3: 'https://i.postimg.cc/MGpHvVVk/Center-my-character-28150019.jpg',
  hellkage_walk_4: 'https://i.postimg.cc/bJKwC5Md/Center-my-character-81fd139b.jpg',
  hellkage_punch: 'https://i.postimg.cc/RFkqfvYz/Sprite-on-green-background-a9eb2bd5.jpg',
  hellkage_hurt: 'https://i.postimg.cc/Bb2bBdWF/Character-on-green-background-f6e6a8ce.jpg',
  hellkage_knockdown: 'https://i.postimg.cc/2yny7Ppv/Sprite-on-green-background-6408b256.jpg',
} as const;

export const BONE_HEAD_URLS = {
  bonehead_idle_1: 'https://i.postimg.cc/s22tP7F1/Adjusting-idle-pose-variation-d57ad18e.jpg',
  bonehead_idle_2: 'https://i.postimg.cc/5yf5v5TF/Sprite-on-green-background-428c5a20.jpg',
  bonehead_walk_1: 'https://i.postimg.cc/tJD3zZGv/IMG-7032-jpeg-cdbdfb0a.jpg',
  bonehead_walk_2: 'https://i.postimg.cc/HnT050KR/IMG-7033-jpeg-19bf83cf.jpg',
  bonehead_walk_3: 'https://i.postimg.cc/GtzFj8nM/IMG-7034-jpeg-adeee187.jpg',
  bonehead_walk_4: 'https://i.postimg.cc/HnT050KR/IMG-7033-jpeg-19bf83cf.jpg',
  bonehead_punch: 'https://i.postimg.cc/FzGyxdXF/Sprite-isolated-on-green-background-02a68f56.jpg',
  bonehead_hurt: 'https://i.postimg.cc/85RBjXyZ/Character-on-green-background-85ed9460.jpg',
  bonehead_knockdown: 'https://i.postimg.cc/KjQP5kh4/Sprite-isolated-on-green-background-ac35246e.jpg',
} as const;

export const VICTOR_URLS = {
  victor_idle_1: 'https://i.postimg.cc/1tVRHLx0/Modify-idle-pose-variation-8942ce81.jpg',
  victor_idle_2: 'https://i.postimg.cc/QMyxcjz5/Varying-idle-pose-c9f35a67.jpg',
  victor_walk_1: 'https://i.postimg.cc/m2PxFQsr/IMG-7037-jpeg-d067130d.jpg',
  victor_walk_2: 'https://i.postimg.cc/HsRq0VYS/IMG-7039-jpeg-b750a4e6.jpg',
  victor_walk_3: 'https://i.postimg.cc/ZKWkyrSw/IMG-7041-jpeg-23c2cbac.jpg',
  victor_walk_4: 'https://i.postimg.cc/HsRq0VYS/IMG-7039-jpeg-b750a4e6.jpg',
  victor_punch: 'https://i.postimg.cc/j29FhFbX/Clean-sprite-on-green-background-6b8a6c5a.jpg',
  victor_hurt: 'https://i.postimg.cc/MT94nGrw/Clean-sprite-on-green-background-bf996538.jpg',
  victor_knockdown: 'https://i.postimg.cc/wjtsPbd5/Character-on-green-background-2bbbfa2b.jpg',
} as const;

export const STAGE3_URLS = {
  garageBg1: 'https://i.postimg.cc/HkBZd8DH/Editing-parking-garage-game-back-22e4859a.jpg',
  garageBg2: 'https://i.postimg.cc/sgw6sGdz/Change-pillar-signs-and-cars-60058e9b-(1).jpg',
  garageFloor: 'https://i.postimg.cc/J0wf0Z9V/remove-the-water-puddle-dde2b343-2K.jpg',
  garageBeam: 'https://i.postimg.cc/t42SpnQj/Concrete-pillar-with-security-ca-e9c7f336.jpg',
  garageBeam1: 'https://i.postimg.cc/t42SpnQj/Concrete-pillar-with-security-ca-e9c7f336.jpg',
  garageBeam2: 'https://i.postimg.cc/t42SpnQj/Concrete-pillar-with-security-ca-e9c7f336.jpg',
  garageCar: 'https://i.postimg.cc/6pYjt4sD/Sedan-foreground-prop-overlay-762f3a1c-(1).jpg',
  garageCar1: 'https://i.postimg.cc/6pYjt4sD/Sedan-foreground-prop-overlay-762f3a1c-(1).jpg',
  garageCar2: 'https://i.postimg.cc/sgw6sGdR/Parked-car-foreground-prop-overlay-5e535a0e.jpg',
  garageTire: 'https://i.postimg.cc/Ss6tDsZd/Rubber-car-tires-stack-sprite-8f9e4dd8.jpg',
  garageDrum: 'https://i.postimg.cc/fWvrdVSJ/Industrial-oil-drum-game-sprite-db934984.jpg',
  garageCone: 'https://i.postimg.cc/FssnVh0k/Orange-construction-barrel-game-2ba1bb67.jpg',
} as const;

export const STAGE4_URLS = {
  skyline: 'https://i.postimg.cc/mrRjW9Sf/Isolate-distant-night-sky-skyscr-63246386.jpg',
  bldA: 'https://i.postimg.cc/0QFjwLZG/Adjust-building-designs-and-back-486b9c99.jpg',
  bldB: 'https://i.postimg.cc/ydtxZwnc/Remove-neon-building-signage-7adb5b0b.jpg',
  floor: 'https://i.postimg.cc/1X0g1vcX/remove-the-red-light-spill-c8d7c6f1.jpg',
  guy1: 'https://i.postimg.cc/FH0p6p3C/Turning-subject-to-face-away-e7979c8f.jpg',
  guy2: 'https://i.postimg.cc/13DBdBwv/Turn-person-around-rear-view-05166412.jpg',
  guy3: 'https://i.postimg.cc/2SnGtGhK/Turning-character-around-3d39464d.jpg',
  guy4: 'https://i.postimg.cc/BbxyC3SB/Turning-subject-to-face-away-1a99e6e2.jpg',
  fence: 'https://i.postimg.cc/FsMGG8d0/Chain-link-fence-and-tires-overlay-1d547a75.jpg',
} as const;

export const STAGE5_URLS = {
  casinoBgA: 'https://i.postimg.cc/Pr8RDxmh/Isolating-casino-background-art-fa624ecb.jpg',
  casinoBgB: 'https://i.postimg.cc/ZKyMNRrm/Generating-casino-background-art-096bd1d8.jpg',
  casinoFloorA: 'https://i.postimg.cc/4NhScdzT/Isolating-floor-structure-in-image-ad00a1e4.jpg',
  casinoVelvetRope: 'https://i.postimg.cc/Xvghvz92/Change-background-to-neon-green-597f3fc1.jpg',
  casinoSlotFg: 'https://i.postimg.cc/nVWWM7QJ/Creating-retro-casino-slot-machine-cfd64389.jpg',
  casinoStanchion: 'https://i.postimg.cc/WzxYKLPq/Drawing-polished-brass-stanchion-2efbce41.jpg',
  casinoStool: 'https://i.postimg.cc/sfLL1SGc/Isolate-casino-stool-on-green-d918ea36.jpg',
  casinoTable: 'https://i.postimg.cc/9XkkzTqj/Drawing-casino-cocktail-table-299d613b.jpg',
} as const;

export const STAGE6_URLS = {
  precinctWindowBg: 'https://i.postimg.cc/ZYGgbfHd/Creating-city-street-scene-comic-fd029a6b.jpg',
  precinctRoomA: 'https://i.postimg.cc/ZqVDyMDz/Edit-police-precinct-room-image-93dd3ebc.jpg',
  precinctRoomB: 'https://i.postimg.cc/7LmQTWtF/Generating-police-room-art-prompt-feb614a9.jpg',
  precinctSeamPillar: 'https://i.postimg.cc/wxCPqW23/Isolate-vertical-dividing-wall-s-3852295f.jpg',
  precinctArchway: 'https://i.postimg.cc/tTKtp69v/Drawing-armory-doorway-with-sign-904f2a3c.jpg',
  precinctDeskCop1: 'https://i.postimg.cc/GmPfb2F7/Police-officer-at-desk-a8483b4a.jpg',
  precinctDeskCop2: 'https://i.postimg.cc/sXdx6gT9/Detective-seated-at-precinct-desk-0e5364b0.jpg',
  precinctRiotCops: 'https://i.postimg.cc/yYQdqPfm/Make-the-police-officers-b710dcd0.jpg',
  precinctWaterCooler: 'https://i.postimg.cc/65g82cd3/Water-cooler-dispenser-illustration-9321e852.jpg',
  precinctTrashCan: 'https://i.postimg.cc/DyHSJ6q0/Overflowing-office-trash-can-dra-a0e33123.jpg',
  precinctChair: 'https://i.postimg.cc/m2JPzj78/Wooden-police-precinct-desk-chair-36244d5f.jpg',
} as const;

export const STAGE7_URLS = {
  skyline: 'https://i.postimg.cc/dVRc1vMg/Isolate-purple-twilight-city-sky-dec786ab.jpg',
  roomA: 'https://i.postimg.cc/g2ybJd9Q/Isolate-interior-penthouse-room-e1965f94.jpg',
  roomB: 'https://i.postimg.cc/1301tPxY/Edit-penthouse-image-interior-ca39f97c.jpg',
  seamDivider: 'https://i.postimg.cc/FHbXRmtZ/Isolate-vertical-dividing-wall-s-c46f24f9.jpg',
  palmPlant: 'https://i.postimg.cc/YCNB9kcd/Drawing-palm-plant-in-planter-adf99cef.jpg',
  ribbonStatue: 'https://i.postimg.cc/0yG1QxgZ/Draw-abstract-twisted-ribbon-scu-f502d7db.jpg',
  breakableStatue: 'https://i.postimg.cc/T3jvwG80/Drawing-abstract-metallic-sculpture-8e931b2e.jpg',
  breakablePlant: 'https://i.postimg.cc/zGY18vQx/Drawing-potted-indoor-plant-7ef5cfa8.jpg',
  breakableChair: 'https://i.postimg.cc/vBr078hy/Draw-office-chair-reference-a29fbdfa.jpg',
} as const;

export const STAGE8_URLS = {
  rooftopSkyline: 'https://i.postimg.cc/CKdmRTzD/4-3-aspect-c8eed737.jpg',
  rooftopSectionA: 'https://i.postimg.cc/jj9vNg71/4-3-aspect-same-green-background-8d7d7e1b.jpg',
  rooftopSectionB: 'https://i.postimg.cc/d1y69226/4-3-aspect-same-green-background-ce26035a.jpg',
  rooftopForegroundLedge: 'https://i.postimg.cc/L8DKL1Rb/IMG-7342.jpg',
  rooftopTrashCan: 'https://i.postimg.cc/0yP1zfgc/IMG-7343.jpg',
  rooftopWoodenCrate: 'https://i.postimg.cc/YCMBv3Kc/IMG-7345.jpg',
} as const;

export const COVER_ART_URLS = {
  title_cover: 'https://i.postimg.cc/zXP2Yc62/Removing-text-and-logos-d8eb9d68.jpg',
  game_over_screen: 'https://i.postimg.cc/ncwSfPgR/Replace-kneeling-character-with-182f4b15.jpg',
} as const;

export const ARCADE_CONTROLS_SPRITE_URL =
  'https://i.postimg.cc/656xCL38/Edit-button-letters-and-backgrounds-7fb7a3ca.jpg';

export const CUTSCENE_URLS = {
  intro_slide_1: 'https://i.postimg.cc/qqymVMs0/Syndicate-takes-over-Pearl-City-2b59f0d7.jpg',
  intro_slide_2: 'https://i.postimg.cc/4yV8kNzF/Add-story-text-to-box-ca1c0f5b.jpg',
  intro_slide_3: 'https://i.postimg.cc/C5kvTLj2/Change-words-on-box-34545edb.jpg',
  outro_slide_1: 'https://i.postimg.cc/mkCdf2QX/Change-words-on-box-f8275ce0.jpg',
  outro_slide_2: 'https://i.postimg.cc/4yV8kNz8/Change-text-on-box-8e3fbfe9.jpg',
  outro_slide_3: 'https://i.postimg.cc/Twy70chw/Adding-copyright-and-text-details-666d04ea.jpg',
} as const;

export const INTERMISSION_URLS = {
  stage2_story: 'https://i.postimg.cc/KvfMG90S/IMG-7604.jpg',
  stage4_story: 'https://i.postimg.cc/PrywX6Sk/IMG-7605.jpg',
  stage6_story: 'https://i.postimg.cc/kXsbJjTr/IMG-7606.jpg',
  map: 'https://i.postimg.cc/02PSqg0q/IMG-7607.jpg',
} as const;

export interface IntermissionCutsceneConfig {
  slide1Url: string;
  slide2Url: string;
  mapText: string;
  targetStage: number;
}

export const INTERMISSION_CONFIGS: Record<'stage2' | 'stage4' | 'stage6', IntermissionCutsceneConfig> = {
  stage2: {
    slide1Url: 'https://i.postimg.cc/KvfMG90S/IMG-7604.jpg',
    slide2Url: 'https://i.postimg.cc/02PSqg0q/IMG-7607.jpg',
    mapText: 'NEXT: STAGE 3 — PARKING GARAGE',
    targetStage: 3,
  },
  stage4: {
    slide1Url: 'https://i.postimg.cc/PrywX6Sk/IMG-7605.jpg',
    slide2Url: 'https://i.postimg.cc/02PSqg0q/IMG-7607.jpg',
    mapText: 'NEXT: STAGE 5 — THE CASINO',
    targetStage: 5,
  },
  stage6: {
    slide1Url: 'https://i.postimg.cc/kXsbJjTr/IMG-7606.jpg',
    slide2Url: 'https://i.postimg.cc/02PSqg0q/IMG-7607.jpg',
    mapText: 'NEXT: STAGE 7 — EXECUTIVE PENTHOUSE',
    targetStage: 7,
  },
};

export const STAGE_NAMES: Record<number, string> = {
  1: 'CITY STREETS',
  2: 'NIGHTCLUB',
  3: 'PARKING GARAGE',
  4: 'DOWNTOWN STREET RACE',
  5: 'THE CASINO',
  6: 'POLICE PRECINCT',
  7: 'EXECUTIVE PENTHOUSE',
  8: 'SKYSCRAPER ROOFTOP',
};

export const NIGHT_RAZOR_ATTACK_URLS = {
  hero_punch_smear: 'https://i.postimg.cc/3RF4xcjQ/Pose-character-in-punch-position-9d8d7ac7.jpg',
  hero_punch1_follow: 'https://i.postimg.cc/rpZjVgTQ/hero-punch1.jpg',
  hero_load: 'https://i.postimg.cc/5yPXwQkK/load.jpg',
  hero_pull: 'https://i.postimg.cc/PJfLpQKL/Pose-first-character-like-second-c4e7a6cb.jpg',
  hero_punch2_smear: 'https://i.postimg.cc/1trn3j0h/Pose-character-punching-db19dd64.jpg',
  hero_punch2_follow: 'https://i.postimg.cc/d1YZvYCc/Posing-character-like-second-cha-536fc7d5.jpg',
  hero_kick_kneel: 'https://i.postimg.cc/PfMYXPKY/Pose-first-character-kneeling-8fab3512.jpg',
  hero_kick_spring: 'https://i.postimg.cc/C1sBxQG9/Pose-character-in-position-6ea45bea.jpg',
  hero_kick_smear: 'https://i.postimg.cc/W1nSKTfX/Clean-sprite-on-green-background-3b4b5ca9.jpg',
} as const;

// Merge customized config values if present (injected by Playground)
const {playgroundConfig} = globalThis as {
  playgroundConfig?: Record<string, unknown>;
};
if (playgroundConfig) {
  for (const [key, value] of Object.entries(playgroundConfig)) {
    if (key in CONFIG) {
      Object.assign(CONFIG[key as keyof typeof CONFIG], {value});
    }
  }
}

/**
 * Type helper for reading values in game code
 */
export type ConfigKey = keyof typeof CONFIG;

/**
 * Gets a configuration value by key.
 * @param key The configuration key.
 * @return The configuration value.
 */
export function getConfig<K extends ConfigKey>(
  key: K,
): (typeof CONFIG)[K]['value'] {
  return CONFIG[key].value;
}

export const PRESETS = {};
