import SVG from "react-inlinesvg";

import { SocialLink } from "../../typings";
import { socials } from "../../data/socials";
import * as Styled from "./styleds";

const Socials = () => {
	if (!socials || socials.length === 0) {
		return null;
	}

	return (
		<div className="d-flex align-items-center justify-content-between">
			<Styled.SocialList>
				{socials.map((social: SocialLink, i) => {
					return (
						<Styled.SocialItem key={social.name + i}>
							<Styled.SocialLink href={social.url} target={"_blank"} rel={"noopener noreferrer"}>
								<SVG src={social.image} />
							</Styled.SocialLink>
						</Styled.SocialItem>
					);
				})}
			</Styled.SocialList>
		</div>
	);
};

export default Socials;
