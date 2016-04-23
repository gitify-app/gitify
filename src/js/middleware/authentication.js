import { LOGIN_SUCCESS, LOGOUT} from '../actions';

export default store => next => action => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.access_token);
      break;

    case LOGOUT:
      localStorage.clear();
      break;
  }

  return next(action);
};
