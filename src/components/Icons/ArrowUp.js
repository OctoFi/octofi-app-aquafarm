import React from "react";

const ArrowUp = ({ size, fill, color }) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
			<g
				id="Stockholm-icons-/-Navigation-/-Arrow-from-bottom"
				stroke="none"
				strokeWidth="1"
				fill="none"
				fillRule="evenodd"
			>
				<polygon id="Shape" points="0 0 24 0 24 24 0 24" />
				<rect id="Rectangle" fill={fill || color} opacity="0.3" x="11" y="3" width="2" height="14" rx="1" />
				<path
					d="M6.70710678,10.7071068 C6.31658249,11.0976311 5.68341751,11.0976311 5.29289322,10.7071068 C4.90236893,10.3165825 4.90236893,9.68341751 5.29289322,9.29289322 L11.2928932,3.29289322 C11.6714722,2.91431428 12.2810586,2.90106866 12.6757246,3.26284586 L18.6757246,8.76284586 C19.0828436,9.13603827 19.1103465,9.76860564 18.7371541,10.1757246 C18.3639617,10.5828436 17.7313944,10.6103465 17.3242754,10.2371541 L12.0300757,5.38413782 L6.70710678,10.7071068 Z"
					id="Path-94"
					fill={fill || color}
					fillRule="nonzero"
				/>
				<rect id="Rectangle-199" fill={fill || color} opacity="0.3" x="3" y="19" width="18" height="2" rx="1" />
			</g>
		</svg>
	);
};

export default ArrowUp;
