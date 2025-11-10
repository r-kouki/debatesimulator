import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, DebateAnalysis, TrendingTopicsResult, DebateTurn } from '../../services/gemini.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-media-platform',
  templateUrl: './media-platform.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent]
})
export class MediaPlatformComponent {
  private geminiService = inject(GeminiService);

  topic = signal<string>('Should artificial intelligence replace human teachers?');
  analysis = signal<DebateAnalysis | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  isDiscovering = signal(false);
  trendingTopics = signal<TrendingTopicsResult | null>(null);
  discoverError = signal<string | null>(null);

  // New signals for debate simulation
  isDebating = signal(false);
  debateTurns = signal<DebateTurn[]>([]);
  currentDebateTurn = signal<DebateTurn | null>(null);
  currentTurnIndex = signal(0);

  private fullAnalysisResult: DebateAnalysis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private proponentVoice: SpeechSynthesisVoice | null = null;
  private opponentVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.setupSpeechSynthesis();
  }

  private setupSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const loadVoices = () => {
        this.voices = synth.getVoices().filter(v => v.lang.startsWith('en-US'));
        if (this.voices.length > 0) {
          // Try to get distinct, high-quality voices
          this.proponentVoice = this.voices.find(v => v.name === 'Google US English') || this.voices[0];
          this.opponentVoice = this.voices.find(v => v.name === 'Microsoft David - English (United States)') || (this.voices.length > 1 ? this.voices[1] : this.voices[0]);
           // Ensure they are not the same if possible
          if (this.proponentVoice === this.opponentVoice && this.voices.length > 1) {
            this.opponentVoice = this.voices[1];
          }
        }
      };
      
      if (synth.getVoices().length > 0) {
        loadVoices();
      } else {
        synth.onvoiceschanged = loadVoices;
      }
    }
  }

  async discoverTopics() {
    this.isDiscovering.set(true);
    this.discoverError.set(null);
    this.trendingTopics.set(null);
    try {
      const result = await this.geminiService.getTrendingDebateTopics();
      this.trendingTopics.set(result);
    } catch(e: any) {
      this.discoverError.set(e.message || 'An unexpected error occurred.');
    } finally {
      this.isDiscovering.set(false);
    }
  }

  selectTopic(topic: string) {
    this.topic.set(topic);
    this.trendingTopics.set(null); // Hide suggestions after selection
  }

  async analyzeTopic() {
    if (!this.topic()?.trim()) {
      this.error.set('Please enter a topic to analyze.');
      return;
    }
    
    this.isLoading.set(true);
    this.analysis.set(null);
    this.error.set(null);
    this.isDebating.set(false);
    window.speechSynthesis?.cancel(); // Stop any previous speech

    try {
      const result = await this.geminiService.analyzeDebateTopic(this.topic());
      this.fullAnalysisResult = result;
      this.isLoading.set(false);

      if (result.simulatedDebate && result.simulatedDebate.length > 0 && 'speechSynthesis' in window) {
        this.startDebatePlayback();
      } else {
        // Fallback if no debate is generated or TTS is not supported
        this.analysis.set(result);
      }
    } catch (e: any) {
      this.error.set(e.message || 'An unexpected error occurred.');
      this.isLoading.set(false);
    }
  }

  private startDebatePlayback() {
    if (!this.fullAnalysisResult?.simulatedDebate) return;
    
    this.debateTurns.set(this.fullAnalysisResult.simulatedDebate);
    this.currentTurnIndex.set(0);
    this.isDebating.set(true);
    this.playNextTurn();
  }

  private playNextTurn() {
    const turns = this.debateTurns();
    const index = this.currentTurnIndex();
    
    if (index >= turns.length) {
      // Debate finished
      this.isDebating.set(false);
      this.analysis.set(this.fullAnalysisResult);
      this.fullAnalysisResult = null;
      this.currentDebateTurn.set(null);
      return;
    }

    const turn = turns[index];
    this.currentDebateTurn.set(turn);
    
    const utterance = new SpeechSynthesisUtterance(turn.argument);
    utterance.voice = turn.speaker.toLowerCase().includes('proponent') ? this.proponentVoice : this.opponentVoice;
    utterance.lang = 'en-US';
    utterance.pitch = 1;
    utterance.rate = 1.1; // Slightly faster for more natural speech

    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      // If speech fails, just end the debate and show results.
      this.isDebating.set(false);
      this.analysis.set(this.fullAnalysisResult);
      this.fullAnalysisResult = null;
      this.currentDebateTurn.set(null);
    };

    utterance.onend = () => {
      // Small delay before next turn for better pacing
      setTimeout(() => {
        this.currentTurnIndex.update(i => i + 1);
        this.playNextTurn();
      }, 700);
    };
    
    window.speechSynthesis.speak(utterance);
  }

  getEngagementColor(score: number): string {
    if (score > 75) return 'text-green-400';
    if (score > 50) return 'text-yellow-400';
    return 'text-orange-400';
  }
}