import { View, Text, StyleSheet } from "react-native"
import useTimer from "../hooks/useTimer"

export default function TimeShow({ title, initialTime = 0 }) {
  const { formatTime } = useTimer(initialTime, true)

  return (
    <View style={styles.root}>
      <Text style={styles.time}>{formatTime().formatted}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    fontSize: 48,
    fontWeight: "bold",
  },
})
