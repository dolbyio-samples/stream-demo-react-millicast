import React, { memo, useEffect, useState } from 'react';
import { Box, Text, Heading } from '@chakra-ui/react';

const Timer = () => {
    let startTime = 0;
    let currentTime = 0;
    const [sessionTime, setSessionTime] = useState<string>("00:00:00");

    useEffect(() => {
        const startTimer = () => {
            currentTime = Math.floor((Date.now() - startTime) / 1000);

            const hour = Math.floor(currentTime / 60 / 60);
            const minute = Math.floor(currentTime / 60 % 60);
            const second = Math.floor(currentTime % 60 % 60 );

            setSessionTime(`${hour === 0 ? '00' : hour.toLocaleString('en-US', {minimumIntegerDigits: 2})}:${minute === 0 ? '00' : minute.toLocaleString('en-US', {minimumIntegerDigits: 2})}:${second === 0 ? '00' : second.toLocaleString('en-US', {minimumIntegerDigits: 2})}`);
        }
        
            startTime = Date.now();
            const interval = setInterval(startTimer, 1000);

            return () => clearInterval(interval);
    }, []);

    return (
        <Box test-id="timer" textAlign="center">
            <Heading as='h5' size='sm'>Your session has been started for:</Heading>
            <Text>{sessionTime}</Text>
        </Box>
    )
}

export default memo(Timer);