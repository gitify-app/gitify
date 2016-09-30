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


  it('should generate the GitHub url (issue)', () => {

    var apiUrl = 'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3';
    var newUrl = Helpers.generateGitHubUrl(apiUrl);
    expect(newUrl).to.equal('https://www.github.com/ekonstantinidis/notifications-test/issues/3');

  });

  it('should generate the GitHub url (repos)', () => {

    var apiUrl = 'https://api.github.com/repos/ekonstantinidis/notifications-test/pulls/12345';
    var newUrl = Helpers.generateGitHubUrl(apiUrl);
    expect(newUrl).to.equal('https://www.github.com/ekonstantinidis/notifications-test/pull/12345');

  });

  it('should generate the GitHub url (release)', () => {

    var apiUrl = 'https://api.github.com/repos/ekonstantinidis/notifications-test/releases/3988077';
    var newUrl = Helpers.generateGitHubUrl(apiUrl);
    expect(newUrl).to.equal('https://www.github.com/ekonstantinidis/notifications-test/releases');

  });

});
