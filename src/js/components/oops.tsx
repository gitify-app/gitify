import * as React from 'react';
import { emojify } from 'react-emojione';
import styled from 'styled-components';

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

export const Oops = () => {
  const emoji =
    constants.ERROR_EMOJIS[
      Math.floor(Math.random() * constants.ERROR_EMOJIS.length)
    ];

  return (
    <Wrapper>
      <Emoji>{emojify(emoji, { output: 'unicode' })}</Emoji>
      <Title>Something went wrong.</Title>
      <Desc>Couldn&apos;t get your notifications.</Desc>
    </Wrapper>
  );
};
