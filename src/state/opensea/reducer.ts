import { createReducer } from '@reduxjs/toolkit';
import { setOpenSeaAssets } from './actions';

const initialState = {
  assets: []
};

export default createReducer(initialState, builder =>
  builder.addCase(setOpenSeaAssets, (state, { payload: { assets } }) => {
    return {
      ...state,
      assets
    }
  })
);
