import fastify from "fastify";
import personRoutes from "./routes/personRoutes";
import phoneRoutes from "./routes/phoneRoutes";
import attendantRoutes from "./routes/attendantRoutes";
import trimStringMiddleware from "./middlewares/trimStringMiddleware"


const app = fastify();

// Registrar rotas
app.register(personRoutes);
app.register(attendantRoutes);
app.register(phoneRoutes);
app.register(trimStringMiddleware);

app.listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3355
}).then(() => {
    console.log(`Http server running @ port:${String(process.env.PORT)}.`);
});

