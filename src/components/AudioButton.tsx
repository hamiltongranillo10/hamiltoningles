import { useState } from 'react';
import { Icon } from './Icons';

interface AudioButtonProps {
  text: string;
  compact?: boolean;
  label?: string;
  disabled?: boolean;
}

export function AudioButton({ text, compact = false, label = 'Escuchar', disabled = false }: AudioButtonProps) {
  const [notice, setNotice] = useState('');

  function play() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setNotice('Este navegador no ofrece lectura en voz alta. Puedes leer la frase aquí.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.86;
    utterance.onstart = () => setNotice('Reproduciendo con la voz del dispositivo.');
    utterance.onend = () => setNotice('');
    utterance.onerror = () => setNotice('No se pudo reproducir. Revisa si tu dispositivo tiene una voz disponible.');
    window.speechSynthesis.speak(utterance);
  }

  return (
    <span className="audio-control-wrap">
      <button className={`button button-subtle audio-button${compact ? ' button-small' : ''}`} type="button" onClick={play} disabled={disabled || !text.trim()} aria-label={`${label}: ${text}`}>
        <Icon name="volume" size={16} />
        {!compact && <span>{label}</span>}
      </button>
      {notice && <span className="audio-notice" role="status">{notice}</span>}
    </span>
  );
}
