import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebase';

export default function AddExpenseScreen() {
    const navigation = useNavigation();

    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!description || !value) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        const numericValue = parseFloat(value.replace(',', '.'));
        if (isNaN(numericValue) || numericValue <= 0) {
            Alert.alert('Erro', 'Valor inválido');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Erro', 'Usuário não autenticado');
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, 'expenses'), {
                uid: user.uid,
                description,
                value: numericValue,
                date,
            });

            navigation.navigate('Home');
        } catch (error) {
            console.log('Erro ao salvar gasto:', error);
            Alert.alert('Erro ao salvar gasto', error.message);
        }
    };

    const showDatePicker = () => setShowPicker(true);
    const onChangeDate = (_, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowPicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Novo Gasto</Text>

            <TextInput
                style={styles.input}
                placeholder="Descrição"
                placeholderTextColor="#aaa"
                value={description}
                onChangeText={setDescription}
            />

            <View style={styles.inputWithSymbol}>
                <Text style={styles.symbol}>R$</Text>
                <TextInput
                    style={styles.valueInput}
                    placeholder="0,00"
                    placeholderTextColor="#aaa"
                    value={value}
                    onChangeText={setValue}
                    keyboardType="numeric"
                />
            </View>

            <TouchableOpacity style={styles.input} onPress={showDatePicker}>
                <Text style={{ color: '#f2f2f2' }}>{date.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                />
            )}

            <TouchableOpacity style={styles.button} onPress={handleAdd}>
                <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar Gasto'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 48,
        backgroundColor: '#0d0d0d',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 24,
    },
    input: {
        height: 48,
        borderColor: '#444',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        justifyContent: 'center',
        marginBottom: 16,
        backgroundColor: '#1c1c1e',
        color: '#fff',
    },
    inputWithSymbol: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        backgroundColor: '#1c1c1e',
    },
    symbol: {
        fontSize: 16,
        color: '#fff',
        marginRight: 4,
    },
    valueInput: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
    },
    button: {
        backgroundColor: '#7b2cbf',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});