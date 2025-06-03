import { Reducer } from 'redux'
import { createAction } from '@reduxjs/toolkit'
import { IMediaItem } from '../lobby/reducers/mediaPlayer'

export interface IFavoritesState {
  items: IMediaItem[]
}

export const addFavorite = createAction<IMediaItem>('favorites/add')
export const removeFavorite = createAction<string>('favorites/remove')

const initialState: IFavoritesState = {
  items: [],
}

export const favorites: Reducer<IFavoritesState> = (
  state: IFavoritesState = initialState,
  action: any,
) => {
  if (addFavorite.match(action)) {
    // Avoid duplicates by URL
    if (!state.items.find((item) => item.url === action.payload.url)) {
      return { ...state, items: [...state.items, action.payload] }
    }
  } else if (removeFavorite.match(action)) {
    return {
      ...state,
      items: state.items.filter((item) => item.id !== action.payload),
    }
  }
  return state
}
