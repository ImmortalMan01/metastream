import { Reducer } from 'redux'
import { createAction } from '@reduxjs/toolkit'
import { IMediaItem } from '../lobby/reducers/mediaPlayer'

export interface IPlaylistsState {
  items: IMediaItem[]
}

export const addPlaylistItem = createAction<IMediaItem>('playlists/add')
export const removePlaylistItem = createAction<string>('playlists/remove')

const initialState: IPlaylistsState = {
  items: []
}

export const playlists: Reducer<IPlaylistsState> = (
  state: IPlaylistsState = initialState,
  action: any
) => {
  if (addPlaylistItem.match(action)) {
    if (!state.items.find((item) => item.url === action.payload.url)) {
      return { ...state, items: [...state.items, action.payload] }
    }
  } else if (removePlaylistItem.match(action)) {
    return { ...state, items: state.items.filter((item) => item.id !== action.payload) }
  }
  return state
}
