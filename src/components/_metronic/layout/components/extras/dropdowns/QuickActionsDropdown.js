/* eslint-disable no-restricted-imports */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useMemo, useRef, useState } from "react";
import { Col, Button, InputGroup, FormControl, OverlayTrigger, Tooltip, Dropdown } from "react-bootstrap";
import SVG from "react-inlinesvg";
import objectPath from "object-path";

import { useHtmlClassService } from "../../../_core/MetronicLayout";
import { toAbsoluteUrl } from "../../../../_helpers";
import { DropdownTopbarItemToggler } from "../../../../_partials/dropdowns";
import {useUserSlippageTolerance, useUserTransactionTTL} from "../../../../../../state/user/hooks";


const SlippageError = {
  InvalidInput: 'InvalidInput',
  RiskyLow: 'RiskyLow',
  RiskyHigh: 'RiskyHigh'
};

const DeadlineError = {
  InvalidInput: 'InvalidInput'
}

export function QuickActionsDropdown() {
  const bgImage = toAbsoluteUrl("/media/misc/bg-2.jpg");
  const uiService = useHtmlClassService();
  const layoutProps = useMemo(() => {
    return {
      offcanvas:
        objectPath.get(uiService.config, "extras.quick-actions.layout") ===
        "offcanvas",
    };
  }, [uiService]);

  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippageTolerance()

  const [ttl, setTtl] = useUserTransactionTTL()


  const inputRef = useRef()

  const [slippageInput, setSlippageInput] = useState('')
  const [deadlineInput, setDeadlineInput] = useState('')

  const slippageInputIsValid =
      slippageInput === '' || (userSlippageTolerance / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2)
  const deadlineInputIsValid = deadlineInput === '' || (ttl / 60).toString() === deadlineInput

  let slippageError
  if (slippageInput !== '' && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput
  } else if (slippageInputIsValid && userSlippageTolerance < 50) {
    slippageError = SlippageError.RiskyLow
  } else if (slippageInputIsValid && userSlippageTolerance > 500) {
    slippageError = SlippageError.RiskyHigh
  } else {
    slippageError = undefined
  }

  let deadlineError
  if (deadlineInput !== '' && !deadlineInputIsValid) {
    deadlineError = DeadlineError.InvalidInput
  } else {
    deadlineError = undefined
  }

  function parseCustomSlippage(value) {
    setSlippageInput(value)

    try {
      const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
      if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
        setUserSlippageTolerance(valueAsIntFromRoundedFloat)
      }
    } catch {}
  }

  function parseCustomDeadline(value) {
    setDeadlineInput(value)

    try {
      const valueAsInt = Number.parseInt(value) * 60
      if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
        setTtl(valueAsInt)
      }
    } catch {}
  }

  return (
    <>
      {layoutProps.offcanvas && (
        <OverlayTrigger
          placement="left"
          overlay={<Tooltip id="quick-actions-tooltip">Settings</Tooltip>}
        >
          <div className="topbar-item">
            <div
              className="btn btn-icon btn-clean btn-dropdown btn-lg mr-1"
              id="kt_quick_actions_toggle"
            >
              <span className="svg-icon svg-icon-xl svg-icon-primary">
                <SVG
                  src={toAbsoluteUrl("/media/svg/icons/General/Settings-2.svg")}
                />
              </span>
            </div>
          </div>
        </OverlayTrigger>
      )}
      {!layoutProps.offcanvas && (
        <Dropdown drop="down" alignRight>
          <Dropdown.Toggle
            as={DropdownTopbarItemToggler}
            id="kt_quick_actions_panel_toggle"
          >
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="quick-actions-tooltip">Settings</Tooltip>
              }
            >
              <div className="btn btn-icon btn-hover-transparent-white btn-dropdown btn-lg mr-1">
                <span className="svg-icon svg-icon-xl">
                  <SVG
                    src={toAbsoluteUrl("/media/svg/icons/General/Settings-2.svg")}
                  />
                </span>
              </div>
            </OverlayTrigger>
          </Dropdown.Toggle>

          <Dropdown.Menu className="dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-anim-up dropdown-menu-lg">
            <form>
              {/* begin: Head */}
              <div
                className="d-flex flex-column align-items-start justify-content-center pt-6 pb-6 bgi-size-cover bgi-no-repeat rounded-top px-4"
                style={{ backgroundImage: `url(${bgImage})` }}
              >
                <h3 className="text-white font-weight-bold font-size-5">
                  Settings
                </h3>
                <span className="text-white opacity-70">
                  Select your preferences
                </span>
              </div>
              {/* end: Head */}

              <div className="row row-paddingless">
                  <Col xs={12}>
                      <div className="row my-3 d-flex align-items-stretch justify-content-between px-4 py-2">
                          <Col xs={12}>
                              <h3 className="font-weight-bold text-muted font-size-base mb-4">
                                  Slippage Tolerance
                              </h3>
                          </Col>
                          <Col xs={12}>
                            <div className={'row row-paddingless'}>
                              <Col className={'pr-2'}>
                                <Button
                                    onClick={() => {
                                      setSlippageInput('')
                                      setUserSlippageTolerance(50)
                                    }}
                                    variant={userSlippageTolerance === 50 ? "light-primary" : "outline-light"} size='lg' className={' w-100 font-size-lg font-weight-bolder'}>0.5 %</Button>
                              </Col>
                              <Col className={'px-2'}>
                                <Button
                                    onClick={() => {
                                      setSlippageInput('')
                                      setUserSlippageTolerance(100)
                                    }}
                                    variant={userSlippageTolerance === 100 ? "light-primary" : "outline-light"} size='lg' className={' w-100 font-size-lg font-weight-bolder'}>1 %</Button>
                              </Col>
                              <Col className={'pl-2'} xs={5}>
                                <InputGroup size={'lg'}>
                                  <FormControl
                                      ref={inputRef}
                                      type="text"
                                      placeholder={(userSlippageTolerance / 100).toFixed(2)}
                                      value={slippageInput}
                                      onBlur={() => {
                                        parseCustomSlippage((userSlippageTolerance / 100).toFixed(2))
                                      }}
                                      onChange={e => parseCustomSlippage(e.target.value)}
                                      className={`border-right-0 font-weight-bolder custom-input-group-control ${![50, 100].includes(userSlippageTolerance) ? 'bg-light-primary text-primary' : !slippageInputIsValid || (!!slippageInput &&
                                          (slippageError === SlippageError.RiskyLow || slippageError === SlippageError.RiskyHigh)) ? 'text-warning bg-light-warning' : 'text-dark'}`}
                                  />
                                  <InputGroup.Append>
                                    <InputGroup.Text className={`font-weight-bolder ${![50, 100].includes(userSlippageTolerance) ? 'bg-light-primary text-primary' : !slippageInputIsValid ? 'bg-light-warning text-warning' : 'bg-white text-dark'}`} id="btnGroupAddon">%</InputGroup.Text>
                                  </InputGroup.Append>
                                </InputGroup>
                              </Col>
                            </div>
                          </Col>
                          <Col xs={12}>
                            {!!slippageError && (
                                <span className={`pt-4 d-block font-weight-bold ${slippageError === SlippageError.InvalidInput ? 'text-danger' : 'text-warning'}`}>
                                  {slippageError === SlippageError.InvalidInput
                                      ? 'Enter a valid slippage percentage'
                                      : slippageError === SlippageError.RiskyLow
                                          ? 'Your transaction may fail'
                                          : 'Your transaction may be frontrun'}
                                </span>
                            )}
                          </Col>
                      </div>
                  </Col>

                  <Col xs={12}>
                      <div className="row mb-3 d-flex align-items-stretch justify-content-between px-4 py-2">
                          <Col xs={12}>
                              <h3 className="font-weight-bold text-muted font-size-base mb-4">
                                Transaction deadline
                              </h3>
                          </Col>
                          <Col>
                            <InputGroup size={'lg'}>
                              <FormControl
                                  type="text"
                                  onBlur={() => {
                                    parseCustomDeadline((ttl / 60).toString())
                                  }}
                                  placeholder={(ttl / 60).toString()}
                                  value={deadlineInput}
                                  onChange={e => parseCustomDeadline(e.target.value)}
                                  className={`border-right-0 custom-input-group-control font-weight-bolder ${!!deadlineError ? 'bg-light-danger text-danger border-0' : 'bg-white text-dark'}`}
                              />
                              <InputGroup.Append>
                                <InputGroup.Text className={`font-weight-bolder ${!!deadlineError ? 'bg-light-danger text-danger border-0' : 'bg-white text-dark'}`} id="btnGroupAddon">Minutes</InputGroup.Text>
                              </InputGroup.Append>
                            </InputGroup>
                          </Col>
                      </div>
                  </Col>
              </div>
            </form>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </>
  );
}
