const fs = require('fs')

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

module.exports = {
    mkQuery,
    readFile,
    putObject,
}