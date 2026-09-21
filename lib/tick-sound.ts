/**
 * Short, quiet UI tick synthesised with the Web Audio API — no audio asset and
 * no network cost. Browsers keep an AudioContext suspended until the page has
 * been interacted with, so `unlock` must be called from a real user gesture
 * (pointerdown, keydown) before `play` will make any sound.
 */

const ATTACK_SECONDS = 0.002;
const TICK_SECONDS = 0.03;
const TICK_FREQUENCY_HZ = 1200;
const PEAK_GAIN = 0.014;
const SILENCE_GAIN = 0.0001;

type WebkitWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export type TickPlayer = {
  unlock: () => void;
  play: () => void;
  dispose: () => void;
};

export const createTickPlayer = (): TickPlayer => {
  let context: AudioContext | null = null;

  const ensureContext = () => {
    if (context) {
      return context;
    }

    const AudioContextCtor =
      window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    context = new AudioContextCtor();

    return context;
  };

  return {
    unlock: () => {
      const audio = ensureContext();

      if (audio?.state === "suspended") {
        void audio.resume();
      }
    },

    play: () => {
      const audio = context;

      if (audio?.state !== "running") {
        return;
      }

      const startedAt = audio.currentTime;
      const oscillator = audio.createOscillator();
      const envelope = audio.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(TICK_FREQUENCY_HZ, startedAt);

      envelope.gain.setValueAtTime(0, startedAt);
      envelope.gain.linearRampToValueAtTime(
        PEAK_GAIN,
        startedAt + ATTACK_SECONDS
      );
      envelope.gain.exponentialRampToValueAtTime(
        SILENCE_GAIN,
        startedAt + TICK_SECONDS
      );

      oscillator.connect(envelope).connect(audio.destination);
      oscillator.start(startedAt);
      oscillator.stop(startedAt + TICK_SECONDS);
    },

    dispose: () => {
      void context?.close();
      context = null;
    },
  };
};
