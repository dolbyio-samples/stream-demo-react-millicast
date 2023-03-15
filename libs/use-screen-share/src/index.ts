import { useState } from 'react';

import { useScreenShare } from './types';

const useScreenShare = ({ handleError }: useScreenShare = {}) => {
  const [mediaStreams, setMediaStreams] = useState<MediaStream[]>([]);

  const handleInternalError = (error: unknown) => {
    if (error instanceof Error) {
      handleError?.(error.message);
    } else {
      handleError?.(`${error}`);
    }
  };

  const start = async () => {
    const constraints = {
      audio: true,
      video: { cursor: 'always' },
    } as MediaStreamConstraints;

    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);

      setMediaStreams((prevMediaStreams) => [...prevMediaStreams, mediaStream]);
    } catch (error: unknown) {
      handleInternalError(error);
    }
  };

  const stop = (mediaStreamId: string) => {
    const mediaStream = mediaStreams.find(({ id }) => id === mediaStreamId);

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });

      setMediaStreams((prevMediaStreams) => prevMediaStreams.filter(({ id }) => id !== mediaStreamId));
    }
  };

  return { mediaStreams, start, stop };
};

export * from './types';
export default useScreenShare;
