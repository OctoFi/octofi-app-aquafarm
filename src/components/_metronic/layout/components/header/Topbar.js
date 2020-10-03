import React from "react";
import { QuickActionsDropdown } from "../extras/dropdowns/QuickActionsDropdown";
import { CurrencySelectorDropDown } from "../extras/dropdowns/CurrencySelectorDropdown";
import {QuickUserToggler} from "../extras/QuiclUserToggler";

export function Topbar() {

  return (
    <div className="topbar">
      <QuickActionsDropdown />

      <CurrencySelectorDropDown/>

      <QuickUserToggler />
    </div>
  );
}
