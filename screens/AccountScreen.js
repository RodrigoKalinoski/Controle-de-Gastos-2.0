import { useNavigation } from '@react-navigation/native';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebase';

export default function AccountScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const ref = doc(db, 'users', auth.currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUserData(snap.data());
        }
      } catch (error) {
        Alert.alert('Erro ao carregar dados', error.message);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Erro ao sair', error.message);
    }
  };

  const handlePasswordReset = async () => {
    try {
      if (auth.currentUser?.email) {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
        Alert.alert('Sucesso', 'Link de redefinição de senha enviado para seu e-mail.');
      } else {
        Alert.alert('Erro', 'Não foi possível identificar o e-mail do usuário.');
      }
    } catch (error) {
      Alert.alert('Erro ao enviar link', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Conta</Text>

      {userData ? (
        <View style={styles.infoBox}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>{userData.name}</Text>

          <Text style={styles.label}>E-mail:</Text>
          <Text style={styles.value}>{userData.email}</Text>

          <Text style={styles.label}>Telefone:</Text>
          <Text style={styles.value}>{userData.phone}</Text>
        </View>
      ) : (
        <Text style={styles.loading}>Carregando...</Text>
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Redefinir Senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
  },
  infoBox: {
    marginBottom: 32,
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
  },
  label: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f2f2f2',
  },
  loading: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#7b2cbf',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#444',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});