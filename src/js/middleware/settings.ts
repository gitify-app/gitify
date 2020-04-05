import { UPDATE_SETTING } from '../actions';
import { restoreSetting, setAutoLaunch } from '../utils/comms';

export default () => (next) => (action) => {
  switch (action.type) {
    case UPDATE_SETTING:
      if (action.setting === 'openAtStartup') {
        setAutoLaunch(action.value);
      } else if (action.setting === 'showDockIcon') {
        restoreSetting('show-dock-icon', action.value);
      }
  }

  return next(action);
};
