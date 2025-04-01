import { NextApiRequest, NextApiResponse } from 'next';
import { render } from '@react-email/render';
import { FirstAccessEmail } from '@/utils/emails/PrimeiroAcesso';
import { sendEmail } from '@/lib/mailer';
import { generatePassword } from '../../utils/emails/generatePassword';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { name, email, password } = req.body;
    console.log(" Dados recebidos:", { name, email, password });

    const emailHtml = await render(FirstAccessEmail({ name, email, password }));
    console.log(" HTML do e-mail gerado");

    await sendEmail({
      to: email,
      subject: 'Seu acesso à BeeOnTime foi criado!',
      html: emailHtml,
    });

    console.log(" E-mail enviado com sucesso!");
    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error("ERRO AO ENVIAR:", error.message || error);
    return res.status(500).json({ error: String(error) });
  }
}
