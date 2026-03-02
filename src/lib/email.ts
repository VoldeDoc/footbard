import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "PitchSync <noreply@pitchsync.com>",
    to,
    subject,
    html,
  });
}

export function welcomeEmail(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#3b82f6;font-size:28px;margin:0;">⚽ PitchSync</h1>
          <p style="color:#94a3b8;font-size:14px;">Community Football League Platform</p>
        </div>
        <div style="background:#1e293b;border-radius:16px;padding:32px;border:1px solid #334155;">
          <h2 style="color:#f1f5f9;margin:0 0 16px;">Welcome, ${name}! 🎉</h2>
          <p style="color:#94a3b8;line-height:1.6;">
            You've joined PitchSync — the ultimate platform for managing your community football leagues.
            Create teams, track stats, manage matches, and more.
          </p>
          <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" 
             style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px;">
            Go to Dashboard
          </a>
        </div>
        <p style="color:#475569;font-size:12px;text-align:center;margin-top:32px;">
          © ${new Date().getFullYear()} PitchSync. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}

export function matchRecapEmail(homeTeam: string, awayTeam: string, score: string, recap: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#3b82f6;font-size:28px;margin:0;">⚽ PitchSync</h1>
        </div>
        <div style="background:#1e293b;border-radius:16px;padding:32px;border:1px solid #334155;">
          <div style="text-align:center;margin-bottom:24px;">
            <h2 style="color:#f1f5f9;margin:0;">${homeTeam} vs ${awayTeam}</h2>
            <p style="color:#22c55e;font-size:32px;font-weight:800;margin:8px 0;">${score}</p>
            <span style="background:#1e40af;color:#93c5fd;padding:4px 12px;border-radius:999px;font-size:12px;">FULL TIME</span>
          </div>
          <div style="border-top:1px solid #334155;padding-top:20px;">
            <h3 style="color:#f1f5f9;margin:0 0 12px;">Match Recap</h3>
            <p style="color:#94a3b8;line-height:1.7;">${recap}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function announcementEmail(title: string, content: string, communityName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#3b82f6;font-size:28px;margin:0;">⚽ PitchSync</h1>
          <p style="color:#94a3b8;font-size:14px;">${communityName}</p>
        </div>
        <div style="background:#1e293b;border-radius:16px;padding:32px;border:1px solid #334155;">
          <h2 style="color:#f1f5f9;margin:0 0 16px;">📢 ${title}</h2>
          <p style="color:#94a3b8;line-height:1.7;">${content}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
