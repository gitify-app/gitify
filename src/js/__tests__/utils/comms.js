import { expect } from 'chai';
import { updateTrayIcon } from '../../utils/comms';
const ipcRenderer = window.require('electron').ipcRenderer;


describe('utils/comms.js', () => {
  beforeEach(function() {
    ipcRenderer.send.reset();
  });

  it('should send mark the icons as active', () => {
    const notificationsLength = 3;
    updateTrayIcon(notificationsLength);
    expect(ipcRenderer.send).to.have.been.calledOnce;
    expect(ipcRenderer.send).to.have.been.calledWith('update-icon', 'TrayActive');
  });

  it('should send mark the icons as idle', () => {
    const notificationsLength = 0;
    updateTrayIcon(notificationsLength);
    expect(ipcRenderer.send).to.have.been.calledOnce;
    expect(ipcRenderer.send).to.have.been.calledWith('update-icon');
  });
});
