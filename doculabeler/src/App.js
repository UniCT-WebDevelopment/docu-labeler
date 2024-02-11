import { ProjectsPage } from './projects';
import { PublicProjectsPage } from './public_projects';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


import { Navigate } from 'react-router-dom';
import LoginComponent from './login'
import ProtectedRoute from './protectedroute';
import {ProjectTasksContainer} from './project_tasks_container';
import { RegisterComponent } from './register';
import { TaskAnnotator } from './task_annotation';
import './fonts/ReadexPro/ReadexPro-Regular.ttf';
import './fonts/ReadexPro/ReadexPro-Medium.ttf';
import './fonts/ReadexPro/ReadexPro-Bold.ttf';
import './fonts/ReadexPro/ReadexPro-Light.ttf';
import './fonts/ReadexPro/ReadexPro-ExtraLight.ttf';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/register" element={<RegisterComponent />}/>
        <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
        <Route path="/projects/:project_id" element={<ProtectedRoute><ProjectTasksContainer></ProjectTasksContainer></ProtectedRoute>} />
        <Route path="/projects/:project_id/:task_id" element={<ProtectedRoute><TaskAnnotator></TaskAnnotator></ProtectedRoute>} />
        <Route path="/projects/public" element={<ProtectedRoute><PublicProjectsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/projects" />} />
      </Routes>
    </Router>
  );
}

export default App;
