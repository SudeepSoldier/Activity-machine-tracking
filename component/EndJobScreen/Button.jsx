import { Text,StyleSheet, View, Pressable } from "react-native"
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from "../../utils/Colors";


export default function Button(){

    return <Pressable style={styles.root}>

        <Ionicons name="checkmark-circle" color="white" size={24}/>
        <Text style={styles.text}>Continue Job Completion</Text>

    </Pressable>
    
}

const styles = StyleSheet.create({
    root:{
        width:559,
        height:64,
        flexDirection:'row',
        backgroundColor:colors.blue,
        justifyContent:'center',
        alignItems:'center',
        marginTop:100,
        gap:5,
        borderRadius:8,

    },
    text:{
        color:colors.white,
        fontSize:24      
    }
})