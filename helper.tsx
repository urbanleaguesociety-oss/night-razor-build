// tslint:disable
/* eslint-disable */
import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react';

/**  --- Overlay component ---
 * A full-screen UI overlay component used to display game states
 * such as Start Menus, Pause Screens, Game Over, and Victory screens.
 * It renders a semi-transparent background with a title, optional description,
 * and a primary action button.
 */

export type OverlayTone = 'neutral' | 'danger' | 'victory';

export interface OverlayProps {
  title: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
  icon?: React.ReactNode;
  tone?: OverlayTone;
  autoFocus?: boolean;
  children?: React.ReactNode;
}

const TONE_CLASS: Record<OverlayTone, string> = {
  neutral: 'bg-black/70',
  danger: 'bg-red-900/80',
  victory: 'bg-emerald-900/80',
};

const BUTTON_CLASS: Record<OverlayTone, string> = {
  neutral: 'hover:bg-yellow-400',
  danger: 'hover:bg-red-400',
  victory: 'hover:bg-emerald-400',
};

/**
 * @param title - The main, large heading text to display (e.g., "GAME OVER").
 * @param description - Optional subtitle text to display below the title (e.g., "Final Score: 42").
 * @param actionLabel - The text to display inside the primary action button (e.g., "PLAY AGAIN").
 * @param onAction - Callback function executed when the user clicks the primary action button.
 * @param icon - Optional React node (like a Lucide icon) rendered inside the action button next to the label.
 * @param tone - The visual theme of the overlay which dictates background and hover colors. Defaults to 'neutral'. ('neutral' | 'danger' | 'victory')
 */
/** Focuses the referenced element on mount to ensure Enter works. */
export function useAutoFocus<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    // Only focus if enabled is true
    if (enabled && ref.current) {
      ref.current.focus();
    }
  }, [enabled]);
  return ref;
}

function isVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  const style = window.getComputedStyle(el);
  return (
    style.visibility !== 'hidden' &&
    style.display !== 'none' &&
    !el.closest('[inert]')
  );
}

function getActiveTvScope(): HTMLElement | null {
  const scopes = Array.from(
    document.querySelectorAll<HTMLElement>('[data-tv-scope]'),
  ).filter(isVisible);
  return scopes.length ? scopes[scopes.length - 1] : null;
}

/**
 * Auto-focuses the primary action button inside an overlay on mount and enables
 * D-pad arrow key focus navigation across focusable controls while cooperating
 * with `tv.tsx` (`useTvFocusRover`, `useTvModalStack`, and `TvScrollArea`).
 */
export function useOverlayFocusNavigation(
  containerRef: RefObject<HTMLElement>,
  autoFocus = true,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (autoFocus && container) {
      const activeScope = getActiveTvScope();
      const isBlockedByExternalScope =
        activeScope != null &&
        !container.contains(activeScope) &&
        !activeScope.contains(container);
      const active = document.activeElement;
      const alreadyFocusedInside =
        active instanceof HTMLElement &&
        active !== document.body &&
        container.contains(active);
      if (!isBlockedByExternalScope && !alreadyFocusedInside) {
        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [data-tv-focusable]',
          ),
        );
        const target =
          container.querySelector<HTMLElement>(
            '[data-testid="start-button"]',
          ) ??
          focusables.find(isVisible) ??
          focusables[0];
        target?.focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const currentContainer = containerRef.current;
      if (!currentContainer) return;
      const isNext =
        e.key === 'ArrowDown' ||
        e.key === 'ArrowRight' ||
        e.code === 'ArrowDown' ||
        e.code === 'ArrowRight';
      const isPrev =
        e.key === 'ArrowUp' ||
        e.key === 'ArrowLeft' ||
        e.code === 'ArrowUp' ||
        e.code === 'ArrowLeft';
      if (!isNext && !isPrev) return;

      const activeScope = getActiveTvScope();
      if (
        activeScope != null &&
        !currentContainer.contains(activeScope) &&
        !activeScope.contains(currentContainer)
      ) {
        return;
      }
      const active = document.activeElement;
      if (
        active &&
        active !== document.body &&
        !(active instanceof HTMLCanvasElement) &&
        !currentContainer.contains(active)
      ) {
        return;
      }

      const scopeRoot =
        activeScope != null && currentContainer.contains(activeScope)
          ? activeScope
          : currentContainer;
      const items = Array.from(
        scopeRoot.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [data-tv-focusable]',
        ),
      ).filter(isVisible);
      if (!items.length) return;

      const index = active instanceof HTMLElement ? items.indexOf(active) : -1;
      const step = isNext ? 1 : -1;
      const next =
        index < 0
          ? items[0]
          : items[(index + step + items.length) % items.length];
      e.preventDefault();
      next.focus();
      next.scrollIntoView({block: 'nearest'});
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, autoFocus]);
}

/**
 * Opens the referenced `<dialog>` element as a top-layer modal (`showModal()`)
 * and keeps it open while mounted.
 *
 * Sets `closedby="none"` (Chrome 134+, including Android TV WebView) so the
 * browser's `CloseWatcher` does not consume `Escape` / Android TV Back keys or
 * close the dialog on `START` screens, while keeping `cancel` / `close`
 * fallback listeners for engines without `closedby`.
 */
export function useModalDialog(dialogRef: RefObject<HTMLDialogElement>): void {
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    let mounted = true;
    dialog.setAttribute('closedby', 'none');
    const openModal = () => {
      if (!mounted || !dialog.isConnected) return;
      if (typeof dialog.showModal === 'function') {
        const isNativeModal =
          typeof dialog.matches === 'function' && dialog.matches(':modal');
        if (dialog.open && !isNativeModal) {
          dialog.removeAttribute('open');
        }
        if (!dialog.open) {
          try {
            dialog.showModal();
          } catch {
            dialog.setAttribute('open', '');
          }
        }
      } else if (!dialog.open) {
        dialog.setAttribute('open', '');
      }
    };
    const handleCancel = (e: Event) => {
      e.preventDefault();
    };
    const handleClose = () => {
      if (mounted && dialog.isConnected && !dialog.open) {
        openModal();
      }
    };
    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);
    openModal();
    return () => {
      mounted = false;
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
      if (dialog.open) {
        if (typeof dialog.close === 'function') {
          dialog.close();
        } else {
          dialog.removeAttribute('open');
        }
      }
    };
  }, [dialogRef]);
}

/**
 * Full-screen terminal state modal (Start Menu, Pause Screen, Game Over, Victory).
 *
 * Renders a native `<dialog>` opened via `showModal()` in the browser top layer
 * so background canvas and HUD elements are automatically marked `inert`.
 * Because `showModal()` places `<dialog>` in the top layer above all CSS
 * `z-index` stacking contexts, pass any secondary buttons or panels (such as a
 * "Quit to Menu" or "How to Play" button) as `children` inside `<Overlay>`—or
 * use `MenuOverlay`—rather than rendering sibling `z-index` elements outside it.
 */
export function Overlay({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  tone = 'neutral',
  autoFocus = true,
  children,
}: OverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useModalDialog(dialogRef);
  useOverlayFocusNavigation(dialogRef, autoFocus);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      data-overlay-container=""
      data-playground-modal="true"
      className={`fixed inset-0 z-50 m-0 p-0 max-w-none max-h-none w-full h-full border-0 text-inherit backdrop:bg-transparent ${TONE_CLASS[tone]} overflow-y-auto touch-auto`}>
      <div className="min-h-full flex flex-col items-center p-4">
        <div className="m-auto flex flex-col items-center w-full max-w-md">
          <h1
            id={titleId}
            className="text-3xl md:text-5xl font-black mb-4 text-yellow-400 text-center">
            {title}
          </h1>
          {description && (
            <p className="text-lg md:text-2xl mb-8 text-center">
              {description}
            </p>
          )}
          <button
            autoFocus={autoFocus}
            onClick={onAction}
            data-testid="start-button"
            className={`bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded-full font-bold text-lg md:text-xl transition-colors flex items-center gap-2 ${BUTTON_CLASS[tone]}`}>
            {icon}
            {actionLabel}
          </button>
          {children}
        </div>
      </div>
    </dialog>
  );
}

export interface MenuOverlayProps {
  children: React.ReactNode;
  tone?: OverlayTone;
  zIndex?: number;
  autoFocus?: boolean;
}

/**
 * A highly resilient menu wrapper that statically decouples scrolling from flexbox alignment.
 * It strictly avoids the clipping bug on mobile by preventing flex justify-center from being assigned
 * to the overflow-y-auto boundary. Plugs seamlessly into the AI's generation workflows.
 * The inner children should provide their own box styling (e.g., w-full max-w-md bg-slate-900 rounded).
 *
 * Kept as a `zIndex`-positioned `<div role="dialog" aria-modal="true" data-playground-modal="true">`
 * (backed by the host modal containment runtime) rather than a top-layer `showModal()` `<dialog>`,
 * so custom settings panels, confirmation `div`s, or toasts with a higher `zIndex` can still stack
 * above `MenuOverlay` without being trapped underneath the browser top layer.
 */
export function MenuOverlay({
  children,
  tone = 'neutral',
  zIndex = 40,
  autoFocus = true,
}: MenuOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackTitleId = useId();
  const [titleId, setTitleId] = useState<string | undefined>(undefined);
  useOverlayFocusNavigation(containerRef, autoFocus);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const heading = container.querySelector<HTMLElement>(
      'h1, h2, h3, [role="heading"]',
    );
    if (heading && heading.textContent?.trim()) {
      if (!heading.id) {
        heading.id = fallbackTitleId;
      }
      setTitleId(heading.id);
    } else {
      setTitleId(undefined);
    }
  }, [children, fallbackTitleId]);

  useLayoutEffect(() => {
    const previousActive =
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
        ? document.activeElement
        : null;
    return () => {
      if (previousActive && previousActive.isConnected) {
        previousActive.focus();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-label={titleId ? undefined : 'Game menu'}
      data-overlay-container=""
      data-playground-modal="true"
      className={`absolute inset-0 ${TONE_CLASS[tone]} overflow-y-auto touch-auto`}
      style={{zIndex}}>
      <div className="min-h-full flex flex-col items-center p-4">
        <div className="m-auto w-full max-w-md flex flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Actions that can be triggered by the user. */
export type InputAction =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'confirm'
  | 'cancel'
  | 'tap';

/** Represents the state of the pointer (mouse or touch). */
export interface PointerState {
  /** The X coordinate of the pointer. */
  x: number;
  /** The Y coordinate of the pointer. */
  y: number;
  /** Whether the pointer is currently pressed down. */
  down: boolean;
}

/** A snapshot of the input state at a specific frame. */
export interface InputSnapshot {
  /** Map of actions to their active state. */
  actions: Record<InputAction, boolean>;
  /** The current state of the pointer. */
  pointer: PointerState;
}

interface LogicalSize {
  width: number;
  height: number;
}

interface AndroidTvWindow extends Window {
  /** Injected by Android TV WebView when the host handles the Back key. */
  canHandleBackKey?: boolean;
}

const ACTION_KEYS: Record<string, InputAction> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  a: 'left',
  d: 'right',
  w: 'up',
  s: 'down',
  Enter: 'confirm',
  ' ': 'confirm',
  Space: 'confirm',
  Escape: 'cancel',
};

/**
 * Initializes all input actions to a default 'false' state.
 */
const createEmptyActions = (): Record<InputAction, boolean> => ({
  left: false,
  right: false,
  up: false,
  down: false,
  confirm: false,
  cancel: false,
  tap: false,
});

/**
 * Calculates the pointer's logical X/Y coordinates on the canvas.
 */
const getPointerPosition = (
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  logicalSize?: LogicalSize,
): {x: number; y: number} => {
  const rect = canvas.getBoundingClientRect();
  const width = logicalSize?.width ?? rect.width;
  const height = logicalSize?.height ?? rect.height;
  const x = (event.clientX - rect.left) * (width / rect.width);
  const y = (event.clientY - rect.top) * (height / rect.height);
  return {x, y};
};

/**
 * Hook to capture and manage user input (keyboard and pointer).
 * @param canvasRef Reference to the game canvas element.
 * @param enabled Whether input capture is enabled.
 * @param logicalSize Optional logical size of the canvas for coordinate scaling.
 * @returns A mutable ref containing the current input snapshot.
 */
export const useInput = (
  canvasRef: RefObject<HTMLCanvasElement>,
  enabled = true,
  logicalSize?: LogicalSize,
): MutableRefObject<InputSnapshot> => {
  const inputRef = useRef<InputSnapshot>({
    actions: createEmptyActions(),
    pointer: {x: 0, y: 0, down: false},
  });

  useEffect(() => {
    if (!enabled) {
      inputRef.current.actions = createEmptyActions();
      inputRef.current.pointer = {x: 0, y: 0, down: false};
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const action = ACTION_KEYS[event.key] ?? ACTION_KEYS[event.code];
      if (!action) return;
      const isArrowOrSpace =
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(
          event.key,
        ) ||
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(
          event.code,
        );
      const isEscapeWithHandshake =
        (event.key === 'Escape' || event.code === 'Escape') &&
        Boolean((window as AndroidTvWindow).canHandleBackKey);
      if (isEscapeWithHandshake) {
        event.preventDefault();
      } else if (isArrowOrSpace) {
        const active = document.activeElement;
        const isUiControlFocused =
          active instanceof HTMLElement &&
          active.matches(
            'button:not([disabled]), [data-tv-focusable], input, select, textarea',
          );
        const hasVisibleOverlayOrModal = Array.from(
          document.querySelectorAll<HTMLElement>(
            '[data-overlay-container], [data-tv-scope]',
          ),
        ).some(isVisible);
        if (!isUiControlFocused && !hasVisibleOverlayOrModal) {
          event.preventDefault();
        }
      }
      inputRef.current.actions[action] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const action = ACTION_KEYS[event.key] ?? ACTION_KEYS[event.code];
      if (!action) return;
      inputRef.current.actions[action] = false;
    };

    const canvas = canvasRef.current;
    const handlePointerDown = (event: PointerEvent) => {
      if (!canvas) return;
      if (typeof canvas.setPointerCapture === 'function') {
        canvas.setPointerCapture(event.pointerId);
      }
      inputRef.current.pointer = {
        ...getPointerPosition(event, canvas, logicalSize),
        down: true,
      };
      inputRef.current.actions.tap = true;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!canvas) return;
      inputRef.current.pointer = {
        ...getPointerPosition(event, canvas, logicalSize),
        down: inputRef.current.pointer.down,
      };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!canvas) return;
      if (
        typeof canvas.releasePointerCapture === 'function' &&
        canvas.hasPointerCapture(event.pointerId)
      ) {
        canvas.releasePointerCapture(event.pointerId);
      }
      inputRef.current.pointer = {
        ...getPointerPosition(event, canvas, logicalSize),
        down: false,
      };
      inputRef.current.actions.tap = false;
    };

    const handleBlur = () => {
      inputRef.current.actions = createEmptyActions();
      if (inputRef.current.pointer) {
        inputRef.current.pointer.down = false;
      }
      inputRef.current.actions.tap = false;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleBlur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (canvas) {
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerup', handlePointerUp);
      canvas.addEventListener('pointercancel', handlePointerUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (canvas) {
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerup', handlePointerUp);
        canvas.removeEventListener('pointercancel', handlePointerUp);
      }
    };
  }, [canvasRef, enabled]);

  return inputRef;
};

// Pure HTML5 Audio compatible stub (zero Web Audio API synthesizer / pluck code)
class GameAudio {
  private muted = false;
  private volume = 0.6;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('playground-mute', (e: Event) => {
        const customEvent = e as CustomEvent<{muted: boolean}>;
        this.setMuted(customEvent.detail.muted);
      });
    }
  }

  resume() {}
  setVolume(v: number) { this.volume = Math.max(0, Math.min(1, v)); }
  toggleMute(): boolean { this.muted = !this.muted; return this.muted; }
  setMuted(muted: boolean) { this.muted = muted; }
  getMuteState(): boolean { return this.muted; }

  playTone(_o: any) {}
  playMeleePunch() {}
  playCoinPickup() {}
  playPotionGulp() {}
  playVictoryFanfare() {}
  playDefeatMotif() {}
  playLevelUpStinger() {}
  playCrispClick() {}
  playConfirmSelect() {}
}

/** Shared singleton — import and use anywhere. */
export const gameAudio = new GameAudio();

// ============================================================================
// GENERAL UTILITIES & MATH HELPERS
// ============================================================================

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const formatTime = (seconds: number): string => {
  const clamped = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(clamped / 60);
  const remaining = clamped % 60;
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
};

export const prepareCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dprOverride?: number,
): void => {
  const isMobile =
    typeof window !== 'undefined' &&
    (window.innerWidth <= 900 ||
      'ontouchstart' in window ||
      (navigator.maxTouchPoints != null && navigator.maxTouchPoints > 0));
  const scale = dprOverride ?? (isMobile ? 1 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2));
  const displayWidth = Math.floor(width * scale);
  const displayHeight = Math.floor(height * scale);

  if (
    ctx.canvas.width !== displayWidth ||
    ctx.canvas.height !== displayHeight
  ) {
    ctx.canvas.width = displayWidth;
    ctx.canvas.height = displayHeight;
  }

  ctx.setTransform(scale, 0, 0, scale, 0, 0);
};

export const createFixedStepper = (stepMs: number, maxSubSteps = 5) => {
  let lastTime = 0;
  let accumulator = 0;

  return (time: number, onStep: (deltaSeconds: number) => void): void => {
    if (lastTime === 0) {
      lastTime = time;
      return;
    }

    const frameMs = Math.min(time - lastTime, stepMs * maxSubSteps);
    lastTime = time;
    accumulator += frameMs;

    let steps = 0;
    while (accumulator >= stepMs && steps < maxSubSteps) {
      onStep(stepMs / 1000);
      accumulator -= stepMs;
      steps += 1;
    }
  };
};

/**
 * A 2D coordinate representing a position in the game world.
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * An entity within the game.
 */
export interface Entity extends Position {
  id: string;
  type: string;
  width: number;
  height: number;
  vx: number;
  vy: number;
  [key: string]: any; // Allow flexible properties
}

/**
 * The current phase of the game.
 */
export type GamePhase =
  | 'START'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'LEVEL_COMPLETE'
  | 'INTRO_CUTSCENE'
  | 'OUTRO_CUTSCENE'
  | 'INTERMISSION_CUTSCENE';

/**
 * The overall state of the game.
 */
export interface GameState {
  status: GamePhase;
  score: number;
  level: number;
  timer?: number;
  moves?: number;
  lives?: number;
  [key: string]: any; // Allow flexible properties
}

/**
 * The music track to be used in the game.
 */
export interface MusicTrack {
  name: string;
  url: string;
  description: string;
}

declare global {
  interface Window {
    PlaygroundSDK: any;
  }
}

/**
 * Configuration for a sprite sheet.
 */
export interface SpriteConfig {
  url: string;
  frameWidth?: number;
  frameHeight?: number;
  frameCount?: number;
}

/**
 * Preloads all assets defined in the manifest.
 * Returns a dictionary of loaded images (keyed by manifest ID) and a loading state.
 *
 * WARNING: Generated sprites already have transparent backgrounds removed server-side.
 * Do not run client-side `ctx.getImageData()` loops to strip backgrounds. If you ever
 * call `ctx.getImageData()`, wrap it in `try / catch` and fall back to raw `ctx.drawImage()`
 * in case an external asset fell back to `no-cors` loading.
 */
export function useAssets(manifest: Record<string, string>) {
  const [assets, setAssets] = useState<Record<string, HTMLImageElement | null>>(
    {},
  );
  const [isReady, setIsReady] = useState(false);

  // Stringify the manifest to prevent infinite re-renders if an inline object is passed
  const manifestStr = JSON.stringify(manifest);

  useEffect(() => {
    const currentManifest = JSON.parse(manifestStr) as Record<string, string>;
    const urls = Object.entries(currentManifest);
    if (urls.length === 0) {
      setIsReady(true);
      return;
    }

    let loadedCount = 0;
    const loadedAssets: Record<string, HTMLImageElement | null> = {};

    urls.forEach(([id, url]) => {
      const img = new Image();
      let retriedWithoutCors = false;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedAssets[id] = img; // Keyed by manifest ID for easy lookup
        loadedCount++;
        if (loadedCount === urls.length) {
          setAssets(loadedAssets);
          setIsReady(true);
        }
      };
      img.onerror = () => {
        if (!retriedWithoutCors) {
          retriedWithoutCors = true;
          img.removeAttribute('crossorigin');
          img.src = url;
          return;
        }
        console.warn(`[AssetPreloader] Failed to load asset: ${id} at ${url}`);
        loadedAssets[id] = null;
        loadedCount++;
        if (loadedCount === urls.length) {
          setAssets(loadedAssets);
          setIsReady(true);
        }
      };
      img.src = url;
    });
  }, [manifestStr]);

  return {assets, isReady};
}

/**
 * Safely draws an entire image asset on the canvas. If the asset failed to load,
 * falls back to rendering a primitive geometric shape to prevent crashing.
 *
 * Note: Draws from top-left (consistent with standard Canvas drawImage).
 *
 * WARNING: This draws the WHOLE source image (5-arg drawImage) and does not support
 * frame extraction. For animated spritesheets, use the `html-sprite-renderer` skill
 * (`SpriteRenderer` class) instead.
 */
export function drawAsset(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  fallbackDraw: (ctx: CanvasRenderingContext2D) => void,
) {
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x, y, w, h);
  } else {
    fallbackDraw(ctx);
  }
}

/**
 * Robust background drawing function.
 * If a background image is provided, it draws it covering the full canvas width and height.
 * If camera coordinates are provided, it can optionally do parallax scrolling.
 * If the image fails to load, it falls back to a solid color.
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  bgImg: HTMLImageElement | null | undefined,
  canvasWidth: number,
  canvasHeight: number,
  fallbackColor = '#222222',
  camX = 0,
  camY = 0,
) {
  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    // Parallax logic: scroll the background slightly slower than the camera
    const parallaxFactor = 0.5;
    const bgX = (camX * parallaxFactor) % canvasWidth;
    const bgY = (camY * parallaxFactor) % canvasHeight;

    // Draw a 2x2 grid of the background image to ensure the whole screen is covered during scrolling
    ctx.drawImage(bgImg, -bgX, -bgY, canvasWidth, canvasHeight);
    ctx.drawImage(bgImg, -bgX + canvasWidth, -bgY, canvasWidth, canvasHeight);
    ctx.drawImage(bgImg, -bgX, -bgY + canvasHeight, canvasWidth, canvasHeight);
    ctx.drawImage(
      bgImg,
      -bgX + canvasWidth,
      -bgY + canvasHeight,
      canvasWidth,
      canvasHeight,
    );
  } else {
    // Fallback to solid color
    ctx.fillStyle = fallbackColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}

const MOBILE_MAX_WIDTH_PX = 768;

function computeIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  const ua =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  const isIpadOs =
    /Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
  const coarsePointer =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;
  const small = window.innerWidth < MOBILE_MAX_WIDTH_PX;
  return ua || isIpadOs || coarsePointer || small;
}

/**
 * Detect mobile/touch devices.
 * Checks user agent (including iPadOS desktop-class UA), coarse pointer
 * capability, and viewport width, and reacts to both viewport resize and
 * DevTools touch-emulation media query changes.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(computeIsMobile);

  useEffect(() => {
    const update = () => {
      setIsMobile(computeIsMobile());
    };
    window.addEventListener('resize', update);
    const mql =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(pointer: coarse)')
        : null;
    mql?.addEventListener?.('change', update);
    return () => {
      window.removeEventListener('resize', update);
      mql?.removeEventListener?.('change', update);
    };
  }, []);

  return isMobile;
}
