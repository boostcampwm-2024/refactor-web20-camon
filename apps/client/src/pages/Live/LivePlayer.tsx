import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { PlayIcon, PauseIcon, VolumeOffIcon, VolumeOnIcon, ExpandIcon } from '@/shared/components/Icons';
import ErrorCharacter from '@/shared/components/ErrorCharacter';

type Errors = {
  socketError: Error | null;
  transportError: Error | null;
  consumerError: Error | null;
};

type LivePlayerProps = {
  mediaStream: MediaStream | null;
  socket: Socket | null;
  transportId: string | undefined;
  errors: Errors;
};

type VideoQuality = 'auto' | '480p' | '720p' | '1080p';

function LivePlayer({ mediaStream, socket, transportId, errors }: LivePlayerProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [videoQuality, setVideoQuality] = useState('720p');
  const videoRef = useRef<HTMLVideoElement>(null);

  const { socketError, transportError, consumerError } = errors;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && mediaStream) {
      videoElement.srcObject = mediaStream;
    }

    return () => {
      if (videoElement && videoElement.srcObject) {
        videoElement.srcObject = null;
      }
    };
  }, [mediaStream]);

  const handlePlayPause = async () => {
    if (mediaStream && videoRef.current) {
      if (isVideoEnabled) {
        videoRef.current.pause();
        setIsVideoEnabled(false);
      } else {
        videoRef.current.play();
        setIsVideoEnabled(true);
      }
    }
  };

  const handleMute = () => {
    if (mediaStream) {
      setIsAudioEnabled(prev => !prev);
    }
  };

  const handleVideoQuality = (selectedVideoQuality: VideoQuality) => {
    if (!socket) return;

    socket.emit('setVideoQuality', { transportId, quality: selectedVideoQuality });
    setVideoQuality(selectedVideoQuality);
  };

  const handleExpand = async () => {
    await videoRef.current?.requestFullscreen?.();
  };

  if (socketError || transportError || consumerError) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <ErrorCharacter size={400} message="방송 연결 중 에러가 발생했습니다" />
      </div>
    );
  }

  return (
    <section className="relative w-full h-full rounded-xl flex justify-center">
      <video
        ref={videoRef}
        autoPlay
        muted={!isAudioEnabled}
        className="absolute top-0 left-0 h-full w-full bg-surface-alt"
      />
      <div className="absolute bottom-4 left-0 right-0 px-6 text-text-default h-6 flex flex-row justify-between items-center">
        <div className="flex flex-row space-x-6 items-center">
          <button type="button" onClick={handlePlayPause}>
            {isVideoEnabled ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button type="button" onClick={handleMute}>
            {isAudioEnabled ? <VolumeOnIcon /> : <VolumeOffIcon />}
          </button>
        </div>
        <div className="flex flex-row space-x-6 items-center">
          <Select onValueChange={value => handleVideoQuality(value as VideoQuality)} defaultValue="auto">
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder={videoQuality} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto" className="hidden">
                auto
              </SelectItem>
              <SelectItem value="480p">480p</SelectItem>
              <SelectItem value="720p">720p</SelectItem>
              <SelectItem value="1080p">1080p</SelectItem>
            </SelectContent>
          </Select>
          <button type="button" onClick={handleExpand}>
            <ExpandIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

export default LivePlayer;
