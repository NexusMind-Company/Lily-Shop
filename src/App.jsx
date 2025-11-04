import React from 'react'
import AddAddress from './component/AddAddress'
import DeliveryAddress from './component/DeliveryAddress'
import PickupAddress from './component/PickupAddress'
import ChooseCard from './ChooseCard'
import NewCard from './NewCard'
import PasswordComfirmation from './PasswordComfirmation'

const App = () => {
  return (
    <div>
      <AddAddress/>
      <DeliveryAddress/>
      <PickupAddress/>
      <ChooseCard/>
      <NewCard/>
      <PasswordComfirmation/>
    </div>
  )
}

export default App
