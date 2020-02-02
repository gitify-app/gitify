import { LOGIN } from '../actions';
import { LOGOUT } from '../../types/actions';
import { AuthState, EnterpriseAccount } from '../../types/reducers';

const initialState: AuthState = {
  response: {},
  token: null,
  isFetching: false,
  failed: false,
  enterpriseAccounts: [],
};

export default function reducer(state = initialState, action): AuthState {
  switch (action.type) {
    case LOGIN.REQUEST:
      return {
        ...state,
        isFetching: true,
        failed: false,
        response: {},
      };
    case LOGIN.SUCCESS:
      if (action.isEnterprise) {
        const enterpriseAccount: EnterpriseAccount = {
          hostname: action.hostname,
          token: action.payload.access_token,
        };
        return {
          ...state,
          isFetching: false,
          enterpriseAccounts: [...state.enterpriseAccounts, enterpriseAccount],
        };
      }

      return {
        ...state,
        isFetching: false,
        token: action.payload.access_token,
      };
    case LOGIN.FAILURE:
      return {
        ...state,
        isFetching: false,
        failed: true,
        response: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        response: null,
        token: null,
        enterpriseAccounts: [],
      };
    default:
      return state;
  }
}
