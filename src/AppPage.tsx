import React, { useState, useEffect, useContext } from 'react'
import Button from '@mui/material/Button'
import { blue } from '@mui/material/colors'
import { Box } from '@mui/system'
import { Snackbar } from '@mui/material'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert
} from '@mui/material'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import { FirebaseApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { getDatabase, ref, onValue, update, get, set } from 'firebase/database'
import { FirebaseAppContext } from './FirebaseAppContext'
import AddIcon from '@mui/icons-material/Add'
import { SelectChangeEvent } from '@mui/material/Select'

const AppPage: React.FC = () => {
  const [userID, setUserID] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<Array<any>>([])
  const [projectsLoaded, setProjectsLoaded] = useState(false)
  const [selectedProject, setSelectedProject] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const app = useContext(FirebaseAppContext)
  const auth = app ? getAuth(app) : undefined

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const handleSnackbarOpen = (message: string) => {
    setSnackbarMessage(message)
    setSnackbarOpen(true)
  }

  const handleSaveToProjects = async () => {
    console.log('Saving to project')
    if (db && selectedProject && userID) {
      console.log('Database, project, and user ID exist')
      try {
        // first, fetch the current tab
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            if (!tabs[0]) {
              console.error('No active tab found')
              return
            }

            // send a message to the content script in the current tab
            chrome.runtime.sendMessage(
              { action: 'scrapePage' },
              async response => {
                if (response && 'data' in response) {
                  const projectRef = ref(
                    db,
                    'users/' + userID + '/projects/' + selectedProject
                  )

                  // Fetch current data from the database.
                  const snapshot = await get(projectRef)
                  let currentData = snapshot.val()

                  // Prepare new webpage data.
                  const newWebpageData = {
                    webpageData: response.data,
                    webpageUrl: response.url
                  }

                  // If there's no current data, initialize an array.
                  if (!currentData) {
                    currentData = [newWebpageData]
                  }
                  // If currentData is an array, push new data.
                  else if (Array.isArray(currentData)) {
                    currentData.push(newWebpageData)
                  }
                  // If currentData is not an array (i.e., it's an object), turn it into an array.
                  else {
                    currentData = [currentData, newWebpageData]
                  }

                  // Update the data in the database.
                  await set(projectRef, currentData)

                  handleSnackbarOpen('Saved to project successfully')
                } else {
                  console.error(
                    'No response received, or response does not contain data'
                  )
                }
              }
            )
          }
        )
      } catch (error) {
        console.log('Error saving to project:', error)
        handleSnackbarOpen('Error saving to project')
      }
    }
  }

  const handleLogout = () => {
    if (auth) {
      signOut(auth)
        .then(() => {
          console.log('User signed out')
        })
        .catch(error => {
          console.error('Sign out error', error)
        })
    } else {
      console.error('No auth instance available')
    }
  }

  // handle getting user's email using the auth instance
  const getUserEmail = (auth: any) => {
    if (auth) {
      const user = auth.currentUser
      if (user) {
        console.log('User is logged in with email:', user)
        setUserEmail(user.email)
      }
    }
  }

  const handleProjectChange = (event: SelectChangeEvent<string>) => {
    setSelectedProject(event.target.value)
  }

  const getDatabaseSafe = (app: FirebaseApp | null) => {
    if (app) {
      return getDatabase(app)
    }
    return undefined
  }
  const db = getDatabaseSafe(app)

  useEffect(() => {
    setIsLoading(true)
  
    if (auth) {
      getUserEmail(auth)
      const unsubscribe = onAuthStateChanged(auth, user => {
        if (user) {
          const userID = user.uid
          setUserID(userID)
          console.log('User is logged in with ID:', userID)
  
          if (db) {
            const projectsRef = ref(db, 'users/' + userID + '/projects')
            console.log('About to fetch projects for user:', userID)
            onValue(
              projectsRef,
              snapshot => {
                console.log('Fetched projects for user:', userID)
                const data = snapshot.val()
                setProjects(
                  data
                    ? Object.keys(data).map(key => ({ key, name: data[key][0]?.name, ...data[key] }))
                    : []
                )
                setIsLoading(false)
                setProjectsLoaded(true)
              },
              error => {
                console.log('Error fetching projects:', error)
                setIsLoading(false)
              }
            )
          }
        } else {
          console.log('User not logged in')
          setIsLoading(false)
        }
      })
  
      // Don't forget to unsubscribe when the component unmounts
      return () => unsubscribe()
    }
  }, [auth, db])
  


  const StyledButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(blue[500]),
    backgroundColor: blue[500],
    '&:hover': {
      backgroundColor: blue[700]
    }
  }))

  return (
    <Box
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
      height='100vh'
    >
      <img src='zag.png' alt='zag' width='100' height='100' />
      <Typography variant='h4' component='div' gutterBottom>
        ZAG AI
      </Typography>

      <FormControl fullWidth sx={{ marginRight: '5%' }}>
        <InputLabel id='project-select-label'>Select Project</InputLabel>
        <Select
          labelId='project-select-label'
          label='Select Project'
          id='project-select'
          value={selectedProject}
          onChange={handleProjectChange}
        >
          {/* <MenuItem
            value=''
            onClick={handleNewProjectClick}
            sx={{
              color: '#137ebf'
            }}
          >
            <AddIcon />
            Create New Project
          </MenuItem> */}
          {projects.map(project => (
            <MenuItem key={project.key} value={project.key}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
        <StyledButton
          startIcon={<SaveAltIcon />}
          variant='contained'
          onClick={handleSaveToProjects}
          fullWidth
          sx={{ marginTop: '5%' }}
        >
          Save Website to Project
        </StyledButton>
      </FormControl>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity='success'>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Button
        onClick={handleLogout}
        style={{ position: 'absolute', top: '10px', right: '10px' }}
      >
        Logout
      </Button>
      <Typography
        variant='body2'
        style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          fontSize: 16,
          color: 'grey'
        }}
      >
        {userEmail}
      </Typography>
    </Box>
  )
}

export default AppPage
