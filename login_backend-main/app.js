const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const bcrypt = require('bcrypt')
const mypath = path.join(__dirname, 'userData.db')
const app = express()

//server to database connection
let db = null
const initDB = async () => {
  try {
    db = await open({
      filename: mypath,
      driver: sqlite3.Database,
    })
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}

initDB()
app.listen(3000)

//register a user
app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const usernameCheckQuery = `SELECT * FROM user WHERE username = '${username}'`
  const usernameCheckQueryRes = await db.get(usernameCheckQuery)
  if (usernameCheckQueryRes === undefined) {
    if (password.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const decryptPassword = await bcrypt.hash(password, 10)
      const insertQuery = `INSERT INTO user (username,name,password,gender,location)
                           VALUES ('${username}','${name}','${decryptPassword}','${gender}','${location}')`
      const insertQueryRes = await db.run(insertQuery)
      response.status(200)
      response.send('User created successfully')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

//login user
app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const usernameCheckQuery = `SELECT * FROM user WHERE username = '${username}'`
  const usernameCheckQueryRes = await db.get(usernameCheckQuery)
  if (usernameCheckQueryRes !== undefined) {
    const encryptPassword = await bcrypt.compare(
      password,
      usernameCheckQueryRes.password,
    )
    if (encryptPassword) {
      response.status(200)
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  } else {
    response.status(400)
    response.send('Invalid user')
  }
})

//change password
app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  if (oldPassword === insertQueryRes.password) {
    if (newPassword.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const encryptNp = await bcrypt.hash(newPassword, 10)
      const Qr = `UPDATE user SET password = '${encryptNp}' WHERE username = '${username}'`
      const res = await db.run(Qr)
      response.status(200)
      response.send('Password updated')
    }
  } else {
    response.status(400)
    response.send('Invalid current password')
  }
})
module.exports = app
