import { UPDATE_SETTING } from '../actions';

const ipcRenderer = window.require('electron').ipcRenderer;

export default store => next => action => {
  switch (action.type) {
    case UPDATE_SETTING:
      const settings = store.getState().settings;
      // FIXME! Should get new value first
      // console.log(settings);

      localStorage.setItem('settings', JSON.stringify(settings));

      // Register autostartup
      if (action.setting === 'openAtStartup') {
        var method = (action.value) ? 'startup-enable' : 'startup-disable';
        ipcRenderer.send(method);
      }

      break;
  }

  return next(action);
};
