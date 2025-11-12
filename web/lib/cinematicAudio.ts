import AudioManager from './audioManager';

export class CinematicAudioManager {
  private audioManager: AudioManager;
  private cinematicSounds: {
    portalOpen: HTMLAudioElement | null;
    spaceAmbient: HTMLAudioElement | null;
    spaceTravel: HTMLAudioElement | null;
    impact: HTMLAudioElement | null;
    hologramActivate: HTMLAudioElement | null;
    uiBeep: HTMLAudioElement | null;
    portalClose: HTMLAudioElement | null;
  } = {
    portalOpen: null,
    spaceAmbient: null,
    spaceTravel: null,
    impact: null,
    hologramActivate: null,
    uiBeep: null,
    portalClose: null,
  };

  private wasAmbientPlaying = false;
  private soundsLoaded = false;

  constructor() {
    this.audioManager = AudioManager.getInstance();
  }

  public async loadSounds() {
    if (this.soundsLoaded) return;

    try {
      // Load cinematic sounds (from main sounds folder)
      this.cinematicSounds.portalOpen = new Audio('/sounds/whoosh.mp3'); // Geçici: portal için whoosh
      this.cinematicSounds.spaceAmbient = new Audio('/sounds/space-ambient.mp3');
      this.cinematicSounds.spaceTravel = new Audio('/sounds/space-travel.mp3');
      this.cinematicSounds.impact = new Audio('/sounds/impact.mp3');
      this.cinematicSounds.hologramActivate = new Audio('/sounds/hologram-activate.mp3');
      this.cinematicSounds.uiBeep = new Audio('/sounds/ui-beep-sequence.mp3');
      this.cinematicSounds.portalClose = new Audio('/sounds/portal-close.mp3');

      // Set volumes
      if (this.cinematicSounds.portalOpen) this.cinematicSounds.portalOpen.volume = 0.6;
      if (this.cinematicSounds.spaceAmbient) {
        this.cinematicSounds.spaceAmbient.volume = 0.3;
        this.cinematicSounds.spaceAmbient.loop = true;
      }
      if (this.cinematicSounds.spaceTravel) this.cinematicSounds.spaceTravel.volume = 0.7;
      if (this.cinematicSounds.impact) this.cinematicSounds.impact.volume = 0.5;
      if (this.cinematicSounds.hologramActivate) this.cinematicSounds.hologramActivate.volume = 0.5;
      if (this.cinematicSounds.uiBeep) this.cinematicSounds.uiBeep.volume = 0.4;
      if (this.cinematicSounds.portalClose) this.cinematicSounds.portalClose.volume = 0.4;

      this.soundsLoaded = true;
    } catch (error) {
      console.warn('Cinematic sounds could not be loaded:', error);
    }
  }

  public startCinematic() {
    // Remember if ambient was playing
    this.wasAmbientPlaying = this.audioManager.isAmbientPlaying();
    
    // Pause ambient music
    if (this.wasAmbientPlaying) {
      this.audioManager.pauseAmbient();
    }
  }

  public endCinematic() {
    // Stop all cinematic sounds
    Object.values(this.cinematicSounds).forEach(sound => {
      if (sound && !sound.paused) {
        sound.pause();
        sound.currentTime = 0;
      }
    });

    // Resume ambient music if it was playing
    if (this.wasAmbientPlaying) {
      this.audioManager.playAmbient();
    }
  }

  public playPortalOpen() {
    this.play(this.cinematicSounds.portalOpen);
  }

  public playSpaceAmbient() {
    this.play(this.cinematicSounds.spaceAmbient);
  }

  public stopSpaceAmbient() {
    if (this.cinematicSounds.spaceAmbient && !this.cinematicSounds.spaceAmbient.paused) {
      this.cinematicSounds.spaceAmbient.pause();
      this.cinematicSounds.spaceAmbient.currentTime = 0;
    }
  }

  public playSpaceTravel() {
    this.play(this.cinematicSounds.spaceTravel);
  }

  public playImpact() {
    this.play(this.cinematicSounds.impact);
  }

  public playHologramActivate() {
    this.play(this.cinematicSounds.hologramActivate);
  }

  public playUiBeep() {
    this.play(this.cinematicSounds.uiBeep);
  }

  public playPortalClose() {
    this.stopSpaceAmbient();
    this.play(this.cinematicSounds.portalClose);
  }

  private play(audio: HTMLAudioElement | null) {
    if (!audio) return;
    
    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(err => {
          console.warn('Audio play failed:', err);
        });
      }
    } catch (error) {
      console.warn('Error playing audio:', error);
    }
  }
}
