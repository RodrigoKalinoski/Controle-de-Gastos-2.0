# 📱 GastosApp – Controle de Gastos Pessoais

Aplicativo mobile minimalista feito em **React Native com Expo**, que permite:

- Cadastro e login de usuários
- Registro de gastos com descrição, valor e data
- Exibição de lista de gastos por data
- Exibição do total gasto
- Edição futura e tela de "Minha Conta"

---

## 🚀 Tecnologias

- [Expo](https://expo.dev/)
- React Native
- Firebase Authentication
- Firestore (Database)
- React Navigation

---

## 📦 Requisitos

- Node.js e npm
- Git
- Expo CLI (`npm install -g expo-cli`)
- Conta no [Firebase Console](https://console.firebase.google.com)
- Android Studio (ou celular com Expo Go)

---

## 🧪 Como rodar o projeto

```bash
# 1 Instale as dependências
npm install

# 2. Crie um arquivo .env com as suas credenciais do Firebase
cp .env.example .env

🔥 **Configurar Firebase**

1. Crie um novo projeto no [Firebase](https://console.firebase.google.com/)
2. Vá em **Authentication > Sign-in method** e ative **E-mail/senha**
3. Vá em **Cloud Firestore** > Clique em **Criar banco de dados** (modo de teste)
4. Copie as credenciais do projeto e cole no seu arquivo `.env`
5. Configure regras mínimas de segurança para ambiente de desenvolvimento:

```bash
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
