import express from "express";
import bodyParser from "body-parser";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import crypto from 'crypto'
import cors from 'cors'
import mysql from 'mysql'

const app = express()
const PORT = 3000

app.use(bodyParser.json())
app.use(cors())

dotenv.config()
// console.log(crypto.randomBytes(64).toString('hex'))
// process.env.TOKEN_SECRET

const tokenSecret = process.env.TOKEN_SECRET

function generateAccessToken(userId) {
    return jwt.sign(userId, tokenSecret, { expiresIn: 1800 })
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, tokenSecret, (err, user) => {
        console.log('This is error', err)

        if (err) return res.sendStatus(403)

        req.user = user

        next()
    })
}

/* let users = []
let accounts = [] */

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
})

app.get('/', (req, res) => {
    console.log('GET!')
    res.send('Hello!')
})

app.post('/users', (req, res) => {
    console.log('req: ', req.body)

    const { username, password, balance } = req.body

    db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], (err, results) => {
        console.log('result users', results)
        if (err) {
            res.sendStatus(500)
        } else {
            const userId = results.insertId
            db.query("INSERT INTO accounts (user_id, balance) VALUES (?, ?)", [userId, balance], (err, results) => {
                if (err) {
                    res.sendStatus(500)
                } else {
                    res.send('ok')
                }
            })
        }
    })

    /* users.push({
        id: users.length + 1,
        username: req.body.username,
        password: req.body.password,
    })

    accounts.push({
        id: accounts.length + 1,
        userId: users.length,
        balance: req.body.balance,
    })

    console.log(users)
    console.log(accounts) */

    //res.send('done')
})

app.post('/sessions', (req, res) => {
    console.log(req.body)

    const { username, password } = req.body

    db.query("SELECT id, username, password FROM users", (err, results) => {
        if (err) {
            res.sendStatus(500)
        } else {
            let userId

            console.log('sessions result', results)

            results.forEach(user => {
                if (username == user.username && password == user.password) {
                    userId = user.id
                    return
                }
            })

            if (!userId) {
                res.status(401).send('Wrong username or password')
            } else {
                console.log(userId)
                const token = generateAccessToken({ userId: userId })

                res.send(token)
            }


            /* res.send('ok') */
        }
    })

    /* let userId = ''

    users.forEach(user => {
        if (username == user.username && password == user.password) {
            userId = user.id
            return
        }
    })

    if (!userId) res.status(401).send('Wrong username or password')

    const token = generateAccessToken({ userId: userId })

    res.send(token) */
})

app.get('/me/accounts', authenticateToken, (req, res) => {
    const userId = req.user.userId
    
    db.query("SELECT balance FROM accounts WHERE user_id = ?", [userId], (err, results) => {
        if(err) {
            res.sendStatus(500)
        } else {
            console.log(results)
            res.send(`${results[0].balance}`)
        }
    })

    /* res.send(accounts.filter(account => account.userId == req.user.userId)[0].balance) */
})

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT)
})

