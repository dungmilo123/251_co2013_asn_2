import mysql from 'mysql2/promise';

export const dbConfig = {
    host: 'localhost',
    user: 'sManager',
    password: 'sManagerPass123!',
    database: 'LMS_DB',
};

export async function query({ query, values = [] }: { query: string; values?: unknown[] }) {
    const db = await mysql.createConnection(dbConfig);
    try{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [results] = await db.execute(query, values as any[]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return results as any;
    } catch (error) {
        throw error;
    } finally{
        await db.end();
    }
}