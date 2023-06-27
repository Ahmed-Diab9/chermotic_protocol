import useSWR from "swr"
import { useAccount } from "wagmi"
import {utils as ChromaticUtils} from "@chromatic-protocol/sdk"
import {useChromaticClient} from "~/hooks/useChromaticClient"
import {useAppSelector} from "~/store"
import {isValid} from '~/utils/valid'
import {filterIfFulfilled} from "~/utils/array"
import { OwnedBin } from "~/typings/pools"

interface Props {
  marketAddress?: string
}

export const useOwnedLiquidityPoolByMarket = (props: Props) => {
  const {encodeTokenId} = ChromaticUtils
  const {address} = useAccount()
  const {marketAddress: previousMarketAddress} = props
  const market = useAppSelector((state) => state.market.selectedMarket)
  const {client} = useChromaticClient()

  const marketAddress = previousMarketAddress ?? market?.address
  const fetchKey = isValid(address) && isValid(marketAddress) ? [address, marketAddress] : undefined

  const {data: ownedPool, error, mutate: fetchOwnedPool} = useSWR(fetchKey, async ([address, marketAddress]) => {
    if (!isValid(client)) {
      return
    }
    const bins = await client.lens().ownedLiquidityBins(marketAddress, address)
    const binsResponse = bins.map(async (bin) => {
      const tokenId = encodeTokenId(bin.tradingFeeRate, bin.tradingFeeRate > 0)
      const {
        name, decimals, description, image
      } = await client.market().clbTokenMeta(marketAddress, tokenId)
      return {
        liquidity: bin.liquidity,
        freeLiquidity: bin.freeLiquidity,
        removableRate: bin.removableRate,
        clbTokenName: name,
        clbTokenImage: image,
        clbTokenDescription: description,
        clbTokenDecimals: decimals,
        clbTokenBalance: bin.clbBalance,
        clbTokenValue: bin.clbValue,
        clbTotalSupply: bin.clbTotalSupply,
        binValue: bin.clbBalance.mul(bin.clbValue),
        baseFeeRate: bin.tradingFeeRate,
        tokenId: tokenId,
      } satisfies OwnedBin
    })
    const filteredBins = await filterIfFulfilled(binsResponse)
    return {
      marketAddress, bins: filteredBins
    }
  })

  return {
    ownedPool, fetchOwnedPool
  }
}