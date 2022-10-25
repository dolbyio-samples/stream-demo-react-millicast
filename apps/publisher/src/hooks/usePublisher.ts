import { useEffect, useRef, useState } from "react";
import { Director, Publish, Event } from '@millicast/sdk';

export type PublisherState = "ready" | "connecting" | "streaming";

export type streamStats = {
    audio: {
      inbounds: [];
      outbounds: {
        bitrate: number;
        id: string;
        mid: string;
        mimeType: string;
        timestamp: number;
        totalBytesSent: number;
      }[]
    },
    availableOutgoingBitrate: number;
    candidateType: string;
    currentRoundTripTime: number;
    raw: {
      size: number;
    },
    totalRoundTripTime: number;
    video: {
      inbounds: [];
      outbounds: {
        bitrate: number;
        frameHeight: number;
        frameWidth: number;
        framesPerSecond: number;
        id: string;
        mid: string;
        mimeType: string;
        qualityLimitationReason: string;
        timestamp: number;
        totalBytesSent: number;
      }[]
    },
  }
export interface Publisher {
    startStreaming: (broadcastOptions: BroadcastOptions) => Promise<void>;
    stopStreaming: () => void;
    updateStreaming: (mediaStream: MediaStream) => void;
    publisherState: PublisherState;
    viewerCount: number;
    linkText: string;
    stats: streamStats | undefined;
}

export interface BroadcastOptions {
    mediaStream: MediaStream,
    // TODO The app only supports the `viewercount` event right now, and none others. Subsribing to other events
    // will not produce any results. 
    events: Event[]
}

const usePublisher = (token: string, streamName: string, streamId: string): Publisher => {

    const [publisherState, setPublisherState] = useState<PublisherState>("ready");
    const [viewerCount, setViewerCount] = useState(0);
    const [stats, setStats] = useState<streamStats>()

    const publisher = useRef<Publish>();

    useEffect(() => {
        if (!token || !streamName) return; 
        const tokenGenerator = () => Director.getPublisher({ token: token, streamName: streamName });
        publisher.current = new Publish(streamName, tokenGenerator, true);
        return () => { stopStreaming() };

    }, [token, streamName]);

    const startStreaming = async (broadcastOptions: BroadcastOptions) => {

        if (!publisher.current || publisher.current.isActive() || publisherState !== "ready") return;
        try {

            setPublisherState("connecting");
            await publisher.current.connect(broadcastOptions);

            publisher.current.on('broadcastEvent', (event) => {
                const { name, data } = event;
                if (broadcastOptions.events.includes(name)) setViewerCount(data.viewercount);
            });

            setPublisherState("streaming")
            publisher.current.webRTCPeer.initStats()

            publisher.current.webRTCPeer.on('stats', (stats) => {
                console.log('Stats from event: ', stats)
                setStats(stats);
             })
        } catch (e) {
            setPublisherState("ready");
            console.error(e);
        }
    };

    const stopStreaming = async () => {
        await publisher.current?.stop();
        setPublisherState("ready")
        setStats(undefined)
    }

    const updateStreaming = (stream: MediaStream) => {
        if (publisher.current && publisher.current.isActive()) {
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length) {
                publisher.current.webRTCPeer.replaceTrack(audioTracks[0]);
            }
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length) {
                publisher.current.webRTCPeer.replaceTrack(videoTracks[0]);
            }
        }
    }

    const linkText = `https://viewer.millicast.com/?streamId=${streamId}/${streamName}`;

    return {
        startStreaming,
        stopStreaming,
        updateStreaming,
        publisherState,
        viewerCount,
        linkText,
        stats
    };
};

export default usePublisher;
