import styled from 'styled-components';

export const CallToActionButton = styled.button`
  ${props => props.theme.reset}
  ${props => props.theme.bg.action}
  ${props => props.theme.fg.paper}
  font-family: ${props => props.theme.heavyFontFamily}
  font-size: ${props => props.theme.regularFontSize}
  text-transform: uppercase;
  ${props => props.theme.basePaddingHorizontal}
  ${props => props.theme.tinyPaddingVertical}
  border-radius: 4px;
  cursor: pointer;
`;

export const SecondaryCallToAction = styled(CallToActionButton)`
  ${props => props.theme.fg.action}
  ${props => props.theme.bg.paper}
  border: 1px solid ${props => props.theme.action}
`;
