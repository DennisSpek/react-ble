import React from "react";
import {
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatGroup,
} from '@chakra-ui/react'
import {Icon} from '@chakra-ui/react'

interface StatsDisplayProps {
    label: string;
    currentValue: string | number;
    icon?: any;
    iconColour?: string;
    units: string;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = (props: StatsDisplayProps, context?: any) => {
    let icon: JSX.Element = props.icon ? <Icon color={props.iconColour ? props.iconColour : "black"} mr="2" as={props.icon as any}></Icon> : null;
    return (
        <StatGroup padding={2}>
            <Stat>
                <StatLabel fontSize='2xl'>
                    {icon}
                    {props.label}
                </StatLabel>
                <StatNumber fontSize='2xl'>{props.currentValue}</StatNumber>
                <StatHelpText fontSize='2xl'>
                    {props.units}
                </StatHelpText>
            </Stat>
        </StatGroup>
    );
}
