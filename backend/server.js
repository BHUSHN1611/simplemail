import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import Imap from "imap";
import { simpleParser } from "mailparser";

const app = express();

// ✅ CORS setup (allow only your frontend)
app.use(cors({
  origin: "https://qumail-7cpm.onrender.com",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// ✅ Store active sessions (temporary)
const sessions = new Map();

/* -------------------- LOGIN ENDPOINT -------------------- */
app.post("/login", async (req, res) => {
  const { gmail, appPassword } = req.body;

  try {
    // Verify credentials with nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmail,
        pass: appPassword,
      },
    });

    await transporter.verify();

    // Create session
    const sessionId = Date.now().toString();
    sessions.set(sessionId, { gmail, appPassword });

    const name = gmail.split("@")[0];

    res.json({ 
      success: true, 
      name,
      sessionId 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ 
      success: false, 
      message: "Invalid credentials" 
    });
  }
});

/* -------------------- FETCH EMAILS ENDPOINT -------------------- */
app.post("/fetch-mails", async (req, res) => {
  const { email, appPassword, maxEmails = 10 } = req.body;

  if (!email || !appPassword) {
    return res.status(400).json({ 
      success: false, 
      error: "Email and password required" 
    });
  }

  try {
    const emails = await fetchImapEmails(email, appPassword, maxEmails);
    res.json({ success: true, mails: emails });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/* -------------------- SEND EMAIL ENDPOINT -------------------- */
app.post("/send-email", async (req, res) => {
  const { email, appPassword, to, subject, body } = req.body;

  if (!email || !appPassword || !to || !subject) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields" 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: appPassword,
      },
    });

    const info = await transporter.sendMail({
      from: email,
      to,
      subject,
      text: body,
      html: `<div style="font-family: Arial, sans-serif;">${body.replace(/\n/g, "<br>")}</div>`,
    });

    res.json({ 
      success: true, 
      messageId: info.messageId,
      message: "Email sent successfully" 
    });
  } catch (error) {
    console.error("Send error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/* -------------------- HELPER: FETCH IMAP EMAILS -------------------- */
function fetchImapEmails(email, password, maxEmails = 10) {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: email,
      password,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    const emails = [];

    imap.once("ready", () => {
      imap.openBox("INBOX", true, (err, box) => {
        if (err) {
          imap.end();
          return reject(err);
        }

        const totalMessages = box.messages.total;
        if (totalMessages === 0) {
          imap.end();
          return resolve([]);
        }

        const start = Math.max(1, totalMessages - maxEmails + 1);
        const fetchRange = `${start}:${totalMessages}`;

        const fetch = imap.seq.fetch(fetchRange, { bodies: "" });

        fetch.on("message", (msg, seqno) => {
          msg.on("body", (stream) => {
            simpleParser(stream, (err, parsed) => {
              if (err) {
                console.error("Parse error:", err);
                return;
              }

              emails.push({
                id: seqno,
                subject: parsed.subject || "(No Subject)",
                from: parsed.from?.text || "Unknown",
                to: parsed.to?.text || email,
                date: parsed.date ? new Date(parsed.date).toLocaleString() : "Unknown date",
                snippet: (parsed.text || "").substring(0, 150) + "...",
              });
            });
          });
        });

        fetch.once("error", (err) => {
          imap.end();
          reject(err);
        });

        fetch.once("end", () => {
          imap.end();
        });
      });
    });

    imap.once("error", (err) => {
      reject(new Error("IMAP connection failed: " + err.message));
    });

    imap.once("end", () => {
      emails.sort((a, b) => new Date(b.date) - new Date(a.date));
      resolve(emails);
    });

    imap.connect();
  });
}

/* -------------------- SERVER START -------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
