import React from 'react';
import { View, StyleSheet } from 'react-native';
import FileExplorer from './FileExplorer';

const App = () => {
  return (
    <View style={styles.container}>
      <FileExplorer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    marginTop:0,
  },
});

export default App;
