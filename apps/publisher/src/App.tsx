import { useEffect, useState, useCallback } from "react";
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
} from "@chakra-ui/react";
import usePublisher from "./hooks/usePublisher";
import useMediaDevices, { AudioChannels, MediaConstraints } from "./hooks/useMediaDevices";
import IconMicrophoneOn from './components/Icons/Microphone';
import IconMicrophoneOff from './components/Icons/MicrophoneOff';
import IconCameraOn from "./components/Icons/Camera";
import IconCameraOff from "./components/Icons/CameraOff";
import IconSettings from "./components/Icons/Settings";
import VideoView from './components/VideoView/VideoView';
import ParticipantCount from "./components/ParticipantCount/ParticipantCount";
import ShareLinkButton from "./components/ShareLinkButton/ShareLinkButton";
import MediaDeviceSelect from "./components/MediaDeviceSelect/MediaDeviceSelect";
import ResolutionSelect, { Resolution } from "./components/ResolutionSelect/ResolutionSelect";

function App() {
  const [shouldRecord, setShouldRecord] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [streamId, setStreamId] = useState("");
  const [streamName, setStreamName] = useState("")
  const [isSimulcastEnabled, setIsSimulcastEnabled] = useState(false);
  const [channels, setChannels] = useState<number>(1);
  const [echoCancellation, setEchoCancellation] = useState<boolean>(true);

  const { startStreaming,
    stopStreaming,
    updateStreaming,
    codec,
    codecList,
    updateCodec,
    publisherState,
    viewerCount,
    linkText
  } = usePublisher(accessToken, streamName, streamId,);

  const {
    cameraList,
    microphoneList,
    cameraId,
    microphoneId,
    setCameraId,
    setMicrophoneId,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    mediaStream,
    updateMediaConstraints,
  } = useMediaDevices();

  useEffect(() => {
    setAccessToken(import.meta.env.VITE_MILLICAST_STREAM_PUBLISHING_TOKEN);
    setStreamName(import.meta.env.VITE_MILLICAST_STREAM_NAME);
    setStreamId(import.meta.env.VITE_MILLICAST_STREAM_ID);
  }, []);

  useEffect(() => {
    if (mediaStream) {
      updateStreaming(mediaStream);
    }
  }, [mediaStream]);

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

  // TODO wire these events correctly to `useMediaDevices
  const onSelectEchoCancellation = (echoCancellation: boolean) => {
    const constraints: MediaConstraints = {
      channelCount: channels as AudioChannels,
      echoCancellation
    };
    updateMediaConstraints(constraints);

  };

  // TODO wire these events correctly to `useMediaDevices
  const onSelectAudioChannels = (channels: AudioChannels) => {
    const constraints: MediaConstraints = {
      channelCount: channels as AudioChannels,
      echoCancellation
    };
    updateMediaConstraints(constraints);
  };

  // TODO wire these events correctly to `useMediaDevices
  const onSelectVideoResolution = (resolution: Resolution) => {
    const constraints: MediaConstraints = {
      channelCount: channels as AudioChannels,
      echoCancellation
    };
    updateMediaConstraints(constraints);
  };

  // Colors, our icon is not managed by ChakraUI, so has to use the CSS variable
  // TODO: move this to IconComponents
  const purple400 = "var(--chakra-colors-dolbyPurple-400)";

  return (
    <VStack w="100%">
      <Flex w="100%" gap="2" minWidth="max-content" alignItems="center">
        <Box>
          <Heading size="md" p="4">
            Dolbyio logo
          </Heading>
        </Box>
        <Spacer />
        {publisherState == "streaming" && <ParticipantCount count={viewerCount} />}
      </Flex>
      <Box>
        <Center>
          <VStack>
            <Box bg="black">
              <VideoView mediaStream={mediaStream}/>
            </Box>
            <HStack>
              <IconButton size='lg' p='4px'
                aria-label="toggle microphone"
                variant='outline'
                test-id='toggleAudioButton'
                isDisabled = { mediaStream && mediaStream.getAudioTracks().length ? false : true }
                icon={ isAudioEnabled ? (<IconMicrophoneOn fill={purple400} />) : (<IconMicrophoneOff fill='red' />)}
                onClick={() => { toggleAudio() }} />
              <IconButton
                size="lg" p='4px'
                aria-label="toggle camera"
                variant="outline"
                test-id='toggleVideoButton'
                isDisabled = { mediaStream && mediaStream.getVideoTracks().length ? false : true }
                icon={ isVideoEnabled ? (<IconCameraOn fill={purple400} />) : (<IconCameraOff fill="red" />)}
                onClick={() => { toggleVideo() }} />
              {/* Popover */}
              <Popover placement="top">
                <PopoverTrigger>
                  <IconButton
                    size='lg'
                    p='4px'
                    aria-label="settings"
                    variant="outline"
                    test-id='settingsButton'
                    icon={<IconSettings fill={purple400} />}
                  />
                </PopoverTrigger>
                <PopoverContent minWidth='360'>
                  <PopoverHeader pt={4} fontWeight='bold' border='0'>
                    Manage Your Devices
                  </PopoverHeader>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverBody>
                    <VStack>
                      <HStack width='100%'>
                        <Text> Camera: </Text>
                        <Spacer />
                        { cameraList.length && (
                          <MediaDeviceSelect
                            disabled = { publisherState === 'connecting' }
                            testId="camera-select"
                            placeHolder="Select Camera"
                            selectedDeviceId={cameraId}
                            deviceList={cameraList}
                            onSelectDeviceId={onSelectCameraId}
                          />
                        )}
                      </HStack>
                      <HStack width='100%'>
                        <Text> Microphone: </Text>
                        <Spacer />
                        { microphoneList.length && (
                          <MediaDeviceSelect
                            disabled = { publisherState === 'connecting' }
                            testId="microphone-select"
                            placeHolder="Select Microphone"
                            selectedDeviceId={microphoneId}
                            deviceList={microphoneList}
                            onSelectDeviceId={onSelectMicrophoneId}
                          />
                        )}
                      </HStack>
                      <HStack width='100%'>
                        <Text> Codec </Text>
                        {
                          <Select
                            disabled={publisherState !== "ready" || codecList.length === 0}
                            test-id="codecSelect"
                            placeholder="Select Codec"
                            defaultValue={codec || (codecList.length !== 0 ? codecList[0] : undefined)}
                            onChange={(e) => updateCodec(e.target.value)}
                          >
                            {codecList.map((codec) => {
                              return (
                                <option value={codec} key={codec}>
                                  {codec}
                                </option>
                              );
                            })}
                          </Select>
                        }
                      </HStack>
                      <HStack>
                        <Text> Resolution </Text>
                        <ResolutionSelect updateResolution={(newResolution: Resolution) => {
                          onSelectVideoResolution(newResolution);
                        }} />
                      </HStack>
                      <Switch test-id="channelCountSwitch"
                        onChange={() => setIsSimulcastEnabled(!isSimulcastEnabled)}
                      >
                        Mono or Stereo
                      </Switch>
                      <Switch test-id="echoCancellationSwitch"
                        onChange={() => setIsSimulcastEnabled(!isSimulcastEnabled)}
                      >
                        Echo Cancellation
                      </Switch>
                      <Switch test-id="simulcastSwitch"
                        onChange={() => setIsSimulcastEnabled(!isSimulcastEnabled)}
                        disabled={publisherState !== "ready"}>
                        Simulcast
                      </Switch>
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
            {publisherState == "ready" || publisherState == "connecting" ? (
              <Button
                isLoading={publisherState == "connecting"}
                onClick={() => {
                  if (publisherState == "ready" && mediaStream) {
                    startStreaming(
                      {
                        mediaStream,
                        events: ['viewercount'],
                        simulcast: isSimulcastEnabled,
                        codec: codec
                      });
                  }
                }}
                test-id="startStreamingButton"
              >
                Go Live
              </Button>
            ) : undefined}
            {publisherState === "streaming" && (
              <>
                <Button
                  test-id="stopStreamingButton"
                  onClick={() => {
                    stopStreaming();
                  }}
                >
                  Stop Live
                </Button>
                <Text> This is a timer </Text>
              </>
            )}
            {(publisherState === "ready" || publisherState === "streaming") && (
              <Switch onChange={() => setShouldRecord(!shouldRecord)}>
                enable recording
              </Switch>
            )}
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
