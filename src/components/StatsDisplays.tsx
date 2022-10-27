import React from "react";
import {BsFillHeartFill, BsSpeedometer2} from 'react-icons/bs'
import useFitnessDataStore from '../store/FitnessDataStore';
import {StatsDisplay} from "./StatsDisplay";
import {Wrap} from "@chakra-ui/react";
import {AiFillThunderbolt} from "react-icons/ai";

const StatsDisplays = () => {

    const {currentHeartRate, currentCadence, currentSpeed, currentPower, totalDistance} = useFitnessDataStore();

    return (
        <Wrap spacingX='30px' justify="center" align='center'>
            <StatsDisplay
                icon={BsFillHeartFill}
                iconColour="red"
                label="Heart Rate"
                currentValue={currentHeartRate}
                units="BPM"/>
            <StatsDisplay
                label="Cadence"
                currentValue={currentCadence.toFixed()}
                units="RPM"/>
            <StatsDisplay
                icon={BsSpeedometer2}
                label="Speed"
                currentValue={currentSpeed.toFixed()}
                units="KM/HR"/>
            <StatsDisplay
                icon={AiFillThunderbolt}
                label="Power"
                currentValue={currentPower}
                units="WATTS"/>
            <StatsDisplay
                label="Distance"
                currentValue={totalDistance.toFixed(2)}
                units="KM"/>
        </Wrap>

    );
}
export default StatsDisplays;
