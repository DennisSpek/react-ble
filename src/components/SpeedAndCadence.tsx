import React, {useEffect, useRef, useState} from "react";
import {Button} from '@chakra-ui/react'
import testPowerData from "./TestPowerData";
import useFitnessDataStore from "../store/FitnessDataStore";

// Bluetooth constants
const cyclingPower = 0x1818;
const cyclingPowerMeasurement = 0x2A63;
const WHEEL_CIRCUMFERENCE = 2136; // assume 28mm tires

let ble_sint16 = ['getInt16', 2, true];
let ble_uint8 = ['getUint8', 1];
let ble_uint16 = ['getUint16', 2, true];
let ble_uint32 = ['getUint32', 4, true];
let ble_uint24 = ['getUint8', 3];

const SpeedAndCadence = () => {

    let testing = false;
    let characteristic = useRef<any>();
    let cadenceDevice = useRef<any>();
    let intervalRef = useRef<null | NodeJS.Timeout>(null);
    let firstCrankReading = useRef<boolean>(true);
    let firstDistanceReading = useRef<boolean>(true);
    let lastCrankRevolutions = useRef<number>(0);
    let lastCrankTime = useRef<number>(0);
    let lastWheelRevolutions = useRef<number>(0);
    let lastWheelTime = useRef<number>(0);

    const {pushCyclingData} = useFitnessDataStore();
    const {cadenceConnected, setCadenceConnected} = useFitnessDataStore();
    const {currentCadence, setCurrentCadence} = useFitnessDataStore();
    const {setCurrentSpeed} = useFitnessDataStore();
    const {setCurrentPower} = useFitnessDataStore();
    const {totalDistance, setTotalDistance} = useFitnessDataStore();

    const [index, setIndex] = useState<number>(0);

     useEffect(() => {
        if (testing) {
            calculateStats(testPowerData[index]);
        }
       // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, testing]);

    useEffect(() => {
        if (testing) {
            setCadenceConnected(true);
            intervalRef.current = setInterval(() => {
                setIndex((prevIndex) => {
                    if (prevIndex < testPowerData.length - 1) {
                        return prevIndex + 1;
                    } else {
                        clearInterval(intervalRef.current);
                        return (prevIndex);
                    }
                })
            }, 500);
        }
        return () => clearInterval(intervalRef.current);
    }, [testing, setCadenceConnected]);

    function cleanup() {
        if (characteristic.current) {
            characteristic.current.removeEventListener('characteristicvaluechanged',
                cadenceChange.bind(this));
            characteristic.current = null;
        }
        if (cadenceDevice.current && cadenceDevice.current.gatt.connected) {
            cadenceDevice.current.gatt.disconnect();
            cadenceDevice.current = null;
        }
        lastCrankRevolutions.current = 0;
        lastCrankTime.current = 0;
        lastWheelRevolutions.current = 0;
        lastWheelTime.current = 0;
        setCadenceConnected(false);
    }

    function getData(dataview) {
        let fields = [
            [0, [[ble_sint16, 'instantaneous_power']]],
            [1, [[ble_uint8, 'pedal_power_balance']]],
            [2, [ /* Pedal Power Balance Reference */]],
            [4, [[ble_uint16, 'accumulated_torque']]],
            [8, [ /* Accumulated Torque Source */]],
            [16, [[ble_uint32, 'cumulative_wheel_revolutions'], [ble_uint16, 'last_wheel_event_time']]],
            [32, [[ble_uint16, 'cumulative_crank_revolutions'], [ble_uint16, 'last_crank_event_time']]],
            [64, [[ble_sint16, 'maximum_force_magnitude'], [ble_sint16, 'minimum_force_magnitude']]],
            [128, [[ble_sint16, 'maximum_torque_magnitude'], [ble_sint16, 'minimum_torque_magnitude']]],
            [256, [[ble_uint24, 'maximum_minimum_angle']]],
            [512, [[ble_uint16, 'top_dead_spot_angle']]],
            [1024, [[ble_uint16, 'bottom_dead_spot_angle']]],
            [2048, [[ble_uint16, 'accumulated_energy']]],
            [4096, [ /* Offset Compensation Indicator */]]
        ];

        let offset = 2;
        let mask = dataview.getUint16(0, true);

        let fieldArrangement = [];

        // Contains required fields
        if (fields[0][0] === 0) {
            for (let fdesc of fields[0][1] as any) {
                fieldArrangement.push(fdesc);
            }
        }

        for (let [flag, fieldDescriptions] of fields) {
            if (mask & flag as any) {
                for (let fdesc of fieldDescriptions as any) {
                    fieldArrangement.push(fdesc);
                }
            }
        }

        let data = {};
        for (let field of fieldArrangement) {
            const [[accessor, fieldSize, endianness], fieldName] = field;
            let value;
            if (endianness) {
                value = dataview[accessor](offset, endianness);
            } else {
                value = dataview[accessor](offset);
            }
            data[fieldName] = value;
            offset += fieldSize;
        }
        return data;
    }

    const calculateStats = (data) => {
        console.log(data);
        let power = data['instantaneous_power'];

        // The time stamps can overflow, but since you only need to know the difference between the last two readings
        // it can still be calculated even if it overflows by subtracting UINT16_MAX.

        // TODO: Clear the current values if we haven't received anything after a timeout
        // TODO:  See if this will work off of the data buffer rather than have to keep the "last" variables

        /* Crank Calc */
        let crankRevolutions = data['cumulative_crank_revolutions'];
        let crankTime = data['last_crank_event_time'];
        let rpm = 0;
        if (crankRevolutions !== undefined && crankTime !== undefined) {
            if (lastCrankTime.current > crankTime) {
                lastCrankTime.current = lastCrankTime.current - 65536;
            }
            if (lastCrankRevolutions.current > crankRevolutions) {
                lastCrankRevolutions.current = (lastCrankRevolutions.current  - 65536);
            }
            let revs = crankRevolutions - lastCrankRevolutions.current;
            let duration = (crankTime - lastCrankTime.current) / 1024;
            if (firstCrankReading.current) {
                firstCrankReading.current = false;
            } else {
                if (duration > 0) {
                    rpm = (revs / duration) * 60;
                }
            }
            lastCrankRevolutions.current = (crankRevolutions);
            lastCrankTime.current = (crankTime);
            /* End Crank Calc */
        }

        /* Wheel Calc */
        let wheelRevolutions = data['cumulative_wheel_revolutions'];
        let wheelTime = data['last_wheel_event_time'];
        let kph = 0;
        let distance = 0;
        let newTotalDistance = 0;
        if (wheelRevolutions !== undefined && wheelTime !== undefined) {
            if (lastWheelTime.current > wheelTime) {
                lastWheelTime.current = (lastWheelTime.current - 65536);
            }
            if (lastWheelRevolutions > wheelRevolutions) {
                lastWheelRevolutions.current = (lastWheelRevolutions.current - 65536);
            }

            let wheelRevs = wheelRevolutions - lastWheelRevolutions.current;
            let wheelDuration = (wheelTime - lastWheelTime.current) / 1024;
            let wheelRpm = 0;
            if (wheelDuration > 0) {
                wheelRpm = (wheelRevs / wheelDuration) * 60;
            }

            lastWheelRevolutions.current = wheelRevolutions;
            lastWheelTime.current = wheelTime;

            // Hardcoded to 28mm tires
            if (firstDistanceReading.current) {
                firstDistanceReading.current = false;
            } else {
                kph = (WHEEL_CIRCUMFERENCE * wheelRpm * 60) / 1000000;
                distance = wheelRevs * WHEEL_CIRCUMFERENCE / 1000000; // km
                newTotalDistance = totalDistance + distance;
            }
        }
        /* End Wheel Calc */

        const newCyclingData =
            {
                time: +Date.now(),
                cadence: rpm,
                speed: kph,
                power,
                totalDistance: newTotalDistance
            };
        console.log(newCyclingData)
        pushCyclingData(newCyclingData);
        setCurrentSpeed(kph);
        setCurrentCadence(rpm);
        setCurrentPower(power);
        setTotalDistance(newTotalDistance);
        console.log('currentCadence', currentCadence);
    }

    function cadenceChange(event) {
        const value = event.target.value;
        const data = getData(value);
        calculateStats(data);
    }

    const onDisconnected = () => {
        cleanup();
    }

    const connectSpeedAndCadence = () => {
        let navigatorObject: any = window.navigator;
        if (navigatorObject && navigatorObject.bluetooth) {
            navigatorObject.bluetooth.requestDevice({
                filters: [{services: [cyclingPower]}]
            })
                .then(device => {
                    cadenceDevice.current = device;
                    device.addEventListener('gattserverdisconnected', () => onDisconnected());
                    return device.gatt.connect();
                })
                .then(server => {
                    return server.getPrimaryService(cyclingPower);
                })
                .then(service => {
                    return service.getCharacteristic(cyclingPowerMeasurement)
                })
                .then(character => {
                    characteristic.current = character;
                    return character.startNotifications().then(_ => {
                        setCadenceConnected(true);
                        character.addEventListener('characteristicvaluechanged',
                            cadenceChange.bind(this));
                    });
                })
                .catch(error => {
                    console.error('Failed to connect!', error);
                    cleanup();
                });
        }
    }

    return (
        <>
            {cadenceConnected ?
                <Button textAlign="center" margin={"4"} className="square" onClick={() => cleanup()}>
                    Disconnect from Speed and Cadence Monitor
                </Button>
                :
                <Button textAlign="center" margin={"4"} className="square" onClick={connectSpeedAndCadence}>
                    Connect to Cycling Power Measurement
                </Button>
            }
        </>
    );
}
export default SpeedAndCadence;
