"use client"

import { View, TextInput, StyleSheet } from "react-native"
import colors from "../../utils/Colors"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useState } from "react"

export default function SearchInput({ onSearch }) {
  const [searchText, setSearchText] = useState("")

  const handleChangeText = (text) => {
    setSearchText(text)
    onSearch && onSearch(text)
  }

  return (
    <View style={styles.root}>
      <Ionicons name="search" size={24} color={colors.grey} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search jobs..."
        placeholderTextColor={colors.grey}
        value={searchText}
        onChangeText={handleChangeText}
      />
      {searchText.length > 0 && (
        <Ionicons
          name="close-circle"
          size={24}
          color={colors.grey}
          style={styles.clearIcon}
          onPress={() => handleChangeText("")}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 50,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.darkGrey,
  },
  clearIcon: {
    marginLeft: 8,
  },
})
