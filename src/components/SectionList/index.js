import React from 'react';
import styled from 'styled-components';

const Section = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
`

const SectionTitle = styled.div`
  margin-bottom: 1.25rem;
  font-weight: bold;
  color: ${({theme}) => theme.text2}
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const SectionBody = styled.div`
  display: flex;
  flex-direction: ${({direction}) => direction};
  margin-bottom: .5rem;
`

const SectionList = props => {
    return props.sections.map(section => {
        return (
            <Section>
                <SectionTitle>
                    <div>
                        {section.title}
                        {section.description && (
                            <span className="text-muted font-size-sm font-weight-light d-block pt-3">{section.description}</span>
                        )}
                    </div>
                    {section.headerAction || null}
                </SectionTitle>

                <SectionBody direction={props.direction || 'column'}>{section.content}</SectionBody>
            </Section>
        )
    })
}

export default SectionList;