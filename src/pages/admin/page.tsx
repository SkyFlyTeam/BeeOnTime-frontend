'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const res = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) alert('Funcionário cadastrado com sucesso!');
    else alert('Erro ao cadastrar.');

    form.reset();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Nome" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" placeholder="Senha Inicial" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Cadastrar'}
      </button>
    </form>
  );
}
