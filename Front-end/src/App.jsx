import React from 'react';
import { BrowserRouter, Route, Routes, Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RegisterLogin from './Page/RegisterLogin/RegisterLogin';
import Dashboard from './Page/DashBoard/Dashboard';
import Public from './Page/Public/Public';
import NotFound from './Component/DashBoard/NotFound/NotFound';
import ProtectRoter from './ProtectedRoutes/ProtectedRoutes';


function App() {
  const loader = 'Loading....';
  const isLoaderToggle = useSelector(state => state.loaderAction.loader);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RegisterLogin />} />
          <Route path="sharedtasklink/:taskId" element={<PublicWithTaskId />} />
          <Route path="/dashboard" element={<ProtectRoter><Dashboard /></ProtectRoter>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      {isLoaderToggle && (
        <img src={loader} alt="loader" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '111px' }} />
      )}
    </>
  );
}

function PublicWithTaskId() {
  let { taskId } = useParams();
  return <Public taskId={taskId} />;
}

export default App;
