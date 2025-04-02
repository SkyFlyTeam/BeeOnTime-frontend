import { Html, Body, Container, Text, Heading } from '@react-email/components';

export const FirstAccessEmail = ({ name, email, password }: { name: string, email: string, password: string }) => (
  <Html>
    <Body style={{ fontFamily: 'Arial', padding: '20px' }}>
      <Container>
        <Heading>Olá {name}, seja bem-vindo(a) ao BeeOnTime!</Heading>
        <Text>Você recebeu acesso ao sistema. Aqui estão seus dados de login:</Text>
        <Text><strong>Email:</strong> {email}</Text>
        <Text><strong>Senha inicial:</strong> {password} </Text>
        <Text>Entre na plataforma e altere sua senha ao acessar pela primeira vez.</Text>
        <Text>Equipe BeeOnTime 🕝🐝</Text>
      </Container>
    </Body>
  </Html>
);
