import { Box, Flex, Text } from '@chakra-ui/react';
import { IconParticipant } from '@millicast-react/dolbyio-icons';
import React from 'react';

export type ParticipantCountProps = {
  count: string | number;
};

const ParticipantCount = ({ count }: ParticipantCountProps) => {
  const formatText = (count: string | number): string => {
    if (count == '1') {
      return `${count} viewer`;
    } else {
      return `${count} viewers`;
    }
  };

  return (
    <Flex test-id="participantCountView" color="dolbySecondary.200" alignItems="center">
      <Box boxSize={6}>
        <IconParticipant />
      </Box>
      <Text color="dolbySecondary.200" fontSize="14px" ml="2">
        {formatText(count)}
      </Text>
    </Flex>
  );
};

export default ParticipantCount;
