import React from "react";
import useSound from "use-sound";
import soundUrl from "/sounds/inqueue.mp3";

const SoundPlayer = ({ isPlaying }) => {
  const [play, { stop }] = useSound(soundUrl, { loop: true, volume: 0.2 }); // Set volume to 20%

  React.useEffect(() => {
    if (isPlaying) {
      play();
    } else {
      stop();
    }
  }, [isPlaying, play, stop]);

  return null;
};

export default SoundPlayer;

