/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { AccessibilityInfo } from 'react-native';

import ZulipTextIntl from '../common/ZulipTextIntl';
import styles from '../styles';

export default function AnnouncementOnly(props: {||}): Node {
  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibilityWithOptions(
      'Only organization admins are allowed to post to this stream.',
      { queue: true },
    );
  }, []);

  return (
    <View style={styles.disabledComposeBox}>
      <ZulipTextIntl
        style={styles.disabledComposeText}
        text="Only organization admins are allowed to post to this stream."
      />
    </View>
  );
}
