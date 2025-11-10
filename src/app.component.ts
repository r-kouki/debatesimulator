import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaPlatformComponent } from './components/media-platform/media-platform.component';
import { DebateGameComponent } from './components/debate-game/debate-game.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MediaPlatformComponent, DebateGameComponent]
})
export class AppComponent {
  activeMode = signal<'media' | 'game'>('media');

  setMode(mode: 'media' | 'game') {
    this.activeMode.set(mode);
  }
}
