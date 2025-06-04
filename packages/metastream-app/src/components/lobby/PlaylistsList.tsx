import React from 'react'
import { connect } from 'react-redux'
import { ListOverlay } from './ListOverlay'
import { IMediaItem } from '../../lobby/reducers/mediaPlayer'
import { IAppState } from '../../reducers'
import { removePlaylistItem } from '../../reducers/playlists'
import { MediaItem } from '../media/MediaItem'
import MenuItem from '@material-ui/core/MenuItem'
import { WithNamespaces, withNamespaces } from 'react-i18next'

interface ConnectedProps {
  playlists: IMediaItem[]
}

interface DispatchProps {
  removePlaylistItem(id: string): void
}

type Props = ConnectedProps & DispatchProps & WithNamespaces

const _PlaylistsList: React.SFC<Props> = ({ playlists, t, removePlaylistItem }) => {
  return (
    <ListOverlay
      id="playlists"
      title={t('playlists')}
      tagline={playlists.length ? `${playlists.length}` : undefined}
      renderMenuOptions={(item, close) => (
        <MenuItem
          onClick={() => {
            removePlaylistItem(item.id)
            close()
          }}
        >
          {t('remove')}
        </MenuItem>
      )}
    >
      {playlists.map((media) => (
        <MediaItem key={media.id} media={media} onClickMenu={() => {}} />
      ))}
    </ListOverlay>
  )
}

export const PlaylistsList = withNamespaces()(
  connect<ConnectedProps, DispatchProps, {}, IAppState>(
    (state) => ({ playlists: state.playlists.items }),
    (dispatch) => ({ removePlaylistItem: (id) => dispatch(removePlaylistItem(id)) })
  )(_PlaylistsList)
)
