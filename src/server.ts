import fastify from "fastify";
import personRoutes from "./routes/personRoutes";

const app = fastify();

// Registrar rotas
app.register(personRoutes);

app.listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3355
}).then(() => {
    console.log(`Http server running @ port:${String(process.env.PORT)}.`);
});