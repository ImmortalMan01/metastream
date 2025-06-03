import { Reducer } from 'redux'
import { createStructuredSelector } from 'reselect'
import { isType } from 'utils/redux'
import { clamp } from 'utils/math'
import { setVolume, setMute, setUsername, setColor, setSetting, addVolume } from 'actions/settings'
import {
  USERNAME_MAX_LEN,
  COLOR_LEN,
  DEFAULT_COLOR,
  DEFAULT_USERNAME,
  USERNAME_MIN_LEN,
} from 'constants/settings'
import { IAppState } from '.'
import { stripEmoji } from 'utils/string'
import { DEFAULT_LANGUAGE } from 'locale'
import { ChatLocation } from '../components/chat/Location'
import { AccountService, MetastreamUserTier } from 'account/account'
import { localUserId } from 'network'

export const enum SessionMode {
  /** Open to connections. */
  Public = 0,

  /** Not listening for connections. */
  Offline = 1,

  /** Permission to join is requested upon connection. */
  Private = 2,
}

export interface ISettingsState {
  mute: boolean
  volume: number
  username?: string
  color?: string
  allowTracking: boolean
  sessionMode: SessionMode
  maxUsers?: number
  avatar?: string
  language: string
  chatLocation: ChatLocation
  chatTimestamp: boolean
  userListCollapsed?: boolean
  mediaListCollapsed?: boolean
  autoFullscreen: boolean
  theaterMode: boolean
  audioMode: boolean
  safeBrowse: boolean
}

const initialState: ISettingsState = {
  mute: false,
  volume: 0.75,
  allowTracking: false,
  sessionMode: SessionMode.Private,
  language: DEFAULT_LANGUAGE,
  chatLocation: ChatLocation.DockRight,
  chatTimestamp: false,
  autoFullscreen: true,
  theaterMode: false,
  audioMode: false,
  safeBrowse: true,
}

export const settings: Reducer<ISettingsState> = (
  state: ISettingsState = initialState,
  action: any,
) => {
  if (isType(action, setSetting as any)) {
    const { key, value } = action.payload as { key: keyof ISettingsState; value: any }
    const currentValue = state[key]
    const newValue = typeof value === 'function' ? value(currentValue) : value
    return { ...state, [key]: newValue }
  }

  if (isType(action, setVolume)) {
    return {
      ...state,
      mute: false,
      volume: clamp(action.payload, 0, 1),
    }
  } else if (isType(action, addVolume)) {
    return {
      ...state,
      mute: false,
      volume: clamp(state.volume + action.payload, 0, 1),
    }
  } else if (isType(action, setMute)) {
    return {
      ...state,
      mute: action.payload,
    }
  }

  if (isType(action, setUsername)) {
    let username = action.payload && stripEmoji(action.payload.trim()).substr(0, USERNAME_MAX_LEN)

    if (typeof username === 'undefined' || username.length >= USERNAME_MIN_LEN) {
      return { ...state, username }
    }
  } else if (isType(action, setColor)) {
    const color = action.payload.substr(0, COLOR_LEN)
    return { ...state, color }
  }

  return state
}

export const getLocalColor = (state: IAppState) =>
  (AccountService.get().tier > MetastreamUserTier.None && state.settings.color) || DEFAULT_COLOR

export const getLocalUsername = (state: IAppState) => state.settings.username || DEFAULT_USERNAME
export const getLocalSessionMode = (state: IAppState) => state.settings.sessionMode || DEFAULT_COLOR

export const getLocalAvatar = (state: IAppState) => {
  const { avatar } = state.settings
  return avatar || `uid:${localUserId()}`
}

export interface PlayerSettings {
  autoFullscreen: boolean
  theaterMode: boolean
  audioMode: boolean

  // UNUSED
  mediaSessionProxy?: boolean
  syncOnBuffer?: boolean
  seekThreshold?: number
  theaterModeSelectors?: string[]
}

/** Gets a subset of settings to pass to player extension */
export const getPlayerSettings = createStructuredSelector<IAppState, PlayerSettings>({
  autoFullscreen: (state) => state.settings.autoFullscreen,
  theaterMode: (state) => state.settings.theaterMode,
  audioMode: (state) => state.settings.audioMode,
})
