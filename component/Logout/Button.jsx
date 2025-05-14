import { Text,StyleSheet, View, Pressable } from "react-native"
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from "../../utils/Colors";


export default function Button({onPress}){

    return <Pressable style={styles.root}
            onPress={onPress}>
        <Ionicons name="checkmark-circle" color="white" size={24}/>
        <Text style={styles.text}>Continue Job Completion</Text>

    </Pressable>
    
}

const styles = StyleSheet.create({
    root:{
        width:559,
        height:64,
        flexDirection:'row',
        backgroundColor:colors.red,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:8,
        gap:5
    },
    text:{
        color:colors.white,
        fontSize:24      
    }
})