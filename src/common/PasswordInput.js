/* @flow strict-local */
import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, Pressable } from 'react-native';

import Input from './Input';
import type { Props as InputProps } from './Input';
import ZulipTextIntl from './ZulipTextIntl';
import { createStyleSheet } from '../styles';
import Touchable from './Touchable';

const styles = createStyleSheet({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  showPasswordButton: {
    justifyContent: 'center',
  },
  showPasswordButtonText: {
    fontWeight: 'bold',
  },
});

/**
 * PasswordInput component to handle password visibility toggle.
 *
 * Provides a 'show'/'hide' button to show the password.
 *
 * All props are passed through to `Input`.  See `Input` for descriptions.
 */
export default function PasswordInput(props: Props): Node {
  const [isHidden, setIsHidden] = useState<boolean>(true);

  const handleShow = useCallback(() => {
    setIsHidden(prevIsHidden => !prevIsHidden);
  }, []);

  return (
    <View style={styles.container}>
      <Input {...props} secureTextEntry={isHidden} autoCorrect={false} autoCapitalize="none" />
      {/* Using Pressable instead of Touchable for better performance and compatibility */}
      <Pressable style={styles.showPasswordButton} onPress={handleShow}>
        <ZulipTextIntl style={styles.showPasswordButtonText} text={isHidden ? 'show' : 'hide'} />
      </Pressable>
    </View>
  );
}
