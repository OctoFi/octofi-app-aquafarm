import React from "react";

const ArrowRightIcon = ({ size, fill, color }) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
			<g
				id="Stockholm-icons-/-Navigation-/-Angle-right"
				stroke="none"
				strokeWidth="1"
				fill="none"
				fillRule="evenodd"
			>
				<polygon id="Shape" points="0 0 24 0 24 24 0 24"></polygon>
				<path
					fill={fill || color}
					d="M6.70710678,15.7071068 C6.31658249,16.0976311 5.68341751,16.0976311 5.29289322,15.7071068 C4.90236893,15.3165825 4.90236893,14.6834175 5.29289322,14.2928932 L11.2928932,8.29289322 C11.6714722,7.91431428 12.2810586,7.90106866 12.6757246,8.26284586 L18.6757246,13.7628459 C19.0828436,14.1360383 19.1103465,14.7686056 18.7371541,15.1757246 C18.3639617,15.5828436 17.7313944,15.6103465 17.3242754,15.2371541 L12.0300757,10.3841378 L6.70710678,15.7071068 Z"
					id="Path-94"
					fillRule="nonzero"
					transform="translate(12.000003, 11.999999) rotate(-270.000000) translate(-12.000003, -11.999999) "
				></path>
			</g>
		</svg>
	);
};

export default ArrowRightIcon;
