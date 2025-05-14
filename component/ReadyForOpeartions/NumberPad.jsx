"use client"

import { View, TouchableOpacity, Text, StyleSheet } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import colors from "../../utils/Colors"

export default function NumberPad({ onNumberPress, onDeletePress }) {
  const renderNumberButton = (number) => (
    <TouchableOpacity key={number} style={styles.numberButton} onPress={() => onNumberPress(number.toString())}>
      <Text style={styles.numberText}>{number}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.row}>{[1, 2, 3].map(renderNumberButton)}</View>
      <View style={styles.row}>{[4, 5, 6].map(renderNumberButton)}</View>
      <View style={styles.row}>{[7, 8, 9].map(renderNumberButton)}</View>
      <View style={styles.row}>
        <View style={styles.emptyButton} />
        {renderNumberButton(0)}
        <TouchableOpacity style={styles.deleteButton} onPress={onDeletePress}>
          <Ionicons name="backspace-outline" size={24} color={colors.grey} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  numberText: {
    fontSize: 24,
    fontWeight: "500",
    color: colors.black,
  },
  deleteButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyButton: {
    width: 70,
    height: 70,
  },
})
