import { expect } from 'chai';
import reducer from '../../reducers/settings';
// import { UPDATE_SETTING } from '../../actions';

describe('reducers/settings.js', () => {
  it('should return the initial state', () => {
    const initialState = {
      participating: false,
      playSound: true,
      showNotifications: true,
      markOnClick: false,
      openAtStartup: false
    };

    expect(reducer(undefined, {})).to.eql(initialState);
  });

  // it('should handle UPDATE_SETTING', () => {
  //   expect(
  //     reducer([], {
  //       type: types.ADD_TODO,
  //       text: 'Run the tests'
  //     })
  //   ).toEqual({})
  //
  //   expect(
  //     reducer(
  //       [
  //         {
  //           text: 'Use Redux',
  //           completed: false,
  //           id: 0
  //         }
  //       ],
  //       {
  //         type: types.ADD_TODO,
  //         text: 'Run the tests'
  //       }
  //     )
  //   ).toEqual({})
  // })
});
