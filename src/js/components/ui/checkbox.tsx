import * as React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin-bottom: 0.5rem;
`;

const CheckboxContainer = styled.div`
  display: inline-block;
  vertical-align: middle;
`;

const Icon = styled.svg`
  fill: none;
  stroke: white;
  stroke-width: 2px;
`;

// Hide checkbox visually but remain accessible to screen readers.
// Source: https://polished.js.org/docs/#hidevisually
const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  border: 0;
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const StyledCheckbox = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  background: ${(props) =>
    // @ts-ignore
    props.isChecked ? props.theme.primaryDark : props.theme.primary};
  border-radius: 3px;
  transition: all 150ms;

  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px ${(props) => props.theme.info};
  }

  ${Icon} {
    // @ts-ignore
    visibility: ${(props) => (props.isChecked ? 'visible' : 'hidden')};
  }
`;

interface IFieldCheckbox {
  name: string;
  label: string;
  checked: boolean;
  onChange: any;
}

export const FieldCheckbox = (props: IFieldCheckbox) => {
  return (
    <Wrapper>
      <label>
        <CheckboxContainer>
          <HiddenCheckbox checked={props.checked} {...props} />
          {/* 
            // @ts-ignore */}
          <StyledCheckbox isChecked={props.checked}>
            <Icon viewBox="0 0 24 24">
              <g
                stroke="none"
                strokeWidth="1"
                fill="none"
                fillRule="evenodd"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <g
                  transform="translate(6.000000, 7.000000)"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                >
                  <polyline points="13 0 4.0625 9 0 4.90909091"></polyline>
                </g>
              </g>
            </Icon>
          </StyledCheckbox>
        </CheckboxContainer>

        <span style={{ marginLeft: '1rem' }}>{props.label}</span>
      </label>
    </Wrapper>
  );
};
