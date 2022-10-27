import React, {useCallback, useEffect, useRef, useState} from "react";
import {Button} from '@chakra-ui/react'
import testHeartRateData from "./TestHeartRateData";
import useFitnessDataStore from '../store/FitnessDataStore';

const HeartRate = () => {

    let characteristic = useRef<any>();
    let heartRateDevice = useRef<any>();
    let testing = false;
    let intervalRef = useRef<null | NodeJS.Timeout>(null);

    const {setHeartRateData, pushHeartRateData} = useFitnessDataStore();
    const {heartRateConnected, setHeartRateConnected} = useFitnessDataStore();
    const {setCurrentHeartRate} = useFitnessDataStore();
    const [index, setIndex] = useState<number>(0);

    useEffect(() => {
        if (testing) {
            setCurrentHeartRate(testHeartRateData[index].heartRate);
            pushHeartRateData({time: +Date.now(), heartRate: testHeartRateData[index].heartRate});
        }
    }, [index, testing, setCurrentHeartRate, pushHeartRateData]);

    useEffect(() => {
        if (testing) {
            setHeartRateConnected(true);
            intervalRef.current = setInterval(() => {
                setIndex((prevIndex) => {
                    if (prevIndex < testHeartRateData.length - 1) {
                        return prevIndex + 1;
                    } else {
                        clearInterval(intervalRef.current);
                        return (prevIndex);
                    }
                })
            }, 500);
        }
        return () => clearInterval(intervalRef.current);
    }, [testing, setHeartRateConnected]);

    const heartRateChange = useCallback((event) => {
        const value = event.target.value;
        const currentHeartRate: number = value.getUint8(1);
        setCurrentHeartRate(currentHeartRate);
        pushHeartRateData({time: +Date.now(), heartRate: currentHeartRate});
    }, [setCurrentHeartRate, pushHeartRateData]);

    const cleanup = useCallback(() => {
        if (!testing) {
            if (characteristic.current) {
                characteristic.current.removeEventListener('characteristicvaluechanged',
                    heartRateChange);
                characteristic.current = null;
            }
            if (heartRateDevice.current && heartRateDevice.current.gatt.connected) {
                heartRateDevice.current.removeEventListener('gattserverdisconnected', cleanup);
                heartRateDevice.current.gatt.disconnect();
                heartRateDevice.current = null;
            }
            setCurrentHeartRate(0);
            setHeartRateConnected(false);
            setHeartRateData([]);
        }
    }, [heartRateChange, setHeartRateConnected, setHeartRateData, testing, setCurrentHeartRate]);

    const connectHeartRate = () => {
        let navigatorObject: any = window.navigator;
        if (navigatorObject && navigatorObject.bluetooth) {
            navigatorObject.bluetooth.requestDevice({filters: [{services: ['heart_rate']}]})
                .then(device => {
                    heartRateDevice.current = device;
                    heartRateDevice.current.addEventListener('gattserverdisconnected', cleanup);
                    return heartRateDevice.current.gatt.connect();
                })
                .then(server => {
                    return server.getPrimaryService('heart_rate')
                })
                .then(service => {
                    return service.getCharacteristic('heart_rate_measurement')
                })
                .then(character => {
                    characteristic.current = character;
                    return characteristic.current.startNotifications().then(_ => {
                        setHeartRateConnected(true);
                        characteristic.current.addEventListener('characteristicvaluechanged',
                            heartRateChange);
                    });
                })
                .catch(e => console.error(e));
        }
    }

    return (
        <>
            {heartRateConnected ?
                <Button textAlign="center" className="square" onClick={() => cleanup()}>
                    Disconnect from Heart Rate Monitor
                </Button>
                :
                <Button textAlign="center" className="square" onClick={connectHeartRate}>
                    Connect to Heart Rate Monitor
                </Button>
            }
        </>
    );
}

export default HeartRate;
