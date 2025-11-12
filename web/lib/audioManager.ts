// Global Audio Manager - Singleton pattern
// This ensures only one audio instance exists across all pages

class AudioManager {
  private static instance: AudioManager;
  
  public whoosh: HTMLAudioElement | null = null;
  public enter: HTMLAudioElement | null = null;
  public panelOpen: HTMLAudioElement | null = null;
  public ambient: HTMLAudioElement | null = null;
  
  private soundsEnabled = false;
  public ambientPlaying = false;

  private constructor() {
    if (typeof window === 'undefined') return;
    
    // Create audio elements only once
    this.whoosh = new Audio('/sounds/whoosh.mp3');
    this.enter = new Audio('/sounds/enter.mp3');
    this.panelOpen = new Audio('/sounds/panel-open.mp3');
    this.ambient = new Audio('/sounds/ambient.mp3');

    // Set volumes
    if (this.whoosh) this.whoosh.volume = 0.4;
    if (this.enter) this.enter.volume = 0.5;
    if (this.panelOpen) this.panelOpen.volume = 0.4;
    if (this.ambient) {
      this.ambient.volume = 0.15;
      this.ambient.loop = true;
    }
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public enableSounds() {
    this.soundsEnabled = true;
  }

  public play(audio: HTMLAudioElement | null) {
    if (!this.soundsEnabled || !audio) return;
    
    try {
      audio.currentTime = 0;
      audio.play().catch(err => console.log('Audio play prevented:', err));
    } catch (err) {
      console.log('Audio error:', err);
    }
  }

  public playAmbient() {
    if (!this.soundsEnabled || !this.ambient) return;
    
    this.ambient.play().catch(err => console.log('Ambient play error:', err));
    this.ambientPlaying = true;
    localStorage.setItem('ambient_playing', 'true');
  }

  public pauseAmbient() {
    if (!this.ambient) return;
    
    this.ambient.pause();
    this.ambientPlaying = false;
    localStorage.setItem('ambient_playing', 'false');
  }

  public toggleAmbient() {
    if (this.ambientPlaying) {
      this.pauseAmbient();
    } else {
      this.playAmbient();
    }
  }

  public isAmbientPlaying(): boolean {
    return this.ambientPlaying;
  }
}

export default AudioManager;
