import { TextStyle } from 'react-native';

export const typography = {
  display: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
  } satisfies TextStyle,
  heading: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  } satisfies TextStyle,
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  } satisfies TextStyle,
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  } satisfies TextStyle,
} as const;
