import { expect } from 'chai';
import Helpers from '../../utils/helpers';
const ipcRenderer = window.require('electron').ipcRenderer;


describe('utils/helpers.js', () => {

  beforeEach(function() {
    ipcRenderer.send.reset();
  });

  it('should send mark the icons as active', () => {

    const notificationsLength = 3;
    Helpers.updateTrayIcon(notificationsLength);
    expect(ipcRenderer.send).to.have.been.calledOnce;
    expect(ipcRenderer.send).to.have.been.calledWith('update-icon', 'TrayActive');

  });

  it('should send mark the icons as idle', () => {

    const notificationsLength = 0;
    Helpers.updateTrayIcon(notificationsLength);
    expect(ipcRenderer.send).to.have.been.calledOnce;
    expect(ipcRenderer.send).to.have.been.calledWith('update-icon', 'TrayIdle');

  });
});
