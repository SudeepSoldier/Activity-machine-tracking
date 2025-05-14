import { View,TextInput,Text,StyleSheet,TouchableOpacity } from "react-native"
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useState } from "react";

export default function Input({title,placeholder,type,addStyleInput,addStyleTitle,getPassCode}){

    const [secureText, setSecureText] = useState(false);
    const [passcode, setPasscode] = useState('');

    const togglePasswordVisibility = () => {
        setSecureText(!secureText);
    };

    return  <View>
                <Text style={[styles.text,addStyleTitle]}>{title}</Text>
                <TextInput onChangeText={(txt)=>{
                    getPassCode(txt)
                }} keyboardType={type} placeholder={placeholder} style={[styles.textInput, addStyleInput]} secureTextEntry={secureText}/>
                {title=="Operator Passcode" && <TouchableOpacity onPress={togglePasswordVisibility} style={styles.icon}>
                    <Ionicons name={secureText ? 'eye-off' : 'eye'} size={24} color="gray" />
                </TouchableOpacity>}
            </View>
}

const styles = StyleSheet.create({
    text:{
        fontWeight:500,
        marginBottom:15
    },
    textInput:{
        
        borderStyle:"solid",
        borderWidth:0.4,
        borderRadius:5,
        padding:15,
    },
    icon:{
        position: 'absolute',
        right: 10,
        top:40
    },
})