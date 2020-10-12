import React from 'react';
import { Row, Col } from 'react-bootstrap';
import styled from 'styled-components';

const Section = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
`

const SectionTitle = styled.h4`
  margin-bottom: 1.25rem;
  font-weight: bold;
  color: ${({theme}) => theme.text2}
  font-size: 1.25rem;
`

const SectionBody = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: .5rem;
`

const SectionList = props => {
    return props.sections.map(section => {
        return (
            <Section>
                <SectionTitle>{section.title}</SectionTitle>
                <SectionBody>{section.content}</SectionBody>
            </Section>
        )
    })
}

export default SectionList;