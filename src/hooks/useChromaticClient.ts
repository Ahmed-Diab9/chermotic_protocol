
import { useEffect, useMemo, useState } from "react";
import {useSigner, useProvider, useAccount} from "wagmi"
import { Client } from '@chromatic-protocol/sdk'


export function useChromaticClient(){
  const {isConnected} = useAccount()
  // const [isFinished, setIsFinished] = useState(false)
  const [client, setClient ] = useState<Client>()

  const provider = useProvider()
  const {data: signer} = useSigner()
  useEffect(()=>{
    console.log('provider, signer, isConnected', provider, signer, isConnected)
    if (!client &&  (provider || signer )) {
      console.log('new client')
      console.log('signer or provider', signer || provider)
      setClient(new Client('anvil',  signer || provider))
    }
    if(client){
      if( isConnected && signer) client.signer = signer
        if(provider) client.provider = provider
    }
  }, [provider, signer, isConnected])
  // useMemo(() => {
  //   let instance: Client | undefined 
   
  //   // if(instance){
  //   //   if( isConnected && signer) instance.signer = signer
  //   //   if(provider) instance.provider = provider
  //   //   // setIsFinished(true)
  //   // }
  //   return instance
  // }, [provider, signer, isConnected])


  return {
      client,
  }
}