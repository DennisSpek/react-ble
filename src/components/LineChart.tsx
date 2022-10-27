import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import debounce from "lodash/debounce";

const PADDING_WIDTH = 150;
const PADDING_HEIGHT = 30;

interface StateInfo {
    width: number,
    height: number
}

function useResize(ref) {
    const [state, setState] = useState<StateInfo>();
    useEffect(() => {
        const getSize = debounce(() => {
            if (!ref || !ref.current) {
                return;
            }

            const width = ref.current.offsetWidth;
            const height = ref.current.offsetHeight;
            setState({
                width,
                height
            });
        }, 1000);

        window.addEventListener("resize", getSize);
        getSize();
        return () => window.removeEventListener("resize", getSize);
    }, [ref]);

    return state;
}

const LineChart = props => {
    const [lineData, setLineData] = useState();
    const [markers, setMarkers] = useState();

    const rootRef = useRef(null);
    const xAxisRef = useRef(null);
    const yAxisRef = useRef(null);
    const size: any = useResize(rootRef);

    useEffect(() => {
        if (!size || !props.data) {
            return;
        }

        const data = props.data;

        const { width, height } = size;

        const xScale = d3
            .scaleLinear()
            .domain([d3.min(data, d => d[props.x]), d3.max(data, d => d[props.x])])
            .range([PADDING_WIDTH, width - PADDING_WIDTH]);
        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(data, d => d[props.y])])
            .range([height - PADDING_HEIGHT, PADDING_HEIGHT]);

        const lineGenerator = d3
            .line()
            .x(d => xScale(d[props.x]))
            .y(d => yScale(d[props.y]))
            .curve(d3.curveMonotoneX);

        const xAxis = d3
            .axisBottom()
            .scale(xScale)
            .tickValues([]);
        const yAxis = d3
            .axisLeft()
            .scale(yScale)
            .ticks(height / 50);

        d3.select(xAxisRef.current).call(xAxis);
        d3.select(yAxisRef.current).call(yAxis);

       setLineData(lineGenerator(data));
        setMarkers(
            data.map((d) => ({
                x: xScale(d[props.x]),
                y: yScale(d[props.y])
            }))
        );

    }, [size, props]);

    return (
        <div className="chart-area" ref={rootRef}>
            {size && (
                <svg width={size.width} height={size.height}>
                    <g id="axes">
                        <g
                            id="x-axis"
                            ref={xAxisRef}
                            transform={`translate(0, ${size.height - PADDING_HEIGHT})`}
                        />
                        <g
                            id="y-axis"
                            ref={yAxisRef}
                            transform={`translate(${PADDING_WIDTH}, 0)`}
                        />
                    </g>
                    <g id="chart">
                        {lineData && (
                            <path
                                fill="none"
                                stroke={props.lineColour ? props.lineColour : "black"}
                                className="chart-line"
                                d={lineData} />
                        )}
                        {markers &&
                        (markers as any).map((marker, i) => (
                            <circle
                                key={i}
                                cx={marker.x}
                                cy={marker.y}
                                r={2}
                                className="chart-marker"
                            />
                        ))}
                    </g>
                </svg>
            )}
        </div>
    );
};

export default LineChart;

