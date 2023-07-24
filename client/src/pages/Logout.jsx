import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import { CustomButton } from '../components';

const Logout = () => {
    const { address, disconnectWallet } = useStateContext();
    const navigate = useNavigate();

  return (
    <div>
    {address? (
      <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">Are you sure to logout?</h1>) :
      null}
      <br />
      {address? (<CustomButton 
          btnType="button"
          title={"Logout"}
          styles={'bg-[#c53030]'}
          handleClick={() => {
            if(address) {
                disconnectWallet();
                navigate("/");
            }
          }}
        />) : (<h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">No wallet connected</h1>)}
    </div>
  )
}

export default Logout
