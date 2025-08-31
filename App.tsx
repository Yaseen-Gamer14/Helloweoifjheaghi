
import React, { useState, useRef } from 'react';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { DONATION_SOUND } from './constants';
import Input from './components/Input';
import Button from './components/Button';

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const DollarIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0 1H9m3 0h3m-3 10v-1m0 1h-3m3 0h3m-3 2v1m0-1h-3m3 0h3" />
    </svg>
);

const MessageIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const Title: React.FC = () => (
    <div className="text-center">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Donation Alert Simulator
        </h1>
        <p className="mt-2 text-lg text-indigo-300">
            Powered by "Brian" Text-to-Speech
        </p>
    </div>
);

const App: React.FC = () => {
    const [donator, setDonator] = useState('JohnDoe');
    const [amount, setAmount] = useState('5');
    const [message, setMessage] = useState('This is an awesome app!');
    const [isPlaying, setIsPlaying] = useState(false);

    const { speak, isReady } = useTextToSpeech();
    
    // This ref is now attached to a declarative <audio> element in the JSX.
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const speakAlert = () => {
        const amountAsNumber = parseFloat(amount);
        const currency = amountAsNumber === 1 ? 'dollar' : 'dollars';
        const textToSpeak = `${donator} donated ${amount} ${currency} through super chat! ${message}`;
        
        speak(textToSpeak, () => {
            setIsPlaying(false);
        });
    };

    const handleRun = () => {
        if (!donator || !amount || isPlaying || !isReady || !audioRef.current) return;
        
        const audio = audioRef.current;
        
        audio.onended = speakAlert;
        audio.onerror = () => {
            console.error("Error playing audio.");
            speakAlert();
        };

        setIsPlaying(true);
        audio.currentTime = 0;
        
        audio.play().catch(e => {
            console.error("Audio playback failed:", e);
            speakAlert();
        });
    };

    return (
        <div className="bg-gray-900 min-h-screen flex items-center justify-center font-sans p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6 border border-gray-700">
                {/* 
                  "Placing" the audio element directly in the component's DOM structure.
                  It's hidden from view and from screen readers for accessibility.
                */}
                <audio 
                    ref={audioRef} 
                    src={DONATION_SOUND} 
                    preload="auto" 
                    style={{ display: 'none' }} 
                    aria-hidden="true" 
                />

                <Title />
                <div className="space-y-4">
                    <Input
                        label="The Donator"
                        value={donator}
                        onChange={(e) => setDonator(e.target.value)}
                        icon={<UserIcon />}
                        placeholder="e.g., JaneDoe"
                        disabled={isPlaying}
                    />
                    <Input
                        label="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        icon={<DollarIcon />}
                        placeholder="e.g., 10"
                        min="0"
                        disabled={isPlaying}
                    />
                    <Input
                        label="The Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        icon={<MessageIcon />}
                        placeholder="Your message..."
                        disabled={isPlaying}
                    />
                </div>
                <Button onClick={handleRun} disabled={isPlaying || !donator || !amount || !isReady}>
                    {isPlaying ? 'Playing Alert...' : (isReady ? 'Run' : 'Loading Voices...')}
                </Button>
            </div>
        </div>
    );
};

export default App;
