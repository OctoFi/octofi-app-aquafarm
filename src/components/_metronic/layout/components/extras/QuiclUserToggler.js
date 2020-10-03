/* eslint-disable no-restricted-imports */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, {useMemo} from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {useSelector} from "react-redux";
import objectPath from "object-path";
import {useHtmlClassService} from "../../_core/MetronicLayout";
import {UserProfileDropdown} from "./dropdowns/UserProfileDropdown";
import { useActiveWeb3React } from "../../../../../hooks";

export function QuickUserToggler() {
  const {account} = useActiveWeb3React();
  const uiService = useHtmlClassService();
  const layoutProps = useMemo(() => {
    return {
      offcanvas: objectPath.get(uiService.config, "extras.user.layout") === "offcanvas",
    };
  }, [uiService]);

  return (<>
        {layoutProps.offcanvas && (<OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="quick-user-tooltip">View user</Tooltip>}
        >
          <div className="topbar-item">
            <div className="btn btn-icon w-auto btn-clean d-flex align-items-center btn-lg px-2"
                 id="kt_quick_user_toggle">
              <>
                <span className="text-dark-50 font-weight-bolder font-size-base d-none d-md-inline mr-3">
                  {account && (account.slice(0, 6) + '...' + account.slice(-4))}
                </span>
                <span className="symbol symbol-35 bg-warning">
                  <svg x="0" y="0" width="32" height="32"><rect x="0" y="0" width="32" height="32" transform="translate(3.0701412914300477 -3.2967797183170924) rotate(466.4 16 16)" fill="#017E8E"></rect><rect x="0" y="0" width="32" height="32" transform="translate(9.464101229664621 -8.524333048581537) rotate(377.7 16 16)" fill="#C8143E"></rect><rect x="0" y="0" width="32" height="32" transform="translate(23.461824290398052 5.0905377128432026) rotate(163.3 16 16)" fill="#F95401"></rect></svg>
                </span>
              </>
            </div>
          </div>
        </OverlayTrigger>)}

        {!layoutProps.offcanvas && (<UserProfileDropdown/>)}
      </>
  );
}
