import React from 'react'
import styled from 'styled-components'
import QRCode from 'qrcode.react'
import {useIsDarkMode} from "../../state/user/hooks";

const QRCodeWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  margin-bottom: 1.25rem;
`

export default function WalletConnectData({ uri = '', size }) {
	const isDark = useIsDarkMode()
	return (
		<QRCodeWrapper>
			{uri && (
				<QRCode size={size} value={uri} bgColor={isDark ? '#333639' : 'white'} fgColor={isDark ? 'white' : 'black'} />
			)}
		</QRCodeWrapper>
	)
}
