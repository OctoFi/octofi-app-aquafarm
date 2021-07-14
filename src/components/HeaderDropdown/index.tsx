import { useTranslation } from "react-i18next";
import { ChevronDown } from "react-feather";
import useTheme from "../../hooks/useTheme";
import * as Styled from "./styleds";

export type HeaderDropdownProps = {
	items: Array<any>;
	title: string;
};

const HeaderDropdown = ({ items, title }: HeaderDropdownProps) => {
	const theme = useTheme();
	const { t } = useTranslation();

	return (
		<Styled.Wrapper>
			<Styled.Item>
				<Styled.ItemInner>{t(`menu.${title}`)}</Styled.ItemInner>
				<ChevronDown size={16} color={theme.text3} />
			</Styled.Item>
			<Styled.DropDown className={"header-dropdown"}>
				{Object.values(items).map((item, index) => {
					return (
						<Styled.DropDownItem to={item.path} key={`${title}-${index}`} state={item.state}>
							{t(`menu.${item.title}`)}
						</Styled.DropDownItem>
					);
				})}
			</Styled.DropDown>
		</Styled.Wrapper>
	);
};

export default HeaderDropdown;
