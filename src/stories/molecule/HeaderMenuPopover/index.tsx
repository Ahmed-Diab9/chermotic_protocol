import './style.css';

import { Link } from 'react-router-dom';
import { Popover } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

// import { useHeaderMenuPopover } from './hooks';

export function HeaderMenuPopover() {
  // const { isConnected, isLoading, isAccountExist, balance, tokenImage } = useHeaderMenuPopover();

  return (
    <>
      {/* <div className="border-l HeaderMenuPopover border-primary/10 panel panel-transparent"> */}
      <div className="HeaderMenuPopover">
        <div className="flex flex-col gap-[6px] text-right">
          <Popover.Group className="flex gap-2">
            <Popover>
              {({ open, close }) => (
                <>
                  <Popover.Button>
                    <EllipsisHorizontalIcon className="w-6 text-primary" />
                  </Popover.Button>
                  <Popover.Panel className="popover-panel w-[600px]">
                    <div className="flex px-2">
                      <div className="wrapper-ul">
                        <h2>Development</h2>
                        <ul className="">
                          <li className="list-item">
                            <Link to="" target="_blank">
                              Github
                            </Link>
                          </li>
                          <li className="list-item">
                            <Link to="" target="_blank">
                              Contract
                            </Link>
                          </li>
                          <li className="list-item">
                            <Link to="" target="_blank">
                              SDK
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div className="border-l wrapper-ul">
                        <h2>Docs</h2>
                        <ul className="">
                          <li className="list-item">
                            <Link to="" target="_blank">
                              Gitbook
                            </Link>
                          </li>
                          <li className="list-item">
                            <Link to="" target="_blank">
                              Medium
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div className="border-l wrapper-ul">
                        <h2>Social</h2>
                        <ul className="">
                          <li className="list-item">
                            <Link to="" target="_blank">
                              Twitter
                            </Link>
                          </li>
                          <li className="list-item">
                            <Link to="" target="_blank">
                              Discord
                            </Link>
                          </li>
                          <li className="list-item">
                            <Link to="" target="_blank">
                              Zealy
                            </Link>
                          </li>
                          <li className="list-item">
                            <Link to="" target="_blank">
                              Galxe
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex gap-12 pt-5 mt-5 border-t px-7">
                      <Link to="" target="_blank">
                        Chromatic Intro
                      </Link>
                      <Link to="" target="_blank">
                        LinkTree
                      </Link>
                    </div>
                  </Popover.Panel>
                </>
              )}
            </Popover>
          </Popover.Group>
        </div>
      </div>
    </>
  );
}
