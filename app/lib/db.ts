import mysql from 'mysql2/promise';

export const dbConfig = {
    host: 'localhost',
    user: 'sManager',
    password: 'sManagerPass123!',
    database: 'LMS_DB',
};

export async function query({ query, values = [] }: { query: string;  values?: any[] }){
    const db = await mysql.createConnection(dbConfig);
    try{
        const [results] = await db.execute(query, values);
        return results;
    } catch (error) {
        throw error;
    } finally{
        await db.end();
    }
}