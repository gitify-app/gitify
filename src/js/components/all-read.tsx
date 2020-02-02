import * as React from 'react';
import Typist from 'react-typist';
import styled from 'styled-components';
import { emojify } from 'react-emojione';

import constants from '../utils/constants';

const Wrapper = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Emoji = styled.div`
  margin-top: 2rem;
  font-size: 4rem;
  font-weight: 400;
`;

const Title = styled.h2`
  margin: 0.5rem 0 0;
  padding: 10px 5px;
  font-weight: 600;
  line-height: 40px;
`;

const Desc = styled.h4`
  font-weight: 400;
`;

export const AllRead = () => {
  const message =
    constants.ALLREAD_MESSAGES[
      Math.floor(Math.random() * constants.ALLREAD_MESSAGES.length)
    ];

  const emoji =
    constants.ALLREAD_EMOJIS[
      Math.floor(Math.random() * constants.ALLREAD_EMOJIS.length)
    ];

  return (
    <Wrapper>
      <Emoji>{emojify(emoji, { output: 'unicode' })}</Emoji>

      <Title>
        <Typist>{message}</Typist>
      </Title>

      <Desc>No new notifications.</Desc>
    </Wrapper>
  );
};
