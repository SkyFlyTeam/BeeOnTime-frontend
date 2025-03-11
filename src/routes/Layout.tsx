import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="content">
      <div className="main-content">
        <Outlet /> 
      </div>
    </div>
  )
}

export default Layout