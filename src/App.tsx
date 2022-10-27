import * as React from 'react'
import {Heading, Box, WrapItem} from '@chakra-ui/react'
import {ChakraProvider, Wrap} from '@chakra-ui/react'

import HeartRate from './components/HeartRate'
import SpeedAndCadence from "./components/SpeedAndCadence";
import StatsDisplays from "./components/StatsDisplays";
import {LineCharts} from "./components/LineCharts";

function App() {
    return (
        <ChakraProvider>
            <Box m={2} width="100%">
                <Heading textAlign='center' as='h1' size='2xl'>React BLE Fitness</Heading>
            </Box>
            <Wrap spacingX='20px' justify="center" align='center'>
                <WrapItem>
                    <HeartRate></HeartRate>
                </WrapItem>
                <WrapItem>
                    <SpeedAndCadence></SpeedAndCadence>
                </WrapItem>
            </Wrap>
            <StatsDisplays/>
            <LineCharts/>
        </ChakraProvider>
    )
}

export default App;
