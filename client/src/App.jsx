import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Sidebar, Navbar } from './components';
import { CampaignDetails, CreateCampaign, Home, Profile, Logout } from './pages';
import { sun } from './assets';

const Icon = ({ styles,  imgUrl, handleClick }) => (
  <div className={`w-[48px] h-[48px] rounded-[10px]  flex justify-center items-center ${'cursor-pointer'} ${styles}`} onClick={handleClick}>
      <img src={imgUrl} alt="fund_logo" className="w-1/2 h-1/2" />
  </div>
)

const App = () => {
  const [col, setCol] = useState("bg-[#13131a]");

  return (
    <div className={`relative sm:-8 p-4 ${col} min-h-screen flex flex-row`}>
      <div className='sm:flex hidden mr-10 relative'>
        <Sidebar />
      </div>

      <div className='flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5'>
        <Navbar />

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/campaign-details/:id" element={<CampaignDetails />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </div>

      <div className="sm:flex hidden fixed bottom-11 left-7">
        <Icon styles="bg-[#1c1c24] shadow-secondary" imgUrl={sun} handleClick={() => setCol(col === "bg-[#13131a]"? "bg-[#243c5a]" : "bg-[#13131a]")}/>
      </div>
    </div>
  )
}

export default App;
