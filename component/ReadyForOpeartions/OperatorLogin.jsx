"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import colors from "../../utils/Colors"
import Ionicons from "react-native-vector-icons/Ionicons"
import Button from "../UI/Button"
import NumberPad from "./NumberPad" // This import should now work correctly

export default function OperatorLogin({ onLogin, onPasscodeChange, isLoading }) {
  const [passcode, setPasscode] = useState("")

  const handleNumberPress = (number) => {
    if (passcode.length < 4) {
      const newPasscode = passcode + number
      setPasscode(newPasscode)
      onPasscodeChange(newPasscode)
    }
  }

  const handleDeletePress = () => {
    if (passcode.length > 0) {
      const newPasscode = passcode.slice(0, -1)
      setPasscode(newPasscode)
      onPasscodeChange(newPasscode)
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.component}>
        <View style={styles.iconContainer}>
          <Ionicons name="person-circle-outline" size={32} color={colors.blue} />
        </View>
        <Text style={styles.operatorText}>Operator Login</Text>
        <Text>Enter your passcode to login</Text>
      </View>

      <View style={styles.passcodeContainer}>
        {[...Array(4)].map((_, index) => (
          <View key={index} style={[styles.passcodeCircle, index < passcode.length ? styles.filledCircle : null]} />
        ))}
      </View>

      <NumberPad onNumberPress={handleNumberPress} onDeletePress={handleDeletePress} />

      <View style={styles.button}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.blue} />
        ) : (
          <Button onPress={onLogin}>Login & Start Job</Button>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    marginTop: 50,
  },
  component: {
    width: "100%",
    height: 222,
    backgroundColor: colors.dimWhite,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.dimBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  operatorText: {
    fontSize: 32,
    fontWeight: "500",
  },
  passcodeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  passcodeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.grey,
    marginHorizontal: 10,
  },
  filledCircle: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  button: {
    marginTop: 20,
    alignItems: "center",
    height: 50,
    justifyContent: "center",
  },
})
