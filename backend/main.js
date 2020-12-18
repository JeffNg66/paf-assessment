const morgan = require('morgan')
const express = require('express')
const sha1 = require('sha1')
const cors = require('cors')
const mysql = require('mysql2/promise')
const { MongoClient } = require('mongodb')

const { mkQuery } = require('./db_util')


const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

// configure the databases
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'paf2020',
    password: process.env.DB_PASSWORD || 'paf2020',
    database: process.env.DB_NAME || 'paf2020',
    connectionLimit: 4,
    timezone: '+08:00'
})

// configure Mongodb
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const MONGO_DB = 'paf2020'
const MONGO_COLLECTION = 'comments'
const client = new MongoClient(MONGO_URL, {
    useNewUrlParser: true, useUnifiedTopology: true
})

const findUser = mkQuery('SELECT * FROM user WHERE user_id = ? AND password = ?', pool)

const app = express()

app.use(cors())
app.use(morgan('combined'))

app.post("/login", express.json() , async (req, resp) => {
// app.post("/login", express.urlencoded({ extended: true }) , async (req, res) => {
	console.info('req.body --> ', req.body)
	const user = req.body['username']
	const password = sha1(req.body['password'])

	try {
		const db_record = await findUser([user, password])
	
		console.log('dbrecord, user, password ->', db_record, user, password)
		console.log('db_recode length', db_record.length)

		if (db_record.length <= 0) {
			resp.status(401)
            resp.json({ errorMessage: `Login failed for ${user}`})
            return
		}
			
		resp.status(200)
		resp.json({message: 'User anthenticated'})
			
	} catch (e) {
		console.error('ERROR: ', e)
        resp.status(500)
        resp.json({ error: e, errorMessage: 'User not found' })
	}

})






const p0 = (async () => {
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release()
    return true
})()

const p1 = (async () => {
    await client.connect()
    return true
})()

Promise.all([ p0, p1 ])
    .then((r) => {
        app.listen(PORT, () => {
            console.info(`Application started on port ${PORT} at ${new Date()}`)
        })
    })