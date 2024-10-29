/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { IconStream, IconPrivate, IconWebPublic } from '../common/Icons';

// Removed IconMute as it's no longer needed

type Props = $ReadOnly<{|
  color?: string,
  isPrivate: boolean,
  isMuted: boolean,
  isWebPublic: boolean | void,
  size: number,
  style?: TextStyleProp,
|}>;

export default function StreamIcon(props: Props): Node {
  const { color, style, isPrivate, isMuted, isWebPublic, size } = props;

  let Component = undefined;
  // Removed the isMuted check as we no longer use IconMute
  if (isPrivate) {
    Component = IconPrivate;
  } else if (isWebPublic ?? false) {
    Component = IconWebPublic;
  } else {
    Component = IconStream;
  }

  return <Component size={size} color={color} style={style} />;
}
