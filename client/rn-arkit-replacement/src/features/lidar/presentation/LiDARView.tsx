import { requireNativeComponent, type StyleProp, type ViewStyle } from 'react-native';
import type { ComponentType } from 'react';

export const LiDARView = requireNativeComponent('RNLiDARView') as ComponentType<{ style?: StyleProp<ViewStyle> }>;
