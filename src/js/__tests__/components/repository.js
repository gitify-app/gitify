/* global jest, describe, beforeEach, it, expect */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../utils/api-requests');
jest.dontMock('../../components/repository.js');
jest.dontMock('../../stores/auth.js');
jest.dontMock('../../stores/notifications.js');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe('Test for Repository Component', function () {

  var Actions, Repository;

  beforeEach(function () {
    // Mock Electron's window.require
    // and remote.require('shell')
    window.require = function () {
      return {
        require: function () {
          return {
            openExternal: function () {
              return {};
            }
          };
        }
      };
    };

    // Mock localStorage
    window.localStorage = {
      item: false,
      getItem: function () {
        return this.item;
      }
    };

    Actions = require('../../actions/actions.js');
    Repository = require('../../components/repository.js');
  });

  it('Should render the Repository component', function () {

    var repoDetails = [{
      'repository': {
        'full_name': 'ekonstantinidis/gitify',
        'owner': {
          'avatar_url': 'http://avatar.url'
        }
      },
      'subject': {
        'type': 'Issue'
      }
    }];

    var instance = TestUtils.renderIntoDocument(
      <Repository
        repo={repoDetails}
        repoName='ekonstantinidis/gitify'
        key='ekonstantinidis/gitify' />
    );

    expect(instance.props.repo[0].repository.full_name).toBe('ekonstantinidis/gitify');
    expect(instance.getAvatar).toBeDefined();
    expect(instance.openBrowser).toBeDefined();

    // Get Avatar
    var avatar = instance.getAvatar();
    expect(avatar).toBe('http://avatar.url');

    // Open Browser
    instance.openBrowser();

  });

});
