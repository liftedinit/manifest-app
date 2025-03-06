import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { Texture } from 'three';

/**
 *  Adapted from https://github.com/brunoimbrizi/interactive-particles/blob/master/src/scripts/webgl/particles/TrailTexture.js
 *  Changes:
 *    * accepts config as constructor params
 *    * frame-rate independent aging
 *    * added option to interpolate between slow mouse events
 *    * added option for smoothing between values to avoid large jumps in force
 */
type Point = {
  x: number;
  y: number;
  age: number;
  force: number;
};

// smooth new sample (measurement) based on previous sample (current)
function smoothAverage(current: number, measurement: number, smoothing = 0.9) {
  return measurement * smoothing + current * (1.0 - smoothing);
}

// default ease
const easeCircleOut = (x: number) => Math.sqrt(1 - Math.pow(x - 1, 2));

type WaveTextureConfig = {
  size?: number;
  speed?: number;
  frequency?: number;
  amplitude?: number;
  waveCount?: number;
  colorIntensity?: number;
  intensity?: number;
};

class WaveTexture {
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  texture!: Texture;
  size: number;
  speed: number;
  frequency: number;
  amplitude: number;
  waveCount: number;
  colorIntensity: number;
  time: number = 0;

  constructor({
    size = 256,
    speed = 1,
    frequency = 2,
    amplitude = 0.5,
    waveCount = 3,
    colorIntensity = 0.7,
  }: WaveTextureConfig = {}) {
    this.size = size;
    this.speed = speed;
    this.frequency = frequency;
    this.amplitude = amplitude;
    this.waveCount = waveCount;
    this.colorIntensity = colorIntensity;
    this.initTexture();
  }

  initTexture() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = this.size;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.texture = new Texture(this.canvas);

    this.canvas.id = 'waveTexture';
    this.canvas.style.width = this.canvas.style.height = `${this.canvas.width}px`;
  }

  update(delta: number) {
    // Update time
    this.time += delta * this.speed;

    // Clear canvas
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw wave pattern
    this.drawWavePattern();

    this.texture.needsUpdate = true;
  }

  drawWavePattern() {
    const { size, time, frequency, amplitude, waveCount } = this;

    // Draw a subtle background gradient
    const bgGradient = this.ctx.createLinearGradient(0, 0, size, size);
    bgGradient.addColorStop(0, 'rgba(10, 10, 10, 1)');
    bgGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, size, size);

    // Set blending for additive effect
    this.ctx.globalCompositeOperation = 'screen';

    // Draw multiple waves with different phases and frequencies
    for (let w = 0; w < waveCount; w++) {
      const wavePhase = time * (0.5 + w * 0.2) + (w * Math.PI) / waveCount;
      const waveFreq = frequency * (1 + w * 0.3);

      // Create a wave pattern
      for (let i = 0; i < size; i += 4) {
        for (let j = 0; j < size; j += 4) {
          // Normalize coordinates to [0, 1]
          const x = i / size;
          const y = j / size;

          // Calculate distance from center
          const dx = x - 0.5;
          const dy = y - 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Calculate angle
          const angle = Math.atan2(dy, dx);

          // Create wave pattern
          const wave1 = Math.sin(angle * waveFreq + wavePhase) * 0.5 + 0.5;
          const wave2 = Math.sin(dist * waveFreq * 10 + wavePhase) * 0.5 + 0.5;
          const wave3 = Math.cos(angle * 3 + dist * 5 + wavePhase * 0.7) * 0.5 + 0.5;

          // Combine waves
          const combinedWave = (wave1 * 0.4 + wave2 * 0.3 + wave3 * 0.3) * amplitude;

          // Apply radial falloff
          const falloff = Math.max(0, 1 - dist * 2);
          const intensity = combinedWave * falloff * this.colorIntensity;

          if (intensity > 0.05) {
            // Draw wave point
            const radius = 6 * intensity;
            const alpha = intensity;

            const gradient = this.ctx.createRadialGradient(i, j, 0, i, j, radius);

            gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.beginPath();
            this.ctx.fillStyle = gradient;
            this.ctx.arc(i, j, radius, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }
      }
    }
  }
}

export function useTrailTexture(config?: WaveTextureConfig) {
  // Convert old trail texture config to new wave texture config
  const waveConfig = useMemo(() => {
    if (!config) return {};

    return {
      size: config.size || 256,
      speed: 0.5,
      frequency: 2,
      amplitude: config.amplitude || config.intensity || 0.7,
      waveCount: 3,
      colorIntensity: 0.7,
    };
  }, [config]);

  const wave = useMemo(() => new WaveTexture(waveConfig), [waveConfig]);

  useFrame((_, delta) => {
    if (wave) wave.update(delta);
  });

  // We still return onMove for compatibility, but it's not used anymore
  const onMove = () => {};

  return { texture: wave.texture, onMove };
}
