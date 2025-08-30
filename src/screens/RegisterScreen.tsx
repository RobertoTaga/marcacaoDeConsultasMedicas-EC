import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Input, Button, Text } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';
import { ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC = () => {
  const { register } = useAuth();
  const navigation = useNavigation<RegisterScreenProps['navigation']>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // NOVO: estado para tipo de usuário
  const [userType, setUserType] = useState<'PACIENTE' | 'ADMIN'>('PACIENTE');

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');

      if (!name || !email || !password) {
        setError('Por favor, preencha todos os campos');
        return;
      }

      await register({
        name,
        email,
        password,
        userType, // NOVO - envia o tipo de usuário
      });

      navigation.navigate('Login');
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Cadastro de Usuário</Title>

      <Input
        placeholder="Nome completo"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        containerStyle={styles.input}
      />

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        containerStyle={styles.input}
      />

      <Input
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={styles.input}
      />

      {/* NOVO: seleção de tipo de usuário */}
      <SectionTitle>Tipo de Usuário</SectionTitle>
      <UserTypeContainer>
        <UserTypeButton
          selected={userType === 'PACIENTE'}
          onPress={() => setUserType('PACIENTE')}
        >
          <UserTypeText selected={userType === 'PACIENTE'}>Paciente</UserTypeText>
        </UserTypeButton>

        <UserTypeButton
          selected={userType === 'ADMIN'}
          onPress={() => setUserType('ADMIN')}
        >
          <UserTypeText selected={userType === 'ADMIN'}>Administrador</UserTypeText>
        </UserTypeButton>
      </UserTypeContainer>

      {error ? <ErrorText>{error}</ErrorText> : null}

      <Button
        title="Cadastrar"
        onPress={handleRegister}
        loading={loading}
        containerStyle={styles.button as ViewStyle}
        buttonStyle={styles.buttonStyle}
      />

      <Button
        title="Voltar para Login"
        onPress={() => navigation.navigate('Login')}
        containerStyle={styles.backButton as ViewStyle}
        buttonStyle={styles.backButtonStyle}
      />
    </Container>
  );
};

const styles = {
  input: { marginBottom: 15 },
  button: { marginTop: 10, width: '100%' },
  buttonStyle: { backgroundColor: theme.colors.primary, paddingVertical: 12 },
  backButton: { marginTop: 10, width: '100%' },
  backButtonStyle: { backgroundColor: theme.colors.secondary, paddingVertical: 12 },
};

const Container = styled.View`
  flex: 1;
  padding: 20px;
  justify-content: center;
  background-color: ${theme.colors.background};
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: ${theme.colors.text};
`;

const ErrorText = styled.Text`
  color: ${theme.colors.error};
  text-align: center;
  margin-bottom: 10px;
`;

// NOVO: estilo para seleção de tipo de usuário
const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: ${theme.colors.text};
`;

const UserTypeContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const UserTypeButton = styled.TouchableOpacity<{ selected: boolean }>`
  flex: 1;
  padding: 12px;
  margin-right: 10px;
  border-radius: 8px;
  background-color: ${(props) => (props.selected ? theme.colors.primary : theme.colors.surface)};
`;

const UserTypeText = styled.Text<{ selected: boolean }>`
  color: ${(props) => (props.selected ? '#fff' : theme.colors.text)};
  text-align: center;
  font-weight: bold;
`;

export default RegisterScreen;