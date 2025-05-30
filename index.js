import express from 'express'
import mysql from 'mysql2'

const app = express()
const port = 8080

const db = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '123456',
    database: 'GenderForCare',
    waitForConnections: true,
    connectionLimit: 10
})

db.query('SELECT * FROM Users', (err, results) => {
    if (err) {
        console.error('Error executing query:', err)
        return
    }
    console.log('Query results:', results)
})

app.listen(port, () => {
    console.log(`PROJECT GenderHealthcareBE OPEN ON PORT: ${port}`)
})
