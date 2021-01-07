import React from "react";

export const DropdownTopbarItemToggler = React.forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      data-offset="10px,0px"
      className="topbar-item"
      onClick={e => {
        e.preventDefault();
        props.onClick(e);
      }}
    >
      {props.children}
    </div>
  );
});

DropdownTopbarItemToggler.displayName = 'DropdownTopbarItemToggler';
