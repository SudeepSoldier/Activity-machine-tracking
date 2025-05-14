import {Pressable,Text,StyleSheet} from "react-native"
import colors from "../../utils/Colors";

export default function CancelButton(){

    return <Pressable style={styles.root}>
        <Text style={styles.text}>Cancel</Text>
    </Pressable>
}

const styles = StyleSheet.create({
    root:{
        backgroundColor:colors.white,
        width:559,
        height:64,
        borderRadius:8,
        alignItems:'center',
        justifyContent:'center',
        marginTop:10
    },
    text:{
        fontSize:24,
        fontWeight:"semibold"
    }
})