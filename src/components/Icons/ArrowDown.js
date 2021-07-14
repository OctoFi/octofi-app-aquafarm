import React from "react";

const ArrowDown = ({ size, fill, color }) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
			<g
				id="Stockholm-icons-/-Navigation-/-Arrow-down"
				stroke="none"
				strokeWidth="1"
				fill="none"
				fillRule="evenodd"
			>
				<polygon id="Shape" points="0 0 24 0 24 24 0 24"></polygon>
				<rect
					id="Rectangle"
					fill={fill || color}
					opacity="0.3"
					x="11"
					y="5"
					width="2"
					height="14"
					rx="1"
				></rect>
				<path
					d="M6.70710678,18.7071068 C6.31658249,19.0976311 5.68341751,19.0976311 5.29289322,18.7071068 C4.90236893,18.3165825 4.90236893,17.6834175 5.29289322,17.2928932 L11.2928932,11.2928932 C11.6714722,10.9143143 12.2810586,10.9010687 12.6757246,11.2628459 L18.6757246,16.7628459 C19.0828436,17.1360383 19.1103465,17.7686056 18.7371541,18.1757246 C18.3639617,18.5828436 17.7313944,18.6103465 17.3242754,18.2371541 L12.0300757,13.3841378 L6.70710678,18.7071068 Z"
					id="Path-94"
					fill={fill || color}
					fillRule="nonzero"
					transform="translate(12.000003, 14.999999) scale(1, -1) translate(-12.000003, -14.999999) "
				></path>
			</g>
		</svg>
	);
};

export default ArrowDown;
