import { expect } from 'chai';
import Helpers from '../../utils/helpers';
const ipcRenderer = window.require('electron').ipcRenderer;


describe('utils/helpers.js', () => {

  it('should send mark the icons as active', () => {

    const notifications = [1, 2, 3];
    Helpers.updateTrayIcon(notifications);
    expect(ipcRenderer.send).to.have.been.calledOnce;

    ipcRenderer.send().reset();

  });

  it('should send mark the icons as idle', () => {

    const notifications = [];
    Helpers.updateTrayIcon(notifications);
    expect(ipcRenderer.send).to.have.been.calledOnce;

    ipcRenderer.send().reset();

  });
});
