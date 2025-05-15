import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const NetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  console.log(isConnected)

  return isConnected
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: '#ff4d4d',
    zIndex: 999,
    padding: 10,
  },
  warningText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default NetworkStatus;