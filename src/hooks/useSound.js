import { useCallback, useRef } from 'react';

// TODO: Replace with actual sound files for production
export function useSound() {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  // Simple tone for UI sounds
  const playTone = useCallback((frequency, duration = 0.15, type = 'sine') => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {
      // AudioContext not available
    }
  }, [getCtx]);

  // Create white noise buffer
  const createNoise = useCallback((duration) => {
    const ctx = getCtx();
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }, [getCtx]);

  // ---------------------------------------------------------------------------
  // Animal / nature sounds for Sound Safari
  // ---------------------------------------------------------------------------

  const playCowMoo = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;

      // Moo 1: deep tone sweeping down
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(180, t);
      osc1.frequency.linearRampToValueAtTime(140, t + 0.6);
      osc1.frequency.linearRampToValueAtTime(120, t + 1.0);
      gain1.gain.setValueAtTime(0, t);
      gain1.gain.linearRampToValueAtTime(0.25, t + 0.08);
      gain1.gain.setValueAtTime(0.25, t + 0.5);
      gain1.gain.linearRampToValueAtTime(0, t + 1.0);

      // Sub-harmonic for body
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(90, t);
      osc2.frequency.linearRampToValueAtTime(70, t + 0.6);
      osc2.frequency.linearRampToValueAtTime(60, t + 1.0);
      gain2.gain.setValueAtTime(0, t);
      gain2.gain.linearRampToValueAtTime(0.15, t + 0.08);
      gain2.gain.setValueAtTime(0.15, t + 0.5);
      gain2.gain.linearRampToValueAtTime(0, t + 1.0);

      // Formant filter for "oo" quality
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 300;
      filter.Q.value = 2;

      osc1.connect(filter);
      filter.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(t);
      osc1.stop(t + 1.0);
      osc2.start(t);
      osc2.stop(t + 1.0);

      // Second moo
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      const filter2 = ctx.createBiquadFilter();
      filter2.type = 'bandpass';
      filter2.frequency.value = 280;
      filter2.Q.value = 2;
      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(160, t + 1.2);
      osc3.frequency.linearRampToValueAtTime(110, t + 2.0);
      gain3.gain.setValueAtTime(0, t + 1.2);
      gain3.gain.linearRampToValueAtTime(0.2, t + 1.28);
      gain3.gain.setValueAtTime(0.2, t + 1.6);
      gain3.gain.linearRampToValueAtTime(0, t + 2.0);
      osc3.connect(filter2);
      filter2.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(t + 1.2);
      osc3.stop(t + 2.0);
    } catch (e) { /* */ }
  }, [getCtx]);

  const playBirdChirp = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;

      // Series of chirps — quick rising tones
      const chirps = [
        { start: 0,    freqFrom: 2200, freqTo: 3400, dur: 0.06 },
        { start: 0.1,  freqFrom: 2400, freqTo: 3600, dur: 0.05 },
        { start: 0.18, freqFrom: 2000, freqTo: 3200, dur: 0.07 },
        { start: 0.35, freqFrom: 2600, freqTo: 4000, dur: 0.04 },
        { start: 0.42, freqFrom: 2800, freqTo: 3800, dur: 0.05 },
        { start: 0.48, freqFrom: 2200, freqTo: 3000, dur: 0.06 },
        { start: 0.65, freqFrom: 2500, freqTo: 3700, dur: 0.05 },
        { start: 0.72, freqFrom: 2700, freqTo: 3500, dur: 0.04 },
        { start: 0.78, freqFrom: 2100, freqTo: 3300, dur: 0.07 },
      ];

      chirps.forEach(c => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(c.freqFrom, t + c.start);
        osc.frequency.exponentialRampToValueAtTime(c.freqTo, t + c.start + c.dur * 0.7);
        osc.frequency.exponentialRampToValueAtTime(c.freqFrom * 1.1, t + c.start + c.dur);
        gain.gain.setValueAtTime(0, t + c.start);
        gain.gain.linearRampToValueAtTime(0.15, t + c.start + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.01, t + c.start + c.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + c.start);
        osc.stop(t + c.start + c.dur + 0.01);
      });
    } catch (e) { /* */ }
  }, [getCtx]);

  const playRainDrops = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;

      // Noise-based rain with filter
      const noiseBuffer = createNoise(2.5);
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 8000;
      bandpass.Q.value = 0.5;

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 4000;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.3);
      gain.gain.setValueAtTime(0.12, t + 1.8);
      gain.gain.linearRampToValueAtTime(0, t + 2.5);

      noise.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(gain);
      gain.connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 2.5);

      // Individual droplet plinks
      for (let i = 0; i < 15; i++) {
        const delay = Math.random() * 2.0;
        const freq = 3000 + Math.random() * 4000;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + delay + 0.04);
        g.gain.setValueAtTime(0.08 + Math.random() * 0.06, t + delay);
        g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.04);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.05);
      }
    } catch (e) { /* */ }
  }, [getCtx, createNoise]);

  const playDogBark = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;

      const bark = (startTime) => {
        // Noise burst for the "rough" part
        const noiseBuffer = createNoise(0.15);
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const nGain = ctx.createGain();
        const nFilter = ctx.createBiquadFilter();
        nFilter.type = 'bandpass';
        nFilter.frequency.value = 800;
        nFilter.Q.value = 1.5;
        nGain.gain.setValueAtTime(0.12, startTime);
        nGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);
        noise.connect(nFilter);
        nFilter.connect(nGain);
        nGain.connect(ctx.destination);
        noise.start(startTime);
        noise.stop(startTime + 0.15);

        // Tonal component — sharp attack
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, startTime);
        osc.frequency.exponentialRampToValueAtTime(280, startTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(200, startTime + 0.15);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.18);

        // Sub thump
        const sub = ctx.createOscillator();
        const sGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(150, startTime);
        sub.frequency.exponentialRampToValueAtTime(80, startTime + 0.1);
        sGain.gain.setValueAtTime(0.15, startTime);
        sGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
        sub.connect(sGain);
        sGain.connect(ctx.destination);
        sub.start(startTime);
        sub.stop(startTime + 0.12);
      };

      bark(t);
      bark(t + 0.3);
      bark(t + 0.9);
    } catch (e) { /* */ }
  }, [getCtx, createNoise]);

  const playThunder = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;

      // Initial crack — noise burst
      const crackBuffer = createNoise(0.3);
      const crack = ctx.createBufferSource();
      crack.buffer = crackBuffer;
      const crackGain = ctx.createGain();
      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = 'highpass';
      crackFilter.frequency.value = 2000;
      crackGain.gain.setValueAtTime(0.3, t);
      crackGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      crack.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(ctx.destination);
      crack.start(t);
      crack.stop(t + 0.3);

      // Low rumble
      const rumbleBuffer = createNoise(2.5);
      const rumble = ctx.createBufferSource();
      rumble.buffer = rumbleBuffer;
      const rumbleGain = ctx.createGain();
      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.value = 200;
      rumbleFilter.Q.value = 1;
      rumbleGain.gain.setValueAtTime(0, t + 0.05);
      rumbleGain.gain.linearRampToValueAtTime(0.3, t + 0.2);
      rumbleGain.gain.setValueAtTime(0.3, t + 0.6);
      rumbleGain.gain.linearRampToValueAtTime(0.15, t + 1.2);
      rumbleGain.gain.linearRampToValueAtTime(0, t + 2.5);
      rumble.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);
      rumble.start(t + 0.05);
      rumble.stop(t + 2.5);

      // Secondary rumble wave
      const osc = ctx.createOscillator();
      const oGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, t + 0.1);
      osc.frequency.linearRampToValueAtTime(30, t + 2.0);
      oGain.gain.setValueAtTime(0, t + 0.1);
      oGain.gain.linearRampToValueAtTime(0.12, t + 0.3);
      oGain.gain.setValueAtTime(0.12, t + 0.8);
      oGain.gain.linearRampToValueAtTime(0, t + 2.0);
      const oFilter = ctx.createBiquadFilter();
      oFilter.type = 'lowpass';
      oFilter.frequency.value = 120;
      osc.connect(oFilter);
      oFilter.connect(oGain);
      oGain.connect(ctx.destination);
      osc.start(t + 0.1);
      osc.stop(t + 2.0);
    } catch (e) { /* */ }
  }, [getCtx, createNoise]);

  // UI sounds
  const success = useCallback(() => {
    playTone(523, 0.1);
    setTimeout(() => playTone(659, 0.1), 100);
    setTimeout(() => playTone(784, 0.2), 200);
  }, [playTone]);

  const tap = useCallback(() => {
    playTone(440, 0.08);
  }, [playTone]);

  const celebrate = useCallback(() => {
    [523, 587, 659, 698, 784, 880, 988, 1047].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.12, 'triangle'), i * 80);
    });
  }, [playTone]);

  const gentle = useCallback(() => {
    playTone(330, 0.2, 'sine');
  }, [playTone]);

  const pop = useCallback(() => {
    playTone(600, 0.06, 'sine');
  }, [playTone]);

  return {
    success, tap, celebrate, gentle, pop, playTone,
    playCowMoo, playBirdChirp, playRainDrops, playDogBark, playThunder,
  };
}
