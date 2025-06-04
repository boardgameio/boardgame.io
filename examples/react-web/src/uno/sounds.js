/*
 * UNO游戏音效系统
 * 
 * 提供游戏音效管理和播放功能
 */

class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.7;
    this.initializeSounds();
  }

  // 初始化音效
  initializeSounds() {
    // 使用Web Audio API创建音效
    this.audioContext = null;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return;
    }

    // 创建各种游戏音效
    this.createSounds();
  }

  // 创建音效
  createSounds() {
    // 出牌音效
    this.sounds.playCard = this.createTone(440, 0.1, 'sine');
    
    // 抽牌音效
    this.sounds.drawCard = this.createTone(220, 0.15, 'triangle');
    
    // UNO音效
    this.sounds.uno = this.createChord([523, 659, 784], 0.5);
    
    // 获胜音效
    this.sounds.win = this.createMelody([
      {freq: 523, duration: 0.2},
      {freq: 659, duration: 0.2},
      {freq: 784, duration: 0.2},
      {freq: 1047, duration: 0.4}
    ]);
    
    // 特殊牌音效
    this.sounds.specialCard = this.createTone(330, 0.2, 'square');
    
    // 错误音效
    this.sounds.error = this.createTone(150, 0.3, 'sawtooth');
    
    // 回合切换音效
    this.sounds.turnChange = this.createTone(880, 0.1, 'sine');
    
    // 洗牌音效
    this.sounds.shuffle = this.createNoise(0.5);
  }

  // 创建单音调
  createTone(frequency, duration, type = 'sine') {
    return () => {
      if (!this.audioContext || !this.enabled) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    };
  }

  // 创建和弦
  createChord(frequencies, duration) {
    return () => {
      if (!this.audioContext || !this.enabled) return;
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, this.audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
          
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + duration);
        }, index * 50);
      });
    };
  }

  // 创建旋律
  createMelody(notes) {
    return () => {
      if (!this.audioContext || !this.enabled) return;
      
      let currentTime = this.audioContext.currentTime;
      
      notes.forEach(note => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(note.freq, currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + note.duration);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration);
        
        currentTime += note.duration;
      });
    };
  }

  // 创建噪音效果（洗牌声）
  createNoise(duration) {
    return () => {
      if (!this.audioContext || !this.enabled) return;
      
      const bufferSize = this.audioContext.sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.1;
      }
      
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      source.start(this.audioContext.currentTime);
    };
  }

  // 播放音效
  play(soundName) {
    if (this.sounds[soundName] && this.enabled) {
      try {
        this.sounds[soundName]();
      } catch (e) {
        console.warn(`Failed to play sound: ${soundName}`, e);
      }
    }
  }

  // 设置音量
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // 启用/禁用音效
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // 获取音效状态
  isEnabled() {
    return this.enabled;
  }

  // 获取当前音量
  getVolume() {
    return this.volume;
  }
}

// 创建全局音效管理器实例
const soundManager = new SoundManager();

// 导出音效管理器
export default soundManager;

// 导出便捷方法
export const playSound = (soundName) => soundManager.play(soundName);
export const setSoundVolume = (volume) => soundManager.setVolume(volume);
export const setSoundEnabled = (enabled) => soundManager.setEnabled(enabled);
export const isSoundEnabled = () => soundManager.isEnabled();
export const getSoundVolume = () => soundManager.getVolume();
