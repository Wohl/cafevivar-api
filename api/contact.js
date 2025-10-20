import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    // 🔹 CORS
    res.setHeader("Access-Control-Allow-Origin", "https://cafevivar.com");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ message: "❌ Method not allowed" });

    try {
        const { nombre, email, asunto, mensaje } = await parseJSONBody(req);

        if (!nombre || !email || !mensaje || !asunto) {
            return res.status(400).json({ message: "❌ Todos los campos son requeridos" });
        }

        const { data, error } = await resend.emails.send({
            from: "Formulario Web <ventas@cafevivar.com>",
            to: "ventas@cafevivar.com",
            subject: `Nuevo mensaje Web: ${asunto}`,
            html: `
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong> ${mensaje}</p>
      `,
        });

        if (error) return res.status(400).json({ message: "❌ Error al enviar", error });

        return res.status(200).json({ message: "✅ Mensaje enviado con éxito", data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "❌ Error interno", error: String(err) });
    }
}

// Función helper para parsear JSON
function parseJSONBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(err);
            }
        });
        req.on("error", reject);
    });
}
