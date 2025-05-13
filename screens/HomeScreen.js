import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Modal
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [valueFilter, setValueFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [filterVisible, setFilterVisible] = useState(false);

    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'expenses'),
            where('uid', '==', user.uid),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate(),
            }));
            setExpenses(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => navigation.navigate("Account")}> 
                        <Text style={{ marginRight: 16, color: '#7b2cbf', fontWeight: 'bold' }}>Conta</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout}>
                        <Text style={{ marginRight: 16, color: '#ff4d4d', fontWeight: 'bold' }}>Sair</Text>
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.replace("Login");
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    };

    const filteredExpenses = expenses.filter((item) => {
        const matchesValue = valueFilter
            ? item.value >= parseFloat(valueFilter.replace('>', '').replace('<', '')) && valueFilter.includes('>')
              || item.value <= parseFloat(valueFilter.replace('>', '').replace('<', '')) && valueFilter.includes('<')
              || item.value === parseFloat(valueFilter)
            : true;

        const matchesDate = dateFilter
            ? format(item.date, 'yyyy-MM-dd').includes(dateFilter)
            : true;

        return matchesValue && matchesDate;
    });

    const totalValue = filteredExpenses.reduce((sum, item) => sum + item.value, 0).toFixed(2);

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('EditExpense', { expenseId: item.id })}>
            <View style={styles.card}>
                <View>
                    <Text style={styles.description}>{item.description}</Text>
                    <Text style={styles.date}>{format(item.date, 'dd/MM/yyyy')}</Text>
                </View>
                <Text style={styles.value}>R$ {item.value.toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Total de Gastos</Text>
                <Text style={styles.total}>R$ {totalValue}</Text>
            </View>

            <Modal
                visible={filterVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setFilterVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.filterTitle}>Filtros</Text>

                        <TextInput
                            style={styles.filterInput}
                            placeholder="Valor (ex: >50 ou <30)"
                            placeholderTextColor="#888"
                            value={valueFilter}
                            onChangeText={setValueFilter}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.filterInput}
                            placeholder="Data (ex: 2025-05)"
                            placeholderTextColor="#888"
                            value={dateFilter}
                            onChangeText={setDateFilter}
                        />

                        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(false)}>
                            <Text style={styles.filterButtonText}>Aplicar Filtros</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setValueFilter('');
                            setDateFilter('');
                        }}>
                            <Text style={styles.clearText}>Limpar filtros</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {loading ? (
                <ActivityIndicator size="large" color="#7b2cbf" />
            ) : (
                <FlatList
                    data={filteredExpenses}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <View style={styles.fabContainer}>
                <TouchableOpacity style={styles.filterFab} onPress={() => setFilterVisible(true)}>
                    <Text style={styles.fabText}>🔍</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddExpense')}>
                    <Text style={styles.fabText}>＋</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d0d0d',
        paddingHorizontal: 16,
        paddingTop: 48,
    },
    header: {
        marginBottom: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        color: '#ccc',
    },
    total: {
        fontSize: 32,
        fontWeight: '600',
        color: '#fff',
        marginTop: 8,
    },
    card: {
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    description: {
        fontSize: 16,
        fontWeight: '500',
        color: '#f2f2f2',
    },
    date: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#90ee90',
    },
    fabContainer: {
        position: 'absolute',
        flexDirection: 'row',
        right: 24,
        bottom: 32,
        gap: 12,
    },
    fab: {
        backgroundColor: '#7b2cbf',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    filterFab: {
        backgroundColor: '#3498db',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    fabText: {
        fontSize: 28,
        color: '#fff',
        marginBottom: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#1e1e1e',
        padding: 20,
        borderRadius: 12,
    },
    filterTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
    },
    filterInput: {
        backgroundColor: '#2c2c2e',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#fff',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#444',
    },
    filterButton: {
        backgroundColor: '#7b2cbf',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    filterButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    clearText: {
        color: '#aaa',
        textAlign: 'center',
        marginTop: 12,
        fontSize: 14,
    },
});