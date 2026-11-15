export type Score = {
  resume: () => Promise<void>;
  stop: () => Promise<void>;
};

export function startScore(rootHz: number): Score {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const low = ctx.createOscillator();
  low.type = "sine";
  low.frequency.value = rootHz;
  const fifth = ctx.createOscillator();
  fifth.type = "triangle";
  fifth.frequency.value = rootHz * 1.498;
  fifth.detune.value = 7;

  const lowGain = ctx.createGain();
  lowGain.gain.value = 0.55;
  const fifthGain = ctx.createGain();
  fifthGain.gain.value = 0.07;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 220;
  filter.Q.value = 0.6;

  low.connect(lowGain);
  fifth.connect(fifthGain);
  lowGain.connect(filter);
  fifthGain.connect(filter);
  filter.connect(master);

  const seconds = 2;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "lowpass";
  band.frequency.value = 140;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.035;
  noise.connect(band);
  band.connect(noiseGain);
  noiseGain.connect(master);

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.025;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 70;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  low.start();
  fifth.start();
  noise.start();
  lfo.start();

  const begun = ctx.currentTime;
  master.gain.setValueAtTime(0, begun);
  master.gain.linearRampToValueAtTime(0.2, begun + 3.2);

  return {
    resume: () => ctx.resume(),
    stop: async () => {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.35);
      await new Promise((resolve) => setTimeout(resolve, 380));
      await ctx.close();
    },
  };
}
