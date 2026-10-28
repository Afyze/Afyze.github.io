// Notificări pe e-mail pentru cererile noi (opțional, prin SMTP).
import nodemailer from "nodemailer";

export function createMailer(mail, log = console) {
  if (!mail.host || !mail.user || !mail.pass) {
    return {
      enabled: false,
      async sendLead() { log.info?.("[mail] SMTP neconfigurat — cererea a fost salvată doar în baza de date."); }
    };
  }
  const transport = nodemailer.createTransport({
    host: mail.host, port: mail.port, secure: mail.secure,
    auth: { user: mail.user, pass: mail.pass }
  });
  return {
    enabled: true,
    async sendLead(lead) {
      const lines = [
        `Nume: ${lead.name}`,
        lead.email ? `E-mail: ${lead.email}` : null,
        lead.phone ? `Telefon: ${lead.phone}` : null,
        lead.type ? `Tip proiect: ${lead.type}` : null,
        lead.package ? `Pachet: ${lead.package}` : null,
        "",
        lead.message,
        "",
        `— primită pe ${new Date().toLocaleString("ro-RO", { timeZone: "Europe/Chisinau" })}`
      ].filter((x) => x !== null);
      await transport.sendMail({
        from: mail.from,
        to: mail.to,
        replyTo: lead.email || undefined,
        subject: `Cerere nouă: ${lead.type || "proiect"} — ${lead.name}`.slice(0, 150),
        text: lines.join("\n")
      });
    }
  };
}
