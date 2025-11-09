import type { Percentage } from '../../types';
import {
  canDecreaseVolume,
  canIncreaseVolume,
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

  it('can increase volume percentage', () => {
    expect(canIncreaseVolume(10 as Percentage)).toBe(true);
    expect(canIncreaseVolume(90 as Percentage)).toBe(true);
    expect(canIncreaseVolume(100 as Percentage)).toBe(false);
    expect(canIncreaseVolume(110 as Percentage)).toBe(false);
  });
});
