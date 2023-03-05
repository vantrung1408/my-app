import React, { useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
import { ContractEventListener } from './ContractEventListener'
import { VaultAbi } from './abis/vault'
import { Interface } from 'ethers/lib/utils'
import { OrderbookAbi } from './abis/orderbook'

function App() {
  const rpcUrl = 'https://bsc-dataseed1.binance.org/'
  useEffect(() => {
    if (!rpcUrl) {
      if (ContractEventListener.Instance.initialized) {
        ContractEventListener.Instance.destroy()
      }
      return
    }
    ContractEventListener.Instance.init(rpcUrl)
    return () => {
      ContractEventListener.Instance.destroy()
    }
  }, [rpcUrl])

  useEffect(() => {
    ContractEventListener.Instance.register(
      'positions',
      '0xA5aBFB56a78D2BD4689b25B8A77fd49Bb0675874',
      new Interface(VaultAbi),
      ['IncreasePosition', 'DecreasePosition', 'LiquidatePosition'].map(
        (event) => ({
          event: event,
          callback: (...[, owner]) => {
            console.log(owner?.toString())
          },
        })
      )
    )
    const orderBookAbi = new Interface(OrderbookAbi)
    ContractEventListener.Instance.register(
      'orders_placed',
      '0xf584A17dF21Afd9de84F47842ECEAF6042b1Bb5b',
      orderBookAbi,
      ['OrderPlaced', 'OrderExecuted'].map((event) => ({
        event: event,
        callback: (...[, [, owner, , , , expiredAt]]) => {
          console.log(owner?.toString(), expiredAt?.toString())
        },
      }))
    )
    ContractEventListener.Instance.register(
      'order_expired',
      '0xf584A17dF21Afd9de84F47842ECEAF6042b1Bb5b',
      orderBookAbi,
      ['OrderExpired'].map((event) => ({
        event: event,
        callback: () => {
          console.log('expired')
        },
      }))
    )
  }, [])

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className='App-link'
          href='https://reactjs.org'
          target='_blank'
          rel='noopener noreferrer'
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
