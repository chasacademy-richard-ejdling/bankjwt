import express from "express";
import bodyParser from "body-parser";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import crypto from 'crypto'
import cors from 'cors'

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

let users = []
let accounts = []

app.get('/', (req, res) => {
    console.log('GET!')
    res.send('Hello!')
})

app.post('/users', (req, res) => {
    console.log('req: ', req.body)

    users.push({
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
    console.log(accounts)

    res.send('done')
})

app.post('/sessions', (req, res) => {
    console.log(req.body)

    let userId = ''

    users.forEach(user => {
        if (req.body.username == user.username && req.body.password == user.password) {
            userId = user.id
            return
        }
    })

    if (!userId) res.status(401).send('Wrong username or password')

    const token = generateAccessToken({ userId: userId })

    res.send(token)
})

app.get('/me/accounts', authenticateToken, (req, res) => {
    req.user.userId
    res.send(accounts.filter(account => account.userId == req.user.userId)[0].balance)
})

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT)
})

