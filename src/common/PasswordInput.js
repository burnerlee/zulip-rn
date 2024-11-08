/* @flow strict-local */
import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, Pressable } from 'react-native';

import Input from './Input';
import type { Props as InputProps } from './Input';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import ZulipTextIntl from './ZulipTextIntl';

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
    margin: 8,
    color: BRAND_COLOR,
  },
});

// Prettier wants a ", >" here, which is silly.
// prettier-ignore
type Props = $ReadOnly<$Diff<InputProps,
  // "mixed" here is a way of spelling "no matter *what* type
  // `InputProps` allows for these, don't allow them here."
  {| secureTextEntry: mixed, autoCorrect: mixed, autoCapitalize: mixed, _: mixed |}>>;

/**
 * A password input component using Input internally.
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
      <Input
        {...props}
        style={styles.input}
        secureTextEntry={isHidden}
        autoCorrect={false}
        autoCapitalize="none"
      />
      <Pressable style={styles.showPasswordButton} onPress={handleShow}>
        <ZulipTextIntl style={styles.showPasswordButtonText} text={isHidden ? 'show' : 'hide'} />
      </Pressable>
    </View>
  );
}
