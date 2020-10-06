/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useEffect } from "react";
import clsx from "clsx";
import { Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { DropdownTopbarItemToggler } from "../../../../_partials/dropdowns";
import { rates } from "../../../../../../constants";
import * as actions from '../../../../../../state/currency/actions';

export function CurrencySelectorDropDown() {
    const selectedCurrency = useSelector(state => state.currency.selected)
    const dispatch = useDispatch();

    const selectDestinationCurrency = (id) => {
        dispatch(actions.fetchCurrencies(id));
    }

    useEffect(() => {
        selectDestinationCurrency(selectedCurrency);
    }, [selectedCurrency])

    return (
        <Dropdown drop="down" alignRight>
            <Dropdown.Toggle
                as={DropdownTopbarItemToggler}
                id="dropdown-toggle-my-cart"
            >
                <OverlayTrigger
                    placement="bottom"
                    overlay={
                        <Tooltip id="currency-panel-tooltip">Select Currency</Tooltip>
                    }
                >
                    <div className="btn btn-icon btn-hover-transparent-white btn-dropdown btn-lg mr-1">
                        <img
                            className="h-20px w-20px rounded-sm"
                            src={rates[selectedCurrency].image}
                            alt={selectedCurrency}
                        />
                    </div>
                </OverlayTrigger>
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu p-0 m-0 dropdown-menu-anim-up dropdown-menu-sm dropdown-menu-right">
                <ul className="navi navi-hover py-4">
                    {Object.keys(rates).map((currency) => (
                        <li
                            key={currency}
                            className={clsx("navi-item", {
                                'bg-light-primary': currency === selectedCurrency,
                            })}
                        >
                            <a
                                href="#"
                                onClick={selectDestinationCurrency.bind(this, currency)}
                                className="navi-link"
                            >
                                <span className="symbol symbol-20 mr-3">
                                    <img src={rates[currency].image} alt={currency} />
                                </span>
                                <span className="navi-text">{currency}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </Dropdown.Menu>
        </Dropdown>
    );
}
