import { Component, ChangeDetectionStrategy, signal, inject, WritableSignal, ElementRef, viewChild, afterNextRender, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, Persona, DebateScore } from '../../services/gemini.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { Chat } from '@google/genai';

type GameStep = 'persona-selection' | 'debating' | 'loading-chat' | 'scoring' | 'results' | 'leaderboard';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

interface LeaderboardEntry extends DebateScore {
  id: string;
  persona: Persona;
  date: string;
}

@Component({
  selector: 'app-debate-game',
  templateUrl: './debate-game.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
})
export class DebateGameComponent {
  private geminiService = inject(GeminiService);
  
  chatContainer = viewChild<ElementRef>('chatContainer');

  step: WritableSignal<GameStep> = signal('persona-selection');
  loadingMessage = signal('Loading...');
  personas: Persona[] = [
    { name: 'Pragmatic Scientist', description: 'Focuses on data, evidence, and logical reasoning. Avoids emotional arguments.', imageUrl: 'https://picsum.photos/seed/scientist/400' },
    { name: 'Passionate Activist', description: 'Appeals to emotion, ethics, and social impact. Uses strong, persuasive language.', imageUrl: 'https://picsum.photos/seed/activist/400' },
    { name: 'Skeptical Journalist', description: 'Questions everything, probes for weaknesses in arguments, and demands clarification.', imageUrl: 'https://picsum.photos/seed/journalist/400' },
    { name: 'Optimistic Technologist', description: 'Highlights the benefits of progress and innovation, often downplaying risks.', imageUrl: 'https://picsum.photos/seed/tech/400' },
  ];
  selectedPersona = signal<Persona | null>(null);
  debateTopic = signal('The widespread adoption of AI in the workplace will lead to greater human flourishing.');

  chat: Chat | null = null;
  chatHistory = signal<ChatMessage[]>([]);
  userMessage = signal('');
  isAiThinking = signal(false);
  
  gameResult = signal<DebateScore | null>(null);
  leaderboard = signal<LeaderboardEntry[]>([]);

  // Voice features state
  isVoiceEnabled = signal(true);
  isListening = signal(false);
  speechSynthesis: SpeechSynthesis | null = null;
  speechRecognition: any | null = null; // SpeechRecognition API
  private voices: SpeechSynthesisVoice[] = [];
  private aiVoice: SpeechSynthesisVoice | null = null;

  userScorePercentage = computed(() => this.gameResult() ? (this.gameResult()!.userScore / 100) : 0);
  aiScorePercentage = computed(() => this.gameResult() ? (this.gameResult()!.aiScore / 100) : 0);

  constructor() {
    this.loadLeaderboard();
    this.setupSpeechApis();
  }

  private setupSpeechApis() {
    if (typeof window !== 'undefined') {
      // Text-to-Speech
      if ('speechSynthesis' in window) {
        this.speechSynthesis = window.speechSynthesis;
        const loadVoices = () => {
          this.voices = this.speechSynthesis!.getVoices().filter(v => v.lang.startsWith('en-US'));
          if (this.voices.length > 0) {
            // Prefer a high-quality, non-default voice for the AI to make it sound more distinct and human.
            this.aiVoice = this.voices.find(v => v.name === 'Google US English') ||
                           this.voices.find(v => v.name === 'Microsoft David - English (United States)') ||
                           this.voices.find(v => !v.default) || // Try to find any non-default voice
                           this.voices[0]; // Fallback to the first available voice
          }
        };

        // Voices may load asynchronously.
        if (this.speechSynthesis.getVoices().length > 0) {
          loadVoices();
        } else {
          this.speechSynthesis.onvoiceschanged = loadVoices;
        }
      }
      
      // Speech-to-Text
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.speechRecognition = new SpeechRecognition();
        this.speechRecognition.continuous = false;
        this.speechRecognition.lang = 'en-US';
        this.speechRecognition.interimResults = false;
        this.speechRecognition.maxAlternatives = 1;

        this.speechRecognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          this.userMessage.set(transcript);
        };
        this.speechRecognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          this.isListening.set(false);
        };
        this.speechRecognition.onend = () => {
          this.isListening.set(false);
        };
      }
    }
  }

  selectPersona(persona: Persona) {
    this.selectedPersona.set(persona);
    this.step.set('loading-chat');
    this.loadingMessage.set('Preparing the debate...');
    this.startDebate();
  }

  startDebate() {
    const persona = this.selectedPersona();
    if (!persona) return;

    this.chat = this.geminiService.startChat(persona, this.debateTopic());
    const openingLine = `I am the ${persona.name}. I will argue against the motion: "${this.debateTopic()}". State your first point.`;
    this.chatHistory.set([{ sender: 'ai', text: openingLine }]);
    this.speak(openingLine);

    this.gameResult.set(null);
    this.step.set('debating');
  }

  async sendMessage() {
    const messageText = this.userMessage().trim();
    if (!messageText || this.isAiThinking() || !this.chat) return;

    this.isListening.set(false);
    this.speechRecognition?.stop();
    
    this.chatHistory.update(history => [...history, { sender: 'user', text: messageText }]);
    this.userMessage.set('');
    this.isAiThinking.set(true);
    this.scrollToBottom();

    try {
      const result = await this.chat.sendMessage({ message: messageText });
      const aiResponse = result.text.trim();
      
      this.chatHistory.update(history => [...history, { sender: 'ai', text: aiResponse }]);
      this.speak(aiResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = 'I seem to be having trouble formulating a response. Please try again.';
      this.chatHistory.update(history => [...history, { sender: 'ai', text: errorMessage }]);
      this.speak(errorMessage);
    } finally {
      this.isAiThinking.set(false);
      this.scrollToBottom();
    }
  }

  async endDebate() {
    const persona = this.selectedPersona();
    if (!persona) return;

    this.speechSynthesis?.cancel();
    this.isListening.set(false);
    this.speechRecognition?.stop();

    this.step.set('scoring');
    this.loadingMessage.set('The AI Judge is analyzing the debate...');

    try {
        const result = await this.geminiService.scoreDebate(this.chatHistory(), this.debateTopic(), persona);
        this.gameResult.set(result);
        this.saveToLeaderboard(result, persona);
        this.step.set('results');
    } catch (e) {
        console.error("Failed to score debate", e);
        this.step.set('debating'); 
    }
  }

  playAgain() {
    this.step.set('persona-selection');
    this.selectedPersona.set(null);
    this.chatHistory.set([]);
    this.userMessage.set('');
    this.isAiThinking.set(false);
    this.chat = null;
    this.gameResult.set(null);
    this.speechSynthesis?.cancel();
  }

  // --- Voice Methods ---
  toggleVoice() {
    this.isVoiceEnabled.update(v => !v);
    if (!this.isVoiceEnabled()) {
      this.speechSynthesis?.cancel();
    }
  }

  speak(text: string) {
    if (!this.speechSynthesis || !this.isVoiceEnabled()) return;
    this.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use the selected AI voice and adjust parameters for a more natural feel
    if (this.aiVoice) {
      utterance.voice = this.aiVoice;
    }
    utterance.lang = 'en-US';
    utterance.pitch = 1.0; // Can be adjusted (0 to 2)
    utterance.rate = 1.1; // Slightly faster for more natural speech flow (0.1 to 10)

    this.speechSynthesis.speak(utterance);
  }

  toggleListening() {
    if (!this.speechRecognition) return;
    if (this.isListening()) {
      this.speechRecognition.stop();
      this.isListening.set(false);
    } else {
      this.speechRecognition.start();
      this.isListening.set(true);
    }
  }

  // --- Leaderboard Logic ---
  loadLeaderboard() {
    try {
      const data = localStorage.getItem('debateLeaderboard');
      if (data) {
        this.leaderboard.set(JSON.parse(data));
      }
    } catch (e) {
      console.error("Failed to load leaderboard from localStorage", e);
    }
  }

  saveToLeaderboard(score: DebateScore, persona: Persona) {
    try {
      const newEntry: LeaderboardEntry = {
        ...score,
        id: crypto.randomUUID(),
        persona: persona,
        date: new Date().toISOString(),
      };
      const currentLeaderboard = this.leaderboard();
      const updatedLeaderboard = [...currentLeaderboard, newEntry]
        .sort((a, b) => b.userScore - a.userScore)
        .slice(0, 10);
      
      this.leaderboard.set(updatedLeaderboard);
      localStorage.setItem('debateLeaderboard', JSON.stringify(updatedLeaderboard));
    } catch(e) {
      console.error("Failed to save to localStorage", e);
    }
  }
  
  showLeaderboard() {
    this.step.set('leaderboard');
  }

  showPersonaSelection() {
    this.step.set('persona-selection');
  }

  private scrollToBottom(): void {
    setTimeout(() => {
        try {
            const element = this.chatContainer()?.nativeElement;
            if (element) {
                element.scrollTop = element.scrollHeight;
            }
        } catch {}
    }, 0);
  }
}