var app = require('app');
var path = require('path');
var ipc = require('ipc');
var autoUpdater = require('auto-updater');

require('crash-reporter').start();

var Menu = require('menu');
var Tray = require('tray');
var AutoLaunch = require('auto-launch');
var BrowserWindow = require('browser-window');
var dialog = require('dialog');

var iconIdle = path.join(__dirname, 'images', 'tray-idleTemplate.png');
var iconActive = path.join(__dirname, 'images', 'tray-active.png');

var autoStart = new AutoLaunch({
  name: 'Gitify',
  path: process.execPath.match(/.*?\.app/)[0]
});

app.on('ready', function(){
  var appIcon = new Tray(iconIdle);
  initWindow();

  appIcon.on('clicked', function clicked (e, bounds) {
    if (appIcon.window && appIcon.window.isVisible()) {
      return hideWindow();
    } else {
      showWindow(bounds);
    }
  });

  function initWindow () {
    var defaults = {
      width: 400,
      height: 350,
      show: false,
      frame: false,
      resizable: false,
      'standard-window': false
    };

    appIcon.window = new BrowserWindow(defaults);
    appIcon.window.loadUrl('file://' + __dirname + '/index.html');
    appIcon.window.on('blur', hideWindow);
    appIcon.window.setVisibleOnAllWorkspaces(true);

    initMenu();
    checkAutoUpdate();
  }

  function showWindow (bounds) {
    var options = {
      x: bounds.x - 200 + (bounds.width / 2),
      y: bounds.y,
      index: path.join('./', 'index.html')
    };

    appIcon.window.setPosition(options.x, options.y);
    appIcon.window.show();
  }

  function initMenu () {
    var template = [{
      label: 'Edit',
      submenu: [
        {
          label: 'Copy',
          accelerator: 'Command+C',
          selector: 'copy:'
        },
        {
          label: 'Paste',
          accelerator: 'Command+V',
          selector: 'paste:'
        },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:'
        }
      ]
    }];

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  function hideWindow () {
    if (!appIcon.window) { return; }
    appIcon.window.hide();
  }

  function checkAutoUpdate() {

    autoUpdater
      .on('error', function(event, message) {
        console.log('ERRORED.');
        console.log('Event: ' + JSON.stringify(event) + '. MESSAGE: ' + message);
        app.dock.hide();
      })
      .on('checking-for-update', function () {
        console.log('Checking for update');
      })
      .on('update-available', function () {
        console.log('Update available');
        // AutoUpdater Downloads the update automatically
      })
      .on('update-not-available', function () {
        console.log('Update not available');
        app.dock.hide();
      })
      .on('update-downloaded', function (event, releaseNotes, releaseName,
        releaseDate, updateUrl, quitAndUpdate) {
        console.log('Update downloaded');
        confirmAutoUpdate(quitAndUpdate);
      });

    autoUpdater.setFeedUrl('https://raw.githubusercontent.com/' +
      'ekonstantinidis/gitify/master/auto-update.json');
    autoUpdater.checkForUpdates();
  }

  function confirmAutoUpdate(quitAndUpdate) {
    dialog.showMessageBox({
      type: 'question',
      buttons: ['Update & Restart', 'Cancel'],
      title: 'Update Available',
      cancelId: 99,
      message: 'There is an update available. Would you like to update Gitify now?'
    }, function (response) {
        console.log('Exit: ' + response);
        app.dock.hide();
        if (response === 0) {
          quitAndUpdate();
        }
      }
    );
  }

  ipc.on('reopen-window', function() {
    appIcon.window.show();
  });

  ipc.on('update-icon', function(event, arg) {
    if (arg === 'TrayActive') {
      appIcon.setImage(iconActive);
    } else {
      appIcon.setImage(iconIdle);
    }
  });

  ipc.on('startup-enable', function() {
    autoStart.enable();
  });

  ipc.on('startup-disable', function() {
    autoStart.disable();
  });

  ipc.on('app-quit', function() {
    app.quit();
  });

  appIcon.setToolTip('GitHub Notifications on your menu bar.');
});
