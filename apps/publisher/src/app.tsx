import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Select,
  Spacer,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react';

import usePublisher from '@millicast-react/use-publisher';
import useMediaDevices, { MediaConstraints } from '@millicast-react/use-media-devices';
import {
  IconMicrophoneOn,
  IconMicrophoneOff,
  IconCameraOn,
  IconCameraOff,
  IconSettings,
} from '@millicast-react/dolbyio-icons';
import VideoView from '@millicast-react/video-view';
import ParticipantCount from '@millicast-react/participant-count';
import ShareLinkButton from '@millicast-react/share-link-button';
import MediaDeviceSelect from '@millicast-react/media-device-select';
import Timer from '@millicast-react/timer';
import ResolutionSelect, { Resolution } from '@millicast-react/resolution-select';
import LiveIndicator from '@millicast-react/live-indicator';

import type { Stereo, Mono, AudioChannels } from '@millicast-react/use-media-devices';

function App() {
  const displayShareSourceId = 'DisplayShare';

  const [isSimulcastEnabled, setIsSimulcastEnabled] = useState(false);
  const [channels, setChannels] = useState<number>(1);
  const [echoCancellation, setEchoCancellation] = useState<boolean>(false);
  const [supportedResolutions, setSupportedResolutions] = useState<Resolution[]>([]);

  const {
    setupPublisher,
    startStreaming,
    stopStreaming,
    updateStreaming,
    startDisplayStreaming,
    stopDisplayStreaming,
    codec,
    codecList,
    updateCodec,
    publisherState,
    viewerCount,
    linkText,
    statistics,
  } = usePublisher();

  const {
    cameraList,
    microphoneList,
    setCameraId,
    setMicrophoneId,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    mediaStream,
    updateMediaConstraints,
    startDisplayCapture,
    stopDisplayCapture,
    displayStream,
    supportedVideoTrackCapabilities,
    supportedAudioTrackCapabilities,
  } = useMediaDevices();

  const [resolution, setResolution] = useState<Resolution>(supportedResolutions[0]);

  useEffect(() => {
    setupPublisher(
      import.meta.env.VITE_MILLICAST_STREAM_PUBLISHING_TOKEN,
      import.meta.env.VITE_MILLICAST_STREAM_NAME,
      import.meta.env.VITE_MILLICAST_STREAM_ID
    );
  }, []);

  useEffect(() => {
    if (mediaStream) {
      updateStreaming(mediaStream);

      // List supported camera resolutions
      if (supportedVideoTrackCapabilities) {
        const tempSupportedResolutionList = [];
        if (
          supportedVideoTrackCapabilities.width &&
          supportedVideoTrackCapabilities.width.max &&
          supportedVideoTrackCapabilities.height &&
          supportedVideoTrackCapabilities.height.max
        ) {
          if (supportedVideoTrackCapabilities.width.max >= 3840 && supportedVideoTrackCapabilities.height.max >= 2160) {
            tempSupportedResolutionList.push({
              name: '2160p',
              width: 3840,
              height: 2160,
            });
          }
          if (supportedVideoTrackCapabilities.width.max >= 2560 && supportedVideoTrackCapabilities.height.max >= 1440) {
            tempSupportedResolutionList.push({
              name: '1440p',
              width: 2560,
              height: 1440,
            });
          }
          if (supportedVideoTrackCapabilities.width.max >= 1920 && supportedVideoTrackCapabilities.height.max >= 1080) {
            tempSupportedResolutionList.push({
              name: '1080p',
              width: 1920,
              height: 1080,
            });
          }
          if (supportedVideoTrackCapabilities.width.max >= 1280 && supportedVideoTrackCapabilities.height.max >= 720) {
            tempSupportedResolutionList.push({
              name: '720p',
              width: 1280,
              height: 720,
            });
          }
          if (supportedVideoTrackCapabilities.width.max >= 720 && supportedVideoTrackCapabilities.height.max >= 480) {
            tempSupportedResolutionList.push({
              name: '480p',
              width: 720,
              height: 480,
            });
          }
        }

        if (tempSupportedResolutionList.length !== 0) {
          setSupportedResolutions(tempSupportedResolutionList);
        }
      }
    }
  }, [mediaStream]);

  useEffect(() => {
    if (!displayStream) stopDisplayStreaming();
    else if (publisherState === 'streaming')
      startDisplayStreaming({
        mediaStream: displayStream,
        sourceId: displayShareSourceId,
      });
  }, [displayStream, publisherState]);

  const onSelectCameraId = useCallback(
    (deviceId: string) => {
      setCameraId(deviceId);
    },
    [cameraList]
  );

  const onSelectMicrophoneId = useCallback(
    (deviceId: string) => {
      setMicrophoneId(deviceId);
    },
    [microphoneList]
  );

  const onSelectEchoCancellation = (echoCancellation: boolean) => {
    if (mediaStream) {
      const constraints = mediaStream.getTracks()[0].getConstraints();

      constraints.echoCancellation = echoCancellation;
  
      setEchoCancellation(echoCancellation);
      updateMediaConstraints(constraints as MediaStreamConstraints);
    }
    
  };

  const onSelectAudioChannels = () => {
    if (mediaStream) {
      const constraints = mediaStream.getTracks()[0].getConstraints();

      const stereoChannelCount: Stereo = 2;
      const monoChannelCount: Mono = 1;

      constraints.channels = channels === monoChannelCount ? stereoChannelCount : monoChannelCount;

      setChannels(channels);
      updateMediaConstraints(constraints as MediaStreamConstraints);
    }
    
  };

  const onSelectVideoResolution = (resolution: Resolution) => {
    if (mediaStream) {
      const constraints = mediaStream.getTracks()[0].getConstraints();
      
      constraints.width = resolution.width;
      constraints.height = resolution.height;

      setResolution(resolution);
      updateMediaConstraints(constraints as MediaStreamConstraints);
    }

  };

  // Colors, our icon is not managed by ChakraUI, so has to use the CSS variable
  // TODO: move this to IconComponents
  const purple400 = 'var(--chakra-colors-dolbyPurple-400)';

  return (
    <VStack w="100%">
      <Flex w="100%" gap="2" minWidth="max-content" alignItems="center">
        <Heading size="md" p="4">
          Dolbyio logo
        </Heading>
        <Spacer />
        {publisherState === 'streaming' && (
          <Box pr="8">
            <LiveIndicator />
          </Box>
        )}
      </Flex>
      <Flex w="100%">
        <Spacer />
        {publisherState === 'streaming' && (
          <Box pr="8">
            <ParticipantCount count={viewerCount} />
          </Box>
        )}
      </Flex>
      <Box>
        <Center>
          <VStack>
            <HStack bg="black">
              <Box>
                <VideoView
                  mirrored={true}
                  muted={true}
                  displayMuteButton={false}
                  mediaStream={mediaStream}
                  statistics={statistics}
                  height={480}
                />
              </Box>
              <Box display={displayStream ? 'block' : 'none'}>
                <VideoView mediaStream={displayStream} />
              </Box>
            </HStack>
            <HStack>
              <IconButton
                size="lg"
                p="4px"
                aria-label="toggle microphone"
                variant="outline"
                test-id="toggleAudioButton"
                isDisabled={!(mediaStream && mediaStream.getAudioTracks().length)}
                icon={isAudioEnabled ? <IconMicrophoneOn fill={purple400} /> : <IconMicrophoneOff fill="red" />}
                onClick={() => {
                  toggleAudio();
                }}
              />
              <IconButton
                size="lg"
                p="4px"
                aria-label="toggle camera"
                variant="outline"
                test-id="toggleVideoButton"
                isDisabled={!(mediaStream && mediaStream.getVideoTracks().length)}
                icon={isVideoEnabled ? <IconCameraOn fill={purple400} /> : <IconCameraOff fill="red" />}
                onClick={() => {
                  toggleVideo();
                }}
              />
              {/* Popover */}
              <Popover placement="top">
                <PopoverTrigger>
                  <IconButton
                    size="lg"
                    p="4px"
                    aria-label="settings"
                    variant="outline"
                    test-id="settingsButton"
                    icon={<IconSettings fill={purple400} />}
                  />
                </PopoverTrigger>
                <PopoverContent minWidth="360">
                  <PopoverHeader pt={4} fontWeight="bold" border="0">
                    Manage Your Devices
                  </PopoverHeader>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverBody>
                    <VStack>
                      <HStack width="100%">
                        <Text> Camera: </Text>
                        <Spacer />
                        {cameraList.length && (
                          <MediaDeviceSelect
                            disabled={publisherState === 'connecting'}
                            testId="camera-select"
                            deviceList={cameraList}
                            onSelectDeviceId={onSelectCameraId}
                          />
                        )}
                      </HStack>
                      <HStack width="100%">
                        <Text> Microphone: </Text>
                        <Spacer />
                        {microphoneList.length && (
                          <MediaDeviceSelect
                            disabled={publisherState === 'connecting'}
                            testId="microphone-select"
                            deviceList={microphoneList}
                            onSelectDeviceId={onSelectMicrophoneId}
                          />
                        )}
                      </HStack>
                      {codecList.length !== 0 && (
                        <HStack width="100%">
                          <Text> Codec </Text>
                          <Select
                            disabled={publisherState !== 'ready' || codecList.length === 0}
                            test-id="codecSelect"
                            defaultValue={codec || (codecList.length !== 0 ? codecList[0] : undefined)}
                            onChange={(e) => updateCodec(e.target.value)}
                          >
                            {codecList.map((codec: string) => {
                              return (
                                <option value={codec} key={codec}>
                                  {codec}
                                </option>
                              );
                            })}
                          </Select>
                        </HStack>
                      )}
                      {mediaStream && supportedResolutions.length && (
                        <HStack>
                          <Text> Resolution </Text>
                          <ResolutionSelect
                            onSelectResolution={(newResolution: Resolution) => {
                              onSelectVideoResolution(newResolution);
                            }}
                            resolutionList={supportedResolutions}
                            defaultResolution={resolution}
                          />
                        </HStack>
                      )}
                      {supportedAudioTrackCapabilities?.channelCount?.max &&
                        supportedAudioTrackCapabilities?.channelCount?.max >= 2 && (
                          <Switch test-id="channelCountSwitch" onChange={() => onSelectAudioChannels()}>
                            {channels === 1 ? 'Mono' : 'Stereo'}
                          </Switch>
                        )}
                      {supportedAudioTrackCapabilities?.echoCancellation && (
                        <Switch
                          test-id="echoCancellationSwitch"
                          onChange={() => onSelectEchoCancellation(!echoCancellation)}
                        >
                          Echo Cancellation {echoCancellation ? 'on' : 'off'}
                        </Switch>
                      )}
                      <Switch
                        test-id="simulcastSwitch"
                        onChange={() => setIsSimulcastEnabled(!isSimulcastEnabled)}
                        disabled={publisherState !== 'ready'}
                      >
                        Simulcast {isSimulcastEnabled ? 'on' : 'off'}
                      </Switch>
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
            <HStack>
              {(publisherState == 'ready' || publisherState == 'connecting') && (
                <Button
                  isLoading={publisherState == 'connecting'}
                  onClick={() => {
                    if (publisherState == 'ready' && mediaStream) {
                      startStreaming({
                        mediaStream,
                        simulcast: isSimulcastEnabled,
                        codec,
                        events: ['viewercount'],
                      });
                      if (displayStream)
                        startDisplayStreaming({
                          mediaStream: displayStream,
                          sourceId: displayShareSourceId,
                        });
                    }
                  }}
                  test-id="startStreamingButton"
                >
                  Go Live
                </Button>
              )}
              {publisherState === 'streaming' && (
                <>
                  <Button
                    test-id="stopStreamingButton"
                    onClick={() => {
                      stopDisplayStreaming();
                      stopStreaming();
                    }}
                  >
                    Stop Live
                  </Button>
                </>
              )}
              <Button
                test-id="toggleDisplayCaptureButton"
                onClick={() => {
                  displayStream ? stopDisplayCapture() : startDisplayCapture();
                }}
              >
                {displayStream ? 'Stop Presenting' : 'Present'}
              </Button>
            </HStack>
            {publisherState === 'streaming' && <Timer />}
            <ShareLinkButton linkText={linkText} />
          </VStack>
        </Center>
      </Box>
      <Box>
        <Text>Version: {__APP_VERSION__} </Text>
      </Box>
    </VStack>
  );
}

export default App;
