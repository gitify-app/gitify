/*global jest, describe, it, expect, beforeEach */

'use strict';

jest.dontMock('reflux');
jest.dontMock('../../stores/search');
jest.dontMock('../../actions/actions');

describe('Tests for AuthStore', function () {

  var SearchStore, Actions;

  beforeEach(function () {
    Actions = require('../../actions/actions');
    SearchStore = require('../../stores/search');
  });

  it('should login - store the token', function () {
    var searchTerm = 'test';
    SearchStore.onUpdateSearchTerm(searchTerm);
    expect(SearchStore._searchTerm).toEqual(searchTerm);
    expect(SearchStore.searchTerm()).toEqual(searchTerm);
  });

  it('should logout - remove the token', function () {
    SearchStore.onClearSearchTerm();
    expect(SearchStore._searchTerm).toEqual(undefined);
    expect(SearchStore.searchTerm()).toEqual(undefined);
  });

});
