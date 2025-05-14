import { Pressable,Text,StyleSheet } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from "../../utils/Colors";
import { useNavigation } from '@react-navigation/native';

export default function Button({icon,title}){

    const navigation = useNavigation();

    return <Pressable style={styles.root} onPress={()=>{
        if(title==='Take Break'){

            navigation.navigate('TakeBreak')
        }
        else if(title==='End Job'){
            navigation.navigate('EndJob')
        }
        else if(title==='Change Job'){
            navigation.navigate('ChangeJob')
        }
        else{
            navigation.navigate("Logout")
        }
    }}>
        <Ionicons name={icon} size={24} color={title=='Logout'?'red':colors.blue}/>
        <Text style={styles.textFont}>{title}</Text>
    </Pressable>
}

const styles = StyleSheet.create({
    root:{
        flexDirection:'row',
        backgroundColor:colors.white,
        marginTop:40,
        width:"49%",
        height:96,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:5
    },
    textFont:{
        fontSize:24
    }  
})