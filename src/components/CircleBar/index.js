import styled from "styled-components";

const SVG = styled.svg`
  display: flex;
  width: ${({ width }) => `${width}px`};
  height: ${({ height }) => `${height}px`};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`
const Path = styled.path`
  stroke-dasharray: 292.273, 292.273;
  stroke-dashoffset: ${({ percent })  => percent ? Math.floor(292.273 - (292.273 * percent / 100)) : 292.273};
`

const CircleBar = props => {
    return (
        <SVG viewBox="0 0 100 100" width={props.width || 24} height={props.height || 24}>
            <path d="M 50,50 m 0,-46.5 a 46.5,46.5 0 1 1 0,93 a 46.5,46.5 0 1 1 0,-93" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="7" fillOpacity="0"/>
            <Path d="M 50,50 m 0,-46.5 a 46.5,46.5 0 1 1 0,93 a 46.5,46.5 0 1 1 0,-93" stroke={props.fill} percent={props.percent} strokeWidth="7" fillOpacity="0"/>
        </SVG>
    )
}

export default CircleBar;