import { VOICE_COMMANDS } from '../utils/constants';

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export function isVoiceSupported() {
  return Boolean(SpeechRecognition);
}

export function matchCommand(transcript) {
  const text = transcript.toLowerCase().trim();
  for (const command of VOICE_COMMANDS) {
    if (command.phrases.some((p) => text.includes(p))) return command.id;
  }
  return null;
}

export function createRecognizer({ onResult, onEnd, onError }) {
  if (!SpeechRecognition) return null;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((r) => r[0]?.transcript ?? '')
      .join(' ')
      .trim();
    const commandId = matchCommand(transcript);
    onResult?.({ transcript, commandId });
  };
  recognition.onerror = (event) => onError?.(event.error);
  recognition.onend = () => onEnd?.();
  return recognition;
}
