const WHISPER_SAMPLE_RATE = 16_000;

function mixToMono(buffer: AudioBuffer): Float32Array {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
  if (channels.length === 1) return channels[0].slice();

  const mono = new Float32Array(buffer.length);
  const channelScale = 1 / channels.length;
  for (let frame = 0; frame < buffer.length; frame += 1) {
    let sample = 0;
    for (const channel of channels) sample += channel[frame] ?? 0;
    mono[frame] = sample * channelScale;
  }
  return mono;
}

function createAudioContext(): AudioContext {
  try {
    return new AudioContext({ sampleRate: WHISPER_SAMPLE_RATE });
  } catch {
    try {
      return new AudioContext();
    } catch {
      throw new Error('Este navegador no ofrece decodificación de audio local. Prueba con una versión actualizada.');
    }
  }
}

/** Decode on the page thread, then supply Whisper-ready PCM to the worker. */
export async function decodeAudioForWhisper(audio: Blob): Promise<Float32Array> {
  if (audio.size === 0) throw new Error('El archivo de audio está vacío.');

  const context = createAudioContext();
  try {
    const decoded = await context.decodeAudioData(await audio.arrayBuffer());
    let samples: Float32Array;

    if (decoded.sampleRate === WHISPER_SAMPLE_RATE) {
      samples = mixToMono(decoded);
    } else {
      if (typeof OfflineAudioContext === 'undefined') {
        throw new Error('Este navegador no pudo convertir el audio a 16 kHz para el reconocimiento local.');
      }
      const frameCount = Math.max(1, Math.ceil(decoded.duration * WHISPER_SAMPLE_RATE));
      const offline = new OfflineAudioContext(1, frameCount, WHISPER_SAMPLE_RATE);
      const source = offline.createBufferSource();
      source.buffer = decoded;
      source.connect(offline.destination);
      source.start();
      samples = (await offline.startRendering()).getChannelData(0).slice();
    }

    if (samples.length === 0) throw new Error('El navegador no encontró muestras de audio para reconocer.');
    return samples;
  } catch (cause) {
    if (cause instanceof Error && (cause.message.startsWith('Este navegador') || cause.message.startsWith('El navegador'))) {
      throw cause;
    }
    throw new Error('No se pudo decodificar este audio en el navegador. Comprueba que sea MP3, WAV, WebM, OGG o M4A y que tu navegador admita ese formato.');
  } finally {
    if (context.state !== 'closed') await context.close().catch(() => undefined);
  }
}
