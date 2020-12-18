const morgan = require('morgan')
const express = require('express')
const sha1 = require('sha1')
const cors = require('cors')
const mysql = require('mysql2/promise')
const { MongoClient } = require('mongodb')
const multer = require('multer')
const AWS = require('aws-sdk')
const fs = require('fs')

// const { mkQuery, readFile, putObject } = require('./db_util')

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
const DATABASE = 'paf2020'
const COLLECTION = 'paf2020'
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const client = new MongoClient(MONGO_URL, {
    useNewUrlParser: true, useUnifiedTopology: true
})

const ACCESS_KEY = process.env.ACCESS_KEY || 'W4LVT2ZD57FP6IICPUNX'
const SECRET_KEY = process.env.SECRET_ACCESS_KEY || 'b22tsQsCUhQ9JzRyphnHBVr1fl6AqZQGvBiY9bnJA5g'

const s3 = new AWS.S3({
	endpoint: new AWS.Endpoint('sfo2.digitaloceanspaces.com'),
	accessKeyId: ACCESS_KEY, 
	secretAccessKey: SECRET_KEY,

})
const upload = multer({
	dest: process.env.TMP_DIR || './uploads'
})

const mkQuery = (sql, pool) => {
    return async (args) => {
        const conn = await pool.getConnection()
        try {
            const [ result, _ ] = await conn.query(sql, args)
            return result
        } catch(e) {
            console.error('ERROR: ', e)
            throw e
        } finally {
            conn.release()
        }
    }
}

const findUser = mkQuery('SELECT * FROM user WHERE user_id = ? AND password = ?', pool)

const readFile = (path) => new Promise(
	(resolve, reject) => 
		fs.readFile(path, (err, buff) => {
			if (null != err)
				reject(err)
			else 
				resolve(buff)
		})
)

const putObject = (file, buff, s3) => new Promise(
	(resolve, reject) => {
		const params = {
			Bucket: 'jn-day24',
			Key: file.filename, 
			Body: buff,
			ACL: 'public-read',
			ContentType: file.mimetype,
			ContentLength: file.size
		}
		s3.putObject(params, (err, result) => {
			if (null != err)
				reject(err)
			else
				resolve(result)
		})
	}
)

const app = express()

app.use(cors())
app.use(morgan('combined'))

app.use(express.static(__dirname + '/frontend'))

app.post("/login", express.json() , async (req, resp) => {
	// console.info('req.body --> ', req.body)
	const user = req.body['username']
	const password = sha1(req.body['password'])

	try {
		const db_record = await findUser([user, password])
	
		// console.log('dbrecord, user, password ->', db_record, user, password)
		// console.log('db_recode password', db_record[0].password)

		if (db_record.length <= 0) {
			resp.status(401)
            resp.json({ errorMessage: `Login failed for ${user}`})
            return
		}
			
		resp.status(200)
		resp.json({message: 'User anthenticated'})
			
	} catch (e) {
		console.error('ERROR: ', e)
        resp.status(401)
        resp.json({ error: e, errorMessage: 'User not found' })
	}

})

app.post("/upload", upload.single('imageData') , (req, resp) => {

		console.info('>>> req.body: ', req.body)
		console.info('>>> req.file: ', req.file)

		const doc = {
			title: req.body.title,
			comments: req.body.comments,
			image: req.file.filename,
			timestamp: new Date()
		}

		resp.on('finish', () => {
			// delete the temp file
			fs.unlink(req.file.path, () => { })
		})
	
		readFile(req.file.path)
		.then(buff => 
			putObject(req.file, buff, s3)
		)
		.then(() => 
			client.db(DATABASE).collection(COLLECTION)
				.insertOne(doc)
		)
		.then(results => {
			// console.info('insert results: ', results)
			fs.unlink(req.file.path, () => { })

			resp.status(200)
			resp.json({ id: results.ops[0]._id })
		})
		.catch(error => {
			console.error('insert error: ', error)
			resp.status(500)
			resp.json({ error })
		})
	
	
	
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

const p2 = new Promise(
	(resolve, reject) => {
		if ((!!ACCESS_KEY) && (!!SECRET_KEY))
			resolve()
		else
			reject('S3 keys not found')
	}
)

Promise.all([ p0, p1, p2 ])
    .then((r) => {
        app.listen(PORT, () => {
            console.info(`Application started on port ${PORT} at ${new Date()}`)
        })
    })