const ipcRenderer = window.require('electron').ipcRenderer;
import { UPDATE_SETTING } from '../actions';

export default store => next => action => {

  switch (action.type) {
    case UPDATE_SETTING:
      if (action.setting === 'openAtStartup') {
        if (action.value) {
          ipcRenderer.send('startup-enable');
        } else {
          ipcRenderer.send('startup-disable');
        }
      }
  }

  return next(action);
};
