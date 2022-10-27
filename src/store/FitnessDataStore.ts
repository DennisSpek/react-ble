import create from 'zustand'

export interface HeartRateData {
    time: number,
    heartRate: number
}

export interface CyclingData {
    time: number,
    cadence: number,
    speed: number,
    power: number,
    totalDistance: number
}

interface FitnessDataState {
    heartRateData: HeartRateData[],
    setHeartRateData: (data: HeartRateData[]) => void,
    pushHeartRateData: (data: HeartRateData) => void,
    heartRateConnected: boolean,
    setHeartRateConnected: (isConnected: boolean) => void,
    currentHeartRate: number,
    setCurrentHeartRate: (currentHeartRate: number) => void,
    cyclingData: CyclingData[],
    setCyclingData: (data: CyclingData[]) => void,
    pushCyclingData: (data: CyclingData) => void,
    cadenceConnected: boolean,
    setCadenceConnected: (isConnected: boolean) => void,
    currentCadence: number,
    setCurrentCadence: (currentCadence: number) => void,
    currentSpeed: number,
    setCurrentSpeed: (currentSpeed: number) => void,
    currentPower: number,
    setCurrentPower: (currentPower: number) => void,
    totalDistance: number,
    setTotalDistance: (totalDistance: number) => void,
}

const useFitnessDataStore = create<FitnessDataState>((set) => ({
    heartRateData: [],
    setHeartRateData: (heartRateData: HeartRateData[]) =>
        set((state) => ({
            ...state,
            heartRateData
        })),
    pushHeartRateData: (heartRateData: HeartRateData) =>
        set((state) => ({
            ...state,
            heartRateData: [
                ...state.heartRateData,
                heartRateData
            ]
        })),
    heartRateConnected: false,
    setHeartRateConnected: (heartRateConnected: boolean) =>
        set((state) => ({
            ...state,
            heartRateConnected
        })),
    currentHeartRate: 0,
    setCurrentHeartRate: (currentHeartRate: number) =>
        set((state) => ({
            ...state,
            currentHeartRate
        })),
    cyclingData: [],
    setCyclingData: (cyclingData: CyclingData[]) =>
        set((state) => ({
            ...state,
            cyclingData
        })),
    pushCyclingData: (cyclingData: CyclingData) =>
        set((state) => ({
            ...state,
            cyclingData: [
                ...state.cyclingData,
                cyclingData
            ]
        })),
    cadenceConnected: false,
    setCadenceConnected: (cadenceConnected: boolean) =>
        set((state) => ({
            ...state,
            cadenceConnected
        })),
    currentCadence: 0,
    setCurrentCadence: (currentCadence: number) =>
        set((state) => ({
            ...state,
            currentCadence
        })),
    currentSpeed: 0,
    setCurrentSpeed: (currentSpeed: number) =>
        set((state) => ({
            ...state,
            currentSpeed
        })),
    currentPower: 0,
    setCurrentPower: (currentPower: number) =>
        set((state) => ({
            ...state,
            currentPower
        })),
    totalDistance: 0,
    setTotalDistance: (totalDistance: number) =>
        set((state) => ({
            ...state,
            totalDistance
        })),
}));
export default useFitnessDataStore;
