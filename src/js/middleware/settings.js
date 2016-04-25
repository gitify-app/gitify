import { UPDATE_SETTING } from '../actions';

export default store => next => action => {
  switch (action.type) {
    case UPDATE_SETTING:
      const settings = store.getState().settings;
      // FIXME! Should get new value first
      console.log(settings);

      localStorage.setItem('settings', JSON.stringify(settings));
      break;
  }

  return next(action);
};
