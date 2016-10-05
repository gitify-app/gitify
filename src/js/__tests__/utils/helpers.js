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


  it('should generate the GitHub url (issue)', () => {

    var subject = {
      url: 'https://api.github.com/repos/manosim/gitify/issues/173',
      latest_comment_url: 'https://api.github.com/manosim/gitify/issues/173'
    };
    var newUrl = Helpers.generateGitHubUrl(subject);
    expect(newUrl).to.equal('https://github.com/manosim/gitify/issues/173');

  });

  it('should generate the GitHub url (issue with comment)', () => {

    var subject = {
      url: 'https://api.github.com/repos/manosim/gitify/issues/173',
      latest_comment_url: 'https://api.github.com/manosim/gitify/issues/173/comments/224367941'
    };
    var newUrl = Helpers.generateGitHubUrl(subject);
    expect(newUrl).to.equal('https://github.com/manosim/gitify/issues/173#issuecomment-224367941');

  });

  it('should generate the GitHub url (repos)', () => {

    var subject = {
      url: 'https://api.github.com/repos/ekonstantinidis/notifications-test/pulls/12345',
      latest_comment_url: null
    };

    var newUrl = Helpers.generateGitHubUrl(subject);
    expect(newUrl).to.equal('https://github.com/ekonstantinidis/notifications-test/pull/12345');

  });

  it('should generate the GitHub url (release)', () => {

    var subject = {
      url: 'https://api.github.com/repos/ekonstantinidis/notifications-test/releases/3988077',
      latest_comment_url: null
    };

    var newUrl = Helpers.generateGitHubUrl(subject);
    expect(newUrl).to.equal('https://github.com/ekonstantinidis/notifications-test/releases');

  });

});
