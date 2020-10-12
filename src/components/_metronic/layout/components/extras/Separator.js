import React from 'react';
import styled from 'styled-components';

const Separator = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.text5 };
  height: 0;
`

export default Separator;