import { View,TextInput,Text,StyleSheet } from "react-native"
import colors from "../../utils/Colors";

export default function TextArea({title,placeholder}){

    return  <View style={styles.root}>
                
                <Text style={[styles.text,{fontSize:20,marginBottom:10}]}>{title}</Text>
                
                < TextInput style={styles.textInput} placeholder={placeholder}   
                multiline={true}
                numberOfLines={4}
                />
                
            </View>
}

const styles = StyleSheet.create({
    root:{

    },
    text:{
        fontWeight:500,
    },
    textInput:{    
        borderStyle:"solid",
        borderWidth:0.4,
        borderRadius:5,
        padding:15,
        backgroundColor:colors.white,
        height:194,
        width:746,
        
    },
    icon:{
        position: 'absolute',
        right: 10,
        top:30
    },
})