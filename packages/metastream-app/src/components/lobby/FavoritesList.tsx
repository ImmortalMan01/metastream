import React from 'react'
import { connect } from 'react-redux'
import { ListOverlay } from './ListOverlay'
import { IMediaItem } from '../../lobby/reducers/mediaPlayer'
import { IAppState } from '../../reducers'
import { removeFavorite } from '../../reducers/favorites'
import { MediaItem } from '../media/MediaItem'
import MenuItem from '@material-ui/core/MenuItem'
import { WithNamespaces, withNamespaces } from 'react-i18next'

interface ConnectedProps {
  favorites: IMediaItem[]
}

interface DispatchProps {
  removeFavorite(id: string): void
}

type Props = ConnectedProps & DispatchProps & WithNamespaces

const _FavoritesList: React.SFC<Props> = ({ favorites, t, removeFavorite }) => {
  return (
    <ListOverlay
      id="favorites"
      title={t('favorites')}
      tagline={favorites.length ? `${favorites.length}` : undefined}
      renderMenuOptions={(item, close) => (
        <MenuItem
          onClick={() => {
            removeFavorite(item.id)
            close()
          }}
        >
          {t('remove')}
        </MenuItem>
      )}
    >
      {favorites.map((media) => (
        <MediaItem key={media.id} media={media} onClickMenu={() => {}} />
      ))}
    </ListOverlay>
  )
}

export const FavoritesList = withNamespaces()(
  connect<ConnectedProps, DispatchProps, {}, IAppState>(
    (state) => ({ favorites: state.favorites.items }),
    (dispatch) => ({ removeFavorite: (id) => dispatch(removeFavorite(id)) }),
  )(_FavoritesList),
)
