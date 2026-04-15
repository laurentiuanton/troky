import { Resend } from 'resend';

// Inițializare Resend folosind cheia API din fisierul .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailNotification({ 
    to, 
    subject, 
    htmlContent 
}: { 
    to: string, 
    subject: string, 
    htmlContent: string 
}) {
  try {
    const data = await resend.emails.send({
      from: 'Troky <contact@troky.ro>', // Asigurați-vă că domeniul e validat în Resend (până atunci puteți folosi onboarding@resend.dev pentru test)
      to,
      subject,
      html: htmlContent,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Eroare la trimiterea emailului prin Resend:", error);
    return { success: false, error };
  }
}
