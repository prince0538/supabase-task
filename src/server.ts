import 'dotenv/config';
import app from "./app"
import prisma from './prisma';

const port = process.env.port || 5555;
async function start() {
    try {
        await prisma.$connect()
        console.log('Connected to database')
    } catch (error: any) {
        console.error('Database connection failed', error);
    }
    app.listen(port, () => {
        console.log(`Listening on port: ${port}`)
    })
}

start();