import {
  SEARCH_NOTIFICATIONS, CLEAR_SEARCH
} from '../actions';

const initialState = {
  query: ''
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SEARCH_NOTIFICATIONS:
      return {
        ...state,
        query: action.query
      };
    case CLEAR_SEARCH:
      return {
        ...state,
        query: ''
      };
    default:
      return state;
  }
};
