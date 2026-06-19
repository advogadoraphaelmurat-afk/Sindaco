import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function sendVotingCreatedEmail(toEmails: string[], votingTitle: string, buildingName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL SIMULADO] Nova votação "${votingTitle}" enviada para: ${toEmails.join(", ")}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: "Sindaco <onboarding@resend.dev>",
      to: toEmails,
      subject: `Nova Assembleia Aberta: ${votingTitle}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Olá! Há uma nova pauta para você.</h2>
          <p>O condomínio <strong>${buildingName}</strong> abriu a assembleia:</p>
          <div style="padding: 16px; background-color: #f3f4f6; border-radius: 8px; margin: 20px 0;">
             <h3 style="margin: 0; color: #111827;">${votingTitle}</h3>
          </div>
          <p>Por favor, acesse o painel do Sindaco para ler a pauta completa e registrar o seu voto com segurança.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/votings" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Acessar Sistema
          </a>
          <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">
            Enviado automaticamente pela plataforma Sindaco.
          </p>
        </div>
      `
    });

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error };
  }
}
