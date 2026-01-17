import type { Percentage } from '../../types';

import {
  canDecreaseVolume,
  canIncreaseVolume,
  decreaseVolume,
  increaseVolume,
  volumePercentageToLevel,
} from './sound';

describe('renderer/utils/notifications/sound.ts', () => {
  it('should convert percentage to sound level', () => {
    expect(volumePercentageToLevel(100 as Percentage)).toBe(1);
    expect(volumePercentageToLevel(50 as Percentage)).toBe(0.5);
    expect(volumePercentageToLevel(0 as Percentage)).toBe(0);
  });

  it('can decrease volume percentage', () => {
    expect(canDecreaseVolume(-10 as Percentage)).toBe(false);
    expect(canDecreaseVolume(0 as Percentage)).toBe(false);
    expect(canDecreaseVolume(10 as Percentage)).toBe(true);
    expect(canDecreaseVolume(100 as Percentage)).toBe(true);
  });

  it('should decrease volume by step amount', () => {
    expect(decreaseVolume(100 as Percentage)).toBe(90);
    expect(decreaseVolume(50 as Percentage)).toBe(40);
    expect(decreaseVolume(0 as Percentage)).toBe(0);
    expect(decreaseVolume(-10 as Percentage)).toBe(0);
  });

  it('can increase volume percentage', () => {
    expect(canIncreaseVolume(10 as Percentage)).toBe(true);
    expect(canIncreaseVolume(90 as Percentage)).toBe(true);
    expect(canIncreaseVolume(100 as Percentage)).toBe(false);
    expect(canIncreaseVolume(110 as Percentage)).toBe(false);
  });

  it('should increase volume by step amount', () => {
    expect(increaseVolume(0 as Percentage)).toBe(10);
    expect(increaseVolume(50 as Percentage)).toBe(60);
    expect(increaseVolume(100 as Percentage)).toBe(100);
    expect(increaseVolume(110 as Percentage)).toBe(100);
  });
});
