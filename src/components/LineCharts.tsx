import React from "react";
import {
    Center,
} from '@chakra-ui/react'
import LineChart from "./LineChart";
import useFitnessDataStore from "../store/FitnessDataStore";

const LINE_CHART_HEIGHT = '200px';

export const LineCharts = () => {
    const {heartRateData, cyclingData} = useFitnessDataStore();
    return (
        <div>
            <Center width="100%" m={2} height={LINE_CHART_HEIGHT}>
                <LineChart
                    height={LINE_CHART_HEIGHT}
                    x="time"
                    y="heartRate"
                    lineColour="red"
                    data={heartRateData}/>
            </Center>
            <Center width="100%" m={2} height={LINE_CHART_HEIGHT}>
                <LineChart
                    data={cyclingData}
                    x="time"
                    y="power"/>
            </Center>
        </div>
    );
}
