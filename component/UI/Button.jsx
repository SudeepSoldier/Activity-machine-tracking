"use client"

import { TouchableOpacity, Text, StyleSheet } from "react-native"
import colors from "../../utils/Colors"

export default function Button({ children, onPress, style, textStyle }) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.blue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
})
