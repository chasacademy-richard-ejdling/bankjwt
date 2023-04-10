import { useRef, useState } from 'react'
import './App.css'


function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [balance, setBalance] = useState('')
  const [userStatus, setUserStatus] = useState({ isRegistered: false, isLoggedIn: false })
  const [accountBalance, setAccountBalance] = useState()

  const token = useRef('')

  function handleRegister() {
    const user = {
      username: username,
      password: password,
      balance: balance,
    }

    fetch("http://localhost:3000/users", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((res) => {
        console.log(res)
        setUserStatus({ ...userStatus, isRegistered: true })
      })
  }

  function handleLogin() {
    const user = {
      username: username,
      password: password,
    }

    fetch("http://localhost:3000/sessions", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((res) => {
        console.log(res)
        if (res.ok) {
          setUserStatus({ ...userStatus, isLoggedIn: true })
          return res.text()
        }
        
      }).then(data => {
        token.current = data
      })
  }

  function handleGetBalance() {
    fetch("http://localhost:3000/me/accounts", {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.current}`,
      }
    }).then(res => {
      return res.text()
    }).then(data => setAccountBalance(data))
  }

  return (
    <div className="App">
      {!userStatus.isRegistered ? (
        <>
          <label htmlFor="username">Username: </label>
          <input type="text" id='username' onChange={e => setUsername(e.target.value)} />
          <br />
          <label htmlFor="password">Password: </label>
          <input type="text" id='password' onChange={e => setPassword(e.target.value)} />
          <br />
          <label htmlFor="Balance">Balance: </label>
          <input type="text" id='Balance' onChange={e => setBalance(e.target.value)} />
          <br />
          <button onClick={handleRegister}>Register</button>
        </>
      ) : !userStatus.isLoggedIn ? (
        <>
          <label htmlFor="username">Username: </label>
          <input type="text" id='username' onChange={e => setUsername(e.target.value)} />
          <br />
          <label htmlFor="password">Password: </label>
          <input type="text" id='password' onChange={e => setPassword(e.target.value)} />
          <br />
          <button onClick={handleLogin}>Login</button>
        </>
      ) : (
        <>
          {!accountBalance ? <button onClick={handleGetBalance}>Show Balance</button> : <p>{accountBalance}</p>}
        </>
      )}

    </div>
  )
}

export default App
