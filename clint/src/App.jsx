import React from 'react'
import { Route,Routes } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import MailVerify from './pages/MailVerify'
import ResetPassword from './pages/resetPassword'
import { ToastContainer } from 'react-toastify';




const App = () => {
  return (
    <div>
      <ToastContainer/>
<Routes>
 <Route path="/"element={<Home/>}/>
  <Route path="/Login" element={<Login/>}/>
 <Route path="/Mail-Verify" element={<MailVerify />} />
 <Route path="/Reset-Password" element={<ResetPassword/>}/>

</Routes>
    </div>
  )
}

export default App