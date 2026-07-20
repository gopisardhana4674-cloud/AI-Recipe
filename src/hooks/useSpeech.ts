import { useState, useEffect, useCallback } from 'react';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(event.error === 'not-allowed' ? 'Microphone permission denied' : 'Speech recognition failed');
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      setRecognition(rec);
    } else {
      setError('Web Speech API is not supported in this browser.');
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition) {
      setTranscript('');
      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to start speech:', err);
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Failed to stop speech:', err);
      }
    }
  }, [recognition]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported: !!recognition,
  };
}
