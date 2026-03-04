// Notification sound utility
export const playNotificationSound = (type = "default") => {
  try {
    // Use Web Audio API to generate simple tones
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const now = audioContext.currentTime;

    switch (type) {
      case "confirmed":
        // Pleasant "ding" sound for order confirmed
        playTone(audioContext, 523.25, 0.15, now, now + 0.1); // C5
        playTone(audioContext, 659.25, 0.15, now + 0.1, now + 0.2); // E5
        break;

      case "ready":
        // Bright success sound for order ready
        playTone(audioContext, 587.33, 0.1, now, now + 0.08); // D5
        playTone(audioContext, 783.99, 0.1, now + 0.08, now + 0.16); // G5
        playTone(audioContext, 987.77, 0.15, now + 0.16, now + 0.31); // B5
        break;

      case "preparing":
        // Gentle notification for preparing
        playTone(audioContext, 440, 0.1, now, now + 0.15); // A4
        playTone(audioContext, 494.88, 0.1, now + 0.1, now + 0.25); // B4
        break;

      default:
        // Default beep
        playTone(audioContext, 600, 0.1, now, now + 0.1);
        break;
    }
  } catch (error) {
    console.warn("[Sound] Could not play notification sound:", error);
  }
};

const playTone = (audioContext, frequency, gain = 0.3, startTime, endTime) => {
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(gain, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

    oscillator.start(startTime);
    oscillator.stop(endTime);
  } catch (error) {
    console.warn("[Sound] Error playing tone:", error);
  }
};

// Alternative: Play sound from URL (if you want to use audio files)
export const playAudioFile = (url) => {
  try {
    const audio = new Audio(url);
    audio.volume = 0.5; // 50% volume
    audio.play().catch((error) => {
      console.warn("[Sound] Could not play audio file:", error);
    });
  } catch (error) {
    console.warn("[Sound] Error creating audio element:", error);
  }
};
