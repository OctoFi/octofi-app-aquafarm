/* eslint-disable no-restricted-imports */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, {useContext, useMemo} from "react";
import Dropdown from "react-bootstrap/Dropdown";
import objectPath from "object-path";
import copy from 'clipboard-copy';
import { useHtmlClassService } from "../../../_core/MetronicLayout";
import { toAbsoluteUrl } from "../../../../_helpers";
import { DropdownTopbarItemToggler } from "../../../../_partials/dropdowns";
import { useActiveWeb3React } from "../../../../../../hooks";
import {getEtherscanLink} from "../../../../../../utils";
import {useETHBalances} from "../../../../../../state/wallet/hooks";
import {useWalletModalToggle} from "../../../../../../state/application/hooks";
import Separator from "../Separator";
import {ThemeContext} from "styled-components";
import { injected } from "../../../../../../connectors";
import {emitter} from "../../../../../../lib/helper";

export function UserProfileDropdown() {
  const {account, chainId, connector, deactivate} = useActiveWeb3React();
  const toggleWalletModal = useWalletModalToggle()
  const theme = useContext(ThemeContext)

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const uiService = useHtmlClassService();
  const layoutProps = useMemo(() => {
    return {
      light:
        objectPath.get(uiService.config, "extras.user.dropdown.style") ===
        "light",
    };
  }, [uiService]);

  const copyAccountToClipboard = () => {
    copy(account);
  }

  const disconnectWalletHandler = () => {
    if(connector !== injected) {
      connector.close();
    } else {
      deactivate();
    }
    emitter.emit('change-route', {
      path: '/'
    })
  }

  return (
    <Dropdown drop="down" alignRight>
      <Dropdown.Toggle
        as={DropdownTopbarItemToggler}
        id="dropdown-toggle-user-profile"
      >
        <div
          className={
            "btn btn-icon btn-hover-transparent-white d-flex align-items-center btn-lg px-md-2 w-md-auto"
          }
        >
          <span className="text-white opacity-90 font-weight-bolder font-size-base d-none d-md-inline mr-4">
            {account && (account.slice(0, 6) + '...' + account.slice(-4))}
          </span>
          <span className="symbol symbol-35 bg-warning">
            <svg x="0" y="0" width="32" height="32"><rect x="0" y="0" width="32" height="32" transform="translate(3.0701412914300477 -3.2967797183170924) rotate(466.4 16 16)" fill="#017E8E"/><rect x="0" y="0" width="32" height="32" transform="translate(9.464101229664621 -8.524333048581537) rotate(377.7 16 16)" fill="#C8143E"></rect><rect x="0" y="0" width="32" height="32" transform="translate(23.461824290398052 5.0905377128432026) rotate(163.3 16 16)" fill="#F95401"></rect></svg>
          </span>
        </div>
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-anim-up dropdown-menu-lg p-0">
        <>
          {/** ClassName should be 'dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-anim dropdown-menu-top-unround dropdown-menu-xl' */}
          {layoutProps.light && (
            <>
              <div className="d-flex align-items-center p-8 rounded-top">
                <div className="symbol symbol-md mr-3 flex-shrink-0 bg-warning">
                  <svg x="0" y="0" width="32" height="32"><rect x="0" y="0" width="32" height="32" transform="translate(3.0701412914300477 -3.2967797183170924) rotate(466.4 16 16)" fill="#017E8E"/><rect x="0" y="0" width="32" height="32" transform="translate(9.464101229664621 -8.524333048581537) rotate(377.7 16 16)" fill="#C8143E"></rect><rect x="0" y="0" width="32" height="32" transform="translate(23.461824290398052 5.0905377128432026) rotate(163.3 16 16)" fill="#F95401"></rect></svg>
                </div>
                <div className="m-0 flex-grow-1 mr-3 font-size-h5" style={{ color: theme.text1 }}>
                  {account && (account.slice(0, 10) + '...' + account.slice(-6))}
                </div>
                <span onClick={copyAccountToClipboard} className="btn btn-light-success btn-sm font-weight-bold">
                  copy
                </span>
              </div>
              <Separator/>
            </>
          )}

          {!layoutProps.light && (
            <div
              className="d-flex align-items-center justify-content-between flex-wrap p-8 bgi-size-cover bgi-no-repeat rounded-top"
              style={{
                backgroundImage: `url(${toAbsoluteUrl(
                  "/media/misc/bg-1.jpg"
                )})`,
              }}
            >
              <div className="symbol symbol-md mr-3 flex-shrink-0 bg-warning">
                  <svg x="0" y="0" width="32" height="32"><rect x="0" y="0" width="32" height="32" transform="translate(3.0701412914300477 -3.2967797183170924) rotate(466.4 16 16)" fill="#017E8E"/><rect x="0" y="0" width="32" height="32" transform="translate(9.464101229664621 -8.524333048581537) rotate(377.7 16 16)" fill="#C8143E"></rect><rect x="0" y="0" width="32" height="32" transform="translate(23.461824290398052 5.0905377128432026) rotate(163.3 16 16)" fill="#F95401"></rect></svg>
                {/*<img alt="Pic" className="hidden" src={user.pic} />*/}
              </div>
              <div className="m-0 flex-grow-1 mr-3 font-size-h5" style={{ color: theme.text1 }}>
                {account && (account.slice(0, 10) + '...' + account.slice(-6))}
              </div>
              <span onClick={copyAccountToClipboard} className="btn btn-success btn-sm font-weight-bold">
                  copy
                </span>
            </div>
          )}
        </>

        <div className="navi navi-spacer-x-0 pt-5">

          <a className="navi-item px-8" href={getEtherscanLink(chainId, account, 'address')} target={"_blank"} rel={'noopener noreferrer'}>
            <div className="navi-link">
              <div className="navi-icon mr-2">
                <i className="flaticon2-calendar-3 text-info"></i>
              </div>
              <div className="navi-text">
                <div className="font-weight-bold" style={{ color: theme.text1 }}>View on Etherscan </div>
                <div className="text-muted">Show detailed profile</div>
              </div>
            </div>
          </a>
          <a className="navi-item px-8" onClick={toggleWalletModal}>
            <div className="navi-link">
              <div className="navi-icon mr-2">
                <i className="flaticon2-rocket-1 text-warning"></i>
              </div>
              <div className="navi-text">
                <div className="font-weight-bold" style={{ color: theme.text1 }}>Change connection</div>
                <div className="text-muted">Connect to another wallet</div>
              </div>
            </div>
          </a>

          <a className="navi-item px-8" onClick={disconnectWalletHandler}>
            <div className="navi-link">
              <div className="navi-icon mr-2">
                <i className="flaticon2-rocket-1 text-danger"></i>
              </div>
              <div className="navi-text">
                <div className="font-weight-bold" style={{ color: theme.text1 }}>Disconnect</div>
                <div className="text-muted">Disconnect your account from deFi</div>
              </div>
            </div>
          </a>
          <div className="navi-footer  px-8 py-5">
            <div className="label label-light-primary label-lg font-weight-bold d-flex w-100 label-inline py-3">
              {userEthBalance?.toSignificant(4)} ETH
            </div>
          </div>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
