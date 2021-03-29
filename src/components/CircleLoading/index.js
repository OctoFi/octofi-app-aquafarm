import styled, { keyframes } from "styled-components";

const fill = keyframes`
  from {
    stroke-dashoffset: 0;
  }
  
  to {
    stroke-dashoffset: 292.273;
  }
`

const SVG = styled.svg`
  display: flex;
  width: ${({ width }) => `${width}px`};
  height: ${({ height }) => `${height}px`};
`
const Path = styled.path`
  stroke-dasharray: 292.273, 292.273;
  animation: ${fill} 15s linear infinite forwards;
`

const CircleLoading = props => {
    return (
        <SVG viewBox="0 0 100 100" width={props.width || 24} height={props.height || 24}>
            <path d="M 50,50 m 0,-46.5 a 46.5,46.5 0 1 1 0,93 a 46.5,46.5 0 1 1 0,-93" stroke="#eee" strokeWidth="2" fillOpacity="0"/>
            {!props.loading && !props.priceLoading && (
                <Path d="M 50,50 m 0,-46.5 a 46.5,46.5 0 1 1 0,93 a 46.5,46.5 0 1 1 0,-93" stroke={props.fill} strokeWidth="7" fillOpacity="0"/>
            )}
        </SVG>
    )
}

export default CircleLoading;