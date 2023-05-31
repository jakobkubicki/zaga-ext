import React, { useState } from 'react'
import {
  Grid,
  Paper,
  Avatar,
  TextField,
  Button,
  Typography,
  Link,
  FormControlLabel,
  Checkbox,
  Snackbar
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth'
import { useContext } from 'react'
import { FirebaseAppContext } from './FirebaseAppContext'

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />
})

const LoginPage: React.FC<{ setCurrentPage: (page: string) => void }> = ({
  setCurrentPage
}) => {
  const app = useContext(FirebaseAppContext)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const paperStyle = {
    padding: 20,
    height: '65vh',
    width: 350,
    margin: '10% auto'
  }
  const avatarStyle = { backgroundColor: '#1bbd7e' }
  const btnstyle = { margin: '8px 0' }

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === '') {
      setError('Please enter an email')
      setOpen(true)
      return
    }
    if (password === '') {
      setError('Please enter a password')
      setOpen(true)
      return
    }
    if (app) {
      const auth = getAuth(app)
      signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
          const user = userCredential.user
          sessionStorage.setItem('user', user.uid)
          setCurrentPage('app')
        })
        .catch(error => {
          if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            setError('Invalid email or password')
            setOpen(true)
          } else {
            setError(error.message)
            setOpen(true)
          }
        })
    }
  }
  

  // Other functions...
  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const errorDisplay = () => {
    if (error !== null) {
      return (
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity='warning'
            sx={{ marginBottom: '10px' }}
          >
            {error} {/* Change this line */}
          </Alert>
        </Snackbar>
      )
    } else {
      return null
    }
  }

  return (
    <Grid>
      <Grid
        container
        direction='column'
        justifyContent='center' // horizontally center
        alignItems='center' // vertically center
        sx={{ paddingTop: '20px' }}
      >
        <img src='zag.png' alt='zag' width='50' height='50' />
        <h2>Sign In to your ZAG AI account</h2>
      </Grid>
      <TextField
        label='Email'
        placeholder='Enter email'
        variant='outlined'
        fullWidth
        required
        onChange={e => setEmail(e.target.value)}
      />
      <div style={{ height: '10px' }}></div>
      <TextField
        label='Password'
        placeholder='Enter password'
        type='password'
        variant='outlined'
        fullWidth
        required
        onChange={e => setPassword(e.target.value)}
      />
      <div style={{ height: '10px' }}></div>
      <div style={{ height: '10px' }}></div>
      {errorDisplay()}
      <Button
        type='submit'
        color='primary'
        variant='outlined'
        style={btnstyle}
        fullWidth
        onClick={onLogin}
      >
        Sign in
      </Button>
    </Grid>
  )
}

export default LoginPage
