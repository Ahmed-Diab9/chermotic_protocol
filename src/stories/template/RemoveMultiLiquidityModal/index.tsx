import { Dialog } from '@headlessui/react';
import { isNil } from 'ramda';
import { useEffect, useMemo, useState } from 'react';
import { MULTI_ALL, MULTI_TYPE } from '~/configs/pool';
import { useRemoveLiquidityBins } from '~/hooks/useRemoveLiquidityBins';
import { useAppDispatch } from '~/store';
import { poolsAction } from '~/store/reducer/pools';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';
import { Outlink } from '~/stories/atom/Outlink';
import { ScrollTrigger } from '~/stories/atom/ScrollTrigger';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { LiquidityItem } from '~/stories/molecule/LiquidityItem';
import { Token } from '~/typings/market';
import { OwnedBin } from '~/typings/pools';
import { formatDecimals } from '~/utils/number';
import { isValid } from '~/utils/valid';
import { Logger } from '../../../utils/log';
import { Button } from '../../atom/Button';
import '../Modal/style.css';

const logger = Logger('RemoveMultiLiquidityModal');
export interface RemoveMultiLiquidityModalProps {
  selectedBins?: OwnedBin[];
  amount?: number;
  token?: Token;
  type?: MULTI_TYPE;
  balance?: bigint;
  onAmountChange?: (type: MULTI_TYPE) => unknown;
}

export const RemoveMultiLiquidityModal = (props: RemoveMultiLiquidityModalProps) => {
  const {
    selectedBins = [],
    type = MULTI_ALL,
    token,
    amount = 0,
    balance = 0n,
    onAmountChange,
  } = props;
  const dispatch = useAppDispatch();
  const convertedAmount = useMemo(() => {
    if (type === MULTI_ALL) {
      return selectedBins.reduce((sum, current) => {
        sum = sum + current.clbBalanceOfSettlement;
        return sum;
      }, 0n);
    } else {
      return selectedBins.reduce((sum, current) => {
        sum = sum + current.clbBalanceOfSettlement;
        return sum;
      }, 0n);
    }
  }, [type, selectedBins]);

  const calculatedLiquidities = useMemo(() => {
    logger.info('selected bin length', selectedBins.length);

    const totalBalance = selectedBins
      .map((bin) => bin.clbTokenBalance)
      .reduce((b, curr) => b + curr, 0n);
    const totalBalanceOfSettlement = selectedBins.reduce((sum, current) => {
      return sum + current.clbBalanceOfSettlement;
    }, 0n);
    const totalLiquidity = selectedBins.reduce((acc, current) => {
      acc += current.liquidity;
      return acc;
    }, 0n);
    const totalFreeLiquidity = selectedBins.reduce((acc, current) => {
      if (current.clbBalanceOfSettlement > current.freeLiquidity) {
        acc += current.freeLiquidity;
      } else {
        acc += current.clbBalanceOfSettlement;
      }
      return acc;
    }, 0n);
    return {
      totalBalance,
      totalFreeLiquidity,
      totalBalanceOfSettlement,
      avgRemovableRate: (totalFreeLiquidity * 100n) / (totalLiquidity || 1n),
    };
  }, [type, selectedBins, token]);
  const { onRemoveLiquidities } = useRemoveLiquidityBins({
    bins: selectedBins,
    type,
  });
  const [arrowState, setArrowState] = useState({
    isScrolled: false,
    hasSameHeight: false,
  });

  useEffect(() => {
    const bins = document.querySelector('#bins');
    if (isNil(bins)) {
      return;
    }
    if (bins.clientHeight === bins.scrollHeight) {
      setArrowState((state) => ({ isScrolled: false, hasSameHeight: true }));
    }

    const onWindowResize = () => {
      if (bins.scrollTop !== 0) {
        setArrowState((state) => ({ ...state, isScrolled: true }));
        return;
      }
      if (bins.clientHeight === bins.scrollHeight) {
        setArrowState({ isScrolled: false, hasSameHeight: true });
      } else {
        setArrowState({ isScrolled: false, hasSameHeight: false });
      }
    };
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return (
    <Dialog
      className=""
      open={selectedBins.length > 0}
      onClose={() => {
        onAmountChange?.('ALL');
        dispatch(poolsAction.onBinsReset());
      }}
    >
      {/* backdrop */}
      <div className="fixed inset-0 bg-white2" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 shadow-xl">
        <Dialog.Panel className="modal modal-base">
          <Dialog.Title className="modal-title">
            Remove Liquidity
            {/* Bin 개수가 여러개일 때 */}
            <span className="ml-2">({selectedBins.length})</span>
            <ModalCloseButton
              onClick={() => {
                onAmountChange?.('ALL');
                dispatch(poolsAction.onBinsReset());
              }}
            />
          </Dialog.Title>
          {/* <div className="w-[100px] mx-auto border-b border-2 border-black1"></div> */}
          <Dialog.Description className="gap-5 modal-content">
            {/* liquidity items */}
            <article className="relative flex flex-col border border-light2 rounded-xl">
              <div
                id="bins"
                className="max-h-[calc(100vh-600px)] min-h-[180px] overflow-auto"
                onScroll={(event) => {
                  if (!(event.target instanceof HTMLDivElement)) {
                    return;
                  }
                  if (event.target.clientHeight === event.target.scrollHeight) {
                    return;
                  }
                  if (event.target.scrollTop === 0) {
                    setArrowState((state) => ({ ...state, isScrolled: false }));
                  }
                  if (event.target.scrollTop > 0 && !arrowState.isScrolled) {
                    setArrowState((state) => ({ ...state, isScrolled: true }));
                  }
                }}
              >
                {isValid(token) &&
                  selectedBins.map((bin) => {
                    return (
                      <LiquidityItem
                        key={bin.baseFeeRate}
                        token={token}
                        name={bin.clbTokenDescription}
                        bin={bin}
                        imageSrc={bin.clbTokenImage}
                      />
                    );
                  })}
              </div>
              <div className="absolute bottom-0 flex justify-center w-full">
                <ScrollTrigger
                  isVisible={!arrowState.hasSameHeight}
                  hasOpacity={!arrowState.isScrolled}
                />
              </div>
            </article>

            {/* info bottom */}
            <article className="flex flex-col gap-2 pb-5 border-b">
              {/**
               * @TODO
               * LP 토큰 총합 밸런스
               */}
              <div className="flex justify-between">
                <div className="flex text-black3">
                  Total CLB
                  <TooltipGuide
                    label="RemoveMultiLiquidityModal-total-clb"
                    tip="The sum of the quantity of the above liquidity tokens(CLB)."
                  />
                </div>
                <p>{formatDecimals(balance, token?.decimals, 2)} CLB</p>
              </div>
              {/**
               * @TODO
               * 총합 유동성 가치
               */}
              <div className="flex justify-between">
                <div className="flex text-black3">
                  Total Liquidity Value
                  <TooltipGuide
                    label="RemoveMultiLiquidityModal-total-liquidity-value"
                    tip="The total value of the above liquidity tokens(CLB), converted into the current value."
                  />
                </div>
                <p>
                  {formatDecimals(
                    calculatedLiquidities.totalBalanceOfSettlement,
                    token?.decimals,
                    2
                  )}{' '}
                  {token?.name}
                </p>
              </div>
              {/**
               * @TODO
               * 총합 제거 가능한 유동성 가치
               */}
              <div className="flex justify-between">
                <div className="flex text-black3">
                  Removable Liquidity
                  <TooltipGuide
                    label="RemoveMultiLiquidityModal-removable-liquidity"
                    tip="The amount of liquidity that is currently removable due to not being utilized."
                    outLink="https://chromatic-protocol.gitbook.io/docs/liquidity/withdraw-liquidity"
                  />
                </div>
                <p>
                  {formatDecimals(calculatedLiquidities.totalFreeLiquidity, token?.decimals, 2)}{' '}
                  {token?.name}
                  <span className="ml-1 text-black3">
                    {`${calculatedLiquidities.avgRemovableRate}%`}
                  </span>
                </p>
              </div>
            </article>

            {/* input - number */}
            <article className="">
              <div className="flex items-center justify-between gap-2">
                <p className="flex-none font-semibold">Remove CLB Tokens</p>
                <p className="text-right text-black3">
                  {/**
                   * @TODO
                   * 사용자가 입력한 제거 하려는 LP 토큰의 개수에 대해서 USDC 값으로 변환하는 로직입니다.
                   */}
                  {/* {formatDecimals(convertedAmount, token?.decimals, 2)} {token?.name} */}
                  {formatDecimals(convertedAmount, token?.decimals, 2)} {token?.name}
                </p>
              </div>
              <div className="flex items-center justify-between gap-6 mt-3">
                <div className="flex gap-1">
                  <Button
                    className="flex-auto shadow-base border-light2"
                    label="All"
                    size="sm"
                    onClick={() => onAmountChange?.(MULTI_ALL)}
                  />
                </div>
                <div className="max-w-[220px] relative">
                  <p className="text-lg font-semibold text-black1">{amount} CLB</p>
                  {/* <Input
                    unit="CLB"
                    value={input?.amount}
                    onChange={(event) => {
                      const value = trimLeftZero(event.target.value);
                      const parsed = Number(value);
                      if (isNaN(parsed)) {
                        return;
                      }
                      onAmountChange?.(parsed);
                    }}
                    onClickAway={() => {
                      if (!isValid(input) || !isValid(maxAmount)) {
                        return;
                      }
                      if (input.amount > maxAmount) {
                        onMaxChange?.();
                      }
                    }}
                  /> */}
                </div>
              </div>
              <p className="mt-4 text-xs text-black3">
                Holders can immediately withdraw liquidity by burning the CLB tokens that is not
                collateralized by maker margin. Since the withdrawal takes place in the next oracle
                round, the final amount of removable liquidity is determined based on the
                utilization status of the liquidity bins in the next oracle round.{' '}
                <Outlink outLink="https://chromatic-protocol.gitbook.io/docs/liquidity/withdraw-liquidity" />
              </p>
            </article>
          </Dialog.Description>
          <div className="modal-button">
            <Button
              label="Remove"
              size="xl"
              className="text-lg"
              css="active"
              onClick={() => {
                onRemoveLiquidities();
              }}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
