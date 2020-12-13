import { UPDATE_SETTING } from '../actions';
import { setAppearance } from '../utils/appearance';
import { setAutoLaunch } from '../utils/comms';

export default () => (next) => (action) => {
  switch (action.type) {
    case UPDATE_SETTING:
      if (action.setting === 'openAtStartup') {
        setAutoLaunch(action.value);
      }

      if (action.setting === 'appearance') {
        setAppearance(action.value);
      }
  }

  return next(action);
};
