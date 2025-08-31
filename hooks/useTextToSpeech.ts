
import { useState, useEffect, useCallback } from 'react';

export const useTextToSpeech = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const getVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
          setVoices(availableVoices);
          
          const brianVoice = availableVoices.find(voice => voice.name.toLowerCase().includes('brian') && voice.lang.startsWith('en'));
          const googleMaleVoice = availableVoices.find(voice => voice.name === 'Google US English' && voice.lang === 'en-US');
          const microsoftMaleVoice = availableVoices.find(voice => voice.name.toLowerCase().includes('david') && voice.lang.startsWith('en'));
          const fallbackVoice = availableVoices.find(voice => voice.lang.startsWith('en-') && !voice.name.toLowerCase().includes('female'));
    
          const voiceToUse = brianVoice || googleMaleVoice || microsoftMaleVoice || fallbackVoice || availableVoices[0];
          
          setSelectedVoice(voiceToUse || null);
          setIsReady(true);
          window.speechSynthesis.onvoiceschanged = null; // Clean up listener once we have voices
      }
    };

    // onvoiceschanged is the reliable event to listen for
    window.speechSynthesis.onvoiceschanged = getVoices;
    // Call it once directly, in case voices are already loaded (e.g., in Chrome)
    getVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!selectedVoice || !text || !isReady) {
        if(onEnd) onEnd();
        return;
    }

    // Cancel any ongoing speech to prevent overlap
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;

    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        if (onEnd) onEnd(); // Ensure we unlock the UI even if speech fails
    };

    window.speechSynthesis.speak(utterance);
  }, [selectedVoice, isReady]);

  return { speak, isReady };
};
