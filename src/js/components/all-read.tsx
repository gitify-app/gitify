import * as React from 'react';
import Typist from 'react-typist';
import styled from 'styled-components';
import { emojify } from 'react-emojione';

import constants from '../utils/constants';

const Title = styled.h2`
  margin-top: 10px;
  margin-bottom: 0;
  padding: 10px 5px;
  text-align: center;
  line-height: 40px;
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
    <div className="container-fluid main-container notifications all-read">
      <Title>
        <Typist>{message}</Typist>
      </Title>

      <h4>No new notifications.</h4>
      <h1 className="emoji">{emojify(emoji, { output: 'unicode' })}</h1>
    </div>
  );
};
