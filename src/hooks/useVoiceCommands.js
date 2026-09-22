import { useCallback, useEffect, useRef } from 'react';
import { createRecognizer, isVoiceSupported } from '../services/voiceService';
import { usePetStore } from '../store/petStore';

export function useVoiceCommands() {
  const recognitionRef = useRef(null);
  const cameraPosRef = useRef([0, 1.4, 0]);
  const setListening = usePetStore((s) => s.setListening);
  const setVoiceFeedback = usePetStore((s) => s.setVoiceFeedback);
  const applyVoiceCommand = usePetStore((s) => s.applyVoiceCommand);

  useEffect(() => {
    recognitionRef.current = createRecognizer({
      onResult: ({ transcript, commandId }) => {
        if (!commandId) {
          setVoiceFeedback(`Heard "${transcript}" — try bark, sit, jump…`);
          return;
        }
        applyVoiceCommand(commandId, cameraPosRef.current);
      },
      onEnd: () => setListening(false),
      onError: (error) => {
        setListening(false);
        if (error !== 'aborted' && error !== 'no-speech') {
          setVoiceFeedback(`Mic: ${error}`);
        }
      },
    });
    return () => recognitionRef.current?.abort?.();
  }, [applyVoiceCommand, setListening, setVoiceFeedback]);

  const toggleListening = useCallback(() => {
    if (!isVoiceSupported()) {
      setVoiceFeedback('Voice is not supported in this browser');
      return;
    }
    const rec = recognitionRef.current;
    const listening = usePetStore.getState().isListening;
    if (listening) {
      rec?.stop();
      setListening(false);
      return;
    }
    try {
      rec?.start();
      setListening(true);
      setVoiceFeedback('Listening…');
    } catch {
      setListening(false);
    }
  }, [setListening, setVoiceFeedback]);

  return { toggleListening, supported: isVoiceSupported(), cameraPosRef };
}
