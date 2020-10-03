/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import SVG from "react-inlinesvg";
import {Dropdown} from "react-bootstrap";
import {DropdownCustomToggler, DropdownMenu1} from "../../dropdowns";
import {toAbsoluteUrl} from "../../../_helpers";

export function ListsWidget9({ className }) {
  return (
    <>
      <div className={`card card-custom ${className}`}>
        {/* Header */}
        <div className="card-header align-items-center border-0 mt-4">
          <h3 className="card-title align-items-start flex-column">
            <span className="font-weight-bolder text-dark">
              Recent Activities
            </span>
            <span className="text-muted mt-3 font-weight-bold font-size-sm">
              890,344 Sales
            </span>
          </h3>
          <div className="card-toolbar">
            <Dropdown className="dropdown-inline" alignRight>
              <Dropdown.Toggle
                id="dropdown-toggle-top"
                as={DropdownCustomToggler}
              >
                <i className="ki ki-bold-more-hor" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu dropdown-menu-sm dropdown-menu-right">
                <DropdownMenu1 />
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        {/* Body */}
        <div className="card-body pt-0">
          <div className="timeline timeline-5 mt-3">
            <div className="timeline-item align-items-start">
              <div className="timeline-label font-weight-bolder text-dark-75 font-size-lg text-right pr-3">
                08:42
              </div>

              <div className="timeline-badge">
                <i className="fa fa-genderless text-success icon-xxl"></i>
              </div>

              <div className="timeline-content text-dark-50">
                Outlines of the recent activities that happened last weekend
              </div>
            </div>

            <div className="timeline-item align-items-start">
              <div className="timeline-label font-weight-bolder text-dark-75 font-size-lg text-right pr-3">
                3 hr
              </div>

              <div className="timeline-badge">
                <i className="fa fa-genderless text-danger icon-xxl"></i>
              </div>

              <div className="timeline-content d-flex">
                <span className="mr-4 font-weight-bolder text-dark-75">
                  AEOL meeting with
                </span>

                <div className="d-flex align-items-start mt-n2">
                  <a
                    href="#"
                    className="symbol symbol-35 symbol-light-success mr-2"
                  >
                    <span className="symbol-label">
                      <SVG
                        className="h-75 align-self-end"
                        src={toAbsoluteUrl("/media/svg/avatars/004-boy-1.svg")}
                      ></SVG>
                    </span>
                  </a>

                  <a href="#" className="symbol symbol-35 symbol-light-success">
                    <span className="symbol-label">
                      <SVG
                        className="h-75 align-self-end"
                        src={toAbsoluteUrl("/media/svg/avatars/002-girl.svg")}
                      ></SVG>
                    </span>
                  </a>
                </div>
              </div>
            </div>

            <div className="timeline-item align-items-start">
              <div className="timeline-label font-weight-bolder text-dark-75 font-size-lg text-right pr-3">
                14:37
              </div>

              <div className="timeline-badge">
                <i className="fa fa-genderless text-info icon-xxl"></i>
              </div>

              <div className="timeline-content font-weight-bolder text-dark-75">
                Submit initial budget -
                <a href="#" className="text-primary">
                  USD 700
                </a>
              </div>
            </div>

            <div className="timeline-item align-items-start">
              <div className="timeline-label font-weight-bolder text-dark-75 font-size-lg text-right pr-3">
                16:50
              </div>

              <div className="timeline-badge">
                <i className="fa fa-genderless text-danger icon-xxl"></i>
              </div>

              <div className="timeline-content text-dark-50">
                Stakeholder meeting
              </div>
            </div>

            <div className="timeline-item align-items-start">
              <div className="timeline-label font-weight-bolder text-dark-75 font-size-lg text-right pr-3">
                17:30
              </div>

              <div className="timeline-badge">
                <i className="fa fa-genderless text-success icon-xxl"></i>
              </div>

              <div className="timeline-content text-dark-50">
                Project scoping & estimations with stakeholders
              </div>
            </div>

            <div className="timeline-item align-items-start">
              <div className="timeline-label font-weight-bolder text-dark-75 font-size-lg text-right pr-3">
                21:03
              </div>

              <div className="timeline-badge">
                <i className="fa fa-genderless text-warning icon-xxl"></i>
              </div>

              <div className="timeline-content font-weight-bolder text-dark-75">
                New order placed{" "}
                <a href="#" className="text-primary">
                  #XF-2356
                </a>
              </div>
            </div>

            <div className="timeline-item align-items-start">
              <div className="timeline-label font-weight-bolder text-dark-75 font-size-lg text-right pr-3">
                21:07
              </div>

              <div className="timeline-badge">
                <i className="fa fa-genderless text-danger icon-xxl"></i>
              </div>

              <div className="timeline-content text-dark-50">
                Company BBQ to celebrate the last quater achievements and goals.
                Food and drinks provided
              </div>
            </div>

            <div className="timeline-item align-items-start">
              <div className="timeline-label font-weight-bolder text-dark-75 font-size-lg text-right pr-3">20:30</div>
              <div className="timeline-badge">
                <i className="fa fa-genderless text-info icon-xxl"></i>
              </div>
              <div className="timeline-content text-dark-50">
                Marketing campaign planning with customer.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
