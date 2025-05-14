"use client"

import { View, Text, StyleSheet } from "react-native"
import colors from "../utils/Colors"

export default function Title({ title1, title2 }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title1}>{title1}</Text>
      <Text style={styles.title2}>{title2}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  title1: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 8,
  },
  title2: {
    fontSize: 18,
    color: colors.grey,
  },
})
