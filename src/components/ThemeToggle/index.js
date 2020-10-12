import React, { Component } from 'react';

import MoonIcon from "../Icons/Moon";
import SunIcon from "../Icons/Sun";

class ThemeToggle extends Component {
    render() {
        return (
            <label htmlFor='theme-toggle' className='switch switch--primary'>
                <input className='switch__input' type="checkbox" id='theme-toggle' onChange={this.props.changeHandler} checked={this.props.isActive || this.props.checked}/>
                <div className="switch__box">
                    <div className="switch__bg">
                        <MoonIcon size={17} fill={'#ffffff80'}/>
                        <SunIcon size={17} fill={'#fc6'}/>
                    </div>
                    <span className="switch__box-inner" />
                </div>
            </label>
        )
    }
}

export default ThemeToggle;